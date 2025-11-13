"use client"
import { useState, useMemo } from "react"
import type { Player } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTeamName, getPositionName } from "@/lib/roster-logic"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import headerMapping from "@/logic/header_mapping.json"

interface ComparisonPanelProps {
  originalPlayers: Player[]
  processedPlayers: Player[]
}

interface PlayerChange {
  player: Player
  changes: {
    field: string
    original: any
    updated: any
  }[]
}

const equipmentValueNames: Record<string, Record<number, string>> = {
  PLSL: {
    0: "Normal",
    1: "Long White",
    2: "Long Black",
    3: "Short White",
    4: "Short Black",
    5: "Elite White",
    6: "Elite Black",
  },
  PLSR: {
    0: "Normal",
    1: "Long White",
    2: "Long Black",
    3: "Short White",
    4: "Short Black",
    5: "Elite White",
    6: "Elite Black",
  },
  PLWR: { 0: "None", 1: "White Wristband", 2: "Black Wristband", 3: "Team Color" },
  PRWR: { 0: "None", 1: "White Wristband", 2: "Black Wristband", 3: "Team Color" },
  PLBB: { 0: "None", 1: "Black Bicep", 2: "White Bicep", 3: "Team Color" },
  PRBB: { 0: "None", 1: "Black Bicep", 2: "White Bicep", 3: "Team Color" },
  PLFB: { 0: "None", 1: "Black Forearm", 2: "White Forearm" },
  PRFB: { 0: "None", 1: "Black Forearm", 2: "White Forearm" },
  PFLK: { 0: "No", 1: "Yes" },
}

const GLOBAL_FIELDS = ["PBAK", "PHLM", "PNEK", "PJER", "PLSO", "BSPT"]

const getDisplayName = (field: string): string => {
  return (headerMapping as any)[field] || field
}

const getEquipmentValueName = (field: string, value: any): string => {
  if (equipmentValueNames[field] && equipmentValueNames[field][value] !== undefined) {
    return `(${value}) ${equipmentValueNames[field][value]}`
  }
  return String(value ?? "N/A")
}

export function ComparisonPanel({ originalPlayers, processedPlayers }: ComparisonPanelProps) {
  const [filterCategory, setFilterCategory] = useState<"all" | "jersey" | "equipment" | "attributes">("all")
  const [displayLimit, setDisplayLimit] = useState(50)

  const playerChanges = useMemo(() => {
    console.log("[v0] Computing player changes...")

    if (!originalPlayers?.length || !processedPlayers?.length) {
      console.log("[v0] No data available for comparison")
      return []
    }

    const changes: PlayerChange[] = []

    try {
      const originalMap = new Map<string, Player>()
      originalPlayers.forEach((p) => {
        const key = `${p.PGID}-${p.TGID}`
        originalMap.set(key, p)
      })

      console.log("[v0] Original map created with", originalMap.size, "players")

      processedPlayers.forEach((processed) => {
        const key = `${processed.PGID}-${processed.TGID}`
        const original = originalMap.get(key)

        if (!original) return

        const ppos = processed.PPOS || 0
        if (ppos >= 5 && ppos <= 9) {
          return
        }

        const playerChanges: { field: string; original: any; updated: any }[] = []

        const equipmentFields = ["PLSL", "PLSR", "PLWR", "PRWR", "PLBB", "PRBB", "PLFB", "PRFB"]
        const hasEquipmentChanges = equipmentFields.some((field) => {
          const origVal = (original as any)[field]
          const procVal = (processed as any)[field]
          return origVal !== procVal
        })

        if (hasEquipmentChanges && processed.assignedTemplate) {
          playerChanges.push({
            field: "EQUIPMENT_TEMPLATE",
            original: "No Template",
            updated: processed.assignedTemplate,
          })
        }

        if (original.PJEN !== processed.PJEN) {
          playerChanges.push({ field: "PJEN", original: original.PJEN, updated: processed.PJEN })
        }

        const attributeFields = ["PAGI", "PJMP", "PKPR", "PFLK", "PSTA", "PINJ"]
        attributeFields.forEach((field) => {
          const origVal = (original as any)[field]
          const procVal = (processed as any)[field]
          if (origVal !== procVal) {
            playerChanges.push({ field, original: origVal, updated: procVal })
          }
        })

        if (playerChanges.length > 0) {
          changes.push({ player: processed, changes: playerChanges })
        }
      })

      console.log("[v0] Comparison complete:", changes.length, "players with changes")
    } catch (error) {
      console.error("[v0] Error comparing players:", error)
      return []
    }

    return changes
  }, [originalPlayers, processedPlayers])

  const stats = useMemo(() => {
    const jerseyChanges = playerChanges.filter((pc) => pc.changes.some((c) => c.field === "PJEN")).length
    const equipmentChanges = playerChanges.filter((pc) =>
      pc.changes.some((c) => c.field === "EQUIPMENT_TEMPLATE"),
    ).length
    const attributeChanges = playerChanges.filter((pc) =>
      pc.changes.some((c) => ["PAGI", "PJMP", "PKPR", "PFLK", "PSTA", "PINJ"].includes(c.field)),
    ).length

    return { jerseyChanges, equipmentChanges, attributeChanges, totalAffected: playerChanges.length }
  }, [playerChanges])

  const filteredChanges = useMemo(() => {
    if (filterCategory === "all") return playerChanges

    return playerChanges.filter((pc) => {
      if (filterCategory === "jersey") {
        return pc.changes.some((c) => c.field === "PJEN")
      }
      if (filterCategory === "equipment") {
        return pc.changes.some((c) => c.field === "EQUIPMENT_TEMPLATE")
      }
      if (filterCategory === "attributes") {
        return pc.changes.some((c) => ["PAGI", "PJMP", "PKPR", "PFLK", "PSTA", "PINJ"].includes(c.field))
      }
      return false
    })
  }, [playerChanges, filterCategory])

  const displayedChanges = useMemo(() => {
    return filteredChanges.slice(0, displayLimit)
  }, [filteredChanges, displayLimit])

  if (!originalPlayers || !processedPlayers || originalPlayers.length === 0 || processedPlayers.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>Process a roster file to see the comparison.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Changes</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.totalAffected}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">players affected</CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Jersey Numbers</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.jerseyChanges}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">jerseys updated</CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Equipment</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.equipmentChanges}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">equipment changed</CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Attributes</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.attributeChanges}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">attributes modified</CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-4 bg-secondary/50">
          <TabsTrigger value="all" className="font-medium text-xs">
            All ({playerChanges.length})
          </TabsTrigger>
          <TabsTrigger value="jersey" className="font-medium text-xs">
            Jerseys ({stats.jerseyChanges})
          </TabsTrigger>
          <TabsTrigger value="equipment" className="font-medium text-xs">
            Equipment ({stats.equipmentChanges})
          </TabsTrigger>
          <TabsTrigger value="attributes" className="font-medium text-xs">
            Attributes ({stats.attributeChanges})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Changes List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Changed Players</CardTitle>
          <CardDescription className="text-sm">
            Showing {displayedChanges.length} of {filteredChanges.length} players with changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {displayedChanges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No changes found in this category</p>
            ) : (
              <>
                {displayedChanges.map((pc, idx) => (
                  <div key={idx} className="p-4 bg-secondary/30 rounded-lg border border-border/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {pc.player.FirstName} {pc.player.LastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getPositionName(pc.player.PPOS || 0)} • {getTeamName(pc.player.TGID || 0)} • OVR{" "}
                          {pc.player.POVR}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">{pc.changes.length} changes</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pc.changes.map((change, changeIdx) => {
                        const isEquipmentTemplate = change.field === "EQUIPMENT_TEMPLATE"
                        const displayOriginal = isEquipmentTemplate
                          ? change.original
                          : equipmentValueNames[change.field]
                            ? getEquipmentValueName(change.field, change.original)
                            : (change.original ?? "N/A")
                        const displayUpdated = isEquipmentTemplate
                          ? change.updated
                          : equipmentValueNames[change.field]
                            ? getEquipmentValueName(change.field, change.updated)
                            : (change.updated ?? "N/A")

                        return (
                          <div key={changeIdx} className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-muted-foreground min-w-[100px]">
                              {isEquipmentTemplate ? "Equipment Template" : getDisplayName(change.field)}:
                            </span>
                            <span className="text-red-400">{displayOriginal}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-green-400">{displayUpdated}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {filteredChanges.length > displayLimit && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDisplayLimit((prev) => prev + 50)}
                      className="font-medium"
                    >
                      Load More ({filteredChanges.length - displayLimit} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
