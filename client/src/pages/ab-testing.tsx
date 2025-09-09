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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  TestTube, 
  Plus, 
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Target,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { apiRequest } from "@/lib/queryClient";

const abTestSchema = z.object({
  name: z.string().min(3, "Test name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  hypothesis: z.string().min(20, "Hypothesis must be at least 20 characters"),
  trafficSplit: z.number().min(10).max(90).default(50),
  duration: z.number().min(1).max(30).default(7),
  variants: z.array(z.object({
    name: z.string(),
    subjectLine: z.string(),
    templateId: z.string(),
    description: z.string()
  })).min(2, "Must have at least 2 variants"),
  targetMetrics: z.array(z.string()).min(1, "Must select at least one metric"),
  isActive: z.boolean().default(false)
});

type ABTestFormData = z.infer<typeof abTestSchema>;

interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number;
  duration: number;
  startedAt?: string;
  endedAt?: string;
  variants: Array<{
    id: string;
    name: string;
    subjectLine: string;
    templateId: string;
    description: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
  }>;
  targetMetrics: string[];
  results?: {
    winner: string;
    confidence: number;
    improvement: number;
    significance: boolean;
  };
}

const mockABTests: ABTest[] = [
  {
    id: "1",
    name: "Barclays Email Subject Line Test",
    description: "Testing different urgency levels in Barclays phishing email subject lines",
    hypothesis: "More urgent subject lines will increase click-through rates by 15%+",
    status: "running",
    trafficSplit: 50,
    duration: 7,
    startedAt: "2024-01-18T09:00:00Z",
    variants: [
      {
        id: "var1",
        name: "Control - Standard Urgency",
        subjectLine: "Important: Verify your Barclays account details",
        templateId: "barclays-standard",
        description: "Standard urgent tone with account verification",
        participants: 247,
        conversions: 52,
        conversionRate: 21.1,
        confidence: 95.2
      },
      {
        id: "var2",
        name: "High Urgency",
        subjectLine: "URGENT: Barclays account suspended - Act now!",
        templateId: "barclays-urgent",
        description: "High urgency with account suspension threat",
        participants: 253,
        conversions: 71,
        conversionRate: 28.1,
        confidence: 97.8
      }
    ],
    targetMetrics: ["click_rate", "submission_rate", "time_to_click"],
    results: {
      winner: "var2",
      confidence: 97.8,
      improvement: 33.2,
      significance: true
    }
  },
  {
    id: "2",
    name: "HSBC Login Page Layout Test",
    description: "Testing different login form layouts for HSBC corporate banking",
    hypothesis: "Simplified single-page login will reduce bounce rates and increase submissions",
    status: "completed",
    trafficSplit: 60,
    duration: 10,
    startedAt: "2024-01-10T09:00:00Z",
    endedAt: "2024-01-20T17:00:00Z",
    variants: [
      {
        id: "var1",
        name: "Multi-step Login (Control)",
        subjectLine: "HSBC Business Banking - Secure Access Required",
        templateId: "hsbc-multistep",
        description: "Traditional multi-step authentication process",
        participants: 189,
        conversions: 34,
        conversionRate: 18.0,
        confidence: 89.5
      },
      {
        id: "var2",
        name: "Single-page Login",
        subjectLine: "HSBC Business Banking - Secure Access Required",
        templateId: "hsbc-singlepage",
        description: "Streamlined single-page login process",
        participants: 311,
        conversions: 78,
        conversionRate: 25.1,
        confidence: 96.7
      }
    ],
    targetMetrics: ["submission_rate", "bounce_rate", "form_completion_time"],
    results: {
      winner: "var2",
      confidence: 96.7,
      improvement: 39.4,
      significance: true
    }
  },
  {
    id: "3",
    name: "Office365 Timing Test",
    description: "Testing optimal sending times for Office365 phishing campaigns",
    hypothesis: "Emails sent on Tuesday mornings will have 20% higher engagement",
    status: "draft",
    trafficSplit: 40,
    duration: 14,
    variants: [
      {
        id: "var1",
        name: "Tuesday 9 AM (Control)",
        subjectLine: "Microsoft 365 - Account Security Alert",
        templateId: "o365-standard",
        description: "Standard Tuesday morning delivery",
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        confidence: 0
      },
      {
        id: "var2",
        name: "Thursday 2 PM",
        subjectLine: "Microsoft 365 - Account Security Alert",
        templateId: "o365-standard",
        description: "Thursday afternoon delivery",
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        confidence: 0
      }
    ],
    targetMetrics: ["open_rate", "click_rate", "response_time"]
  }
];

const conversionData = [
  { day: 1, control: 18, variant: 22 },
  { day: 2, control: 21, variant: 26 },
  { day: 3, control: 19, variant: 28 },
  { day: 4, control: 23, variant: 31 },
  { day: 5, control: 20, variant: 29 },
  { day: 6, control: 22, variant: 30 },
  { day: 7, control: 21, variant: 28 },
];

export default function ABTesting() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ABTestFormData>({
    resolver: zodResolver(abTestSchema),
    defaultValues: {
      name: "",
      description: "",
      hypothesis: "",
      trafficSplit: 50,
      duration: 7,
      variants: [
        { name: "Control", subjectLine: "", templateId: "", description: "" },
        { name: "Variant", subjectLine: "", templateId: "", description: "" }
      ],
      targetMetrics: ["click_rate"],
      isActive: false
    },
  });

  // Fetch A/B tests from API
  const { data: abTests = [], isLoading } = useQuery<ABTest[]>({
    queryKey: ["/api/ab-tests"],
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: ABTestFormData) => {
      return await apiRequest('/api/ab-tests', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "A/B test created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ab-tests"] });
      form.reset();
      setIsCreateDialogOpen(false);
    },
  });

  const startTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      return await apiRequest(`/api/ab-tests/${testId}/status`, 'PATCH', { status: 'running' });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "A/B test started successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ab-tests"] });
    },
  });

  const pauseTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      return await apiRequest(`/api/ab-tests/${testId}/status`, 'PATCH', { status: 'paused' });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "A/B test paused successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ab-tests"] });
    },
  });

  const onSubmit = (data: ABTestFormData) => {
    createTestMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'draft': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      running: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const testStats = {
    total: abTests.length,
    running: abTests.filter(t => t.status === 'running').length,
    completed: abTests.filter(t => t.status === 'completed').length,
    draft: abTests.filter(t => t.status === 'draft').length
  };

  const addVariant = () => {
    const currentVariants = form.getValues("variants");
    form.setValue("variants", [
      ...currentVariants,
      { name: `Variant ${currentVariants.length}`, subjectLine: "", templateId: "", description: "" }
    ]);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">A/B Testing & Optimization</h1>
            <p className="text-muted-foreground">Compare campaign effectiveness and optimize performance</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-ab-test">
                <Plus className="w-4 h-4 mr-2" />
                New A/B Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create A/B Test</DialogTitle>
                <DialogDescription>
                  Set up a new A/B test to compare different campaign variants
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Test Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="e.g., Barclays Subject Line Test"
                        data-testid="input-test-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Describe what you're testing and why"
                        rows={2}
                        data-testid="textarea-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hypothesis">Hypothesis</Label>
                      <Textarea
                        id="hypothesis"
                        {...form.register("hypothesis")}
                        placeholder="I believe that [change] will result in [outcome] because [reason]"
                        rows={2}
                        data-testid="textarea-hypothesis"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trafficSplit">Traffic Split (%)</Label>
                      <Input
                        id="trafficSplit"
                        type="number"
                        min="10"
                        max="90"
                        {...form.register("trafficSplit", { valueAsNumber: true })}
                        data-testid="input-traffic-split"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Percentage of traffic for the variant (rest goes to control)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="30"
                        {...form.register("duration", { valueAsNumber: true })}
                        data-testid="input-duration"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Target Metrics</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['click_rate', 'submission_rate', 'bounce_rate', 'open_rate', 'time_to_click', 'form_completion_time'].map((metric) => (
                      <Label key={metric} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={metric}
                          {...form.register("targetMetrics")}
                          className="rounded"
                        />
                        <span className="text-sm">{metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Variants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Test Variants</h3>
                    <Button type="button" onClick={addVariant} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                  
                  {form.watch("variants").map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Variant {index + 1}: {form.watch(`variants.${index}.name`) || `Variant ${index + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Variant Name</Label>
                            <Input
                              {...form.register(`variants.${index}.name`)}
                              placeholder={index === 0 ? "Control" : `Variant ${index + 1}`}
                            />
                          </div>
                          <div>
                            <Label>Template ID</Label>
                            <Select
                              value={form.watch(`variants.${index}.templateId`)}
                              onValueChange={(value) => form.setValue(`variants.${index}.templateId`, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="barclays-standard">Barclays Standard</SelectItem>
                                <SelectItem value="barclays-urgent">Barclays Urgent</SelectItem>
                                <SelectItem value="hsbc-corporate">HSBC Corporate</SelectItem>
                                <SelectItem value="o365-standard">Office365 Standard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Subject Line</Label>
                          <Input
                            {...form.register(`variants.${index}.subjectLine`)}
                            placeholder="Email subject line for this variant"
                          />
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            {...form.register(`variants.${index}.description`)}
                            placeholder="Describe what's different about this variant"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    disabled={createTestMutation.isPending}
                    data-testid="button-submit-test"
                  >
                    {createTestMutation.isPending ? "Creating..." : "Create A/B Test"}
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
              <TestTube className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-semibold">{testStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-semibold text-green-600">{testStats.running}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold text-blue-600">{testStats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-semibold text-gray-600">{testStats.draft}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* A/B Tests List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="running">Running</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {abTests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(test.status)}
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <Badge className={getStatusBadgeColor(test.status)}>
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">{test.description}</CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Hypothesis:</strong> {test.hypothesis}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {test.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => startTestMutation.mutate(test.id)}
                          disabled={startTestMutation.isPending}
                          data-testid={`button-start-${test.id}`}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {test.status === 'running' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => pauseTestMutation.mutate(test.id)}
                          disabled={pauseTestMutation.isPending}
                          data-testid={`button-pause-${test.id}`}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setSelectedTest(test)}>
                        <BarChart3 className="w-4 h-4 mr-1" />
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Test Configuration Summary */}
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                    <span>Split: {test.trafficSplit}%/{100 - test.trafficSplit}%</span>
                    <span>Duration: {test.duration} days</span>
                    <span>Metrics: {test.targetMetrics.join(', ')}</span>
                    {test.startedAt && (
                      <span>Started: {new Date(test.startedAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Variants Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map((variant, index) => (
                      <div key={variant.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{variant.name}</h4>
                          {test.results?.winner === variant.id && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Winner
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{variant.subjectLine}</p>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Participants</span>
                            <p className="font-semibold">{variant.participants.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conversions</span>
                            <p className="font-semibold">{variant.conversions.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate</span>
                            <p className="font-semibold">{variant.conversionRate.toFixed(1)}%</p>
                          </div>
                        </div>
                        
                        {variant.confidence > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Confidence</span>
                              <span>{variant.confidence.toFixed(1)}%</span>
                            </div>
                            <Progress value={variant.confidence} className="h-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Results Summary for Completed Tests */}
                  {test.results && test.status === 'completed' && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Test Results</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        The winning variant achieved a <strong>{test.results.improvement.toFixed(1)}%</strong> improvement 
                        with <strong>{test.results.confidence.toFixed(1)}%</strong> statistical confidence.
                        {test.results.significance ? " This result is statistically significant." : " This result needs more data for significance."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Other tabs would filter the tests accordingly */}
        </Tabs>

        {/* Detailed Results Modal */}
        {selectedTest && (
          <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedTest.name} - Detailed Results</DialogTitle>
                <DialogDescription>
                  Comprehensive analysis and performance metrics
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conversion Rate Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={conversionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -10 }} />
                          <YAxis label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}%`, '']} />
                          <Line 
                            type="monotone" 
                            dataKey="control" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="Control"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="variant" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            name="Variant"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistical Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Statistical Significance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>P-value:</span>
                          <span className="font-mono">0.023</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence Level:</span>
                          <span>{selectedTest.results?.confidence.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effect Size:</span>
                          <span>{selectedTest.results?.improvement.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Statistical Power:</span>
                          <span>87.4%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Additional Conversions:</span>
                          <span className="font-semibold text-green-600">+47</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Improvement Rate:</span>
                          <span className="font-semibold">33.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projected Monthly Gain:</span>
                          <span className="font-semibold">+156 conversions</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence Interval:</span>
                          <span>18.4% - 48.9%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTest(null)}>
                  Close
                </Button>
                <Button onClick={() => console.log("Implementing winner")}>
                  Implement Winner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}