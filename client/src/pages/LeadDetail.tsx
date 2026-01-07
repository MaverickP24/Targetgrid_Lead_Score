import { useLead, useDeleteLead } from "@/hooks/use-leads";
import { Link, useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";
import { ChevronLeft, Trash2, Mail, Building2, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LeadDetail() {
  const [, params] = useRoute("/leads/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: lead, isLoading } = useLead(id);
  const deleteLead = useDeleteLead();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Lead Not Found</h2>
        <Link href="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteLead.mutate(id, {
      onSuccess: () => setLocation("/")
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-3">
              {lead.name}
              <LeadStatusBadge status={lead.status} />
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {lead.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {lead.company}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {lead.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Joined {format(new Date(lead.createdAt || new Date()), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Lead
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {lead.name} and all associated history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <Card className="md:col-span-1 border-primary/10 shadow-md bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-foreground tracking-tighter">
                {lead.score}
              </span>
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">points</span>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
              Last active: {lead.lastActiveAt ? format(new Date(lead.lastActiveAt), "h:mm a, MMM d") : "Never"}
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <div className="md:col-span-2">
          <ScoreTrendChart history={lead.history || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent History */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {lead.history && lead.history.length > 0 ? (
                lead.history.sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map((item, i) => (
                  <div key={i} className="flex items-start justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{item.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.createdAt && format(new Date(item.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className={`text-sm font-bold font-mono ${item.scoreChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.scoreChange > 0 ? '+' : ''}{item.scoreChange}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No activity history recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Raw JSON Data (Developer view / Debug) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono">Raw Data Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono text-muted-foreground">
              {JSON.stringify(lead, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
