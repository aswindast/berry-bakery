import { useEffect, useState } from 'react'
import { Button } from '../ui'

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']

export function ImagePicker({ currentUrl, file, onFile, onRemove }: { currentUrl?: string | null; file: File | null; onFile: (file: File | null) => void; onRemove?: () => void }) {
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const choose = (candidate?: File) => {
    setError('')
    if (!candidate) { setPreview(''); onFile(null); return }
    if (!acceptedTypes.includes(candidate.type)) { setError('Choose a JPEG, PNG, or WebP image.'); setPreview(''); onFile(null); return }
    if (candidate.size > 5 * 1024 * 1024) { setError('Image size must be 5 MB or less.'); setPreview(''); onFile(null); return }
    setPreview(URL.createObjectURL(candidate))
    onFile(candidate)
  }
  const source = preview || currentUrl || ''
  return <div className="sm:col-span-2 xl:col-span-3">
    <label htmlFor="image-upload" className="mb-1 block text-sm font-semibold text-berry-deep">Image (JPEG, PNG, or WebP · up to 5 MB)</label>
    {source && <img src={source} alt="Selected image preview" className="mb-3 h-40 w-56 rounded-xl border border-berry-deep/10 object-cover" />}
    {!source && <p className="mb-3 text-sm text-berry-muted">No image selected. The BERRY placeholder will be shown.</p>}
    <input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choose(event.target.files?.[0])} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-berry-pink file:px-4 file:py-2 file:font-semibold file:text-berry-deep" />
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    {(file || currentUrl) && <Button className="mt-2" variant="ghost" type="button" onClick={() => { choose(); onRemove?.() }}>Remove image</Button>}
  </div>
}
