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
  Brain,
  Target,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Settings,
  Play,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Network
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  type: 'classification' | 'prediction' | 'recommendation';
  accuracy: number;
  status: 'active' | 'training' | 'inactive';
  lastTrained: string;
  dataPoints: number;
}

interface TargetingRule {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  confidence: number;
  effectiveness: number;
  active: boolean;
}

interface CampaignPrediction {
  campaignType: string;
  targetAudience: string;
  predictedSuccessRate: number;
  confidenceLevel: number;
  recommendations: string[];
  riskFactors: string[];
}

const mockAIModels: AIModel[] = [
  {
    id: "1",
    name: "Vulnerability Prediction Model",
    type: "prediction",
    accuracy: 0.89,
    status: "active",
    lastTrained: "2024-01-15T10:00:00Z",
    dataPoints: 15420
  },
  {
    id: "2", 
    name: "Behavioral Classification Model",
    type: "classification",
    accuracy: 0.92,
    status: "active",
    lastTrained: "2024-01-14T14:30:00Z",
    dataPoints: 8930
  },
  {
    id: "3",
    name: "Content Recommendation Engine",
    type: "recommendation",
    accuracy: 0.85,
    status: "training",
    lastTrained: "2024-01-13T09:15:00Z",
    dataPoints: 12500
  },
  {
    id: "4",
    name: "Risk Assessment Model",
    type: "prediction",
    accuracy: 0.94,
    status: "active",
    lastTrained: "2024-01-16T11:45:00Z",
    dataPoints: 18200
  }
];

const mockTargetingRules: TargetingRule[] = [
  {
    id: "1",
    name: "High-Risk Banking Employees",
    description: "Target employees in banking sector with access to financial systems",
    conditions: ["department:finance", "access_level:high", "previous_fails:>2"],
    confidence: 0.87,
    effectiveness: 0.73,
    active: true
  },
  {
    id: "2",
    name: "New Employee Vulnerability",
    description: "Target employees hired within last 90 days",
    conditions: ["hire_date:<90days", "training_completion:false"],
    confidence: 0.92,
    effectiveness: 0.68,
    active: true
  },
  {
    id: "3",
    name: "Executive Spear Phishing",
    description: "High-value targets in leadership positions",
    conditions: ["role:executive", "public_profile:true", "social_media:active"],
    confidence: 0.79,
    effectiveness: 0.81,
    active: true
  },
  {
    id: "4",
    name: "IT Department Targeting",
    description: "Technical staff with system administration privileges",
    conditions: ["department:it", "privileges:admin", "security_training:<6months"],
    confidence: 0.84,
    effectiveness: 0.69,
    active: false
  }
];

const mockCampaignPrediction: CampaignPrediction = {
  campaignType: "Office 365 Login",
  targetAudience: "Finance Department",
  predictedSuccessRate: 0.67,
  confidenceLevel: 0.89,
  recommendations: [
    "Deploy during high email activity periods (Tuesday-Thursday, 10AM-2PM)",
    "Use personalized sender names from recent company communications",
    "Include urgency elements related to compliance deadlines",
    "Target users who haven't completed recent security training"
  ],
  riskFactors: [
    "Recent security awareness training may reduce effectiveness",
    "Finance team has shown higher baseline security awareness", 
    "IT department has implemented additional email filtering"
  ]
};

export default function AITargeting() {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [trainingData, setTrainingData] = useState({
    includeHistorical: true,
    includeBehavioral: true,
    includeExternal: false,
    dataRange: "6months"
  });
  const { toast } = useToast();

  const { data: aiModels = mockAIModels } = useQuery<AIModel[]>({
    queryKey: ["/api/ai/models"],
    queryFn: () => Promise.resolve(mockAIModels),
  });

  const { data: targetingRules = mockTargetingRules } = useQuery<TargetingRule[]>({
    queryKey: ["/api/ai/targeting-rules"],
    queryFn: () => Promise.resolve(mockTargetingRules),
  });

  const { data: campaignPrediction = mockCampaignPrediction } = useQuery<CampaignPrediction>({
    queryKey: ["/api/ai/campaign-prediction"],
    queryFn: () => Promise.resolve(mockCampaignPrediction),
  });

  const trainModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, modelId };
    },
    onSuccess: () => {
      toast({
        title: "Training Started",
        description: "AI model training has been initiated successfully",
      });
    },
  });

  const optimizeCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
        optimizedTargets: 347,
        expectedIncrease: 23,
        confidence: 0.91
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Optimized",
        description: `AI optimized targeting for ${data.optimizedTargets} recipients with ${data.expectedIncrease}% expected improvement`,
      });
    },
  });

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'training': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      case 'classification': return <Users className="w-4 h-4" />;
      case 'recommendation': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI-Powered Campaign Targeting</h1>
            <p className="text-muted-foreground">Machine learning models for intelligent campaign optimization and targeting</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Model Settings
            </Button>
            <Button onClick={() => optimizeCampaignMutation.mutate({})}>
              <Zap className="w-4 h-4 mr-2" />
              Optimize Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* AI Performance Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Models</p>
                  <p className="text-2xl font-bold">{aiModels.filter(m => m.status === 'active').length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold">
                    {Math.round(aiModels.reduce((acc, m) => acc + m.accuracy, 0) / aiModels.length * 100)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Targeting Rules</p>
                  <p className="text-2xl font-bold">{targetingRules.filter(r => r.active).length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-2xl font-bold">
                    {Math.round(aiModels.reduce((acc, m) => acc + m.dataPoints, 0) / 1000)}K
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="targeting">Smart Targeting</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="training">Model Training</TabsTrigger>
            <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
          </TabsList>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiModels.map((model) => (
                <Card key={model.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedModel(model)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getModelIcon(model.type)}
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                      </div>
                      <Badge className={getModelStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {model.type.charAt(0).toUpperCase() + model.type.slice(1)} model
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accuracy</span>
                          <span className="font-medium">{Math.round(model.accuracy * 100)}%</span>
                        </div>
                        <Progress value={model.accuracy * 100} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Data Points</p>
                          <p className="font-medium">{model.dataPoints.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Trained</p>
                          <p className="font-medium">
                            {new Date(model.lastTrained).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            trainModelMutation.mutate(model.id);
                          }}
                          disabled={trainModelMutation.isPending}
                        >
                          {trainModelMutation.isPending ? "Training..." : "Retrain"}
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Smart Targeting Tab */}
          <TabsContent value="targeting" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {targetingRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>{rule.name}</span>
                        </CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={rule.active} />
                        <Badge variant={rule.active ? "default" : "outline"}>
                          {rule.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Confidence Score</span>
                            <span className="font-medium">{Math.round(rule.confidence * 100)}%</span>
                          </div>
                          <Progress value={rule.confidence * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Effectiveness</span>
                            <span className="font-medium">{Math.round(rule.effectiveness * 100)}%</span>
                          </div>
                          <Progress value={rule.effectiveness * 100} className="h-2" />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Targeting Conditions:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.conditions.map((condition, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          Edit Rule
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="w-3 h-3 mr-1" />
                          Test Rule
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Campaign Success Prediction</span>
                </CardTitle>
                <CardDescription>AI-powered campaign effectiveness forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Campaign Type</Label>
                        <p className="text-lg">{campaignPrediction.campaignType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Target Audience</Label>
                        <p className="text-lg">{campaignPrediction.targetAudience}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Predicted Success Rate</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={campaignPrediction.predictedSuccessRate * 100} className="h-3 flex-1" />
                          <span className="font-bold text-lg">
                            {Math.round(campaignPrediction.predictedSuccessRate * 100)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Confidence Level</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={campaignPrediction.confidenceLevel * 100} className="h-3 flex-1" />
                          <span className="font-bold text-lg">
                            {Math.round(campaignPrediction.confidenceLevel * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>AI Recommendations</span>
                      </h4>
                      <ul className="space-y-2">
                        {campaignPrediction.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span>Risk Factors</span>
                      </h4>
                      <ul className="space-y-2">
                        {campaignPrediction.riskFactors.map((risk, index) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button>
                      Apply Recommendations
                    </Button>
                    <Button variant="outline">
                      Generate New Prediction
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5" />
                    <span>Training Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={trainingData.includeHistorical}
                        onCheckedChange={(checked) => 
                          setTrainingData(prev => ({ ...prev, includeHistorical: checked }))
                        }
                      />
                      <Label>Include Historical Campaign Data</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={trainingData.includeBehavioral}
                        onCheckedChange={(checked) => 
                          setTrainingData(prev => ({ ...prev, includeBehavioral: checked }))
                        }
                      />
                      <Label>Include Behavioral Analytics</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={trainingData.includeExternal}
                        onCheckedChange={(checked) => 
                          setTrainingData(prev => ({ ...prev, includeExternal: checked }))
                        }
                      />
                      <Label>Include External Threat Intelligence</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Training Data Range</Label>
                    <Select 
                      value={trainingData.dataRange}
                      onValueChange={(value) => 
                        setTrainingData(prev => ({ ...prev, dataRange: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">Last 3 months</SelectItem>
                        <SelectItem value="6months">Last 6 months</SelectItem>
                        <SelectItem value="1year">Last 1 year</SelectItem>
                        <SelectItem value="all">All available data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">
                    <Cpu className="w-4 h-4 mr-2" />
                    Start Training Session
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Network className="w-5 h-5" />
                    <span>Training Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {aiModels.map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium text-sm">{model.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {model.status === 'training' ? (
                            <Clock className="w-4 h-4 animate-spin text-blue-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          <Badge className={getModelStatusColor(model.status)}>
                            {model.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiModels.map((model) => (
                      <div key={model.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{model.name}</span>
                          <span className="font-medium">{Math.round(model.accuracy * 100)}%</span>
                        </div>
                        <Progress value={model.accuracy * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Impact Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Campaign Success Improvement</span>
                      <span className="font-bold text-green-600">+34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Targeting Accuracy</span>
                      <span className="font-bold text-blue-600">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">False Positive Reduction</span>
                      <span className="font-bold text-purple-600">-67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time to Insights</span>
                      <span className="font-bold text-orange-600">-78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations Impact</CardTitle>
                <CardDescription>How AI suggestions have improved campaign performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-green-600">156</p>
                    <p className="text-sm text-muted-foreground">Campaigns Optimized</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-blue-600">89%</p>
                    <p className="text-sm text-muted-foreground">Avg Accuracy Improvement</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-purple-600">23min</p>
                    <p className="text-sm text-muted-foreground">Avg Time Saved</p>
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