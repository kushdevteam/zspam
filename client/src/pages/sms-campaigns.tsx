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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone,
  MessageSquare,
  Send,
  Users,
  BarChart3,
  Link,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Play,
  Eye,
  Download,
  Upload,
  Copy,
  RefreshCw
} from "lucide-react";

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  shortUrl: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  targetCount: number;
  sentCount: number;
  clickedCount: number;
  submittedCount: number;
  createdAt: string;
  scheduledFor?: string;
  category: string;
  effectiveness: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  category: string;
  message: string;
  effectiveness: number;
  usageCount: number;
  lastUsed: string;
  techniques: string[];
}

interface SMSProvider {
  id: string;
  name: string;
  type: 'twilio' | 'aws_sns' | 'messagebird' | 'custom';
  status: 'active' | 'inactive' | 'error';
  costPerMessage: number;
  deliveryRate: number;
  configuration: any;
}

const mockSMSCampaigns: SMSCampaign[] = [
  {
    id: "1",
    name: "Banking Security Alert",
    message: "URGENT: Suspicious activity detected on your Barclays account. Verify immediately: [SHORT_LINK] Reply STOP to opt out.",
    shortUrl: "bit.ly/secure23",
    status: "completed",
    targetCount: 500,
    sentCount: 487,
    clickedCount: 234,
    submittedCount: 89,
    createdAt: "2024-01-15T10:30:00Z",
    category: "Banking Phishing",
    effectiveness: 0.72
  },
  {
    id: "2",
    name: "Package Delivery Scam",
    message: "Your Royal Mail package couldn't be delivered. Reschedule delivery: [SHORT_LINK] Track: RM5847291",
    shortUrl: "tinyurl.com/rm5847",
    status: "active",
    targetCount: 750,
    sentCount: 234,
    clickedCount: 67,
    submittedCount: 23,
    createdAt: "2024-01-14T09:15:00Z",
    scheduledFor: "2024-01-17T14:00:00Z",
    category: "Delivery Scam",
    effectiveness: 0.65
  },
  {
    id: "3",
    name: "COVID Test Results",
    message: "Your NHS COVID test results are ready. View secure results: [SHORT_LINK] Ref: CV240115",
    shortUrl: "short.ly/cv2401",
    status: "draft",
    targetCount: 300,
    sentCount: 0,
    clickedCount: 0,
    submittedCount: 0,
    createdAt: "2024-01-13T16:45:00Z",
    category: "Health Scam",
    effectiveness: 0.0
  },
  {
    id: "4",
    name: "Tax Refund Alert",
    message: "HMRC: You're entitled to a tax refund of £247. Claim now before it expires: [SHORT_LINK]",
    shortUrl: "goo.gl/hmrc247",
    status: "paused",
    targetCount: 1200,
    sentCount: 156,
    clickedCount: 89,
    submittedCount: 34,
    createdAt: "2024-01-12T11:20:00Z",
    category: "Tax Scam",
    effectiveness: 0.57
  }
];

const mockSMSTemplates: SMSTemplate[] = [
  {
    id: "1",
    name: "Banking Account Verification",
    category: "Banking",
    message: "ALERT: Unusual activity on your [BANK_NAME] account. Verify now: [SHORT_LINK] or call 0800-xxx-xxxx",
    effectiveness: 0.78,
    usageCount: 23,
    lastUsed: "2024-01-15T10:30:00Z",
    techniques: ["Urgency", "Authority", "Fear"]
  },
  {
    id: "2",
    name: "Package Delivery Failed",
    message: "Package delivery failed. Reschedule: [SHORT_LINK] Ref: [REF_NUMBER] - [COURIER_NAME]",
    effectiveness: 0.68,
    usageCount: 45,
    lastUsed: "2024-01-14T14:20:00Z",
    techniques: ["Convenience", "Time Pressure"]
  },
  {
    id: "3",
    name: "Mobile Provider Bill",
    message: "Your [PROVIDER] bill is overdue. Pay now to avoid service disconnection: [SHORT_LINK]",
    effectiveness: 0.61,
    usageCount: 18,
    lastUsed: "2024-01-13T09:45:00Z",
    techniques: ["Fear", "Urgency"]
  },
  {
    id: "4",
    name: "COVID Contact Tracing",
    message: "NHS Track & Trace: You may have been exposed to COVID-19. Order free test: [SHORT_LINK]",
    effectiveness: 0.74,
    usageCount: 67,
    lastUsed: "2024-01-12T16:10:00Z",
    techniques: ["Health Concern", "Authority"]
  },
  {
    id: "5",
    name: "Government Benefits",
    message: "DWP: Additional support payment available. Check eligibility: [SHORT_LINK] Deadline: [DATE]",
    effectiveness: 0.69,
    usageCount: 34,
    lastUsed: "2024-01-11T12:30:00Z",
    techniques: ["Financial Incentive", "Time Pressure", "Authority"]
  }
];

const mockSMSProviders: SMSProvider[] = [
  {
    id: "1",
    name: "Twilio",
    type: "twilio",
    status: "active",
    costPerMessage: 0.045,
    deliveryRate: 0.98,
    configuration: { accountSid: "AC***", authToken: "***" }
  },
  {
    id: "2", 
    name: "AWS SNS",
    type: "aws_sns",
    status: "active",
    costPerMessage: 0.0075,
    deliveryRate: 0.96,
    configuration: { region: "eu-west-1", accessKey: "***" }
  },
  {
    id: "3",
    name: "MessageBird",
    type: "messagebird",
    status: "inactive",
    costPerMessage: 0.039,
    deliveryRate: 0.94,
    configuration: { apiKey: "***" }
  }
];

export default function SMSCampaigns() {
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    targetCount: 100,
    category: "Banking",
    scheduledFor: ""
  });
  const [selectedProvider, setSelectedProvider] = useState("1");
  const { toast } = useToast();

  const { data: smsCampaigns = mockSMSCampaigns } = useQuery<SMSCampaign[]>({
    queryKey: ["/api/sms-campaigns"],
    queryFn: () => Promise.resolve(mockSMSCampaigns),
  });

  const { data: smsTemplates = mockSMSTemplates } = useQuery<SMSTemplate[]>({
    queryKey: ["/api/sms-templates"],
    queryFn: () => Promise.resolve(mockSMSTemplates),
  });

  const { data: smsProviders = mockSMSProviders } = useQuery<SMSProvider[]>({
    queryKey: ["/api/sms-providers"],
    queryFn: () => Promise.resolve(mockSMSProviders),
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, campaignId: Date.now().toString() };
    },
    onSuccess: (data) => {
      toast({
        title: "SMS Campaign Created",
        description: `Campaign created successfully with ID: ${data.campaignId}`,
      });
      setNewCampaign({ name: "", message: "", targetCount: 100, category: "Banking", scheduledFor: "" });
    },
  });

  const sendTestSMSMutation = useMutation({
    mutationFn: async (data: { message: string, phoneNumber: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, messageId: "test-" + Date.now() };
    },
    onSuccess: () => {
      toast({
        title: "Test SMS Sent",
        description: "Test message sent successfully",
      });
    },
  });

  const launchCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, sentCount: Math.floor(Math.random() * 500) + 100 };
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Launched",
        description: `SMS campaign launched successfully. ${data.sentCount} messages queued for delivery.`,
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'twilio': return '📱';
      case 'aws_sns': return '🔶';
      case 'messagebird': return '🐦';
      default: return '💬';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SMS Phishing (Smishing) Campaigns</h1>
            <p className="text-muted-foreground">Create and manage mobile-targeted phishing campaigns via SMS</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Contacts
            </Button>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* SMS Campaign Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{smsCampaigns.filter(c => c.status === 'active').length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Send className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                  <p className="text-2xl font-bold">
                    {smsCampaigns.reduce((acc, c) => acc + c.sentCount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Click Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (smsCampaigns.reduce((acc, c) => acc + c.clickedCount, 0) / 
                       smsCampaigns.reduce((acc, c) => acc + c.sentCount, 0)) * 100
                    )}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Effectiveness</p>
                  <p className="text-2xl font-bold">
                    {Math.round(smsCampaigns.reduce((acc, c) => acc + c.effectiveness, 0) / smsCampaigns.length * 100)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
            <TabsTrigger value="templates">SMS Templates</TabsTrigger>
            <TabsTrigger value="providers">SMS Providers</TabsTrigger>
            <TabsTrigger value="analytics">SMS Analytics</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {smsCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5" />
                          <span>{campaign.name}</span>
                        </CardTitle>
                        <CardDescription>{campaign.category}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(campaign.effectiveness * 100)}% effective
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded border">
                        <p className="text-sm font-mono">{campaign.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Short URL: {campaign.shortUrl}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Progress</p>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={campaign.targetCount > 0 ? (campaign.sentCount / campaign.targetCount) * 100 : 0} 
                              className="h-2 flex-1" 
                            />
                            <span className="text-sm font-medium">
                              {campaign.sentCount}/{campaign.targetCount}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Clicks</p>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={campaign.sentCount > 0 ? (campaign.clickedCount / campaign.sentCount) * 100 : 0} 
                              className="h-2 flex-1" 
                            />
                            <span className="text-sm font-medium">
                              {campaign.clickedCount} ({Math.round((campaign.clickedCount / campaign.sentCount) * 100)}%)
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Submissions</p>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={campaign.clickedCount > 0 ? (campaign.submittedCount / campaign.clickedCount) * 100 : 0} 
                              className="h-2 flex-1" 
                            />
                            <span className="text-sm font-medium">
                              {campaign.submittedCount} ({Math.round((campaign.submittedCount / campaign.clickedCount) * 100)}%)
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Created</p>
                          <p className="text-sm font-medium">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </p>
                          {campaign.scheduledFor && (
                            <p className="text-xs text-muted-foreground">
                              Scheduled: {new Date(campaign.scheduledFor).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm"
                            onClick={() => launchCampaignMutation.mutate(campaign.id)}
                            disabled={launchCampaignMutation.isPending}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Launch Campaign
                          </Button>
                        )}
                        {campaign.status === 'active' && (
                          <Button size="sm" variant="outline">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pause Campaign
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="ghost">
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

          {/* Create Campaign Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Campaign Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Campaign Configuration</span>
                  </CardTitle>
                  <CardDescription>Create a new SMS phishing campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Campaign Name</Label>
                    <Input 
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Banking Security Alert"
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={newCampaign.category}
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Banking">Banking Phishing</SelectItem>
                        <SelectItem value="Delivery">Delivery Scam</SelectItem>
                        <SelectItem value="Health">Health Scam</SelectItem>
                        <SelectItem value="Tax">Tax Scam</SelectItem>
                        <SelectItem value="Mobile">Mobile Provider</SelectItem>
                        <SelectItem value="Government">Government Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>SMS Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {smsProviders.filter(p => p.status === 'active').map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {getProviderIcon(provider.type)} {provider.name} - £{provider.costPerMessage}/msg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Count</Label>
                    <Input 
                      type="number"
                      value={newCampaign.targetCount}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, targetCount: parseInt(e.target.value) }))}
                      min="1"
                      max="10000"
                    />
                  </div>

                  <div>
                    <Label>Schedule (Optional)</Label>
                    <Input 
                      type="datetime-local"
                      value={newCampaign.scheduledFor}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to launch immediately
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Message Composition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Message Composition</span>
                  </CardTitle>
                  <CardDescription>Craft your SMS message (160 characters recommended)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>SMS Message</Label>
                    <Textarea 
                      value={newCampaign.message}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="ALERT: Unusual activity on your account. Verify now: [SHORT_LINK] Reply STOP to opt out."
                      className="min-h-20"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Characters: {newCampaign.message.length}</span>
                      <span className={newCampaign.message.length > 160 ? "text-red-500" : ""}>
                        {newCampaign.message.length > 160 ? "Over 160 chars - may be split" : "Single SMS"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded border">
                    <p className="text-sm font-medium mb-2">Available Variables:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>[FIRST_NAME] - First name</div>
                      <div>[LAST_NAME] - Last name</div>
                      <div>[PHONE] - Phone number</div>
                      <div>[SHORT_LINK] - Phishing URL</div>
                      <div>[REF_NUMBER] - Reference ID</div>
                      <div>[AMOUNT] - Random amount</div>
                      <div>[DATE] - Current date</div>
                      <div>[TIME] - Current time</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setNewCampaign(prev => ({ ...prev, message: smsTemplates[0]?.message || "" }))}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Use Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => sendTestSMSMutation.mutate({ 
                        message: newCampaign.message, 
                        phoneNumber: "+447700000000" 
                      })}
                      disabled={sendTestSMSMutation.isPending}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      {sendTestSMSMutation.isPending ? "Sending..." : "Send Test SMS"}
                    </Button>
                  </div>

                  <Separator />

                  <Button 
                    className="w-full"
                    onClick={() => createCampaignMutation.mutate(newCampaign)}
                    disabled={createCampaignMutation.isPending || !newCampaign.name || !newCampaign.message}
                  >
                    {createCampaignMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Create SMS Campaign
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SMS Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {smsTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <MessageSquare className="w-5 h-5" />
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{template.category}</p>
                          </div>
                        </div>

                        <div className="mb-3 p-3 bg-muted rounded border">
                          <p className="text-sm font-mono">{template.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Characters: {template.message.length}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Effectiveness</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={template.effectiveness * 100} className="h-2 flex-1" />
                              <span className="font-bold text-sm">
                                {Math.round(template.effectiveness * 100)}%
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Usage Count</p>
                            <p className="font-medium text-sm">{template.usageCount}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Last Used</p>
                            <p className="font-medium text-sm">
                              {new Date(template.lastUsed).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Techniques Used:</p>
                          <div className="flex flex-wrap gap-2">
                            {template.techniques.map((technique, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setNewCampaign(prev => ({ ...prev, message: template.message }))}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Use Template
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="ghost">
                            Edit Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SMS Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {smsProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getProviderIcon(provider.type)}</span>
                        <div>
                          <CardTitle>{provider.name}</CardTitle>
                          <CardDescription>SMS delivery provider</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(provider.status)}>
                        {provider.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Cost per Message</p>
                          <p className="font-bold text-lg">£{provider.costPerMessage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery Rate</p>
                          <p className="font-bold text-lg">{Math.round(provider.deliveryRate * 100)}%</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Delivery Performance</p>
                        <Progress value={provider.deliveryRate * 100} className="h-3" />
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="w-3 h-3 mr-1" />
                          Test Connection
                        </Button>
                        {provider.status === 'inactive' && (
                          <Button size="sm">
                            <Play className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Add New SMS Provider</CardTitle>
                <CardDescription>Configure additional SMS delivery services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <span className="text-2xl">📱</span>
                    <span>Add Twilio</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <span className="text-2xl">🔶</span>
                    <span>Add AWS SNS</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <span className="text-2xl">🐦</span>
                    <span>Add MessageBird</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>SMS Campaign Performance</CardTitle>
                  <CardDescription>Overall effectiveness metrics across all campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 border rounded">
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(
                            (smsCampaigns.reduce((acc, c) => acc + c.clickedCount, 0) / 
                             smsCampaigns.reduce((acc, c) => acc + c.sentCount, 0)) * 100
                          )}%
                        </p>
                        <p className="text-sm text-muted-foreground">Click Rate</p>
                      </div>
                      <div className="p-3 border rounded">
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(
                            (smsCampaigns.reduce((acc, c) => acc + c.submittedCount, 0) / 
                             smsCampaigns.reduce((acc, c) => acc + c.clickedCount, 0)) * 100
                          )}%
                        </p>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Banking Phishing</span>
                        <span className="font-bold">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Delivery Scams</span>
                        <span className="font-bold">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Government Services</span>
                        <span className="font-bold">69%</span>
                      </div>
                      <Progress value={69} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>SMS campaign costs and provider comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {smsProviders.map((provider) => (
                        <div key={provider.id} className="flex justify-between items-center p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <span>{getProviderIcon(provider.type)}</span>
                            <span className="text-sm font-medium">{provider.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">£{provider.costPerMessage}/msg</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(provider.deliveryRate * 100)}% delivery
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Messages Sent</span>
                        <span className="font-bold">
                          {smsCampaigns.reduce((acc, c) => acc + c.sentCount, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Total Cost</span>
                        <span className="font-bold text-green-600">
                          £{(smsCampaigns.reduce((acc, c) => acc + c.sentCount, 0) * 0.045).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost per Successful Phish</span>
                        <span className="font-bold">
                          £{(
                            (smsCampaigns.reduce((acc, c) => acc + c.sentCount, 0) * 0.045) /
                            smsCampaigns.reduce((acc, c) => acc + c.submittedCount, 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SMS Campaign Insights</CardTitle>
                <CardDescription>Performance insights and optimization recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Best Performing Categories</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Banking Alerts</span>
                        <span className="font-bold text-green-600">78% effectiveness</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Health Notifications</span>
                        <span className="font-bold text-blue-600">74% effectiveness</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Government Services</span>
                        <span className="font-bold text-purple-600">69% effectiveness</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Optimal Send Times</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Weekdays 10AM-2PM</span>
                        <span className="font-bold text-green-600">Highest engagement</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Evening 6PM-8PM</span>
                        <span className="font-bold text-blue-600">Good response</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekends</span>
                        <span className="font-bold text-yellow-600">Lower effectiveness</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Message Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Keep under 160 characters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Use urgency and authority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Include clear call-to-action</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Personalize with variables</span>
                      </div>
                    </div>
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