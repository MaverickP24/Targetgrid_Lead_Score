import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useWebSocket } from "@/hooks/use-websocket";

import Dashboard from "@/pages/Dashboard";
import LeadsList from "@/pages/LeadsList";
import LeadDetail from "@/pages/LeadDetail";
import Settings from "@/pages/Settings";
import EventsList from "@/pages/EventsList";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/leads" component={LeadsList} />
          <Route path="/leads/:id" component={LeadDetail} />
          <Route path="/events" component={EventsList} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function WebSocketListener() {
  useWebSocket(); 
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WebSocketListener />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
