import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

const buckets = { product: 'product-images', highlight: 'homepage-highlights' } as const
type ImageKind = keyof typeof buckets
const mimeExtensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const

function storageConfig() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) throw new HttpError(503, 'storage_unavailable', 'Image storage is not configured.')
  return { base: env.supabaseUrl.replace(/\/$/, ''), apiKey: env.supabaseAnonKey }
}

function isImageKind(kind: string): kind is ImageKind { return Object.hasOwn(buckets, kind) }
function isStorageBucket(bucket: string | undefined): bucket is (typeof buckets)[ImageKind] { return bucket !== undefined && Object.values(buckets).includes(bucket as (typeof buckets)[ImageKind]) }

function hasValidSignature(bytes: Buffer, mime: string) {
  if (mime === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (mime === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
  return mime === 'image/webp' && bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
}

export async function uploadPublicImage(kind: string, bytes: Buffer, mime: string, accessToken: string) {
  if (!isImageKind(kind)) throw new HttpError(400, 'invalid_image_kind', 'Choose a supported image collection.')
  if (!(mime in mimeExtensions)) throw new HttpError(400, 'invalid_image_type', 'Choose a JPEG, PNG, or WebP image.')
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new HttpError(400, 'invalid_image_size', 'Images must be smaller than 5 MB.')
  if (!hasValidSignature(bytes, mime)) throw new HttpError(400, 'invalid_image_file', 'The selected file is not a valid image of the declared type.')
  const { base, apiKey } = storageConfig()
  const bucket = buckets[kind]!
  const path = `${randomUUID()}.${mimeExtensions[mime as keyof typeof mimeExtensions]}`
  const result = await fetch(`${base}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { apikey: apiKey, authorization: `Bearer ${accessToken}`, 'content-type': mime, 'x-upsert': 'false' },
    body: new Uint8Array(bytes),
    signal: AbortSignal.timeout(15000),
  })
  if (!result.ok) throw new HttpError(result.status === 403 ? 403 : 502, 'image_upload_failed', 'The image could not be uploaded.')
  return `${bucket}/${path}`
}

export function publicImageUrl(path: string | null) {
  if (!path) return null
  const [bucket, ...parts] = path.split('/')
  if (!isStorageBucket(bucket) || !parts.length || parts.some((part) => !part || part === '.' || part === '..')) return path
  const { base } = storageConfig()
  return `${base}/storage/v1/object/public/${bucket}/${parts.map(encodeURIComponent).join('/')}`
}

export async function deletePublicImage(path: string, accessToken: string) {
  const [bucket, ...parts] = path.split('/')
  if (!isStorageBucket(bucket) || !parts.length || parts.some((part) => !part || part === '.' || part === '..')) throw new HttpError(400, 'invalid_image_path', 'The image path is not valid.')
  const { base, apiKey } = storageConfig()
  const result = await fetch(`${base}/storage/v1/object/${bucket}`, {
    method: 'DELETE',
    headers: { apikey: apiKey, authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ prefixes: [parts.join('/')] }),
    signal: AbortSignal.timeout(10000),
  })
  if (!result.ok && result.status !== 404) throw new HttpError(result.status === 403 ? 403 : 502, 'image_delete_failed', 'The image could not be deleted.')
}
