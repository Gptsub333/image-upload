"use client"

import Spinner from "@/components/spinner"

export default function ResultPanel({ status, resultText, error }) {
  return (
    <div className="flex-1">
      <div className={["rounded-lg border", "bg-card text-card-foreground", "p-4 md:p-5", "h-full"].join(" ")}>
        <h2 className="text-lg font-medium mb-3">Backend Response</h2>

        <div className="min-h-40 rounded-md bg-muted/40 p-4" aria-live="polite" aria-atomic="true">
          {status === "idle" && (
            <p className="text-sm text-muted-foreground">
              The backend response will appear here after you upload an image.
            </p>
          )}

          {status === "loading" && (
            <div className="flex items-center gap-2 text-sm">
              <Spinner />
              <span>Waiting for response…</span>
            </div>
          )}

          {status === "success" && (
            <pre className="whitespace-pre-wrap break-words text-sm">{resultText || "(empty response)"}</pre>
          )}

          {status === "error" && <p className="text-sm text-destructive">{error || "An error occurred"}</p>}
        </div>
      </div>
    </div>
  )
}
