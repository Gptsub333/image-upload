"use client"

import Spinner from "./spinner"

export default function OutputPanel({ selectedItem }) {
  return (
    <div className="flex min-h-[420px] flex-col rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-3">
        <h2 className="text-sm font-medium text-gray-900">Processed Output</h2>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        {!selectedItem ? (
          <p className="text-sm text-gray-600">Select or upload an image to view the processed result.</p>
        ) : selectedItem.status === "loading" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner />
            <p className="text-sm text-gray-600">Processing your image…</p>
          </div>
        ) : selectedItem.status === "error" ? (
          <p className="text-sm text-red-600">Upload failed, please try again.</p>
        ) : selectedItem.processedUrl ? (
          <div className="w-full">
            <img
              src={
                selectedItem.processedUrl || "/placeholder.svg?height=600&width=800&query=processed%20image%20output"
              }
              alt={`Processed ${selectedItem.name || "image"}`}
              className="mx-auto max-h-[70vh] w-auto rounded-md object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-600">Awaiting processed result…</p>
        )}
      </div>
    </div>
  )
}
