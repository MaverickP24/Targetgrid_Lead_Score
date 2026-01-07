import { useLeads } from "@/hooks/use-leads";
import { useEvents } from "@/hooks/use-events";
import { CreateLeadDialog } from "@/components/CreateLeadDialog";
import { SimulateEventCard } from "@/components/SimulateEventCard";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, TrendingUp, Users, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: events } = useEvents();
  const [search, setSearch] = useState("");

  const filteredLeads = leads?.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) || 
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    lead.company?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  
  const topLeads = [...(leads || [])].sort((a, b) => b.score - a.score).slice(0, 5);

  const stats = [
    { label: "Total Leads", value: leads?.length || 0, icon: Users, color: "text-blue-500" },
    { label: "Avg Score", value: leads?.length ? Math.round(leads.reduce((a, b) => a + b.score, 0) / leads.length) : 0, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Recent Events", value: events?.length || 0, icon: AlertCircle, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of your lead pipeline.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-background border border-border ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Leads Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Active Leads</CardTitle>
                <CardDescription>Monitor and manage your prospects</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search leads..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Loading leads...
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No leads found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeads.map((lead) => (
                          <TableRow key={lead.id} className="group">
                            <TableCell>
                              <div className="font-medium text-foreground">{lead.name}</div>
                              <div className="text-xs text-muted-foreground">{lead.email}</div>
                              {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                            </TableCell>
                            <TableCell>
                              <LeadStatusBadge status={lead.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`font-mono font-bold ${lead.score > 50 ? 'text-emerald-600' : 'text-foreground'}`}>
                                {lead.score}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Link href={`/leads/${lead.id}`}>
                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <SimulateEventCard />
          
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Highest scoring leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topLeads.map((lead, i) => (
                <Link key={lead.id} href={`/leads/${lead.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="truncate max-w-[120px]">
                        <p className="text-sm font-medium truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.company || "No Company"}</p>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm text-emerald-600">
                      {lead.score}
                    </div>
                  </div>
                </Link>
              ))}
              {topLeads.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
