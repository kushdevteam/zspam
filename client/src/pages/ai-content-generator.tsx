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
  Wand2,
  Brain,
  FileText,
  Image,
  Mail,
  Link,
  Copy,
  RefreshCw,
  Save,
  Eye,
  Settings,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
  Download,
  Upload,
  PenTool
} from "lucide-react";

interface ContentTemplate {
  id: string;
  name: string;
  type: 'email' | 'landing_page' | 'sms' | 'social_media';
  category: string;
  subject?: string;
  content: string;
  effectivenessScore: number;
  lastUsed: string;
  usageCount: number;
  aiGenerated: boolean;
  variations: number;
}

interface AIGenerationRequest {
  contentType: string;
  targetIndustry: string;
  targetRole: string;
  urgencyLevel: string;
  brandName: string;
  socialEngineeringTechnique: string;
  languageStyle: string;
  includePersonalization: boolean;
}

interface GeneratedContent {
  id: string;
  content: string;
  subject?: string;
  confidence: number;
  techniques: string[];
  riskLevel: string;
  estimatedEffectiveness: number;
  variations: string[];
}

const mockContentTemplates: ContentTemplate[] = [
  {
    id: "1",
    name: "Urgent Security Update - Banking",
    type: "email",
    category: "Banking Phishing",
    subject: "Immediate Action Required: Verify Your Banking Details",
    content: "Dear [FIRST_NAME], We've detected unusual activity on your account. Please verify your details immediately to prevent account suspension. Click here to secure your account: [PHISHING_LINK]",
    effectivenessScore: 0.87,
    lastUsed: "2024-01-15T10:30:00Z",
    usageCount: 23,
    aiGenerated: true,
    variations: 5
  },
  {
    id: "2", 
    name: "Office 365 Password Expiry",
    type: "email",
    category: "Credential Harvesting",
    subject: "Your password will expire in 24 hours",
    content: "Hello [FIRST_NAME], Your Office 365 password is set to expire in 24 hours. To avoid service interruption, please update your password now: [PHISHING_LINK]",
    effectivenessScore: 0.74,
    lastUsed: "2024-01-14T14:15:00Z",
    usageCount: 41,
    aiGenerated: true,
    variations: 8
  },
  {
    id: "3",
    name: "Company Benefits Update",
    type: "email",
    category: "HR Impersonation",
    subject: "New Employee Benefits - Action Required",
    content: "Hi [FIRST_NAME], We're excited to announce enhanced employee benefits. Review and confirm your enrollment by clicking here: [PHISHING_LINK]",
    effectivenessScore: 0.62,
    lastUsed: "2024-01-13T09:45:00Z",
    usageCount: 18,
    aiGenerated: false,
    variations: 3
  },
  {
    id: "4",
    name: "Cryptocurrency Alert Landing Page",
    type: "landing_page", 
    category: "Investment Scam",
    content: "🚨 URGENT: Your crypto portfolio is at risk! Secure your investments now with our advanced protection system. Limited time offer - act fast!",
    effectivenessScore: 0.69,
    lastUsed: "2024-01-12T16:20:00Z",
    usageCount: 12,
    aiGenerated: true,
    variations: 4
  },
  {
    id: "5",
    name: "Mobile Banking SMS Alert",
    type: "sms",
    category: "Smishing",
    content: "ALERT: Suspicious activity detected on your account. Verify immediately: [SHORT_LINK] Reply STOP to opt out.",
    effectivenessScore: 0.78,
    lastUsed: "2024-01-11T11:30:00Z",
    usageCount: 35,
    aiGenerated: true,
    variations: 6
  }
];

const mockGenerationRequest: AIGenerationRequest = {
  contentType: "email",
  targetIndustry: "Financial Services",
  targetRole: "Account Manager",
  urgencyLevel: "High",
  brandName: "Barclays Bank",
  socialEngineeringTechnique: "Authority + Urgency",
  languageStyle: "Professional",
  includePersonalization: true
};

export default function AIContentGenerator() {
  const [generationRequest, setGenerationRequest] = useState<AIGenerationRequest>(mockGenerationRequest);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: contentTemplates = mockContentTemplates } = useQuery<ContentTemplate[]>({
    queryKey: ["/api/ai/content-templates"],
    queryFn: () => Promise.resolve(mockContentTemplates),
  });

  const generateContentMutation = useMutation({
    mutationFn: async (request: AIGenerationRequest) => {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsGenerating(false);
      
      const mockGenerated: GeneratedContent = {
        id: Date.now().toString(),
        subject: "Urgent: Verify Your Account to Prevent Suspension",
        content: `Dear [FIRST_NAME],\n\nWe have detected unusual activity on your ${request.brandName} account that requires immediate attention. To ensure the security of your account and prevent temporary suspension, please verify your identity within 24 hours.\n\n🚨 URGENT ACTION REQUIRED 🚨\n\nUnauthorized login attempts have been detected from an unrecognized device. If this wasn't you, your account may be compromised.\n\nTo secure your account immediately:\n1. Click the verification link below\n2. Confirm your identity\n3. Update your security settings\n\n[VERIFY MY ACCOUNT NOW] [PHISHING_LINK]\n\nThis verification link will expire in 24 hours for security reasons.\n\nIf you ignore this message, your account will be temporarily suspended to prevent unauthorized access.\n\nThank you for your immediate attention,\n${request.brandName} Security Team\n\n⚠️ This is an automated message. Do not reply to this email.`,
        confidence: 0.92,
        techniques: ["Authority", "Urgency", "Fear", "Social Proof"],
        riskLevel: "High",
        estimatedEffectiveness: 0.83,
        variations: [
          "Account Security Alert - Immediate Verification Required",
          "Suspicious Activity Detected - Action Needed",
          "Security Notice: Verify Your Account Access"
        ]
      };
      
      setGeneratedContent(mockGenerated);
      return mockGenerated;
    },
    onSuccess: (data) => {
      toast({
        title: "Content Generated Successfully",
        description: `New phishing content generated with ${Math.round(data.confidence * 100)}% confidence score`,
      });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (template: Partial<ContentTemplate>) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, templateId: Date.now().toString() };
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "Content template has been saved successfully",
      });
    },
  });

  const generateVariationsMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { 
        variations: 5,
        avgEffectiveness: 0.78
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Variations Generated",
        description: `Created ${data.variations} variations with ${Math.round(data.avgEffectiveness * 100)}% avg effectiveness`,
      });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'landing_page': return <FileText className="w-4 h-4" />;
      case 'sms': return <FileText className="w-4 h-4" />;
      case 'social_media': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 0.8) return "text-red-600";
    if (score >= 0.6) return "text-orange-600"; 
    if (score >= 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Content Generation Engine</h1>
            <p className="text-muted-foreground">Advanced AI-powered phishing content creation and variation generation</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Templates
            </Button>
            <Button onClick={() => generateContentMutation.mutate(generationRequest)}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Content
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* AI Generation Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Templates Created</p>
                  <p className="text-2xl font-bold">{contentTemplates.filter(t => t.aiGenerated).length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Effectiveness</p>
                  <p className="text-2xl font-bold">
                    {Math.round(contentTemplates.reduce((acc, t) => acc + t.effectivenessScore, 0) / contentTemplates.length * 100)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Variations</p>
                  <p className="text-2xl font-bold">
                    {contentTemplates.reduce((acc, t) => acc + t.variations, 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-bold">
                    {contentTemplates.reduce((acc, t) => acc + t.usageCount, 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="generator">AI Generator</TabsTrigger>
            <TabsTrigger value="templates">Template Library</TabsTrigger>
            <TabsTrigger value="variations">Variation Engine</TabsTrigger>
            <TabsTrigger value="analytics">Content Analytics</TabsTrigger>
            <TabsTrigger value="settings">AI Settings</TabsTrigger>
          </TabsList>

          {/* AI Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Generation Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Content Generation Settings</span>
                  </CardTitle>
                  <CardDescription>Configure AI parameters for content generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Content Type</Label>
                      <Select 
                        value={generationRequest.contentType}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, contentType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="landing_page">Landing Page</SelectItem>
                          <SelectItem value="sms">SMS Message</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Target Industry</Label>
                      <Select 
                        value={generationRequest.targetIndustry}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, targetIndustry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Financial Services">Financial Services</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Target Role</Label>
                      <Select 
                        value={generationRequest.targetRole}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, targetRole: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Executive">Executive</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Employee">General Employee</SelectItem>
                          <SelectItem value="IT Staff">IT Staff</SelectItem>
                          <SelectItem value="Finance">Finance Team</SelectItem>
                          <SelectItem value="HR">HR Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Brand/Organization</Label>
                      <Input 
                        value={generationRequest.brandName}
                        onChange={(e) => setGenerationRequest(prev => ({ ...prev, brandName: e.target.value }))}
                        placeholder="e.g. Barclays Bank, Microsoft, HMRC"
                      />
                    </div>

                    <div>
                      <Label>Social Engineering Technique</Label>
                      <Select 
                        value={generationRequest.socialEngineeringTechnique}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, socialEngineeringTechnique: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Authority">Authority</SelectItem>
                          <SelectItem value="Urgency">Urgency</SelectItem>
                          <SelectItem value="Fear">Fear</SelectItem>
                          <SelectItem value="Authority + Urgency">Authority + Urgency</SelectItem>
                          <SelectItem value="Social Proof">Social Proof</SelectItem>
                          <SelectItem value="Curiosity">Curiosity</SelectItem>
                          <SelectItem value="Greed">Greed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Urgency Level</Label>
                      <Select 
                        value={generationRequest.urgencyLevel}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, urgencyLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Language Style</Label>
                      <Select 
                        value={generationRequest.languageStyle}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, languageStyle: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Casual">Casual</SelectItem>
                          <SelectItem value="Formal">Formal</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                          <SelectItem value="Friendly">Friendly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={generationRequest.includePersonalization}
                        onCheckedChange={(checked) => setGenerationRequest(prev => ({ ...prev, includePersonalization: checked }))}
                      />
                      <Label>Include Personalization Tags</Label>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => generateContentMutation.mutate(generationRequest)}
                    disabled={generateContentMutation.isPending}
                  >
                    {generateContentMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate AI Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Content Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Generated Content</span>
                  </CardTitle>
                  <CardDescription>AI-generated phishing content based on your parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="relative">
                        <Brain className="w-12 h-12 text-purple-500 animate-pulse" />
                        <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">AI Engine is crafting your content...</p>
                        <p className="text-sm text-muted-foreground">Analyzing social engineering patterns</p>
                      </div>
                      <Progress value={66} className="w-full h-2" />
                    </div>
                  ) : generatedContent ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">
                            {Math.round(generatedContent.confidence * 100)}% Confidence
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(generatedContent.estimatedEffectiveness * 100)}% Effectiveness
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>

                      {generatedContent.subject && (
                        <div>
                          <Label className="text-sm font-medium">Subject Line</Label>
                          <div className="mt-1 p-3 bg-muted rounded border">
                            <p className="font-medium">{generatedContent.subject}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Content</Label>
                        <div className="mt-1 p-3 bg-muted rounded border">
                          <pre className="whitespace-pre-wrap text-sm">{generatedContent.content}</pre>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Social Engineering Techniques Used</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {generatedContent.techniques.map((technique, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {technique}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Alternative Subject Lines</Label>
                        <div className="mt-1 space-y-1">
                          {generatedContent.variations.map((variation, index) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              {variation}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => saveTemplateMutation.mutate({
                            name: generatedContent.subject || "AI Generated Template",
                            type: generationRequest.contentType as any,
                            content: generatedContent.content,
                            subject: generatedContent.subject,
                            aiGenerated: true
                          })}
                          disabled={saveTemplateMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Template
                        </Button>
                        <Button variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Generate Variations
                        </Button>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                      <Wand2 className="w-12 h-12 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Ready to Generate Content</p>
                        <p className="text-sm text-muted-foreground">Configure your parameters and click generate to create AI-powered phishing content</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Template Library Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {contentTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTemplate(template)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(template.type)}
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{template.category}</p>
                          </div>
                          {template.aiGenerated && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              AI Generated
                            </Badge>
                          )}
                        </div>

                        {template.subject && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Subject: {template.subject}</p>
                          </div>
                        )}

                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Effectiveness</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={template.effectivenessScore * 100} className="h-2 flex-1" />
                              <span className={`font-bold text-sm ${getEffectivenessColor(template.effectivenessScore)}`}>
                                {Math.round(template.effectivenessScore * 100)}%
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">Usage Count</p>
                            <p className="font-medium text-sm">{template.usageCount}</p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">Variations</p>
                            <p className="font-medium text-sm">{template.variations}</p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">Last Used</p>
                            <p className="font-medium text-sm">
                              {new Date(template.lastUsed).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <PenTool className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateVariationsMutation.mutate(template.id);
                            }}
                            disabled={generateVariationsMutation.isPending}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Generate Variations
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Copy className="w-3 h-3 mr-1" />
                            Duplicate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Variation Engine Tab */}
          <TabsContent value="variations" className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                The AI Variation Engine automatically creates multiple versions of your content to test different approaches and maximize effectiveness.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Variation Configuration</CardTitle>
                  <CardDescription>Configure how AI generates content variations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Vary subject lines</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Adjust urgency levels</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Change social engineering techniques</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Modify language style</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Include visual elements</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Number of Variations</Label>
                    <Select defaultValue="5">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 variations</SelectItem>
                        <SelectItem value="5">5 variations</SelectItem>
                        <SelectItem value="8">8 variations</SelectItem>
                        <SelectItem value="10">10 variations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Variation Strategy</Label>
                    <Select defaultValue="effectiveness">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="effectiveness">Maximize Effectiveness</SelectItem>
                        <SelectItem value="diversity">Maximize Diversity</SelectItem>
                        <SelectItem value="subtle">Subtle Variations</SelectItem>
                        <SelectItem value="aggressive">Aggressive Changes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Variations
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variation Performance</CardTitle>
                  <CardDescription>How different variations perform in campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded">
                        <p className="text-2xl font-bold text-green-600">34%</p>
                        <p className="text-sm text-muted-foreground">Avg Improvement</p>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <p className="text-2xl font-bold text-blue-600">156</p>
                        <p className="text-sm text-muted-foreground">Variations Created</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">Subject Line Variations</p>
                          <p className="text-xs text-muted-foreground">89 variations • 67% avg effectiveness</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">High Impact</Badge>
                      </div>

                      <div className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">Content Structure Changes</p>
                          <p className="text-xs text-muted-foreground">45 variations • 52% avg effectiveness</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>
                      </div>

                      <div className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">Language Style Adjustments</p>
                          <p className="text-xs text-muted-foreground">22 variations • 43% avg effectiveness</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Low Impact</Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance Metrics</CardTitle>
                  <CardDescription>How AI-generated content performs compared to manual content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AI-Generated Content</span>
                        <span className="font-bold text-green-600">78% avg effectiveness</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Manual Content</span>
                        <span className="font-bold text-blue-600">64% avg effectiveness</span>
                      </div>
                      <Progress value={64} className="h-2" />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">+22%</p>
                        <p className="text-sm text-muted-foreground">AI Performance Boost</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">4.7x</p>
                        <p className="text-sm text-muted-foreground">Faster Creation</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Categories</CardTitle>
                  <CardDescription>Effectiveness by content type and category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Banking Phishing</span>
                        <span className="font-bold">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Office 365 Attacks</span>
                        <span className="font-bold">79%</span>
                      </div>
                      <Progress value={79} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>HR Impersonation</span>
                        <span className="font-bold">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Social Media Phishing</span>
                        <span className="font-bold">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>SMS/Smishing</span>
                        <span className="font-bold">76%</span>
                      </div>
                      <Progress value={76} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Content Impact Analysis</CardTitle>
                <CardDescription>Comprehensive analysis of AI-generated content effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-green-600">289</p>
                    <p className="text-sm text-muted-foreground">Templates Generated</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                    <p className="text-sm text-muted-foreground">Variations Created</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-purple-600">67%</p>
                    <p className="text-sm text-muted-foreground">Success Rate Improvement</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-orange-600">156hrs</p>
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Configuration</CardTitle>
                  <CardDescription>Configure AI generation models and parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Primary AI Model</Label>
                      <Select defaultValue="gpt4-advanced">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt4-advanced">GPT-4 Advanced</SelectItem>
                          <SelectItem value="gpt4-standard">GPT-4 Standard</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                          <SelectItem value="custom">Custom Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Creativity Level</Label>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Conservative</span>
                          <span>Creative</span>
                        </div>
                        <Progress value={70} className="h-3" />
                      </div>
                    </div>

                    <div>
                      <Label>Content Safety Level</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">Strict (Low Risk)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="permissive">Permissive (High Impact)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Enable content filtering</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Auto-save generated content</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Include controversial techniques</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generation Limits & Usage</CardTitle>
                  <CardDescription>Monitor and control AI generation usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Monthly Generation Limit</Label>
                      <Input type="number" defaultValue="500" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used 234/500 generations this month
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Usage This Month</span>
                        <span>47%</span>
                      </div>
                      <Progress value={47} className="h-2" />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <p className="font-bold text-lg">234</p>
                        <p className="text-muted-foreground">Templates Generated</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg">1,247</p>
                        <p className="text-muted-foreground">Variations Created</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Email Templates</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Landing Pages</span>
                        <span className="font-medium">34</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SMS Messages</span>
                        <span className="font-medium">67</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Media</span>
                        <span className="font-medium">23</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Fine-tune AI behavior and output preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Default Language</Label>
                      <Select defaultValue="en-GB">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Content Length Preference</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short & Concise</SelectItem>
                          <SelectItem value="medium">Medium Length</SelectItem>
                          <SelectItem value="long">Detailed & Comprehensive</SelectItem>
                          <SelectItem value="variable">Variable Length</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Include technical indicators</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Industry Focus</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Industries</SelectItem>
                          <SelectItem value="finance">Finance & Banking</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Regional Localization</Label>
                      <Select defaultValue="uk">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="eu">European Union</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Beta features enabled</Label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex space-x-4">
                    <Button>
                      Save Configuration
                    </Button>
                    <Button variant="outline">
                      Reset to Defaults
                    </Button>
                    <Button variant="outline">
                      Export Settings
                    </Button>
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