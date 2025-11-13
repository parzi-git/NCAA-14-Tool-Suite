import type { Player } from "./types"
import headerMappingData from "./data/header-mapping.json"

const headerMapping = headerMappingData as Record<string, string>

const DISPLAY_COLUMN_MAP: Record<string, keyof Player> = {
  PFNA: "FirstName",
  PLNA: "LastName",
  PPOS: "Position",
  TGID: "TeamId",
  PJEN: "JerseyNumber", // Fixed - PJEN is the jersey number column, not PJER
  POVR: "Rating",
  PLEL: "LeftElbow",
  PREL: "RightElbow",
  PLWR: "LeftWrist",
  PRWR: "RightWrist",
  PLSL: "LeftSleeve",
  PRSL: "RightSleeve",
  PFLK: "FlakJacket",
  PLSH: "LeftShoe",
  PRSH: "RightShoe",
  PLKL: "LeftKneePad",
  PLKR: "RightKneePad",
  PNEK: "NeckPad",
  PVIS: "Visor",
  PEYE: "EyeBlack",
  PMPC: "MouthPiece",
  PLSO: "Socks",
  PHGT: "Height",
  PWGT: "Weight",
}

export function parseCSV(csvContent: string): Player[] {
  console.log("[v0] Starting CSV parse...")
  const lines = csvContent.split("\n").filter((line) => line.trim())

  if (lines.length < 2) {
    throw new Error("CSV file must have a header row and at least one data row")
  }

  const headers = lines[0].split(",").map((h) => h.trim())
  console.log("[v0] Found", headers.length, "columns")

  const players: Player[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    if (values.length !== headers.length) {
      continue
    }

    const player: any = {}

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j]
      const value = values[j].trim()

      // Convert to number if applicable
      const numValue = Number(value)
      player[header] = !isNaN(numValue) && value !== "" ? numValue : value
    }

    if (player.PFNA) player.FirstName = player.PFNA
    if (player.PLNA) player.LastName = player.PLNA
    if (player.TGID !== undefined) player.TeamId = player.TGID
    if (player.PPOS !== undefined) player.Position = player.PPOS
    if (player.PJEN !== undefined) player.JerseyNumber = player.PJEN
    if (player.POVR !== undefined) player.Rating = player.POVR

    // Only add players with required fields
    if (player.PFNA && player.PLNA && player.PPOS !== undefined && player.TGID !== undefined) {
      players.push(player as Player)
    }
  }

  console.log("[v0] Successfully parsed", players.length, "players")

  return players
}

export function toCSV(players: Player[]): string {
  console.log("[v0] toCSV called with", players.length, "players")

  if (players.length === 0) {
    console.log("[v0] No players to export")
    return ""
  }

  const firstPlayer = players[0] as any
  const allKeys = Object.keys(firstPlayer)
  console.log("[v0] First player has", allKeys.length, "keys")

  const ncaaColumns = allKeys.filter((key) => /^[A-Z]{4}$/.test(key)).sort()
  console.log("[v0] Found", ncaaColumns.length, "NCAA columns to export")

  // Create header row
  const rows: string[] = [ncaaColumns.join(",")]

  // Create data rows
  for (const player of players) {
    const p = player as any
    const values = ncaaColumns.map((col) => {
      const value = p[col]
      if (value === undefined || value === null) return ""

      const stringValue = String(value)
      // Escape commas with quotes
      if (stringValue.includes(",")) {
        return `"${stringValue}"`
      }
      return stringValue
    })

    rows.push(values.join(","))
  }

  const csvContent = rows.join("\n")
  console.log("[v0] Generated CSV with", rows.length, "rows (including header)")

  return csvContent
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export function getColumnDisplayName(columnCode: string): string {
  return headerMapping[columnCode] || columnCode
}
