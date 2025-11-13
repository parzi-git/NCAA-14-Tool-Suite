import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SettingsPanel() {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
        <CardHeader>
          <CardTitle>Processing Settings</CardTitle>
          <CardDescription>Configure which changes are applied when processing the roster</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="equipment" className="text-base">
                  Equipment Templates
                </Label>
                <p className="text-sm text-muted-foreground">Apply equipment templates to all players</p>
              </div>
              <Switch id="equipment" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="jerseys" className="text-base">
                  Jersey Numbers
                </Label>
                <p className="text-sm text-muted-foreground">Assign position-appropriate jersey numbers</p>
              </div>
              <Switch id="jerseys" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stamina" className="text-base">
                  Stamina Distribution
                </Label>
                <p className="text-sm text-muted-foreground">Apply bell curve stamina values</p>
              </div>
              <Switch id="stamina" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="injury" className="text-base">
                  Injury Distribution
                </Label>
                <p className="text-sm text-muted-foreground">Apply bell curve injury resistance values</p>
              </div>
              <Switch id="injury" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="helmet" className="text-base">
                  Global Helmet Style
                </Label>
                <p className="text-sm text-muted-foreground">Set helmet style for all players</p>
              </div>
              <Switch id="helmet" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="neckpad" className="text-base">
                  Global Neck Pad
                </Label>
                <p className="text-sm text-muted-foreground">Set neck pad style for all players</p>
              </div>
              <Switch id="neckpad" defaultChecked />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Note: These settings will be applied the next time you process a roster file.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
