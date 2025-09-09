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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield,
  AlertTriangle,
  TrendingUp,
  Globe,
  Database,
  RefreshCw,
  Eye,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Download,
  Upload,
  Search
} from "lucide-react";

interface ThreatFeed {
  id: string;
  name: string;
  source: string;
  type: 'commercial' | 'open' | 'government' | 'custom';
  status: 'active' | 'inactive' | 'error';
  lastUpdate: string;
  threatCount: number;
  reliability: number;
  cost?: number;
}

interface ThreatIndicator {
  id: string;
  type: 'domain' | 'ip' | 'url' | 'hash' | 'email';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  source: string;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  description: string;
}

interface ThreatCampaign {
  id: string;
  name: string;
  category: string;
  targets: string[];
  techniques: string[];
  indicators: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: string;
  active: boolean;
}

const mockThreatFeeds: ThreatFeed[] = [
  {
    id: "1",
    name: "Recorded Future",
    source: "recordedfuture.com",
    type: "commercial",
    status: "active",
    lastUpdate: "2024-01-16T14:30:00Z",
    threatCount: 15420,
    reliability: 0.95,
    cost: 2500
  },
  {
    id: "2", 
    name: "MISP Threat Sharing",
    source: "misp-project.org",
    type: "open",
    status: "active",
    lastUpdate: "2024-01-16T12:15:00Z",
    threatCount: 8930,
    reliability: 0.87
  },
  {
    id: "3",
    name: "US-CERT Alerts",
    source: "us-cert.gov",
    type: "government",
    status: "active",
    lastUpdate: "2024-01-16T09:45:00Z",
    threatCount: 2156,
    reliability: 0.98
  },
  {
    id: "4",
    name: "Custom IOC Feed",
    source: "internal",
    type: "custom",
    status: "inactive",
    lastUpdate: "2024-01-15T16:20:00Z",
    threatCount: 453,
    reliability: 0.82
  },
  {
    id: "5",
    name: "Emerging Threats",
    source: "emergingthreats.net",
    type: "open",
    status: "error",
    lastUpdate: "2024-01-16T08:00:00Z",
    threatCount: 12400,
    reliability: 0.91
  }
];

const mockThreatIndicators: ThreatIndicator[] = [
  {
    id: "1",
    type: "domain",
    value: "secure-banking-update.net",
    severity: "high",
    confidence: 0.89,
    source: "Recorded Future",
    firstSeen: "2024-01-15T10:30:00Z",
    lastSeen: "2024-01-16T14:20:00Z",
    tags: ["phishing", "banking", "credential-theft"],
    description: "Domain hosting fake banking login pages targeting UK banks"
  },
  {
    id: "2",
    type: "url",
    value: "https://office365-security.com/verify",
    severity: "critical",
    confidence: 0.95,
    source: "US-CERT",
    firstSeen: "2024-01-16T08:15:00Z",
    lastSeen: "2024-01-16T13:45:00Z",
    tags: ["office365", "credential-phishing", "business-email-compromise"],
    description: "Phishing page mimicking Office 365 login with advanced evasion techniques"
  },
  {
    id: "3",
    type: "email",
    value: "security@bankingsupport.co.uk",
    severity: "medium",
    confidence: 0.76,
    source: "MISP",
    firstSeen: "2024-01-14T15:20:00Z",
    lastSeen: "2024-01-16T11:30:00Z",
    tags: ["spoofing", "social-engineering"],
    description: "Email address used in banking phishing campaigns targeting UK customers"
  },
  {
    id: "4",
    type: "ip",
    value: "185.159.158.42",
    severity: "high",
    confidence: 0.92,
    source: "Emerging Threats",
    firstSeen: "2024-01-13T20:10:00Z",
    lastSeen: "2024-01-16T09:15:00Z",
    tags: ["c2", "malware", "banking-trojan"],
    description: "Command and control server for banking malware campaigns"
  }
];

const mockThreatCampaigns: ThreatCampaign[] = [
  {
    id: "1",
    name: "Operation FinancePhish",
    category: "Credential Theft",
    targets: ["Banking", "Financial Services", "Fintech"],
    techniques: ["Spear Phishing", "Social Engineering", "Domain Spoofing"],
    indicators: 23,
    severity: "high",
    firstSeen: "2024-01-10T00:00:00Z",
    active: true
  },
  {
    id: "2",
    name: "Office365 Campaign 2024-01",
    category: "Business Email Compromise",
    targets: ["Enterprise", "Government", "Healthcare"],
    techniques: ["OAuth Phishing", "Token Theft", "Session Hijacking"],
    indicators: 47,
    severity: "critical",
    firstSeen: "2024-01-08T00:00:00Z",
    active: true
  },
  {
    id: "3",
    name: "UK Banking Wave 7",
    category: "Financial Fraud",
    targets: ["UK Banks", "Building Societies", "Credit Unions"],
    techniques: ["SMS Phishing", "Voice Phishing", "Mobile Banking Fraud"],
    indicators: 19,
    severity: "medium",
    firstSeen: "2024-01-12T00:00:00Z",
    active: false
  }
];

export default function ThreatIntelligence() {
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const { toast } = useToast();

  const { data: threatFeeds = mockThreatFeeds } = useQuery<ThreatFeed[]>({
    queryKey: ["/api/threat-intel/feeds"],
    queryFn: () => Promise.resolve(mockThreatFeeds),
  });

  const { data: threatIndicators = mockThreatIndicators } = useQuery<ThreatIndicator[]>({
    queryKey: ["/api/threat-intel/indicators"],
    queryFn: () => Promise.resolve(mockThreatIndicators),
  });

  const { data: threatCampaigns = mockThreatCampaigns } = useQuery<ThreatCampaign[]>({
    queryKey: ["/api/threat-intel/campaigns"],
    queryFn: () => Promise.resolve(mockThreatCampaigns),
  });

  const updateFeedMutation = useMutation({
    mutationFn: async (feedId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, newIndicators: 47 };
    },
    onSuccess: (data) => {
      toast({
        title: "Feed Updated",
        description: `Threat feed updated successfully. ${data.newIndicators} new indicators imported.`,
      });
    },
  });

  const enrichCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
        matchingIndicators: 12,
        riskScore: 78,
        recommendations: ["Update email templates", "Add new IOCs to detection"]
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Enriched",
        description: `Found ${data.matchingIndicators} matching threat indicators. Risk score: ${data.riskScore}%`,
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'commercial': return <TrendingUp className="w-4 h-4" />;
      case 'open': return <Globe className="w-4 h-4" />;
      case 'government': return <Shield className="w-4 h-4" />;
      case 'custom': return <Database className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Threat Intelligence Integration</h1>
            <p className="text-muted-foreground">Automated threat feed management and campaign enrichment</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import IOCs
            </Button>
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Update All Feeds
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Threat Intelligence Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Feeds</p>
                  <p className="text-2xl font-bold">{threatFeeds.filter(f => f.status === 'active').length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Threat Indicators</p>
                  <p className="text-2xl font-bold">
                    {threatFeeds.reduce((acc, f) => acc + f.threatCount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{threatCampaigns.filter(c => c.active).length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Reliability</p>
                  <p className="text-2xl font-bold">
                    {Math.round(threatFeeds.reduce((acc, f) => acc + f.reliability, 0) / threatFeeds.length * 100)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="feeds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="feeds">Threat Feeds</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
            <TabsTrigger value="analytics">Intelligence Analytics</TabsTrigger>
          </TabsList>

          {/* Threat Feeds Tab */}
          <TabsContent value="feeds" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {threatFeeds.map((feed) => (
                <Card key={feed.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedFeed(feed)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(feed.type)}
                        <div>
                          <CardTitle className="text-lg">{feed.name}</CardTitle>
                          <CardDescription>{feed.source}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(feed.status)}>
                          {feed.status}
                        </Badge>
                        <Badge variant="outline">
                          {feed.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Indicators</p>
                          <p className="font-bold text-lg">{feed.threatCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reliability</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={feed.reliability * 100} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{Math.round(feed.reliability * 100)}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Update</p>
                          <p className="font-medium text-sm">
                            {new Date(feed.lastUpdate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cost</p>
                          <p className="font-medium text-sm">
                            {feed.cost ? `$${feed.cost}/month` : 'Free'}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFeedMutation.mutate(feed.id);
                          }}
                          disabled={updateFeedMutation.isPending}
                        >
                          {updateFeedMutation.isPending ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Update Feed
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="ghost">
                          Configure
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Indicators
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Threat Indicators Tab */}
          <TabsContent value="indicators" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search indicators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={filterSeverity} 
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {threatIndicators.map((indicator) => (
                <Card key={indicator.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {indicator.type}
                          </Badge>
                          <Badge className={getSeverityColor(indicator.severity)}>
                            {indicator.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Confidence: {Math.round(indicator.confidence * 100)}%
                          </span>
                        </div>
                        
                        <p className="font-mono text-sm mb-2 break-all">{indicator.value}</p>
                        <p className="text-sm text-muted-foreground mb-2">{indicator.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {indicator.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>Source: {indicator.source}</div>
                          <div>First seen: {new Date(indicator.firstSeen).toLocaleDateString()}</div>
                          <div>Last seen: {new Date(indicator.lastSeen).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Threat Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {threatCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="w-5 h-5" />
                          <span>{campaign.name}</span>
                        </CardTitle>
                        <CardDescription>{campaign.category}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(campaign.severity)}>
                          {campaign.severity}
                        </Badge>
                        <Badge variant={campaign.active ? "default" : "outline"}>
                          {campaign.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Target Sectors</p>
                          <div className="flex flex-wrap gap-1">
                            {campaign.targets.map((target, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {target}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Attack Techniques</p>
                          <div className="flex flex-wrap gap-1">
                            {campaign.techniques.map((technique, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Campaign Stats</p>
                          <div className="space-y-1 text-sm">
                            <div>Indicators: {campaign.indicators}</div>
                            <div>First seen: {new Date(campaign.firstSeen).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => enrichCampaignMutation.mutate({ campaignId: campaign.id })}
                          disabled={enrichCampaignMutation.isPending}
                        >
                          {enrichCampaignMutation.isPending ? (
                            <>
                              <Zap className="w-3 h-3 mr-1 animate-spin" />
                              Enriching...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 mr-1" />
                              Enrich Campaign
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Indicators
                        </Button>
                        <Button size="sm" variant="ghost">
                          Create Simulation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campaign Enrichment Tab */}
          <TabsContent value="enrichment" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Campaign enrichment uses threat intelligence to automatically enhance phishing simulations with current attack techniques and indicators.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automatic Enrichment</CardTitle>
                  <CardDescription>Configure automated threat intelligence integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Auto-update campaigns with new IOCs</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Include trending attack techniques</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Generate campaigns from threat feeds</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Alert on new relevant threats</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Update Frequency</Label>
                    <select className="w-full border rounded px-3 py-2">
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <Button className="w-full">
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enrichment Results</CardTitle>
                  <CardDescription>Recent threat intelligence integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Office 365 Campaign Update</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Added 12 new phishing domains from Recorded Future feed
                      </p>
                      <div className="text-xs text-muted-foreground">
                        2 hours ago
                      </div>
                    </div>

                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Banking Phishing Intelligence</span>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Processing</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Analyzing new UK banking threat campaign IOCs
                      </p>
                      <div className="text-xs text-muted-foreground">
                        4 hours ago
                      </div>
                    </div>

                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Cryptocurrency Scam Detection</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Updated 3 campaigns with new crypto phishing techniques
                      </p>
                      <div className="text-xs text-muted-foreground">
                        1 day ago
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intelligence Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feed Performance</CardTitle>
                  <CardDescription>Threat feed reliability and coverage metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {threatFeeds.map((feed) => (
                      <div key={feed.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{feed.name}</span>
                          <span className="font-medium">{Math.round(feed.reliability * 100)}%</span>
                        </div>
                        <Progress value={feed.reliability * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Threat Landscape</CardTitle>
                  <CardDescription>Current threat distribution and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded">
                        <p className="text-2xl font-bold text-red-600">47</p>
                        <p className="text-sm text-muted-foreground">Critical Threats</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <p className="text-2xl font-bold text-orange-600">129</p>
                        <p className="text-sm text-muted-foreground">High Priority</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Banking Phishing</span>
                        <span className="font-bold">34%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Office 365 Attacks</span>
                        <span className="font-bold">28%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cryptocurrency Scams</span>
                        <span className="font-bold">22%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Other</span>
                        <span className="font-bold">16%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Intelligence Impact</CardTitle>
                <CardDescription>How threat intelligence has improved campaign effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-blue-600">89%</p>
                    <p className="text-sm text-muted-foreground">Detection Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-green-600">34%</p>
                    <p className="text-sm text-muted-foreground">False Positive Reduction</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-purple-600">67</p>
                    <p className="text-sm text-muted-foreground">Campaigns Enhanced</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-orange-600">2.3h</p>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}