import { useEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function EventsList() {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="text-3xl font-display font-bold">Event Log</h1>
        <p className="text-muted-foreground mt-1">Raw stream of all ingested events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Showing {events?.length || 0} recorded events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading events...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs">#{event.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{event.eventType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      Lead #{event.leadId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.processed ? "secondary" : "default"} className="text-xs">
                        {event.processed ? "Processed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.createdAt && format(new Date(event.createdAt), "MMM d, h:mm:ss a")}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <code className="text-xs text-muted-foreground block truncate">
                        {JSON.stringify(event.payload)}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
                {events?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
