"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import UploadPanel from "./upload-panel"
import OutputPanel from "./output-panel"

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return "id-" + Math.random().toString(36).slice(2) + Date.now()
}

export default function ImageProcessorApp() {
  const [items, setItems] = useState([]) // [{id, file, name, size, previewUrl, status, processedUrl, error}]
  const [selectedId, setSelectedId] = useState(null)

  const previewUrlsRef = useRef(new Set())
  const processedUrlsRef = useRef(new Set())

  const processFile = useCallback(async (file, id) => {
    try {
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/process", { method: "POST", body: form })
      if (!res.ok) {
        const message = await safeReadText(res)
        throw new Error(message || "Processing failed")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      processedUrlsRef.current.add(url)

      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: "done", processedUrl: url, error: null } : it)),
      )
    } catch (err) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, status: "error", error: err?.message || "Upload failed, please try again" } : it,
        ),
      )
    }
  }, [])

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []).filter((f) => f.type?.startsWith("image/"))
      if (incoming.length === 0) return

      setItems((prev) => {
        const next = [...prev]
        for (const file of incoming) {
          const id = generateId()
          const previewUrl = URL.createObjectURL(file)
          previewUrlsRef.current.add(previewUrl)
          next.push({
            id,
            file,
            name: file.name || "image",
            size: file.size || 0,
            previewUrl,
            status: "loading",
            processedUrl: null,
            error: null,
          })
          // kick off processing for each file
          processFile(file, id)
        }
        return next
      })

      // selection handled below in effect
    },
    [processFile],
  )

  // select most recent if nothing selected
  useEffect(() => {
    if (!selectedId && items.length > 0) {
      setSelectedId(items[items.length - 1].id)
    }
  }, [items, selectedId])

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      for (const u of previewUrlsRef.current) URL.revokeObjectURL(u)
      for (const u of processedUrlsRef.current) URL.revokeObjectURL(u)
      previewUrlsRef.current.clear()
      processedUrlsRef.current.clear()
    }
  }, [])

  const selectedItem = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId])

  const onRemove = useCallback(
    (id) => {
      setItems((prev) => {
        const target = prev.find((p) => p.id === id)
        if (target?.previewUrl) {
          URL.revokeObjectURL(target.previewUrl)
          previewUrlsRef.current.delete(target.previewUrl)
        }
        if (target?.processedUrl) {
          URL.revokeObjectURL(target.processedUrl)
          processedUrlsRef.current.delete(target.processedUrl)
        }
        const remaining = prev.filter((p) => p.id !== id)
        if (selectedId === id) {
          setSelectedId(remaining[remaining.length - 1]?.id || null)
        }
        return remaining
      })
    },
    [selectedId],
  )

  return (
    <>
      <UploadPanel
        items={items}
        addFiles={addFiles}
        onSelect={setSelectedId}
        selectedId={selectedId}
        onRemove={onRemove}
      />
      <OutputPanel selectedItem={selectedItem} />
    </>
  )
}

async function safeReadText(res) {
  try {
    return await res.text()
  } catch {
    return ""
  }
}
