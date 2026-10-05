import { ImagePlus, UploadCloud, X } from 'lucide-react'
import { useEffect, useRef, type DragEvent, type ChangeEvent } from 'react'
import type { ReferenceImage } from '../../types/customCake'

export const MAX_REFERENCE_IMAGES = 4
export const MAX_REFERENCE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_REFERENCE_IMAGE_SIZE_LABEL = '5 MB'
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
const acceptedExtensions = '.jpg,.jpeg,.png,.webp'

export function ReferenceImageUpload({ images, onChange, error, onError }: { images: ReferenceImage[]; onChange: (images: ReferenceImage[]) => void; error?: string; onError: (message: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef(images)
  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => () => { imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)) }, [])

  const addFiles = (files: File[]) => {
    if (files.length === 0) return
    const availableSlots = MAX_REFERENCE_IMAGES - images.length
    if (availableSlots <= 0) {
      onError(`You can add up to ${MAX_REFERENCE_IMAGES} reference images.`)
      return
    }
    const nextImages: ReferenceImage[] = []
    for (const file of files.slice(0, availableSlots)) {
      if (!acceptedTypes.includes(file.type)) {
        onError(`${file.name} is not a supported image type. Use JPG, PNG or WEBP.`)
        continue
      }
      if (file.size > MAX_REFERENCE_IMAGE_SIZE_BYTES) {
        onError(`${file.name} is larger than ${MAX_REFERENCE_IMAGE_SIZE_LABEL}.`)
        continue
      }
      nextImages.push({ id: `${file.name}-${file.lastModified}-${file.size}-${images.length + nextImages.length}`, file, previewUrl: URL.createObjectURL(file) })
    }
    if (nextImages.length > 0) {
      onError('')
      onChange([...images, ...nextImages])
    }
    if (files.length > availableSlots) onError(`Only ${MAX_REFERENCE_IMAGES} reference images can be added.`)
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    addFiles(Array.from(event.dataTransfer.files))
  }

  const removeImage = (id: string) => {
    const image = images.find((item) => item.id === id)
    if (image) URL.revokeObjectURL(image.previewUrl)
    onChange(images.filter((item) => item.id !== id))
    onError('')
  }

  return <div className="space-y-4"><div><p className="text-sm font-semibold text-berry-text">Reference images <span className="font-normal text-berry-muted">(optional)</span></p><p className="mt-1 text-xs leading-5 text-berry-muted">Share up to {MAX_REFERENCE_IMAGES} inspiration images. JPG, PNG or WEBP, up to {MAX_REFERENCE_IMAGE_SIZE_LABEL} each.</p></div><label htmlFor="reference-images" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-berry-deep/25 bg-berry-cream px-5 py-6 text-center transition hover:border-berry-pink hover:bg-berry-pink/5 focus-within:ring-2 focus-within:ring-berry-deep focus-within:ring-offset-2"><input ref={inputRef} id="reference-images" type="file" accept={acceptedExtensions} multiple className="sr-only" onChange={handleInput} /><UploadCloud size={25} className="text-berry-pink" aria-hidden="true" /><span className="mt-3 text-sm font-semibold text-berry-deep">Choose inspiration images</span><span className="mt-1 text-xs text-berry-muted">or drag and drop them here</span></label>{error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}{images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image) => <div key={image.id} className="group relative overflow-hidden rounded-xl border border-berry-deep/10 bg-white"><img src={image.previewUrl} alt={`Reference image: ${image.file.name}`} className="aspect-square w-full object-cover" /><button type="button" onClick={() => removeImage(image.id)} aria-label={`Remove ${image.file.name}`} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-berry-text/80 text-white opacity-100 transition hover:bg-berry-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><X size={15} /></button><p className="truncate px-2 py-2 text-xs text-berry-muted">{image.file.name}</p></div>)}</div>}{images.length === 0 && <p className="flex items-center gap-2 text-xs text-berry-muted"><ImagePlus size={14} /> Reference images help communicate your visual direction.</p>}</div>
}
