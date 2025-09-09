import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  Webhook,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield
} from "lucide-react";

const alertSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  emailAddress: z.string().email().optional().or(z.literal("")),
  slackEnabled: z.boolean(),
  slackWebhookUrl: z.string().url().optional().or(z.literal("")),
  slackChannel: z.string().optional().or(z.literal("")),
  telegramEnabled: z.boolean(),
  telegramBotToken: z.string().optional().or(z.literal("")),
  telegramChatId: z.string().optional().or(z.literal("")),
  webhookEnabled: z.boolean(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  webhookSecret: z.string().optional().or(z.literal("")),
  alertOnCredentialCapture: z.boolean(),
  alertOnCampaignStart: z.boolean(),
  alertOnCampaignEnd: z.boolean(),
  alertOnHighRiskSession: z.boolean(),
});

type AlertSettingsData = z.infer<typeof alertSettingsSchema>;

export default function AlertSettingsPage() {
  const [testingAlert, setTestingAlert] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/alerts/settings"],
  });

  const form = useForm<AlertSettingsData>({
    resolver: zodResolver(alertSettingsSchema),
    defaultValues: settings || {
      emailEnabled: true,
      emailAddress: "",
      slackEnabled: false,
      slackWebhookUrl: "",
      slackChannel: "",
      telegramEnabled: false,
      telegramBotToken: "",
      telegramChatId: "",
      webhookEnabled: false,
      webhookUrl: "",
      webhookSecret: "",
      alertOnCredentialCapture: true,
      alertOnCampaignStart: true,
      alertOnCampaignEnd: true,
      alertOnHighRiskSession: true,
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings && !form.formState.isDirty) {
      form.reset(settings);
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AlertSettingsData) => {
      const response = await apiRequest("PUT", "/api/alerts/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alert settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update alert settings.",
        variant: "destructive",
      });
    },
  });

  const testAlertMutation = useMutation({
    mutationFn: async (alertType: string) => {
      const response = await apiRequest("POST", "/api/alerts/test", { alertType });
      return response.json();
    },
    onSuccess: (data, alertType) => {
      toast({
        title: "Test Alert Sent",
        description: `${alertType} test alert sent successfully!`,
      });
    },
    onError: (error, alertType) => {
      toast({
        title: "Test Failed",
        description: `Failed to send ${alertType} test alert.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AlertSettingsData) => {
    updateSettingsMutation.mutate(data);
  };

  const handleTestAlert = async (alertType: string) => {
    setTestingAlert(alertType);
    try {
      await testAlertMutation.mutateAsync(alertType);
    } finally {
      setTestingAlert(null);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading alert settings...</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alert Settings</h1>
            <p className="text-muted-foreground">Configure real-time notifications for your campaigns</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Bell className="w-4 h-4 mr-2" />
            Real-time Alerts
          </Badge>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Email Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-primary" />
                <CardTitle>Email Alerts</CardTitle>
              </div>
              <CardDescription>
                Receive alerts via email for important campaign events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailEnabled">Enable Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Send notifications to your email address</p>
                </div>
                <Switch
                  id="emailEnabled"
                  checked={form.watch("emailEnabled")}
                  onCheckedChange={(checked) => form.setValue("emailEnabled", checked)}
                  data-testid="switch-email-enabled"
                />
              </div>
              
              {form.watch("emailEnabled") && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      {...form.register("emailAddress")}
                      placeholder="alerts@yourcompany.com"
                      data-testid="input-email-address"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestAlert("email")}
                      disabled={testingAlert === "email"}
                      data-testid="button-test-email"
                    >
                      {testingAlert === "email" ? (
                        <>Testing...</>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slack Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <CardTitle>Slack Integration</CardTitle>
              </div>
              <CardDescription>
                Send alerts to your Slack workspace via webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="slackEnabled">Enable Slack Alerts</Label>
                  <p className="text-sm text-muted-foreground">Post notifications to Slack channels</p>
                </div>
                <Switch
                  id="slackEnabled"
                  checked={form.watch("slackEnabled")}
                  onCheckedChange={(checked) => form.setValue("slackEnabled", checked)}
                  data-testid="switch-slack-enabled"
                />
              </div>
              
              {form.watch("slackEnabled") && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="slackWebhookUrl">Webhook URL</Label>
                    <Input
                      id="slackWebhookUrl"
                      type="url"
                      {...form.register("slackWebhookUrl")}
                      placeholder="https://hooks.slack.com/services/..."
                      data-testid="input-slack-webhook"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slackChannel">Channel (Optional)</Label>
                    <Input
                      id="slackChannel"
                      {...form.register("slackChannel")}
                      placeholder="#security-alerts"
                      data-testid="input-slack-channel"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestAlert("slack")}
                      disabled={testingAlert === "slack"}
                      data-testid="button-test-slack"
                    >
                      {testingAlert === "slack" ? (
                        <>Testing...</>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Slack
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telegram Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-primary" />
                <CardTitle>Telegram Integration</CardTitle>
              </div>
              <CardDescription>
                Get instant notifications via Telegram bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="telegramEnabled">Enable Telegram Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via Telegram bot</p>
                </div>
                <Switch
                  id="telegramEnabled"
                  checked={form.watch("telegramEnabled")}
                  onCheckedChange={(checked) => form.setValue("telegramEnabled", checked)}
                  data-testid="switch-telegram-enabled"
                />
              </div>
              
              {form.watch("telegramEnabled") && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="telegramBotToken">Bot Token</Label>
                    <Input
                      id="telegramBotToken"
                      type="password"
                      {...form.register("telegramBotToken")}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTuVwXyZ"
                      data-testid="input-telegram-token"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telegramChatId">Chat ID</Label>
                    <Input
                      id="telegramChatId"
                      {...form.register("telegramChatId")}
                      placeholder="-1001234567890"
                      data-testid="input-telegram-chat"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestAlert("telegram")}
                      disabled={testingAlert === "telegram"}
                      data-testid="button-test-telegram"
                    >
                      {testingAlert === "telegram" ? (
                        <>Testing...</>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Telegram
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhook Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Webhook className="w-5 h-5 text-primary" />
                <CardTitle>Webhook Integration</CardTitle>
              </div>
              <CardDescription>
                Send alerts to external systems via HTTP webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="webhookEnabled">Enable Webhook Alerts</Label>
                  <p className="text-sm text-muted-foreground">POST alerts to external endpoints</p>
                </div>
                <Switch
                  id="webhookEnabled"
                  checked={form.watch("webhookEnabled")}
                  onCheckedChange={(checked) => form.setValue("webhookEnabled", checked)}
                  data-testid="switch-webhook-enabled"
                />
              </div>
              
              {form.watch("webhookEnabled") && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      type="url"
                      {...form.register("webhookUrl")}
                      placeholder="https://api.yourcompany.com/webhooks/zspam"
                      data-testid="input-webhook-url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      {...form.register("webhookSecret")}
                      placeholder="your-secret-key"
                      data-testid="input-webhook-secret"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used to sign webhook payloads for security verification
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Triggers */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Alert Triggers</CardTitle>
              </div>
              <CardDescription>
                Configure which events should trigger alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <Label htmlFor="alertOnCredentialCapture" className="font-medium">
                      Credential Capture
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When credentials are submitted
                    </p>
                  </div>
                  <Switch
                    id="alertOnCredentialCapture"
                    checked={form.watch("alertOnCredentialCapture")}
                    onCheckedChange={(checked) => form.setValue("alertOnCredentialCapture", checked)}
                    data-testid="switch-credential-capture"
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <Label htmlFor="alertOnCampaignStart" className="font-medium">
                      Campaign Start
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When campaigns begin execution
                    </p>
                  </div>
                  <Switch
                    id="alertOnCampaignStart"
                    checked={form.watch("alertOnCampaignStart")}
                    onCheckedChange={(checked) => form.setValue("alertOnCampaignStart", checked)}
                    data-testid="switch-campaign-start"
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Info className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <Label htmlFor="alertOnCampaignEnd" className="font-medium">
                      Campaign End
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When campaigns complete
                    </p>
                  </div>
                  <Switch
                    id="alertOnCampaignEnd"
                    checked={form.watch("alertOnCampaignEnd")}
                    onCheckedChange={(checked) => form.setValue("alertOnCampaignEnd", checked)}
                    data-testid="switch-campaign-end"
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <Label htmlFor="alertOnHighRiskSession" className="font-medium">
                      High-Risk Sessions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Suspicious or bot activity
                    </p>
                  </div>
                  <Switch
                    id="alertOnHighRiskSession"
                    checked={form.watch("alertOnHighRiskSession")}
                    onCheckedChange={(checked) => form.setValue("alertOnHighRiskSession", checked)}
                    data-testid="switch-high-risk"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
              className="w-32"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}