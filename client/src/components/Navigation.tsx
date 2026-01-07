import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Activity, 
  BarChart3,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Events", href: "/events", icon: Activity },
  { label: "Scoring Rules", href: "/settings", icon: Settings },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r border-border h-screen bg-card flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2 text-primary">
          <Zap className="h-6 w-6 fill-current" />
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            LeadScore<span className="text-primary">.io</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="px-2 py-2 mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
        </div>
        
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">System Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live Streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
