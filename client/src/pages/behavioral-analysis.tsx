import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain,
  User,
  TrendingUp,
  AlertTriangle,
  Shield,
  Eye,
  Activity,
  Clock,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Zap,
  Users,
  Calendar,
  MousePointer,
  Smartphone
} from "lucide-react";

interface UserBehavior {
  userId: string;
  name: string;
  email: string;
  department: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string;
  clickPatterns: {
    avgClickTime: number;
    suspiciousClicks: number;
    totalClicks: number;
  };
  emailBehavior: {
    openRate: number;
    avgReadTime: number;
    forwardingFreq: number;
  };
  deviceUsage: {
    primaryDevice: string;
    locationVariance: number;
    unusualTimes: number;
  };
  securityEvents: number;
  trainingCompletion: number;
}

interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  riskWeight: number;
  detectionRate: number;
  falsePositiveRate: number;
  usersAffected: number;
  active: boolean;
}

interface RiskFactors {
  factor: string;
  weight: number;
  current: number;
  baseline: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const mockUserBehaviors: UserBehavior[] = [
  {
    userId: "1",
    name: "John Smith",
    email: "j.smith@company.com",
    department: "Finance",
    riskScore: 85,
    riskLevel: "critical",
    lastActivity: "2024-01-16T14:30:00Z",
    clickPatterns: {
      avgClickTime: 1.2,
      suspiciousClicks: 7,
      totalClicks: 23
    },
    emailBehavior: {
      openRate: 0.89,
      avgReadTime: 4.2,
      forwardingFreq: 0.12
    },
    deviceUsage: {
      primaryDevice: "Mobile",
      locationVariance: 3.4,
      unusualTimes: 5
    },
    securityEvents: 3,
    trainingCompletion: 0.65
  },
  {
    userId: "2",
    name: "Sarah Johnson",
    email: "s.johnson@company.com",
    department: "HR",
    riskScore: 42,
    riskLevel: "medium",
    lastActivity: "2024-01-16T11:15:00Z",
    clickPatterns: {
      avgClickTime: 3.1,
      suspiciousClicks: 2,
      totalClicks: 18
    },
    emailBehavior: {
      openRate: 0.67,
      avgReadTime: 8.7,
      forwardingFreq: 0.05
    },
    deviceUsage: {
      primaryDevice: "Desktop",
      locationVariance: 0.8,
      unusualTimes: 1
    },
    securityEvents: 1,
    trainingCompletion: 0.92
  },
  {
    userId: "3",
    name: "Mike Chen",
    email: "m.chen@company.com",
    department: "IT",
    riskScore: 23,
    riskLevel: "low",
    lastActivity: "2024-01-16T16:45:00Z",
    clickPatterns: {
      avgClickTime: 5.8,
      suspiciousClicks: 0,
      totalClicks: 12
    },
    emailBehavior: {
      openRate: 0.45,
      avgReadTime: 12.3,
      forwardingFreq: 0.02
    },
    deviceUsage: {
      primaryDevice: "Desktop",
      locationVariance: 0.3,
      unusualTimes: 0
    },
    securityEvents: 0,
    trainingCompletion: 0.98
  },
  {
    userId: "4",
    name: "Emily Davis",
    email: "e.davis@company.com",
    department: "Marketing",
    riskScore: 67,
    riskLevel: "high",
    lastActivity: "2024-01-16T13:20:00Z",
    clickPatterns: {
      avgClickTime: 2.1,
      suspiciousClicks: 4,
      totalClicks: 31
    },
    emailBehavior: {
      openRate: 0.78,
      avgReadTime: 5.1,
      forwardingFreq: 0.08
    },
    deviceUsage: {
      primaryDevice: "Mobile",
      locationVariance: 2.1,
      unusualTimes: 3
    },
    securityEvents: 2,
    trainingCompletion: 0.74
  }
];

const mockBehaviorPatterns: BehaviorPattern[] = [
  {
    id: "1",
    name: "Rapid Click Pattern",
    description: "Users who click on links within 2 seconds of email opening",
    riskWeight: 0.8,
    detectionRate: 0.89,
    falsePositiveRate: 0.12,
    usersAffected: 127,
    active: true
  },
  {
    id: "2",
    name: "Off-hours Activity",
    description: "Email interactions outside normal business hours",
    riskWeight: 0.6,
    detectionRate: 0.76,
    falsePositiveRate: 0.18,
    usersAffected: 89,
    active: true
  },
  {
    id: "3",
    name: "Mobile-first Behavior",
    description: "Predominantly mobile email usage with higher risk actions",
    riskWeight: 0.7,
    detectionRate: 0.82,
    falsePositiveRate: 0.15,
    usersAffected: 156,
    active: true
  },
  {
    id: "4",
    name: "Credential Reuse Pattern",
    description: "Users showing patterns of password reuse across platforms",
    riskWeight: 0.9,
    detectionRate: 0.94,
    falsePositiveRate: 0.08,
    usersAffected: 67,
    active: false
  },
  {
    id: "5",
    name: "Social Engineering Susceptibility",
    description: "High response rates to authority and urgency-based phishing",
    riskWeight: 0.85,
    detectionRate: 0.91,
    falsePositiveRate: 0.09,
    usersAffected: 203,
    active: true
  }
];

const mockRiskFactors: RiskFactors[] = [
  {
    factor: "Click Response Time",
    weight: 0.25,
    current: 2.3,
    baseline: 4.1,
    trend: "increasing"
  },
  {
    factor: "Security Training Score",
    weight: 0.20,
    current: 0.78,
    baseline: 0.85,
    trend: "decreasing"
  },
  {
    factor: "Unusual Login Locations",
    weight: 0.18,
    current: 1.2,
    baseline: 0.4,
    trend: "increasing"
  },
  {
    factor: "Password Complexity",
    weight: 0.15,
    current: 0.67,
    baseline: 0.72,
    trend: "decreasing"
  },
  {
    factor: "Email Forwarding Frequency",
    weight: 0.12,
    current: 0.08,
    baseline: 0.05,
    trend: "increasing"
  },
  {
    factor: "Multi-factor Auth Usage",
    weight: 0.10,
    current: 0.89,
    baseline: 0.92,
    trend: "stable"
  }
];

export default function BehavioralAnalysis() {
  const [selectedUser, setSelectedUser] = useState<UserBehavior | null>(null);
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [analysisTimeframe, setAnalysisTimeframe] = useState("30days");
  const { toast } = useToast();

  const { data: userBehaviors = mockUserBehaviors } = useQuery<UserBehavior[]>({
    queryKey: ["/api/behavioral/users"],
    queryFn: () => Promise.resolve(mockUserBehaviors),
  });

  const { data: behaviorPatterns = mockBehaviorPatterns } = useQuery<BehaviorPattern[]>({
    queryKey: ["/api/behavioral/patterns"],
    queryFn: () => Promise.resolve(mockBehaviorPatterns),
  });

  const { data: riskFactors = mockRiskFactors } = useQuery<RiskFactors[]>({
    queryKey: ["/api/behavioral/risk-factors"],
    queryFn: () => Promise.resolve(mockRiskFactors),
  });

  const recalculateRiskMutation = useMutation({
    mutationFn: async (userId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { newRiskScore: Math.floor(Math.random() * 100), userId };
    },
    onSuccess: (data) => {
      toast({
        title: "Risk Score Updated",
        description: `New risk score calculated: ${data.newRiskScore}%`,
      });
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
        insights: 8,
        recommendations: 5,
        riskReduction: 23
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Behavioral Insights Generated",
        description: `Generated ${data.insights} insights and ${data.recommendations} recommendations`,
      });
    },
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredUsers = userBehaviors.filter(user => 
    analysisTimeframe === "all" || user.riskScore >= riskThreshold
  );

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Behavioral Analysis & Risk Scoring</h1>
            <p className="text-muted-foreground">Advanced user behavior analytics and predictive risk assessment</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Alerts
            </Button>
            <Button onClick={() => generateInsightsMutation.mutate()}>
              <Brain className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Behavioral Analytics Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Users Analyzed</p>
                  <p className="text-2xl font-bold">{userBehaviors.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">High Risk Users</p>
                  <p className="text-2xl font-bold">
                    {userBehaviors.filter(u => u.riskLevel === 'high' || u.riskLevel === 'critical').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(userBehaviors.reduce((acc, u) => acc + u.riskScore, 0) / userBehaviors.length)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Patterns</p>
                  <p className="text-2xl font-bold">{behaviorPatterns.filter(p => p.active).length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Analysis Controls */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Label htmlFor="risk-threshold">Risk Threshold:</Label>
                <Input
                  id="risk-threshold"
                  type="number"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(Number(e.target.value))}
                  className="w-20"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="timeframe">Analysis Period:</Label>
                <Select value={analysisTimeframe} onValueChange={setAnalysisTimeframe}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} users
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">User Risk Profiles</TabsTrigger>
            <TabsTrigger value="patterns">Behavior Patterns</TabsTrigger>
            <TabsTrigger value="factors">Risk Factors</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          </TabsList>

          {/* User Risk Profiles Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.userId} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedUser(user)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="w-5 h-5" />
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant="outline">{user.department}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={user.riskScore} className="h-2 flex-1" />
                              <span className="font-bold text-sm">{user.riskScore}%</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Click Behavior</p>
                            <p className="text-sm">
                              {user.clickPatterns.suspiciousClicks}/{user.clickPatterns.totalClicks} suspicious
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Avg: {user.clickPatterns.avgClickTime}s response
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Email Patterns</p>
                            <p className="text-sm">{Math.round(user.emailBehavior.openRate * 100)}% open rate</p>
                            <p className="text-xs text-muted-foreground">
                              {user.emailBehavior.avgReadTime}s avg read time
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Security Events</p>
                            <p className="text-sm">{user.securityEvents} recent events</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(user.trainingCompletion * 100)}% training complete
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getRiskLevelColor(user.riskLevel)}>
                              {user.riskLevel.toUpperCase()} RISK
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Primary device: {user.deviceUsage.primaryDevice}
                            </span>
                          </div>

                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                recalculateRiskMutation.mutate(user.userId);
                              }}
                              disabled={recalculateRiskMutation.isPending}
                            >
                              {recalculateRiskMutation.isPending ? "Calculating..." : "Recalculate Risk"}
                            </Button>
                            <Button size="sm" variant="ghost">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Behavior Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {behaviorPatterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>{pattern.name}</span>
                        </CardTitle>
                        <CardDescription>{pattern.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={pattern.active} />
                        <Badge variant={pattern.active ? "default" : "outline"}>
                          {pattern.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Risk Weight</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={pattern.riskWeight * 100} className="h-2 flex-1" />
                            <span className="font-medium text-sm">{Math.round(pattern.riskWeight * 100)}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Detection Rate</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={pattern.detectionRate * 100} className="h-2 flex-1" />
                            <span className="font-medium text-sm">{Math.round(pattern.detectionRate * 100)}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">False Positive Rate</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={pattern.falsePositiveRate * 100} className="h-2 flex-1" />
                            <span className="font-medium text-sm">{Math.round(pattern.falsePositiveRate * 100)}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Users Affected</p>
                          <p className="font-bold text-lg">{pattern.usersAffected}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View Affected Users
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Pattern Analytics
                        </Button>
                        <Button size="sm" variant="ghost">
                          Configure Pattern
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Risk Factors Tab */}
          <TabsContent value="factors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Factor Weights</CardTitle>
                  <CardDescription>How different factors contribute to overall risk scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskFactors.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{factor.factor}</span>
                          <span className="font-medium">{Math.round(factor.weight * 100)}%</span>
                        </div>
                        <Progress value={factor.weight * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Factor Trends</CardTitle>
                  <CardDescription>Current vs baseline risk factor performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium text-sm">{factor.factor}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>Current: {factor.current}</span>
                            <span>•</span>
                            <span>Baseline: {factor.baseline}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(factor.trend)}
                          <span className="text-sm capitalize">{factor.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                AI-powered behavioral analysis provides predictive insights and personalized recommendations based on user patterns and risk factors.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Predictive Insights</CardTitle>
                  <CardDescription>AI-generated behavioral predictions and risk forecasts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">High-Risk User Prediction</h4>
                        <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        John Smith (Finance) shows 89% probability of falling for social engineering attacks based on rapid clicking patterns and low security training scores.
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Recommended immediate training intervention</span>
                      </div>
                    </div>

                    <div className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Department Risk Trend</h4>
                        <Badge className="bg-orange-100 text-orange-800 text-xs">High</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Marketing department showing 34% increase in mobile phishing susceptibility over last 30 days.
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                        <span>Deploy targeted mobile security training</span>
                      </div>
                    </div>

                    <div className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Behavioral Anomaly Detection</h4>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Detected unusual off-hours activity patterns in 23 users, correlating with increased credential phishing attempts.
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span>Monitor for suspicious login activities</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automated Recommendations</CardTitle>
                  <CardDescription>Personalized security interventions based on behavior analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Immediate training for 4 critical risk users</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Deploy mobile-specific security awareness content</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Implement additional MFA for high-risk departments</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Schedule quarterly behavioral assessments</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Create personalized phishing simulations</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">67%</p>
                        <p className="text-sm text-muted-foreground">Expected Risk Reduction</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">89</p>
                        <p className="text-sm text-muted-foreground">Users to Target</p>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Apply All Recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Real-time Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Live Activity Feed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Suspicious click detected</p>
                        <p className="text-xs text-muted-foreground">john.smith@company.com • 2 mins ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <MousePointer className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="font-medium">Rapid clicking pattern</p>
                        <p className="text-xs text-muted-foreground">emily.davis@company.com • 5 mins ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <Smartphone className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="font-medium">Off-hours mobile access</p>
                        <p className="text-xs text-muted-foreground">multiple users • 12 mins ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="font-medium">High risk threshold exceeded</p>
                        <p className="text-xs text-muted-foreground">sarah.johnson@company.com • 18 mins ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">78</p>
                      <p className="text-sm text-muted-foreground">Current Avg Risk Score</p>
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-500">+5% from yesterday</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Finance Department</span>
                        <span className="font-bold text-red-600">85</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing Department</span>
                        <span className="font-bold text-orange-600">72</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HR Department</span>
                        <span className="font-bold text-yellow-600">58</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IT Department</span>
                        <span className="font-bold text-green-600">34</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">High risk score alerts</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">Behavioral anomaly detection</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label className="text-sm">Real-time pattern matching</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">Department risk threshold alerts</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm">Alert Threshold</Label>
                    <Input type="number" defaultValue="70" className="w-full" />
                  </div>

                  <Button size="sm" className="w-full">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}