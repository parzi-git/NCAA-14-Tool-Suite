"use client"

import { useMemo } from "react"
import type { Player } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Trophy, TrendingUp, Shirt, Shield, Eye } from "lucide-react"

interface AnalyticsDashboardProps {
  players: Player[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function AnalyticsDashboard({ players }: AnalyticsDashboardProps) {
  // Calculate team statistics
  const teamStats = useMemo(() => {
    const teams = new Map<string, { count: number; totalRating: number; positions: Set<string> }>()

    players.forEach((player) => {
      const teamId = player.TeamId?.toString() || "Unknown"
      if (!teams.has(teamId)) {
        teams.set(teamId, { count: 0, totalRating: 0, positions: new Set() })
      }
      const team = teams.get(teamId)!
      team.count++
      team.totalRating += player.POVR || 0
      team.positions.add(player.Position?.toString() || "Unknown")
    })

    return Array.from(teams.entries())
      .map(([teamId, data]) => ({
        team: teamId,
        players: data.count,
        avgRating: (data.totalRating / data.count).toFixed(1),
        positions: data.positions.size,
      }))
      .sort((a, b) => b.players - a.players)
      .slice(0, 10)
  }, [players])

  // Calculate position distribution
  const positionStats = useMemo(() => {
    const positions = new Map<string, number>()

    players.forEach((player) => {
      const pos = player.Position?.toString() || "Unknown"
      positions.set(pos, (positions.get(pos) || 0) + 1)
    })

    return Array.from(positions.entries())
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count)
  }, [players])

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const ranges = [
      { range: "90+", min: 90, max: 100, count: 0 },
      { range: "80-89", min: 80, max: 89, count: 0 },
      { range: "70-79", min: 70, max: 79, count: 0 },
      { range: "60-69", min: 60, max: 69, count: 0 },
      { range: "<60", min: 0, max: 59, count: 0 },
    ]

    players.forEach((player) => {
      const rating = player.POVR || 0
      ranges.forEach((range) => {
        if (rating >= range.min && rating <= range.max) {
          range.count++
        }
      })
    })

    return ranges
  }, [players])

  // Calculate equipment statistics
  const equipmentStats = useMemo(() => {
    const sleeves = new Map<number, number>()
    const visors = new Map<number, number>()

    players.forEach((player) => {
      const sleeve = player.Sleeves || 0
      const visor = player.Visor || 0
      sleeves.set(sleeve, (sleeves.get(sleeve) || 0) + 1)
      visors.set(visor, (visors.get(visor) || 0) + 1)
    })

    return {
      sleeves: Array.from(sleeves.entries())
        .map(([type, count]) => ({ type: `Type ${type}`, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      visors: Array.from(visors.entries())
        .map(([type, count]) => ({ type: `Type ${type}`, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    }
  }, [players])

  // Calculate jersey number distribution
  const jerseyDistribution = useMemo(() => {
    const jerseys = new Map<string, number>()

    players.forEach((player) => {
      const num = player.JerseyNumber?.toString() || "Unknown"
      jerseys.set(num, (jerseys.get(num) || 0) + 1)
    })

    return Array.from(jerseys.entries())
      .map(([jersey, count]) => ({ jersey, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [players])

  const totalTeams = new Set(players.map((p) => p.TeamId)).size
  const avgRating = (players.reduce((sum, p) => sum + (p.POVR || 0), 0) / players.length).toFixed(1)
  const topRatedPlayer = players.reduce((top, p) => (p.POVR > top.POVR ? p : top), players[0])

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {totalTeams} teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground mt-1">Overall rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Player</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{topRatedPlayer?.POVR || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {topRatedPlayer?.FirstName} {topRatedPlayer?.LastName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{positionStats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Teams by Player Count</CardTitle>
            <CardDescription>Number of players per team</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="team" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="players" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Player Rating Distribution</CardTitle>
            <CardDescription>Players grouped by overall rating</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Position Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Position Distribution</CardTitle>
            <CardDescription>Players by position</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionStats.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ position, percent }) => `${position} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {positionStats.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jersey Number Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Jersey Numbers</CardTitle>
            <CardDescription>Top 10 jersey numbers by frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jerseyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="jersey" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sleeve Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Top Sleeve Types
            </CardTitle>
            <CardDescription>Most popular sleeve configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipmentStats.sleeves.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(item.count / players.length) * 100}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visor Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Top Visor Types
            </CardTitle>
            <CardDescription>Most popular visor configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipmentStats.visors.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-2" style={{ width: `${(item.count / players.length) * 100}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
