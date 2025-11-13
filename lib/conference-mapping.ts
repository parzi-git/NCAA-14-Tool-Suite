export const CONFERENCES = {
  NCAA: "All Teams",
  SEC: "SEC",
  BIG10: "Big Ten",
  ACC: "ACC",
  BIG12: "Big 12",
  PAC12: "Pac-12",
} as const

export type ConferenceKey = keyof typeof CONFERENCES

export const CONFERENCE_TEAMS: Record<ConferenceKey, number[]> = {
  NCAA: [], // Empty array means all teams
  SEC: [3, 6, 9, 27, 30, 42, 45, 56, 55, 71, 73, 84, 91, 92, 93, 106],
  BIG10: [35, 36, 37, 47, 51, 52, 54, 58, 70, 74, 76, 78, 80, 102, 110, 114],
  ACC: [13, 21, 24, 28, 31, 44, 49, 62, 63, 68, 77, 83, 88, 107, 108, 109],
  BIG12: [4, 5, 11, 16, 20, 22, 33, 38, 39, 40, 72, 89, 94, 103, 18, 112],
  PAC12: [12, 17, 23, 29, 32, 75, 81, 87, 218, 99, 101, 104, 111, 144],
}
