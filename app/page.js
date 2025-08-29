"use client"

import { useCallback, useRef, useState } from "react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/backend/api"

export default function Page() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resultText, setResultText] = useState("")
  const inputRef = useRef(null)


  // AI assisted tongue scanner


  const onDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith("image/")) {
      setFile(f)
      setError(null)
      setResultText("")
    } else {
      setError("Please drop a valid image file.")
    }
  }, [])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const onFileChange = useCallback((e) => {
    const f = e.target.files?.[0]
    if (f && f.type.startsWith("image/")) {
      setFile(f)
      setError(null)
      setResultText("")
    } else if (f) {
      setError("Selected file is not an image.")
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please select an image to upload.")
      return
    }
    setLoading(true)
    setError(null)
    setResultText("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed with status ${res.status}`)
      }

      const textResponse = await res.text()
      setResultText(textResponse)
    } catch (err) {
      setError(err?.message || "Upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [file])

  return (
    <main className="min-h-screen w-full px-4 py-8 md:py-12 bg-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-black">AI assisted tongue scanner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload an image on the left. We&apos;ll POST it to the backend and show the text response on the right.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel: Uploader */}
          <div role="region" aria-label="Image uploader" className="rounded-lg border bg-white text-gray-900 p-4 shadow-sm">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`flex flex-col gap-2 h-40 items-center justify-center rounded-md border-2 border-dashed p-4 text-center transition ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
            >
              <div className="text-sm text-gray-500">Drag and drop an image here</div>
              <div className="text-xs text-gray-400">or</div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 transition"
              >
                Choose file
              </button>
              <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="sr-only" />
            </div>

            {file ? (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded border bg-gray-100">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt="Selected preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-60"
                >
                  {loading ? "Uploading..." : "Send to Backend"}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-gray-400">No file selected yet.</p>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Right Panel: Result */}
          <div
            role="region"
            aria-label="Backend response"
            className="rounded-lg border bg-white text-gray-900 p-4 shadow-sm"
          >
            <h2 className="text-lg font-medium mb-2">Response</h2>
            <div className="min-h-32 rounded-md border bg-gray-50 p-3 text-sm whitespace-pre-wrap">
              {loading && <span className="opacity-70">Waiting for response...</span>}
              {!loading && resultText && <span>{resultText}</span>}
              {!loading && !resultText && (
                <span className="text-gray-400">The backend response will appear here after you upload.</span>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Posting to: <code>{BACKEND_URL}</code>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
