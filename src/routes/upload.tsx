import { getCookie } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000/api'

export const Route = createFileRoute('/upload')({
  component: Upload,
})

type UploadResponse = {
  url: string
}

function Upload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setStatus('idle')
    setMessage(null)

    if (selected) {
      const url = URL.createObjectURL(selected)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0] ?? null
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped)
      setStatus('idle')
      setMessage(null)
      setPreview(URL.createObjectURL(dropped))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    const payload = {
      file_name: file.name,
      file_type: file.type,
    }
    setStatus('loading')
    setMessage(null)

    const csrfToken = getCookie('csrftoken')
    try {
      const res = await fetch(`${API_URL}/upload/`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken ?? '',
        }
      })

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(text || 'Upload failed')
      }

      const { url } = await res.json() satisfies UploadResponse

      const uploadRes = await fetch(url, {
        body: file,
        method: 'PUT'
      })

      if (!uploadRes.ok) {
        const text = await uploadRes.text().catch(() => uploadRes.statusText)
        throw new Error(text || 'File upload failed')
      }

      setStatus('success')
      setMessage('Image uploaded successfully.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message ?? 'Upload failed.')
    }
  }

  function handleClear() {
    setFile(null)
    setPreview(null)
    setStatus('idle')
    setMessage(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-4">Upload Image</h2>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors mb-4"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full object-contain rounded"
            />
          ) : (
            <p className="text-gray-500 text-sm text-center">
              Drag &amp; drop an image here, or click to select
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {file && (
          <p className="text-sm text-gray-600 mb-4 truncate">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}

        {message && (
          <p
            className={`text-sm mb-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {message}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!file || status === 'loading'}
            className="flex-1 bg-cyan-600 text-white p-2 rounded disabled:opacity-50"
          >
            {status === 'loading' ? 'Uploading...' : 'Upload'}
          </button>
          {file && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
