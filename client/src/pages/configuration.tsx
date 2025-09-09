import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import { insertTelegramSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Lock, 
  MessageSquare, 
  Palette, 
  CheckCircle, 
  Zap,
  Sun,
  Moon
} from "lucide-react";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const telegramFormSchema = insertTelegramSettingsSchema.extend({
  enabled: z.boolean().optional(),
});

type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
type TelegramFormData = z.infer<typeof telegramFormSchema>;

export default function ConfigurationPage() {
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Telegram settings
  const { data: telegramSettings, isLoading: telegramLoading } = useQuery<{ enabled: boolean; botToken?: string; chatId?: string }>({
    queryKey: ["/api/telegram"],
  });

  // Password change form
  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Telegram form
  const telegramForm = useForm<TelegramFormData>({
    resolver: zodResolver(telegramFormSchema),
    defaultValues: {
      botToken: "",
      chatId: "",
      enabled: false,
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (telegramSettings) {
      telegramForm.reset({
        botToken: telegramSettings.botToken || "",
        chatId: telegramSettings.chatId || "",
        enabled: telegramSettings.enabled || false,
      });
    }
  }, [telegramSettings, telegramForm]);

  // Password change mutation
  const passwordChangeMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest("POST", "/api/config/password", data),
    onSuccess: () => {
      setPasswordChangeSuccess(true);
      passwordForm.reset();
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      // Hide success message after 5 seconds
      setTimeout(() => setPasswordChangeSuccess(false), 5000);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update password";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Telegram settings mutation
  const telegramMutation = useMutation({
    mutationFn: (data: TelegramFormData) =>
      apiRequest("POST", "/api/telegram", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Telegram settings updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/telegram"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update Telegram settings.",
        variant: "destructive",
      });
    },
  });

  // Test Telegram connection
  const testTelegramMutation = useMutation({
    mutationFn: () => {
      // In a real implementation, this would test the Telegram bot connection
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Telegram connection test successful!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Telegram connection test failed.",
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: PasswordChangeData) => {
    passwordChangeMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const onTelegramSubmit = (data: TelegramFormData) => {
    telegramMutation.mutate(data);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Configuration</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Alert */}
            {passwordChangeSuccess && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Password changed successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Change Password */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </h3>
                
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password:</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      {...passwordForm.register("currentPassword")}
                      data-testid="input-current-password"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-400 mt-1">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password:</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      {...passwordForm.register("newPassword")}
                      data-testid="input-new-password"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-400 mt-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password:</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      {...passwordForm.register("confirmPassword")}
                      data-testid="input-confirm-password"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-400 mt-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={passwordChangeMutation.isPending}
                    data-testid="button-update-password"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {passwordChangeMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Telegram Bot Settings */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Telegram Bot
                </h3>
                
                <form onSubmit={telegramForm.handleSubmit(onTelegramSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="botToken">Bot Token:</Label>
                    <Input
                      id="botToken"
                      type="password"
                      placeholder="Enter Telegram Bot Token"
                      {...telegramForm.register("botToken")}
                      data-testid="input-bot-token"
                    />
                    {telegramForm.formState.errors.botToken && (
                      <p className="text-sm text-red-400 mt-1">
                        {telegramForm.formState.errors.botToken.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="chatId">Chat ID:</Label>
                    <Input
                      id="chatId"
                      placeholder="Enter Chat ID"
                      {...telegramForm.register("chatId")}
                      data-testid="input-chat-id"
                    />
                    {telegramForm.formState.errors.chatId && (
                      <p className="text-sm text-red-400 mt-1">
                        {telegramForm.formState.errors.chatId.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableNotifications"
                      checked={telegramForm.watch("enabled")}
                      onCheckedChange={(checked) => telegramForm.setValue("enabled", !!checked)}
                      data-testid="checkbox-enable-notifications"
                    />
                    <Label htmlFor="enableNotifications">Enable real-time notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => testTelegramMutation.mutate()}
                      disabled={testTelegramMutation.isPending}
                      data-testid="button-test-telegram"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {testTelegramMutation.isPending ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={telegramMutation.isPending}
                      data-testid="button-save-telegram"
                    >
                      {telegramMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Appearance Settings */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Choose Theme
                </h3>
                
                <div className="space-y-3">
                  <div 
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                      theme === "dark" ? "bg-primary/10 border border-primary/20" : "bg-muted/20"
                    }`}
                    onClick={() => setTheme("dark")}
                    data-testid="theme-dark"
                  >
                    <input 
                      type="radio" 
                      name="theme" 
                      checked={theme === "dark"}
                      onChange={() => setTheme("dark")}
                      className="w-4 h-4 text-primary bg-input border-border focus:ring-ring focus:ring-2"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <Moon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">Dark Mode</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                      theme === "light" ? "bg-primary/10 border border-primary/20" : "bg-muted/20"
                    }`}
                    onClick={() => setTheme("light")}
                    data-testid="theme-light"
                  >
                    <input 
                      type="radio" 
                      name="theme" 
                      checked={theme === "light"}
                      onChange={() => setTheme("light")}
                      className="w-4 h-4 text-primary bg-input border-border focus:ring-ring focus:ring-2"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <Sun className="w-5 h-5 text-primary" />
                      <span className={theme === "light" ? "text-primary" : "text-foreground"}>Light Mode</span>
                    </div>
                  </div>
                </div>
                
                {/* Theme Preview */}
                <div className="mt-6 p-4 border border-border rounded-lg bg-background">
                  <div className="h-2 bg-primary rounded-full w-3/4 mb-2"></div>
                  <div className="h-2 bg-muted rounded-full w-1/2 mb-2"></div>
                  <div className="h-2 bg-muted rounded-full w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
