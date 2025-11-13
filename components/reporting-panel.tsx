"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Player } from "@/lib/types"
import { getTeamName } from "@/lib/roster-logic"
import { CONFERENCES, CONFERENCE_TEAMS, type ConferenceKey } from "@/lib/conference-mapping"

interface ReportingPanelProps {
  processedPlayers: Player[]
}

type ClassYearFilter = "All" | "True Freshman"

export function ReportingPanel({ processedPlayers }: ReportingPanelProps) {
  const [selectedConference, setSelectedConference] = useState<ConferenceKey>("NCAA")
  const [classYearFilter, setClassYearFilter] = useState<ClassYearFilter>("All")

  const filteredPlayers = processedPlayers.filter((player) => {
    // Conference filter
    if (selectedConference !== "NCAA") {
      const conferenceTeams = CONFERENCE_TEAMS[selectedConference]
      if (!conferenceTeams.includes(player.TGID || 0)) return false
    }

    // Class year filter
    if (classYearFilter === "True Freshman") {
      const pyea = (player as any).PYEA || 0
      const prsd = (player as any).PRSD || 0
      if (pyea !== 0 || prsd !== 0) return false
    }

    return true
  })

  const getTopQBs = (): Player[] => {
    return filteredPlayers
      .filter((p) => p.PPOS === 0)
      .map((qb) => {
        const povr = qb.POVR || 0
        const pthp = (qb as any).PTHP || 0
        const ptha = (qb as any).PTHA || 0
        const pawr = (qb as any).PAWR || 0
        const combinedScore = povr + pthp + ptha + pawr

        return { ...qb, combinedScore }
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5)
  }

  const getTopHBs = (): Player[] => {
    return filteredPlayers
      .filter((p) => p.PPOS === 1)
      .map((hb) => {
        const povr = hb.POVR || 0
        const pspd = (hb as any).PSPD || 0
        const pacc = (hb as any).PACC || 0
        const pagi = (hb as any).PAGI || 0
        const pcar = (hb as any).PCAR || 0
        const psta = (hb as any).PSTA || 0
        const psmv = (hb as any).PSMV || 0
        const pjmv = (hb as any).PJMV || 0
        const pawr = (hb as any).PAWR || 0
        const combinedScore = povr + pspd + pacc + pagi + pcar + psta + psmv + pjmv + pawr

        return { ...hb, combinedScore }
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5)
  }

  const getTopWRTE = (): Player[] => {
    return filteredPlayers
      .filter((p) => p.PPOS === 3 || p.PPOS === 4)
      .map((player) => {
        const povr = player.POVR || 0
        const pspd = (player as any).PSPD || 0
        const pacc = (player as any).PACC || 0
        const pagi = (player as any).PAGI || 0
        const traf = (player as any).TRAF || 0
        const pcth = (player as any).PCTH || 0
        const spct = (player as any).SPCT || 0
        const pawr = (player as any).PAWR || 0
        const combinedScore = povr + pspd + pacc + pagi + traf + pcth + spct + pawr

        return { ...player, combinedScore }
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5)
  }

  const getTopDL = (): Player[] => {
    return filteredPlayers
      .filter((p) => p.PPOS === 10 || p.PPOS === 11 || p.PPOS === 12)
      .map((player) => {
        const povr = player.POVR || 0
        const pspd = (player as any).PSPD || 0
        const pacc = (player as any).PACC || 0
        const pagi = (player as any).PAGI || 0
        const pstr = (player as any).PSTR || 0
        const pfmv = (player as any).PFMV || 0
        const ppmv = (player as any).PPMV || 0
        const pawr = (player as any).PAWR || 0
        const combinedScore = povr + pspd + pacc + pagi + pstr + pfmv + ppmv + pawr

        return { ...player, combinedScore }
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5)
  }

  const getTopLB = (): Player[] => {
    return filteredPlayers
      .filter((p) => p.PPOS === 13 || p.PPOS === 14 || p.PPOS === 15)
      .map((player) => {
        const povr = player.POVR || 0
        const pspd = (player as any).PSPD || 0
        const pacc = (player as any).PACC || 0
        const pagi = (player as any).PAGI || 0
        const pprs = (player as any).PPRS || 0
        const pstr = (player as any).PSTR || 0
        const pprc = (player as any).PPRC || 0
        const pmcv = (player as any).PMCV || 0
        const pzcv = (player as any).PZCV || 0
        const pfmv = (player as any).PFMV || 0
        const ppmv = (player as any).PPMV || 0
        const pawr = (player as any).PAWR || 0
        const combinedScore = povr + pspd + pacc + pagi + pprs + pstr + pprc + pmcv + pzcv + pfmv + ppmv + pawr

        return { ...player, combinedScore }
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5)
  }

  const getTopPlayersByPositions = (positions: number[], groupName: string): Player[] => {
    return filteredPlayers
      .filter((p) => positions.includes(p.PPOS || 0))
      .sort((a, b) => (b.POVR || 0) - (a.POVR || 0))
      .slice(0, 5)
  }

  const topQBs = getTopQBs()
  const topHBs = getTopHBs()
  const topWRTE = getTopWRTE()

  const topDL = getTopDL()
  const topLB = getTopLB()
  const topDB = getTopPlayersByPositions([16, 17, 18], "DB")

  const PlayerTable = ({ players, title }: { players: Player[]; title: string }) => {
    if (players.length === 0) return null

    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium">Rank</th>
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">OVR</th>
                <th className="p-3 text-left font-medium">Team</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={idx} className="border-t border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-semibold text-primary">#{idx + 1}</td>
                  <td className="p-3 font-medium">{`${player.FirstName} ${player.LastName}`}</td>
                  <td className="p-3 font-mono font-bold text-lg">{player.POVR}</td>
                  <td className="p-3 text-muted-foreground">{getTeamName(player.TGID || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label htmlFor="conference-select" className="text-sm font-medium whitespace-nowrap">
                Filter by Conference:
              </label>
              <Select
                value={selectedConference}
                onValueChange={(value) => setSelectedConference(value as ConferenceKey)}
              >
                <SelectTrigger id="conference-select" className="w-48">
                  <SelectValue placeholder="Select conference" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONFERENCES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="classyear-select" className="text-sm font-medium whitespace-nowrap">
                Class Year:
              </label>
              <Select value={classYearFilter} onValueChange={(value) => setClassYearFilter(value as ClassYearFilter)}>
                <SelectTrigger id="classyear-select" className="w-48">
                  <SelectValue placeholder="Select class year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="True Freshman">True Freshman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offense Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">OFFENSE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PlayerTable players={topQBs} title="Top 5 Quarterbacks" />
          <PlayerTable players={topHBs} title="Top 5 Halfbacks" />
          <PlayerTable players={topWRTE} title="Top 5 Wide Receivers / Tight Ends" />
        </CardContent>
      </Card>

      {/* Defense Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">DEFENSE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PlayerTable players={topDL} title="Top 5 Defensive Line" />
          <PlayerTable players={topLB} title="Top 5 Linebackers" />
          <PlayerTable players={topDB} title="Top 5 Defensive Backs" />
        </CardContent>
      </Card>
    </div>
  )
}
