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
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Plus, 
  Target,
  MapPin,
  Building,
  Clock,
  Mail,
  Edit,
  Trash2,
  Globe,
  Users,
  Calendar
} from "lucide-react";

const personalizationRuleSchema = z.object({
  name: z.string().min(3, "Rule name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.object({
    department: z.string().optional(),
    location: z.string().optional(),
    role: z.string().optional(),
    seniority: z.string().optional(),
    industry: z.string().optional(),
  }),
  personalization: z.object({
    subjectLine: z.string().optional(),
    senderName: z.string().optional(),
    senderEmail: z.string().optional(),
    companyName: z.string().optional(),
    urgencyLevel: z.enum(["low", "medium", "high"]).optional(),
    timeZone: z.string().optional(),
  }),
  template: z.object({
    templateId: z.string(),
    customizations: z.record(z.string()),
  }),
  isActive: z.boolean().default(true),
  priority: z.number().min(1).max(10).default(5),
});

type PersonalizationRuleData = z.infer<typeof personalizationRuleSchema>;

interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  targetAudience: {
    department?: string;
    location?: string;
    role?: string;
    seniority?: string;
    industry?: string;
  };
  personalization: {
    subjectLine?: string;
    senderName?: string;
    senderEmail?: string;
    companyName?: string;
    urgencyLevel?: string;
    timeZone?: string;
  };
  template: {
    templateId: string;
    customizations: Record<string, string>;
  };
  isActive: boolean;
  priority: number;
  createdAt: string;
  lastUsed?: string;
  usage: {
    campaigns: number;
    recipients: number;
    effectiveness: number;
  };
}

const mockRules: PersonalizationRule[] = [
  {
    id: "1",
    name: "UK C-Suite Banking",
    description: "High-urgency banking alerts targeting senior executives in UK financial sector",
    targetAudience: {
      role: "Executive",
      seniority: "C-Level",
      location: "United Kingdom",
      industry: "Financial Services"
    },
    personalization: {
      subjectLine: "URGENT: {{company_name}} account requires immediate verification",
      senderName: "{{bank_name}} Security Team",
      senderEmail: "security@{{bank_domain}}",
      urgencyLevel: "high",
      timeZone: "Europe/London"
    },
    template: {
      templateId: "barclays-executive",
      customizations: {
        logo_variant: "executive",
        language_tone: "formal",
        security_level: "high"
      }
    },
    isActive: true,
    priority: 9,
    createdAt: "2024-01-15T10:00:00Z",
    lastUsed: "2024-01-20T14:30:00Z",
    usage: {
      campaigns: 12,
      recipients: 847,
      effectiveness: 34.2
    }
  },
  {
    id: "2",
    name: "IT Department O365",
    description: "Technical Office365 security alerts for IT professionals",
    targetAudience: {
      department: "Information Technology",
      role: "Technical",
      seniority: "Mid-Senior"
    },
    personalization: {
      subjectLine: "Microsoft 365 Security Alert: {{threat_type}} detected",
      senderName: "Microsoft Security Center",
      senderEmail: "security@microsoftonline.com",
      urgencyLevel: "medium"
    },
    template: {
      templateId: "o365-technical",
      customizations: {
        technical_details: "enhanced",
        action_buttons: "multiple",
        branding: "microsoft"
      }
    },
    isActive: true,
    priority: 7,
    createdAt: "2024-01-12T15:20:00Z",
    lastUsed: "2024-01-19T09:15:00Z",
    usage: {
      campaigns: 8,
      recipients: 423,
      effectiveness: 28.6
    }
  },
  {
    id: "3",
    name: "London Finance Teams",
    description: "Location-specific financial service alerts for London-based teams",
    targetAudience: {
      location: "London",
      department: "Finance",
      industry: "Any"
    },
    personalization: {
      subjectLine: "Your {{service_name}} account: London activity requires verification",
      companyName: "{{target_bank}}",
      timeZone: "Europe/London",
      urgencyLevel: "medium"
    },
    template: {
      templateId: "uk-banking-generic",
      customizations: {
        location_specific: "london",
        currency: "GBP",
        regulatory: "FCA"
      }
    },
    isActive: true,
    priority: 6,
    createdAt: "2024-01-10T11:45:00Z",
    usage: {
      campaigns: 5,
      recipients: 234,
      effectiveness: 22.1
    }
  },
  {
    id: "4",
    name: "Crypto Early Adopters",
    description: "Cryptocurrency platform alerts targeting tech-savvy early adopters",
    targetAudience: {
      role: "Technical",
      industry: "Technology",
      seniority: "Any"
    },
    personalization: {
      subjectLine: "{{platform_name}} Security: Unusual activity on your crypto wallet",
      urgencyLevel: "high",
      senderName: "{{platform_name}} Security"
    },
    template: {
      templateId: "crypto-security",
      customizations: {
        wallet_type: "multi",
        security_features: "2fa_emphasis",
        ui_theme: "dark"
      }
    },
    isActive: false,
    priority: 5,
    createdAt: "2024-01-08T16:30:00Z",
    usage: {
      campaigns: 3,
      recipients: 156,
      effectiveness: 31.4
    }
  }
];

export default function Personalization() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PersonalizationRule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PersonalizationRuleData>({
    resolver: zodResolver(personalizationRuleSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAudience: {},
      personalization: {},
      template: {
        templateId: "",
        customizations: {}
      },
      isActive: true,
      priority: 5,
    },
  });

  const { data: rules = mockRules } = useQuery<PersonalizationRule[]>({
    queryKey: ["/api/personalization/rules"],
    queryFn: () => Promise.resolve(mockRules),
  });

  const createRuleMutation = useMutation({
    mutationFn: async (data: PersonalizationRuleData) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Date.now().toString(), ...data };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personalization rule created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personalization/rules"] });
      form.reset();
      setIsCreateDialogOpen(false);
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ ruleId, data }: { ruleId: string; data: Partial<PersonalizationRuleData> }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ruleId, ...data };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personalization rule updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personalization/rules"] });
      setIsEditDialogOpen(false);
      setSelectedRule(null);
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ruleId, isActive };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rule status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personalization/rules"] });
    },
  });

  const onSubmit = (data: PersonalizationRuleData) => {
    createRuleMutation.mutate(data);
  };

  const handleEditRule = (rule: PersonalizationRule) => {
    setSelectedRule(rule);
    form.reset({
      name: rule.name,
      description: rule.description,
      targetAudience: rule.targetAudience,
      personalization: rule.personalization,
      template: rule.template,
      isActive: rule.isActive,
      priority: rule.priority
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleRule = (ruleId: string, currentStatus: boolean) => {
    toggleRuleMutation.mutate({ ruleId, isActive: !currentStatus });
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 30) return "text-green-600";
    if (effectiveness >= 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) return { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: "High" };
    if (priority >= 5) return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", text: "Medium" };
    return { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", text: "Low" };
  };

  const ruleStats = {
    total: rules.length,
    active: rules.filter(r => r.isActive).length,
    highPerformance: rules.filter(r => r.usage.effectiveness >= 30).length,
    averageEffectiveness: rules.length > 0 ? 
      (rules.reduce((sum, r) => sum + r.usage.effectiveness, 0) / rules.length).toFixed(1) : "0"
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Advanced Personalization Engine</h1>
            <p className="text-muted-foreground">Create dynamic, targeted campaign content based on recipient attributes</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-rule">
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Personalization Rule</DialogTitle>
                <DialogDescription>
                  Define targeting criteria and personalization parameters for campaign content
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Rule Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Rule Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="e.g., UK C-Suite Banking"
                        data-testid="input-rule-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Describe who this rule targets and why"
                        rows={2}
                        data-testid="textarea-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority (1-10)</Label>
                        <Input
                          id="priority"
                          type="number"
                          min="1"
                          max="10"
                          {...form.register("priority", { valueAsNumber: true })}
                          data-testid="input-priority"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-6">
                        <Switch
                          id="isActive"
                          checked={form.watch("isActive")}
                          onCheckedChange={(checked) => form.setValue("isActive", checked)}
                          data-testid="switch-active"
                        />
                        <Label htmlFor="isActive">Rule is active</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Target Audience</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        {...form.register("targetAudience.department")}
                        placeholder="e.g., Finance, IT, HR"
                        data-testid="input-department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        {...form.register("targetAudience.role")}
                        placeholder="e.g., Manager, Developer, Executive"
                        data-testid="input-role"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...form.register("targetAudience.location")}
                        placeholder="e.g., London, UK, Europe"
                        data-testid="input-location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="seniority">Seniority Level</Label>
                      <Select
                        value={form.watch("targetAudience.seniority") || ""}
                        onValueChange={(value) => form.setValue("targetAudience.seniority", value)}
                      >
                        <SelectTrigger data-testid="select-seniority">
                          <SelectValue placeholder="Select seniority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry">Entry Level</SelectItem>
                          <SelectItem value="Mid">Mid Level</SelectItem>
                          <SelectItem value="Senior">Senior Level</SelectItem>
                          <SelectItem value="C-Level">C-Level Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        {...form.register("targetAudience.industry")}
                        placeholder="e.g., Financial Services, Technology"
                        data-testid="input-industry"
                      />
                    </div>
                  </div>
                </div>

                {/* Personalization Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personalization Settings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="subjectLine">Subject Line Template</Label>
                      <Input
                        id="subjectLine"
                        {...form.register("personalization.subjectLine")}
                        placeholder="Use {{variables}} like {{company_name}} or {{urgency_level}}"
                        data-testid="input-subject-template"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Available variables: &#123;&#123;company_name&#125;&#125;, &#123;&#123;recipient_name&#125;&#125;, &#123;&#123;department&#125;&#125;, &#123;&#123;urgency_level&#125;&#125;
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="senderName">Sender Name</Label>
                        <Input
                          id="senderName"
                          {...form.register("personalization.senderName")}
                          placeholder="e.g., {{company_name}} Security Team"
                          data-testid="input-sender-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="senderEmail">Sender Email</Label>
                        <Input
                          id="senderEmail"
                          {...form.register("personalization.senderEmail")}
                          placeholder="e.g., security@{{domain}}"
                          data-testid="input-sender-email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="urgencyLevel">Urgency Level</Label>
                        <Select
                          value={form.watch("personalization.urgencyLevel") || ""}
                          onValueChange={(value) => form.setValue("personalization.urgencyLevel", value as any)}
                        >
                          <SelectTrigger data-testid="select-urgency">
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeZone">Time Zone</Label>
                        <Select
                          value={form.watch("personalization.timeZone") || ""}
                          onValueChange={(value) => form.setValue("personalization.timeZone", value)}
                        >
                          <SelectTrigger data-testid="select-timezone">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            <SelectItem value="America/New_York">New York (EST)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Template & Customization</h3>
                  <div>
                    <Label htmlFor="templateId">Base Template</Label>
                    <Select
                      value={form.watch("template.templateId")}
                      onValueChange={(value) => form.setValue("template.templateId", value)}
                    >
                      <SelectTrigger data-testid="select-template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barclays-standard">Barclays Banking (Standard)</SelectItem>
                        <SelectItem value="barclays-executive">Barclays Banking (Executive)</SelectItem>
                        <SelectItem value="hsbc-corporate">HSBC Corporate Banking</SelectItem>
                        <SelectItem value="o365-standard">Office 365 (Standard)</SelectItem>
                        <SelectItem value="o365-technical">Office 365 (Technical)</SelectItem>
                        <SelectItem value="crypto-security">Cryptocurrency Security</SelectItem>
                      </SelectContent>
                    </Select>
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
                    disabled={createRuleMutation.isPending}
                    data-testid="button-submit-rule"
                  >
                    {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
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
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-semibold">{ruleStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-semibold text-green-600">{ruleStats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Performance</p>
                <p className="text-2xl font-semibold text-blue-600">{ruleStats.highPerformance}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Effectiveness</p>
                <p className="text-2xl font-semibold text-purple-600">{ruleStats.averageEffectiveness}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Rules List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Rules</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="high-performance">High Performance</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <Badge className={getPriorityBadge(rule.priority).color}>
                          {getPriorityBadge(rule.priority).text}
                        </Badge>
                        {rule.isActive ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">{rule.description}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditRule(rule)}
                        data-testid={`button-edit-${rule.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRule(rule.id, rule.isActive)}
                        className={rule.isActive ? "text-red-600" : "text-green-600"}
                        data-testid={`button-toggle-${rule.id}`}
                      >
                        {rule.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Target Audience */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Target Audience</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {rule.targetAudience.department && (
                        <Badge variant="outline" className="text-xs">
                          <Building className="w-3 h-3 mr-1" />
                          {rule.targetAudience.department}
                        </Badge>
                      )}
                      {rule.targetAudience.role && (
                        <Badge variant="outline" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          {rule.targetAudience.role}
                        </Badge>
                      )}
                      {rule.targetAudience.location && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {rule.targetAudience.location}
                        </Badge>
                      )}
                      {rule.targetAudience.seniority && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {rule.targetAudience.seniority}
                        </Badge>
                      )}
                      {rule.targetAudience.industry && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          {rule.targetAudience.industry}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Personalization Preview */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Personalization Preview</h4>
                    {rule.personalization.subjectLine && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Subject:</span> {rule.personalization.subjectLine}
                        </p>
                        {rule.personalization.senderName && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">From:</span> {rule.personalization.senderName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Campaigns</span>
                      <p className="font-semibold">{rule.usage.campaigns}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recipients</span>
                      <p className="font-semibold">{rule.usage.recipients.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effectiveness</span>
                      <p className={`font-semibold ${getEffectivenessColor(rule.usage.effectiveness)}`}>
                        {rule.usage.effectiveness.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Used</span>
                      <p className="font-semibold">
                        {rule.lastUsed ? new Date(rule.lastUsed).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Other tabs would filter rules accordingly */}
        </Tabs>
      </div>

      {/* Edit Rule Dialog - Similar structure to create dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Personalization Rule</DialogTitle>
            <DialogDescription>
              Update targeting criteria and personalization parameters
            </DialogDescription>
          </DialogHeader>
          {/* Form would be similar to create form but for editing */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedRule(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedRule) {
                  updateRuleMutation.mutate({ 
                    ruleId: selectedRule.id, 
                    data: form.getValues() 
                  });
                }
              }}
              disabled={updateRuleMutation.isPending}
            >
              {updateRuleMutation.isPending ? "Updating..." : "Update Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}