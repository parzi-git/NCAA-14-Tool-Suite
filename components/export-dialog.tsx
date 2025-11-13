"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileSpreadsheet, FileJson, FileText } from "lucide-react"
import type { Player } from "@/lib/types"
import { toCSV } from "@/lib/csv-parser"

interface ExportDialogProps {
  players: Player[]
  trigger?: React.ReactNode
}

type ExportFormat = "csv" | "json" | "txt"

export function ExportDialog({ players, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [filename, setFilename] = useState(`roster_${new Date().toISOString().split("T")[0]}`)
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set([
      "FirstName",
      "LastName",
      "Position",
      "TeamId",
      "JerseyNumber",
      "POVR",
      "Sleeves",
      "Visor",
      "LeftShoe",
      "RightShoe",
    ]),
  )

  const allFields = players.length > 0 ? Object.keys(players[0]) : []

  const toggleField = (field: string) => {
    const newSelected = new Set(selectedFields)
    if (newSelected.has(field)) {
      newSelected.delete(field)
    } else {
      newSelected.add(field)
    }
    setSelectedFields(newSelected)
  }

  const exportToCSV = () => {
    const filteredPlayers = players.map((player) => {
      const filtered: any = {}
      selectedFields.forEach((field) => {
        filtered[field] = player[field as keyof Player]
      })
      return filtered
    })

    const csv = toCSV(filteredPlayers)
    downloadFile(csv, `${filename}.csv`, "text/csv")
  }

  const exportToJSON = () => {
    const filteredPlayers = players.map((player) => {
      const filtered: any = {}
      selectedFields.forEach((field) => {
        filtered[field] = player[field as keyof Player]
      })
      return filtered
    })

    const json = JSON.stringify(filteredPlayers, null, 2)
    downloadFile(json, `${filename}.json`, "application/json")
  }

  const exportToText = () => {
    let text = ""

    if (includeHeaders) {
      text += Array.from(selectedFields).join("\t") + "\n"
      text += "-".repeat(80) + "\n"
    }

    players.forEach((player) => {
      const values = Array.from(selectedFields).map((field) => {
        const value = player[field as keyof Player]
        return value !== undefined && value !== null ? String(value) : ""
      })
      text += values.join("\t") + "\n"
    })

    downloadFile(text, `${filename}.txt`, "text/plain")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const handleExport = () => {
    if (selectedFields.size === 0) {
      alert("Please select at least one field to export")
      return
    }

    switch (format) {
      case "csv":
        exportToCSV()
        break
      case "json":
        exportToJSON()
        break
      case "txt":
        exportToText()
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Roster Data</DialogTitle>
          <DialogDescription>Choose export format and customize which fields to include</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormat("csv")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "csv" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-sm font-medium">CSV</span>
              </button>

              <button
                onClick={() => setFormat("json")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "json" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <FileJson className="h-6 w-6" />
                <span className="text-sm font-medium">JSON</span>
              </button>

              <button
                onClick={() => setFormat("txt")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "txt" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">Text</span>
              </button>
            </div>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
            />
            <p className="text-xs text-muted-foreground">File extension will be added automatically</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="headers"
                checked={includeHeaders}
                onCheckedChange={(checked) => setIncludeHeaders(checked === true)}
              />
              <label
                htmlFor="headers"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include column headers
              </label>
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Fields to Export</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedFields(new Set(allFields))}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedFields(new Set())}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-4 max-h-60 overflow-y-auto">
              {allFields.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox id={field} checked={selectedFields.has(field)} onCheckedChange={() => toggleField(field)} />
                  <label
                    htmlFor={field}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field}
                  </label>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedFields.size} of {allFields.length} fields selected
            </p>
          </div>

          {/* Export Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-1">
            <p className="text-sm font-medium">Export Summary</p>
            <p className="text-xs text-muted-foreground">
              {players.length} players • {selectedFields.size} fields • {format.toUpperCase()} format
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedFields.size === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export {format.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
