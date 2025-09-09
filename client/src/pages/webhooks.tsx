import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Webhook, 
  Plus, 
  Link2,
  Shield,
  Globe,
  Zap,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Cpu,
  Database
} from "lucide-react";

const webhookSchema = z.object({
  name: z.string().min(3, "Webhook name must be at least 3 characters"),
  url: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  events: z.array(z.string()).min(1, "Must select at least one event"),
  secret: z.string().min(10, "Secret must be at least 10 characters"),
  isActive: z.boolean().default(true),
  headers: z.record(z.string()).optional(),
  retryAttempts: z.number().min(0).max(5).default(3),
  timeout: z.number().min(5).max(60).default(30),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

interface Webhook {
  id: string;
  name: string;
  url: string;
  description: string;
  events: string[];
  secret: string;
  isActive: boolean;
  headers?: Record<string, string>;
  retryAttempts: number;
  timeout: number;
  createdAt: string;
  lastTriggered?: string;
  status: 'healthy' | 'failing' | 'disabled';
  stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}

const mockWebhooks: Webhook[] = [
  {
    id: "1",
    name: "SIEM Integration",
    url: "https://siem.company.com/api/security-events",
    description: "Send security alerts to SIEM system for threat analysis",
    events: ["session_created", "credentials_submitted", "suspicious_activity"],
    secret: "siem_webhook_secret_2024",
    isActive: true,
    headers: {
      "Authorization": "Bearer xxxxx",
      "Content-Type": "application/json"
    },
    retryAttempts: 3,
    timeout: 30,
    createdAt: "2024-01-15T10:00:00Z",
    lastTriggered: "2024-01-20T14:30:00Z",
    status: "healthy",
    stats: {
      totalRequests: 1247,
      successfulRequests: 1198,
      failedRequests: 49,
      averageResponseTime: 850
    }
  },
  {
    id: "2",
    name: "Slack Notifications",
    url: "https://hooks.slack.com/services/xxx/yyy/zzz",
    description: "Real-time notifications to security team Slack channel",
    events: ["campaign_started", "high_risk_session", "credentials_submitted"],
    secret: "slack_webhook_token_secure",
    isActive: true,
    retryAttempts: 2,
    timeout: 15,
    createdAt: "2024-01-12T09:30:00Z",
    lastTriggered: "2024-01-20T16:45:00Z",
    status: "healthy",
    stats: {
      totalRequests: 892,
      successfulRequests: 889,
      failedRequests: 3,
      averageResponseTime: 450
    }
  },
  {
    id: "3",
    name: "HR System Integration",
    url: "https://hr.company.com/api/security-training",
    description: "Update employee training records based on phishing simulation results",
    events: ["campaign_completed", "employee_failed_test"],
    secret: "hr_integration_key_2024",
    isActive: false,
    retryAttempts: 5,
    timeout: 45,
    createdAt: "2024-01-10T11:20:00Z",
    lastTriggered: "2024-01-18T10:15:00Z",
    status: "disabled",
    stats: {
      totalRequests: 234,
      successfulRequests: 220,
      failedRequests: 14,
      averageResponseTime: 1200
    }
  },
  {
    id: "4",
    name: "Analytics Dashboard",
    url: "https://analytics.company.com/webhooks/phishing-data",
    description: "Send campaign metrics to external analytics dashboard",
    events: ["session_analytics", "campaign_metrics"],
    secret: "analytics_webhook_secure_2024",
    isActive: true,
    retryAttempts: 2,
    timeout: 20,
    createdAt: "2024-01-08T14:45:00Z",
    status: "failing",
    stats: {
      totalRequests: 456,
      successfulRequests: 398,
      failedRequests: 58,
      averageResponseTime: 2100
    }
  }
];

const availableEvents = [
  { value: "session_created", label: "Session Created", description: "When a user clicks a phishing link" },
  { value: "credentials_submitted", label: "Credentials Submitted", description: "When a user submits login credentials" },
  { value: "campaign_started", label: "Campaign Started", description: "When a phishing campaign begins" },
  { value: "campaign_completed", label: "Campaign Completed", description: "When a phishing campaign ends" },
  { value: "suspicious_activity", label: "Suspicious Activity", description: "When bot-like behavior is detected" },
  { value: "high_risk_session", label: "High Risk Session", description: "Sessions with multiple risk indicators" },
  { value: "employee_failed_test", label: "Employee Failed Test", description: "When an employee fails a phishing test" },
  { value: "session_analytics", label: "Session Analytics", description: "Detailed session interaction data" },
  { value: "campaign_metrics", label: "Campaign Metrics", description: "Overall campaign performance data" }
];

export default function Webhooks() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      events: [],
      secret: "",
      isActive: true,
      headers: {},
      retryAttempts: 3,
      timeout: 30,
    },
  });

  const { data: webhooks = mockWebhooks } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
    queryFn: () => Promise.resolve(mockWebhooks),
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormData) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Date.now().toString(), ...data };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Webhook created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      form.reset();
      setIsCreateDialogOpen(false);
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      setTestingWebhook(webhookId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestingWebhook(null);
      // Simulate random success/failure
      const success = Math.random() > 0.3;
      if (!success) throw new Error("Test failed");
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Test Successful",
        description: "Webhook responded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Webhook test failed. Check URL and configuration.",
        variant: "destructive",
      });
    },
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ webhookId, isActive }: { webhookId: string; isActive: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { webhookId, isActive };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Webhook status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
    },
  });

  const onSubmit = (data: WebhookFormData) => {
    createWebhookMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failing': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'disabled': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      healthy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      failing: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      disabled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[status as keyof typeof colors] || colors.disabled;
  };

  const webhookStats = {
    total: webhooks.length,
    active: webhooks.filter(w => w.isActive).length,
    healthy: webhooks.filter(w => w.status === 'healthy').length,
    totalRequests: webhooks.reduce((sum, w) => sum + w.stats.totalRequests, 0)
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Webhooks & API Integrations</h1>
            <p className="text-muted-foreground">Connect with external systems and automate workflows</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-webhook">
                <Plus className="w-4 h-4 mr-2" />
                New Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Webhook</DialogTitle>
                <DialogDescription>
                  Set up a new webhook to receive real-time event notifications
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Webhook Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="e.g., SIEM Integration"
                        data-testid="input-webhook-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">Endpoint URL</Label>
                      <Input
                        id="url"
                        type="url"
                        {...form.register("url")}
                        placeholder="https://your-system.com/webhook"
                        data-testid="input-webhook-url"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Describe what this webhook is used for"
                        rows={2}
                        data-testid="textarea-description"
                      />
                    </div>
                  </div>
                </div>

                {/* Events */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Events to Listen</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {availableEvents.map((event) => (
                      <Label key={event.value} className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-muted">
                        <input
                          type="checkbox"
                          value={event.value}
                          {...form.register("events")}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{event.label}</div>
                          <div className="text-sm text-muted-foreground">{event.description}</div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Security & Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security & Configuration</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="secret">Webhook Secret</Label>
                      <Input
                        id="secret"
                        type="password"
                        {...form.register("secret")}
                        placeholder="Enter a secure secret for request validation"
                        data-testid="input-secret"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used to sign webhook payloads for security verification
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="retryAttempts">Retry Attempts</Label>
                        <Input
                          id="retryAttempts"
                          type="number"
                          min="0"
                          max="5"
                          {...form.register("retryAttempts", { valueAsNumber: true })}
                          data-testid="input-retry-attempts"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeout">Timeout (seconds)</Label>
                        <Input
                          id="timeout"
                          type="number"
                          min="5"
                          max="60"
                          {...form.register("timeout", { valueAsNumber: true })}
                          data-testid="input-timeout"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={form.watch("isActive")}
                        onCheckedChange={(checked) => form.setValue("isActive", checked)}
                        data-testid="switch-active"
                      />
                      <Label htmlFor="isActive">Webhook is active</Label>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createWebhookMutation.isPending}
                    data-testid="button-submit-webhook"
                  >
                    {createWebhookMutation.isPending ? "Creating..." : "Create Webhook"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Webhook className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Webhooks</p>
                <p className="text-2xl font-semibold">{webhookStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold text-green-600">{webhookStats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-2xl font-semibold text-blue-600">{webhookStats.healthy}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-semibold text-purple-600">{webhookStats.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Webhooks List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Webhooks</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(webhook.status)}
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <Badge className={getStatusBadgeColor(webhook.status)}>
                          {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                        </Badge>
                        {webhook.isActive ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">{webhook.description}</CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center space-x-1">
                          <Link2 className="w-3 h-3" />
                          <span className="font-mono text-xs">{webhook.url}</span>
                        </span>
                        <span>Events: {webhook.events.length}</span>
                        {webhook.lastTriggered && (
                          <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhookMutation.mutate(webhook.id)}
                        disabled={testingWebhook === webhook.id}
                        data-testid={`button-test-${webhook.id}`}
                      >
                        {testingWebhook === webhook.id ? (
                          <>
                            <Clock className="w-4 h-4 mr-1 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Test
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWebhookMutation.mutate({ webhookId: webhook.id, isActive: !webhook.isActive })}
                        className={webhook.isActive ? "text-red-600" : "text-green-600"}
                        data-testid={`button-toggle-${webhook.id}`}
                      >
                        {webhook.isActive ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setIsEditDialogOpen(true);
                        }}
                        data-testid={`button-edit-${webhook.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Event Subscriptions */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Event Subscriptions</h4>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {availableEvents.find(e => e.value === event)?.label || event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Requests</span>
                      <p className="font-semibold">{webhook.stats.totalRequests.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate</span>
                      <p className="font-semibold text-green-600">
                        {((webhook.stats.successfulRequests / webhook.stats.totalRequests) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed Requests</span>
                      <p className="font-semibold text-red-600">{webhook.stats.failedRequests}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Response Time</span>
                      <p className="font-semibold">{webhook.stats.averageResponseTime}ms</p>
                    </div>
                  </div>

                  {/* Status Alerts */}
                  {webhook.status === 'failing' && (
                    <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        This webhook is experiencing failures. Recent requests have high error rates.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Integration Examples */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SIEM Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>SIEM Integration</span>
                  </CardTitle>
                  <CardDescription>
                    Forward security events to your SIEM system for centralized monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-mono">
                      POST /api/security-events<br/>
                      Content-Type: application/json<br/>
                      X-Signature: sha256=...
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended events: session_created, credentials_submitted, suspicious_activity
                  </p>
                </CardContent>
              </Card>

              {/* Slack Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Slack Integration</span>
                  </CardTitle>
                  <CardDescription>
                    Get real-time notifications in your security team's Slack channel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-mono">
                      https://hooks.slack.com/<br/>
                      services/T00000000/<br/>
                      B00000000/XXXXXXXX
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended events: high_risk_session, credentials_submitted, campaign_started
                  </p>
                </CardContent>
              </Card>

              {/* Analytics Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Analytics Platform</span>
                  </CardTitle>
                  <CardDescription>
                    Send detailed analytics data to external reporting systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-mono">
                      POST /webhooks/phishing-data<br/>
                      Authorization: Bearer token<br/>
                      Content-Type: application/json
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended events: session_analytics, campaign_metrics, campaign_completed
                  </p>
                </CardContent>
              </Card>

              {/* Custom API Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5" />
                    <span>Custom API</span>
                  </CardTitle>
                  <CardDescription>
                    Integrate with your custom applications and workflow systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-mono">
                      POST /your-endpoint<br/>
                      X-Webhook-Signature: hmac-sha256<br/>
                      Custom headers supported
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full payload customization and event filtering available
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}