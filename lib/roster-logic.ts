import type { Player } from "./types"
import equipmentTemplatesData from "../logic/equipment_templates.json"
import jerseyNumbersData from "../logic/jersey_numbers.json"
import positionMappingData from "../logic/position_mapping.json"
import teamMappingData from "../logic/team_mapping.json"

interface EquipmentTemplate {
  name: string
  positions: number[]
  PLSL: number
  PLSR: number
  PLWR: number
  PRWR: number
  PLBB: number
  PRBB: number
  PLFB: number
  PRFB: number
}

interface JerseyRule {
  ranges: [number, number][]
  impact: number[]
}

interface PositionInfo {
  name: string
  side: "offense" | "defense"
}

const equipmentTemplates = equipmentTemplatesData as EquipmentTemplate[]
const jerseyRules = jerseyNumbersData as Record<string, JerseyRule>
const positionMapping = positionMappingData as Record<string, PositionInfo>
const teamMapping = teamMappingData as Record<string, string>

const TEMPLATE_FIELDS = ["PLSL", "PLSR", "PLWR", "PRWR", "PLBB", "PRBB", "PLFB", "PRFB"]

const FORCE_ZERO = [
  "PLEL",
  "PREL", // elbows
  "PJER", // jersey sleeves
  "PNEK", // neck pad
  "PRCB",
  "PLCB", // calf braces
  "PLKL",
  "PRKL", // knee braces (locked)
  "PLKN",
  "PRKN", // knee pads
  "BSPT", // Corrected from BSPA to BSPT
]

const FORCE_HELMET = 5
const FORCE_PBAK = 1

function getWeightedStamina(): number {
  const rand = Math.random() * 100 // 0-100

  if (rand < 5) {
    // 5% chance: 85-90
    return 85 + Math.floor(Math.random() * 6)
  } else if (rand < 15) {
    // 10% chance: 80-84
    return 80 + Math.floor(Math.random() * 5)
  } else if (rand < 50) {
    // 35% chance: 75-79
    return 75 + Math.floor(Math.random() * 5)
  } else if (rand < 85) {
    // 35% chance: 70-74
    return 70 + Math.floor(Math.random() * 5)
  } else {
    // 15% chance: 65-69
    return 65 + Math.floor(Math.random() * 5)
  }
}

function getWeightedValue(): number {
  const rand = Math.random() * 100 // 0-100

  if (rand < 5) {
    // 5% chance: 85-90
    return 85 + Math.floor(Math.random() * 6)
  } else if (rand < 15) {
    // 10% chance: 80-84
    return 80 + Math.floor(Math.random() * 5)
  } else if (rand < 50) {
    // 35% chance: 75-79
    return 75 + Math.floor(Math.random() * 5)
  } else if (rand < 85) {
    // 35% chance: 70-74
    return 70 + Math.floor(Math.random() * 5)
  } else {
    // 15% chance: 65-69
    return 65 + Math.floor(Math.random() * 5)
  }
}

// Apply global equipment rules
function applyGlobalRules(player: Player): void {
  if ("PHLM" in player) {
    ;(player as any).PHLM = FORCE_HELMET
  }

  for (const field of FORCE_ZERO) {
    if (field in player) {
      ;(player as any)[field] = 0
    }
  }

  if ("PBAK" in player) {
    ;(player as any).PBAK = FORCE_PBAK
  }

  if ("PFLK" in player) {
    ;(player as any).PFLK = player.PPOS === 0 ? 1 : 0
  }

  if ("PLSO" in player) {
    ;(player as any).PLSO = Math.floor(Math.random() * 3)
  }

  if ((player.PPOS === 19 || player.PPOS === 20) && "PKPR" in player) {
    const currentPKPR = (player as any).PKPR
    if (currentPKPR < 75) {
      ;(player as any).PKPR = 75
      console.log(`[v0] Adjusted ${player.FirstName} ${player.LastName} PKPR from ${currentPKPR} to 75`)
    }
  }

  if ((player.PPOS === 16 || player.PPOS === 17 || player.PPOS === 18) && "PAGI" in player) {
    ;(player as any).PAGI = 99
  }

  if ((player.PPOS === 10 || player.PPOS === 11 || player.PPOS === 12) && "PJMP" in player) {
    ;(player as any).PJMP = 99
  }

  if ("PSTA" in player) {
    ;(player as any).PSTA = getWeightedValue()
  }

  if ("PINJ" in player) {
    ;(player as any).PINJ = getWeightedValue()
  }
}

function applyEquipmentTemplate(player: Player): void {
  const ppos = player.PPOS

  if (ppos === undefined) return

  // Find all templates that include this position
  const eligibleTemplates = equipmentTemplates.filter(
    (template) => template.positions && template.positions.includes(ppos),
  )

  if (eligibleTemplates.length === 0) {
    console.warn(`[v0] No equipment template found for position ${ppos}`)
    return
  }

  // Randomly select one template
  const selectedTemplate = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)]

  player.assignedTemplate = selectedTemplate.name
  ;(player as any).PLSL = selectedTemplate.PLSL !== undefined ? selectedTemplate.PLSL : 0
  ;(player as any).PLSR = selectedTemplate.PLSR !== undefined ? selectedTemplate.PLSR : 0
  ;(player as any).PLWR = selectedTemplate.PLWR !== undefined ? selectedTemplate.PLWR : 0
  ;(player as any).PRWR = selectedTemplate.PRWR !== undefined ? selectedTemplate.PRWR : 0
  ;(player as any).PLBB = selectedTemplate.PLBB !== undefined ? selectedTemplate.PLBB : 0
  ;(player as any).PRBB = selectedTemplate.PRBB !== undefined ? selectedTemplate.PRBB : 0
  ;(player as any).PLFB = selectedTemplate.PLFB !== undefined ? selectedTemplate.PLFB : 0
  ;(player as any).PRFB = selectedTemplate.PRFB !== undefined ? selectedTemplate.PRFB : 0

  console.log(
    `[v0] Applied ${selectedTemplate.name} to ${player.FirstName} ${player.LastName}: PLSL=${selectedTemplate.PLSL}, PLSR=${selectedTemplate.PLSR}`,
  )
}

function flattenRanges(ranges: [number, number][]): number[] {
  const numbers: number[] = []
  for (const [min, max] of ranges) {
    for (let i = min; i <= max; i++) {
      numbers.push(i)
    }
  }
  return numbers
}

function isValidJerseyForPosition(jersey: number, ppos: number): boolean {
  const rule = jerseyRules[String(ppos)]
  if (!rule || !rule.ranges) return false

  for (const [min, max] of rule.ranges) {
    if (jersey >= min && jersey <= max) {
      return true
    }
  }
  return false
}

function assignJerseyNumbersForTeam(teamPlayers: Player[]): void {
  // Store original jerseys for audit
  teamPlayers.forEach((p) => {
    p.originalJersey = p.PJEN
  })

  const offensePlayers = teamPlayers.filter((p) => {
    const posInfo = positionMapping[String(p.PPOS)]
    return posInfo && posInfo.side === "offense"
  })

  const defensePlayers = teamPlayers.filter((p) => {
    const posInfo = positionMapping[String(p.PPOS)]
    return posInfo && posInfo.side === "defense"
  })

  // Process each side independently
  assignJerseyNumbersForSide(offensePlayers)
  assignJerseyNumbersForSide(defensePlayers)
}

function assignJerseyNumbersForSide(players: Player[]): void {
  const usedNumbers = new Set<number>()

  const positionGroups: Record<number, Player[]> = {}
  for (const player of players) {
    const ppos = player.PPOS
    if (ppos === undefined) continue

    if (!positionGroups[ppos]) {
      positionGroups[ppos] = []
    }
    positionGroups[ppos].push(player)
  }

  for (const ppos in positionGroups) {
    positionGroups[ppos].sort((a, b) => (b.POVR || 0) - (a.POVR || 0))
  }

  console.log("[v0] === PASS 1: Preserving valid existing jerseys ===")
  for (const ppos in positionGroups) {
    const pposNum = Number(ppos)
    for (const player of positionGroups[ppos]) {
      const currentJersey = player.PJEN

      // Check if player has a jersey and if it's valid for their position
      if (currentJersey && currentJersey !== 0 && isValidJerseyForPosition(currentJersey, pposNum)) {
        // Keep the valid jersey, mark it as used
        usedNumbers.add(currentJersey)
        player.JerseyNumber = currentJersey
        console.log(
          `[v0] Preserved valid jersey ${currentJersey} for ${player.FirstName} ${player.LastName} (PPOS ${pposNum}, OVR ${player.POVR})`,
        )
      } else {
        // Mark player as needing a jersey assignment
        player.PJEN = 0
        console.log(
          `[v0] Player ${player.FirstName} ${player.LastName} needs jersey (had ${currentJersey}, invalid for PPOS ${pposNum})`,
        )
      }
    }
  }

  console.log("[v0] === PASS 2: Assigning impact numbers ===")
  for (const ppos in positionGroups) {
    const pposNum = Number(ppos)
    const rule = jerseyRules[ppos]
    if (!rule || !rule.impact || rule.impact.length === 0) continue

    // Get players who need jerseys (PJEN === 0), sorted by POVR (already sorted above)
    const playersNeedingJerseys = positionGroups[ppos].filter((p) => p.PJEN === 0)

    // Get available impact numbers (not already used across all positions on this side)
    const availableImpactNumbers = rule.impact.filter((num) => !usedNumbers.has(num))

    // Assign impact numbers to top players
    for (let i = 0; i < Math.min(availableImpactNumbers.length, playersNeedingJerseys.length); i++) {
      const player = playersNeedingJerseys[i]
      const impactNumber = availableImpactNumbers[i]

      player.PJEN = impactNumber
      player.JerseyNumber = impactNumber
      usedNumbers.add(impactNumber)
      console.log(
        `[v0] Assigned impact jersey ${impactNumber} to ${player.FirstName} ${player.LastName} (PPOS ${pposNum}, OVR ${player.POVR})`,
      )
    }
  }

  console.log("[v0] === PASS 3: Assigning remaining valid numbers ===")
  for (const ppos in positionGroups) {
    const pposNum = Number(ppos)
    const rule = jerseyRules[ppos]
    if (!rule || !rule.ranges) continue

    // Get all valid numbers for this position
    const allValidNumbers = flattenRanges(rule.ranges)

    // Get available numbers (not used by any player on this side)
    const availableNumbers = allValidNumbers.filter((num) => !usedNumbers.has(num))

    // Get players who still need jerseys
    const playersNeedingJerseys = positionGroups[ppos].filter((p) => p.PJEN === 0)

    for (const player of playersNeedingJerseys) {
      if (availableNumbers.length > 0) {
        // Pick a random available number
        const randomIndex = Math.floor(Math.random() * availableNumbers.length)
        const jerseyNumber = availableNumbers[randomIndex]

        // Remove from available pool
        availableNumbers.splice(randomIndex, 1)

        player.PJEN = jerseyNumber
        player.JerseyNumber = jerseyNumber
        usedNumbers.add(jerseyNumber)
        console.log(`[v0] Assigned jersey ${jerseyNumber} to ${player.FirstName} ${player.LastName} (PPOS ${pposNum})`)
      } else {
        const jerseyNumber = allValidNumbers[Math.floor(Math.random() * allValidNumbers.length)]
        player.PJEN = jerseyNumber
        player.JerseyNumber = jerseyNumber
        console.warn(
          `[v0] WARNING: No available jerseys for ${player.FirstName} ${player.LastName} (PPOS ${pposNum}), assigned ${jerseyNumber} (may duplicate)`,
        )
      }
    }
  }
}

export function processRoster(players: Player[]): {
  processed: Player[]
  summary: { totalPlayers: number; teamsProcessed: number; equipmentApplied: number; jerseysChanged: number }
} {
  console.log("[v0] Processing roster with", players.length, "players...")

  let equipmentCount = 0
  let jerseyChangeCount = 0

  // Apply equipment templates to all players first
  for (const player of players) {
    applyEquipmentTemplate(player)
    equipmentCount++
  }

  // Then apply global rules (which should not touch template fields)
  for (const player of players) {
    applyGlobalRules(player)
  }

  // Group players by team
  const teamGroups: Record<number, Player[]> = {}
  for (const player of players) {
    const tgid = player.TGID
    if (tgid === undefined) continue

    if (!teamGroups[tgid]) {
      teamGroups[tgid] = []
    }
    teamGroups[tgid].push(player)
  }

  console.log("[v0] Found", Object.keys(teamGroups).length, "teams")

  // Assign jersey numbers per team
  for (const tgid in teamGroups) {
    assignJerseyNumbersForTeam(teamGroups[tgid])
  }

  // Count jersey changes
  jerseyChangeCount = players.filter((p) => p.originalJersey && p.originalJersey !== p.PJEN).length

  console.log("[v0] Processing complete!")
  console.log("[v0] Equipment templates applied:", equipmentCount)
  console.log("[v0] Jersey numbers changed:", jerseyChangeCount)

  return {
    processed: players,
    summary: {
      totalPlayers: players.length,
      teamsProcessed: Object.keys(teamGroups).length,
      equipmentApplied: equipmentCount,
      jerseysChanged: jerseyChangeCount,
    },
  }
}

export function getPlayersByTeam(players: Player[], tgid: number): Player[] {
  return players.filter((p) => p.TGID === tgid)
}

export function getJerseyChanges(players: Player[]): Player[] {
  return players.filter((p) => p.originalJersey !== undefined && p.originalJersey !== p.PJEN)
}

export function getPlayersByPosition(players: Player[], ppos: number): Player[] {
  return players.filter((p) => p.PPOS === ppos)
}

export function getPositionName(code: number): string {
  const posInfo = positionMapping[String(code)]
  return posInfo ? posInfo.name : `Position ${code}`
}

export function getTeamName(code: number): string {
  return teamMapping[String(code)] || `Team ${code}`
}

export function getPositionSide(code: number): string {
  const posInfo = positionMapping[String(code)]
  return posInfo ? posInfo.side : "unknown"
}

export function getTemplateCounts(players: Player[]): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const player of players) {
    if (player.assignedTemplate) {
      counts[player.assignedTemplate] = (counts[player.assignedTemplate] || 0) + 1
    }
  }

  return counts
}

export function getPlayersByTemplate(players: Player[], templateName: string): Player[] {
  return players.filter((p) => p.assignedTemplate === templateName)
}
