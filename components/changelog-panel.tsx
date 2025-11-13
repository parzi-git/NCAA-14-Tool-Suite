import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface VersionLog {
  version: string
  versionRange: string
  description: string
  highlights: string[]
}

const changelog: VersionLog[] = [
  {
    version: "0.7",
    versionRange: "v61-v70",
    description: "Advanced comparison features and ranking optimizations",
    highlights: [
      "Added roster comparison view showing before/after changes",
      "Implemented position-specific ranking formulas for all positions",
      "Enhanced equipment template display in comparisons",
      "Performance optimizations for large roster files",
    ],
  },
  {
    version: "0.6",
    versionRange: "v51-v60",
    description: "Major UI redesign and visual enhancements",
    highlights: [
      "Dark minimalist theme inspired by Discord/ChatGPT",
      "Improved typography and color system",
      "Enhanced player search and query interface",
      "Better mobile responsiveness",
    ],
  },
  {
    version: "0.5",
    versionRange: "v41-v50",
    description: "Conference filtering and reporting improvements",
    highlights: [
      "Added conference-based filtering (SEC, Big Ten, ACC, Big 12, Pac-12)",
      "Enhanced top players report with better organization",
      "Team name mappings for all FBS schools",
      "Query panel UI improvements",
    ],
  },
  {
    version: "0.4",
    versionRange: "v31-v40",
    description: "Reporting features and analytics",
    highlights: [
      "Top 5 players by position group rankings",
      "Position-specific attribute scoring systems",
      "Analytics dashboard for roster insights",
      "Export functionality for reports",
    ],
  },
  {
    version: "0.3",
    versionRange: "v21-v30",
    description: "Global rules and position-specific attributes",
    highlights: [
      "Implemented stamina and injury weighted distributions",
      "Position-specific attribute rules (DB agility, DL jumping, etc.)",
      "Punter/Kicker kick power validation",
      "Quarterback flak jacket assignment",
    ],
  },
  {
    version: "0.2",
    versionRange: "v11-v20",
    description: "Equipment templates and jersey number system",
    highlights: [
      "171 equipment templates for all position groups",
      "Intelligent jersey number assignment with range validation",
      "Impact number system for top-rated players",
      "Jersey duplicate prevention by side (offense/defense)",
    ],
  },
  {
    version: "0.1",
    versionRange: "v1-v10",
    description: "Initial release and core functionality",
    highlights: [
      "CSV file upload and parsing for NCAA 14 rosters",
      "Basic roster processing framework",
      "Player data structure and type definitions",
      "File export functionality with updated rosters",
    ],
  },
]

export function ChangelogPanel() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>Development changelog and feature milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {changelog.map((log, idx) => (
              <div key={idx} className="relative pl-8 pb-6 border-l-2 border-border/30 last:border-0 last:pb-0">
                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">Version {log.version}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                      {log.versionRange}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{log.description}</p>

                  <ul className="space-y-1 mt-3">
                    {log.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
