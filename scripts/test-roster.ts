import { parseCSV } from "../lib/csv-parser"
import { processRoster } from "../lib/roster-logic"
import * as fs from "fs"
import * as path from "path"

async function testRoster() {
  console.log("[v0] Starting roster processing test...\n")

  // Read the CSV file
  const csvPath = path.join(process.cwd(), "user_read_only_context/text_attachments/USR-DATA---PLAY-JgaOl.csv")
  const csvContent = fs.readFileSync(csvPath, "utf-8")

  console.log("[v0] Parsing CSV...")
  const originalPlayers = parseCSV(csvContent)
  console.log(`[v0] Loaded ${originalPlayers.length} players\n`)

  // Process the roster
  console.log("[v0] Processing roster with equipment templates and jersey assignments...")
  const { players: processedPlayers, audit } = processRoster(originalPlayers)
  console.log(`[v0] Processed ${processedPlayers.length} players\n`)

  // Show statistics
  console.log("=== PROCESSING STATISTICS ===")
  console.log(`Total players: ${processedPlayers.length}`)
  console.log(`Teams found: ${new Set(processedPlayers.map((p) => p.TGID)).size}`)
  console.log(`Positions found: ${new Set(processedPlayers.map((p) => p.PPOS)).size}`)

  // Jersey changes
  const jerseyChanges = processedPlayers.filter((p, i) => {
    const original = originalPlayers[i]
    return original.PJEN !== p.PJEN
  })
  console.log(`Jersey numbers changed: ${jerseyChanges.length}`)
  console.log(`Jersey numbers preserved: ${processedPlayers.length - jerseyChanges.length}\n`)

  // Show sample of jersey changes
  console.log("=== SAMPLE JERSEY CHANGES (First 10) ===")
  jerseyChanges.slice(0, 10).forEach((player, i) => {
    const original = originalPlayers.find((p) => p.PGID === player.PGID)
    console.log(
      `${player.FirstName} ${player.LastName} (${player.TeamName} ${player.PositionName}): #${original?.PJEN} → #${player.PJEN} [OVR: ${player.POVR}]`,
    )
  })

  // Show Michigan (TGID 51) changes
  console.log("\n=== MICHIGAN (TGID 51) JERSEY CHANGES ===")
  const michiganChanges = jerseyChanges.filter((p) => p.TGID === "51")
  console.log(`Total changes for Michigan: ${michiganChanges.length}`)
  michiganChanges.slice(0, 15).forEach((player) => {
    const original = originalPlayers.find((p) => p.PGID === player.PGID)
    console.log(
      `${player.FirstName} ${player.LastName} (${player.PositionName}): #${original?.PJEN} → #${player.PJEN} [OVR: ${player.POVR}]`,
    )
  })

  // Equipment template statistics
  console.log("\n=== EQUIPMENT TEMPLATE STATISTICS ===")
  const sleeveStats: Record<string, number> = {}
  processedPlayers.forEach((p) => {
    const key = `L:${p.PLSL},R:${p.PRSL}`
    sleeveStats[key] = (sleeveStats[key] || 0) + 1
  })
  console.log("Sleeve combinations (top 5):")
  Object.entries(sleeveStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([combo, count]) => {
      console.log(`  ${combo}: ${count} players`)
    })

  console.log("\n[v0] Test complete!")
}

testRoster()
