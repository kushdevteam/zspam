import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Settings, 
  Mail, 
  PlusCircle, 
  TrendingUp,
  Shield,
  Users,
  TestTube,
  User,
  Webhook,
  Server,
  Brain,
  Activity,
  Wand2,
  MessageSquare,
  Smartphone
} from "lucide-react";

const navigation = [
  {
    name: "Sessions",
    href: "/sessions",
    icon: BarChart3,
  },
  {
    name: "Create Campaign",
    href: "/create-campaign", 
    icon: PlusCircle,
  },
  {
    name: "Campaign Scheduler",
    href: "/campaign-scheduler", 
    icon: Settings,
  },
  {
    name: "Email Sender",
    href: "/email-sender",
    icon: Mail,
  },
  {
    name: "Statistics",
    href: "/statistics",
    icon: TrendingUp,
  },
  {
    name: "Enhanced Analytics",
    href: "/enhanced-statistics",
    icon: BarChart3,
  },
  {
    name: "Alert Settings",
    href: "/alert-settings",
    icon: Shield,
  },
  {
    name: "Test Dashboard",
    href: "/test-dashboard",
    icon: BarChart3,
  },
  {
    name: "Advanced Reports",
    href: "/advanced-reports",
    icon: TrendingUp,
  },
  {
    name: "User Management",
    href: "/user-management",
    icon: Users,
  },
  {
    name: "A/B Testing",
    href: "/ab-testing",
    icon: TestTube,
  },
  {
    name: "Personalization",
    href: "/personalization",
    icon: User,
  },
  {
    name: "Webhooks",
    href: "/webhooks",
    icon: Webhook,
  },
  {
    name: "Production Setup",
    href: "/production-setup",
    icon: Settings,
  },
  {
    name: "AI Targeting",
    href: "/ai-targeting",
    icon: Brain,
  },
  {
    name: "Threat Intelligence",
    href: "/threat-intelligence",
    icon: Shield,
  },
  {
    name: "Behavioral Analysis",
    href: "/behavioral-analysis",
    icon: Activity,
  },
  {
    name: "AI Content Generator",
    href: "/ai-content-generator",
    icon: Wand2,
  },
  {
    name: "SMS Campaigns",
    href: "/sms-campaigns",
    icon: MessageSquare,
  },
  {
    name: "Mobile Simulations",
    href: "/mobile-simulations",
    icon: Smartphone,
  },
  {
    name: "Configuration",
    href: "/configuration",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">zSPAM</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/sessions");
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
