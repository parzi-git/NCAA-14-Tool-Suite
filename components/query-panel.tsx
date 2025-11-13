"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Player } from "@/lib/types"
import { getPositionName, getTeamName } from "@/lib/roster-logic"

interface QueryPanelProps {
  originalPlayers: Player[]
  processedPlayers: Player[]
}

export function QueryPanel({ originalPlayers, processedPlayers }: QueryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const handleSearch = () => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      setSearchResults([])
      return
    }

    // Search by player name or team name
    const results = processedPlayers.filter((player) => {
      const fullName = `${player.FirstName} ${player.LastName}`.toLowerCase()
      const teamName = getTeamName(player.TGID || 0).toLowerCase()
      return fullName.includes(term) || teamName.includes(term)
    })

    setSearchResults(results.slice(0, 50)) // Limit to 50 results
    setSelectedPlayer(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Player Search</CardTitle>
          <CardDescription>Search by player name or team name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter player or team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Search Results ({searchResults.length} {searchResults.length === 50 ? "- showing first 50" : "found"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {searchResults.map((player, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPlayer(player)}
                  className="w-full rounded-md px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-accent hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {player.FirstName} {player.LastName}
                      </span>
                      <span className="text-muted-foreground">#{player.PJEN}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <span>{getPositionName(player.PPOS || 0)}</span>
                      <span>{getTeamName(player.TGID || 0)}</span>
                      <span className="font-medium">OVR {player.POVR}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPlayer && (
        <Card className="animate-[scale-in_0.2s_ease-out]">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>
                  {selectedPlayer.FirstName} {selectedPlayer.LastName}
                </CardTitle>
                <CardDescription>
                  #{selectedPlayer.PJEN} • {getPositionName(selectedPlayer.PPOS || 0)} •{" "}
                  {getTeamName(selectedPlayer.TGID || 0)}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall Rating</p>
                <p className="text-4xl font-bold">{selectedPlayer.POVR ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchTerm && searchResults.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No players or teams found matching "{searchTerm}"
          </CardContent>
        </Card>
      )}
    </div>
  )
}
