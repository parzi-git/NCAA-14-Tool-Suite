"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadAreaProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isProcessing: boolean
}

export function FileUploadArea({ onFileUpload, isProcessing }: FileUploadAreaProps) {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Upload Roster File</CardTitle>
          <CardDescription>Upload your NCAA 14 roster CSV file to begin processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-muted/20 p-12">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drop your CSV file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports CSV files exported from NCAA Football 14</p>
            </div>
            <input type="file" accept=".csv" onChange={onFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload">
              <Button asChild disabled={isProcessing}>
                <span>{isProcessing ? "Processing..." : "Select File"}</span>
              </Button>
            </label>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium text-foreground">What this tool does:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Randomizes player equipment from curated templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Manages jersey numbers by position with impact number priority</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Preserves valid existing jersey assignments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Provides visual analytics and audit trails</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
