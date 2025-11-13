export interface Player {
  // Core identifiers
  PGID?: string
  TeamId: number
  Position: number
  JerseyNumber: number

  // Player info
  FirstName: string
  LastName: string
  POVR: number // Overall rating

  // Equipment fields
  LeftElbow: number
  RightElbow: number
  LeftWrist: number
  RightWrist: number
  LeftSleeve: number
  RightSleeve: number
  FlakJacket: number
  LeftShoe: number
  RightShoe: number
  LeftKneePad: number
  RightKneePad: number
  NeckPad: number
  Visor: number
  EyeBlack: number
  MouthPiece: number
  Socks: number
  Height: number
  Weight: number

  // Original NCAA column names (all columns preserved from CSV)
  PFNA?: string // First Name
  PLNA?: string // Last Name
  TGID?: number // Team ID
  PPOS?: number // Position
  PJEN?: number // Jersey Number
  PLEL?: number // Left Elbow
  PREL?: number // Right Elbow
  PLWR?: number // Left Wrist
  PRWR?: number // Right Wrist
  PLSL?: number // Left Sleeve
  PRSL?: number // Right Sleeve
  PFLK?: number // Flak Jacket
  PLSH?: number // Left Shoe
  PRSH?: number // Right Shoe
  PLKL?: number // Left Knee Pad
  PLKR?: number // Right Knee Pad
  PNEK?: number // Neck Pad
  PVIS?: number // Visor
  PEYE?: number // Eye Black
  PMPC?: number // Mouthpiece
  PLSO?: number // Socks
  PHGT?: number // Height
  PWGT?: number // Weight

  originalJersey?: number
  assignedTemplate?: string

  // Allow any other NCAA columns to be preserved
  [key: string]: string | number | undefined
}

export interface EquipmentTemplate {
  PLEL: number // LeftElbow
  PREL: number // RightElbow
  PLWR: number // LeftWrist
  PRWR: number // RightWrist
  PLSL: number // LeftSleeve
  PRSL: number // RightSleeve
  PFLK: number // Flak Jacket
  PLSH: number // Left Shoe
  PRSH: number // Right Shoe
  PLKL: number // Left Knee Pad
  PLKR: number // Right Knee Pad
  PNEK: number // Neck Pad
  PVIS: number // Visor
  PEYE: number // EyeBlack
  PMPC: number // MouthPiece
}

export interface JerseyRange {
  min: number
  max: number
  impact_numbers: number[]
}

export interface TeamStats {
  teamId: string
  teamName: string
  playerCount: number
  averageRating: number
  positions: Record<string, number>
  jerseyDistribution: Record<string, number>
}

export interface EquipmentStats {
  sleeveTypes: Record<string, number>
  wristbandTypes: Record<string, number>
  visorTypes: Record<string, number>
  total: number
}
