import { useIngestEvent } from "@/hooks/use-events";
import { useRules } from "@/hooks/use-rules";
import { useLeads } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Zap, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SimulateEventCard() {
  const { data: rules } = useRules();
  const { data: leads } = useLeads();
  const ingest = useIngestEvent();
  const { toast } = useToast();

  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const handleSimulate = () => {
    if (!selectedLeadId || !selectedType) return;

    ingest.mutate({
      leadId: parseInt(selectedLeadId),
      eventType: selectedType,
      payload: { simulated: true, timestamp: new Date().toISOString() }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Event Simulated",
          description: `Score updated: ${data.scoreUpdated ? "Yes" : "No"}. New Score: ${data.newScore ?? 'unchanged'}`,
        });
      }
    });
  };

  return (
    <Card className="h-full border-primary/10 shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Event Simulator</CardTitle>
            <CardDescription>Trigger events manually to test scoring rules</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Lead</label>
          <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a lead..." />
            </SelectTrigger>
            <SelectContent>
              {leads?.map(lead => (
                <SelectItem key={lead.id} value={lead.id.toString()}>
                  {lead.name} ({lead.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Event Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Choose event type..." />
            </SelectTrigger>
            <SelectContent>
              {rules?.map(rule => (
                <SelectItem key={rule.id} value={rule.eventType}>
                  {rule.eventType} ({rule.points > 0 ? '+' : ''}{rule.points} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full mt-4" 
          onClick={handleSimulate}
          disabled={!selectedLeadId || !selectedType || ingest.isPending}
        >
          {ingest.isPending ? (
            <Activity className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          {ingest.isPending ? "Processing..." : "Trigger Event"}
        </Button>
      </CardContent>
    </Card>
  );
}
