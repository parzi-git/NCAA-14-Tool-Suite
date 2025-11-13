"use client"

import { useState, useMemo } from "react"
import type { Player } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Edit2, Save, X } from "lucide-react"

interface PlayerTableProps {
  players: Player[]
  onUpdatePlayer?: (index: number, updatedPlayer: Player) => void
  editable?: boolean
}

type SortField = keyof Player
type SortDirection = "asc" | "desc"

export function PlayerTable({ players, onUpdatePlayer, editable = false }: PlayerTableProps) {
  console.log("[v0] PlayerTable received", players.length, "players")
  if (players.length > 0) {
    const sample = players[0] as any
    console.log("[v0] PlayerTable sample player keys:", Object.keys(sample).slice(0, 20))
    console.log("[v0] PlayerTable sample player data:", {
      FirstName: sample.FirstName,
      LastName: sample.LastName,
      Position: sample.Position,
      TeamId: sample.TeamId,
      JerseyNumber: sample.JerseyNumber,
      POVR: sample.POVR,
      PFNA: sample.PFNA,
      PLNA: sample.PLNA,
      PPOS: sample.PPOS,
      TGID: sample.TGID,
      PJEN: sample.PJEN,
    })
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("POVR")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null)

  const playersPerPage = 20

  // Filter players based on search
  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return players

    const term = searchTerm.toLowerCase()
    return players.filter(
      (player) =>
        player.FirstName?.toLowerCase().includes(term) ||
        player.LastName?.toLowerCase().includes(term) ||
        player.Position?.toLowerCase().includes(term) ||
        player.TeamId?.toString().toLowerCase().includes(term) ||
        player.JerseyNumber?.toString().includes(term),
    )
  }, [players, searchTerm])

  // Sort players
  const sortedPlayers = useMemo(() => {
    const sorted = [...filteredPlayers]
    sorted.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()

      if (sortDirection === "asc") {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
      }
    })
    return sorted
  }, [filteredPlayers, sortField, sortDirection])

  // Paginate players
  const totalPages = Math.ceil(sortedPlayers.length / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const paginatedPlayers = sortedPlayers.slice(startIndex, startIndex + playersPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleEdit = (index: number, player: Player) => {
    setEditingIndex(startIndex + index)
    setEditedPlayer({ ...player })
  }

  const handleSave = () => {
    if (editingIndex !== null && editedPlayer && onUpdatePlayer) {
      onUpdatePlayer(editingIndex, editedPlayer)
      setEditingIndex(null)
      setEditedPlayer(null)
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditedPlayer(null)
  }

  const updateEditedField = (field: keyof Player, value: string | number) => {
    if (editedPlayer) {
      setEditedPlayer({ ...editedPlayer, [field]: value })
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, position, team, or jersey..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(startIndex + playersPerPage, sortedPlayers.length)} of{" "}
          {sortedPlayers.length} players
        </div>
      </div>

      {/* Player Table */}
      <Card>
        <CardHeader>
          <CardTitle>Player Data</CardTitle>
          <CardDescription>
            {editable ? "Click Edit to modify player information" : "View player roster details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {editable && <th className="pb-3 pr-4 text-left font-medium text-muted-foreground w-20">Actions</th>}
                  <th
                    className="cursor-pointer pb-3 pr-4 text-left font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("FirstName")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <SortIcon field="FirstName" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer pb-3 pr-4 text-left font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("TeamId")}
                  >
                    <div className="flex items-center gap-1">
                      Team
                      <SortIcon field="TeamId" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer pb-3 pr-4 text-left font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("Position")}
                  >
                    <div className="flex items-center gap-1">
                      Pos
                      <SortIcon field="Position" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer pb-3 pr-4 text-left font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("JerseyNumber")}
                  >
                    <div className="flex items-center gap-1">
                      Jersey
                      <SortIcon field="JerseyNumber" />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer pb-3 pr-4 text-left font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("POVR")}
                  >
                    <div className="flex items-center gap-1">
                      OVR
                      <SortIcon field="POVR" />
                    </div>
                  </th>
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">L Sleeve</th>
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">R Sleeve</th>
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Visor</th>
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">L Shoe</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlayers.map((player, idx) => {
                  const isEditing = editingIndex === startIndex + idx
                  const displayPlayer = isEditing && editedPlayer ? editedPlayer : player

                  return (
                    <tr key={startIndex + idx} className="border-b border-border/50">
                      {editable && (
                        <td className="py-3 pr-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Button size="icon-sm" variant="ghost" onClick={handleSave} title="Save">
                                <Save className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon-sm" variant="ghost" onClick={handleCancel} title="Cancel">
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(idx, player)} title="Edit">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      )}
                      <td className="py-3 pr-4 text-foreground">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Input
                              value={displayPlayer.FirstName}
                              onChange={(e) => updateEditedField("FirstName", e.target.value)}
                              className="h-7 w-20 text-xs"
                            />
                            <Input
                              value={displayPlayer.LastName}
                              onChange={(e) => updateEditedField("LastName", e.target.value)}
                              className="h-7 w-20 text-xs"
                            />
                          </div>
                        ) : (
                          `${displayPlayer.FirstName} ${displayPlayer.LastName}`
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {isEditing ? (
                          <Input
                            value={displayPlayer.TeamId}
                            onChange={(e) => updateEditedField("TeamId", e.target.value)}
                            className="h-7 w-16 text-xs"
                          />
                        ) : (
                          displayPlayer.TeamId
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {isEditing ? (
                          <Input
                            value={displayPlayer.Position}
                            onChange={(e) => updateEditedField("Position", e.target.value)}
                            className="h-7 w-16 text-xs"
                          />
                        ) : (
                          displayPlayer.Position
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium text-accent">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayPlayer.JerseyNumber}
                            onChange={(e) => updateEditedField("JerseyNumber", Number.parseInt(e.target.value) || 0)}
                            className="h-7 w-16 text-xs"
                          />
                        ) : (
                          displayPlayer.JerseyNumber
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayPlayer.POVR}
                            onChange={(e) => updateEditedField("POVR", Number.parseInt(e.target.value) || 0)}
                            className="h-7 w-16 text-xs"
                          />
                        ) : (
                          displayPlayer.POVR
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{displayPlayer.LeftSleeve ?? "-"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{displayPlayer.RightSleeve ?? "-"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{displayPlayer.Visor ?? "-"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{displayPlayer.LeftShoe ?? "-"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="w-9"
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
