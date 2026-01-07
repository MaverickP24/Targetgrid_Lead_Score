import { useRules, useUpdateRule, useResetRules } from "@/hooks/use-rules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Save } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { data: rules, isLoading } = useRules();
  const updateRule = useUpdateRule();
  const resetRules = useResetRules();
  const { toast } = useToast();

  const [localPoints, setLocalPoints] = useState<Record<number, string>>({});

  const handlePointChange = (id: number, val: string) => {
    setLocalPoints(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = (id: number) => {
    const pointsStr = localPoints[id];
    if (!pointsStr) return;
    
    const points = parseInt(pointsStr);
    if (isNaN(points)) {
      toast({ title: "Invalid Number", variant: "destructive" });
      return;
    }

    updateRule.mutate({ id, updates: { points } }, {
      onSuccess: () => {
        toast({ title: "Rule Updated", description: "Points value saved successfully." });
        setLocalPoints(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
  };

  const handleToggle = (id: number, currentStatus: boolean) => {
    updateRule.mutate({ id, updates: { isActive: !currentStatus } }, {
      onSuccess: () => {
        toast({ title: !currentStatus ? "Rule Activated" : "Rule Deactivated" });
      }
    });
  };

  const handleReset = () => {
    if (confirm("Reset all rules to default values?")) {
      resetRules.mutate(undefined, {
        onSuccess: () => toast({ title: "Rules Reset", description: "All scoring rules restored to defaults." })
      });
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Scoring Rules</h1>
          <p className="text-muted-foreground mt-1">Configure how many points each event contributes to the lead score.</p>
        </div>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset Defaults
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Configuration</CardTitle>
          <CardDescription>
            Active rules will automatically update lead scores when events are ingested.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rules?.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
              <div className="space-y-1">
                <div className="font-medium font-mono text-sm">{rule.eventType}</div>
                <div className="text-xs text-muted-foreground">
                  {rule.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Points:</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      className="w-20 h-9 font-mono text-center" 
                      type="number" 
                      value={localPoints[rule.id] ?? rule.points}
                      onChange={(e) => handlePointChange(rule.id, e.target.value)}
                    />
                    {localPoints[rule.id] && localPoints[rule.id] !== rule.points.toString() && (
                      <Button size="icon" className="h-9 w-9" onClick={() => handleSave(rule.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggle(rule.id, rule.isActive)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
