"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QueryPanel } from "@/components/query-panel"
import { ReportingPanel } from "@/components/reporting-panel"
import { ComparisonPanel } from "@/components/comparison-panel"
import { ChangelogPanel } from "@/components/changelog-panel"
import { SettingsPanel } from "@/components/settings-panel"
import type { Player } from "@/lib/types"
import { parseCSV, toCSV } from "@/lib/csv-parser"
import { processRoster } from "@/lib/roster-logic"

type ViewMode = "main" | "query" | "report" | "changes" | "changelog"

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [originalPlayers, setOriginalPlayers] = useState<Player[]>([])
  const [processedPlayers, setProcessedPlayers] = useState<Player[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processSummary, setProcessSummary] = useState<{ totalPlayers: number; teamsProcessed: number } | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("main")
  const [showSettings, setShowSettings] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setIsProcessing(true)
    setProcessedPlayers([])
    setProcessSummary(null)

    try {
      const text = await uploadedFile.text()
      const parsed = parseCSV(text)
      setOriginalPlayers(parsed)
      console.log("[v0] Loaded", parsed.length, "players from CSV")
    } catch (error) {
      console.error("[v0] Error parsing CSV:", error)
      alert("Failed to parse CSV file. Please check the format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcess = () => {
    if (originalPlayers.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 100)

    setTimeout(() => {
      const playersCopy = JSON.parse(JSON.stringify(originalPlayers))
      const result = processRoster(playersCopy)
      setProcessedPlayers(result.processed)
      setProcessSummary(result.summary)
      setProcessingProgress(100)
      clearInterval(progressInterval)

      setTimeout(() => {
        setIsProcessing(false)
        setViewMode("report")
        console.log("[v0] Processing complete:", result.summary)
      }, 500)
    }, 1000)
  }

  const handleDownload = () => {
    console.log("[v0] Download button clicked")
    console.log("[v0] Processed players count:", processedPlayers.length)

    if (processedPlayers.length === 0) {
      console.log("[v0] No processed players to download")
      alert("No processed roster data to download. Please process the roster first.")
      return
    }

    try {
      console.log("[v0] Converting to CSV...")
      const csv = toCSV(processedPlayers)
      console.log("[v0] CSV generated, length:", csv.length)

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      setDownloadUrl(url)

      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `roster_updated_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)

      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        console.log("[v0] Download cleanup complete (URL kept for fallback)")
      }, 100)

      console.log("[v0] Download triggered successfully")
    } catch (error) {
      console.error("[v0] Error during CSV download:", error)
      alert(`Failed to download CSV: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-black sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">NCAA 14 ROSTER TOOL</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Equipment & jersey number management</p>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("main")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "main"
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Main
                </button>
                {processedPlayers.length > 0 && (
                  <>
                    <button
                      onClick={() => setViewMode("query")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors animate-in fade-in slide-in-from-top-2 duration-300 ${
                        viewMode === "query"
                          ? "bg-white/10 text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                      style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
                    >
                      Query Data
                    </button>
                    <button
                      onClick={() => setViewMode("report")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors animate-in fade-in slide-in-from-top-2 duration-300 ${
                        viewMode === "report"
                          ? "bg-white/10 text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                      style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
                    >
                      Top Players
                    </button>
                    <button
                      onClick={() => setViewMode("changes")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors animate-in fade-in slide-in-from-top-2 duration-300 ${
                        viewMode === "changes"
                          ? "bg-white/10 text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                      style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
                    >
                      Changes
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewMode("changelog")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "changelog"
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Changelog
                </button>
              </nav>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                title="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-7xl w-full mx-auto space-y-6">
        {viewMode === "main" && (
          <>
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-lg">Upload Roster CSV</CardTitle>
                    <CardDescription className="text-sm">Select your NCAA 14 roster file to begin</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    <Button variant="outline" asChild className="font-medium bg-transparent">
                      <span>Choose File</span>
                    </Button>
                  </label>
                  {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                  {originalPlayers.length > 0 && (
                    <span className="text-sm font-medium text-primary">{originalPlayers.length} players loaded</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {originalPlayers.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <CardTitle className="text-lg">Process Roster</CardTitle>
                      <CardDescription className="text-sm">
                        Apply equipment templates and assign jersey numbers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing || processedPlayers.length > 0}
                      className="font-medium"
                    >
                      {isProcessing
                        ? "Processing..."
                        : processedPlayers.length > 0
                          ? "Already Processed"
                          : "Process Roster"}
                    </Button>

                    {processedPlayers.length > 0 && (
                      <Button onClick={handleDownload} variant="default" className="font-medium">
                        Download Updated CSV
                      </Button>
                    )}
                  </div>

                  {isProcessing && (
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <p className="font-medium text-foreground text-sm">Processing Roster...</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-mono font-semibold">{processingProgress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-300 ease-out"
                            style={{ width: `${processingProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {downloadUrl && (
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        If download didn't start automatically, use this link:
                      </p>
                      <a
                        href={downloadUrl}
                        download={`roster_updated_${new Date().toISOString().split("T")[0]}.csv`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Right-click here and select "Save Link As..."
                      </a>
                    </div>
                  )}

                  {processSummary && (
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <p className="font-medium text-foreground text-sm">Processing Complete</p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">Total Players: {processSummary.totalPlayers}</p>
                        <p className="text-muted-foreground">Teams Processed: {processSummary.teamsProcessed}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {viewMode === "query" && processedPlayers.length > 0 && (
          <QueryPanel originalPlayers={originalPlayers} processedPlayers={processedPlayers} />
        )}
        {viewMode === "report" && processedPlayers.length > 0 && <ReportingPanel processedPlayers={processedPlayers} />}
        {viewMode === "changes" && processedPlayers.length > 0 && (
          <ComparisonPanel originalPlayers={originalPlayers} processedPlayers={processedPlayers} />
        )}
        {viewMode === "changelog" && <ChangelogPanel />}
        {showSettings && <SettingsPanel />}
      </main>
    </div>
  )
}
