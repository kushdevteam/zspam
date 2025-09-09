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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Battery,
  Signal,
  MapPin,
  Camera,
  Mic,
  Lock,
  Fingerprint,
  Eye,
  Play,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  Target
} from "lucide-react";

interface MobileSimulation {
  id: string;
  name: string;
  type: 'app_clone' | 'fake_wifi' | 'qr_code' | 'bluetooth' | 'nfc' | 'push_notification';
  platform: 'android' | 'ios' | 'both';
  status: 'draft' | 'active' | 'completed' | 'paused';
  targetDevices: number;
  interactionCount: number;
  successCount: number;
  createdAt: string;
  description: string;
  effectiveness: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface MobileVector {
  id: string;
  name: string;
  type: string;
  description: string;
  platforms: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  effectiveness: number;
  detectionRate: number;
  requirements: string[];
}

interface DeviceProfile {
  id: string;
  deviceName: string;
  os: string;
  version: string;
  brand: string;
  model: string;
  vulnerabilities: string[];
  securityFeatures: string[];
  lastSeen: string;
  riskScore: number;
}

const mockMobileSimulations: MobileSimulation[] = [
  {
    id: "1",
    name: "Fake Banking App Clone",
    type: "app_clone",
    platform: "android",
    status: "completed",
    targetDevices: 150,
    interactionCount: 89,
    successCount: 67,
    createdAt: "2024-01-15T10:30:00Z",
    description: "Cloned Barclays mobile banking app with credential harvesting",
    effectiveness: 0.75,
    riskLevel: "high"
  },
  {
    id: "2",
    name: "Evil Twin WiFi Hotspot",
    type: "fake_wifi",
    platform: "both",
    status: "active",
    targetDevices: 300,
    interactionCount: 156,
    successCount: 78,
    createdAt: "2024-01-14T09:15:00Z",
    description: "Fake 'Free-WiFi' hotspot capturing login credentials",
    effectiveness: 0.50,
    riskLevel: "medium"
  },
  {
    id: "3",
    name: "Malicious QR Code Campaign",
    type: "qr_code",
    platform: "both",
    status: "draft",
    targetDevices: 200,
    interactionCount: 0,
    successCount: 0,
    createdAt: "2024-01-13T16:45:00Z",
    description: "QR codes linking to malicious mobile websites",
    effectiveness: 0.0,
    riskLevel: "medium"
  },
  {
    id: "4",
    name: "Bluetooth Pairing Attack",
    type: "bluetooth",
    platform: "android",
    status: "paused",
    targetDevices: 75,
    interactionCount: 23,
    successCount: 8,
    createdAt: "2024-01-12T11:20:00Z",
    description: "Unauthorized Bluetooth pairing and data extraction",
    effectiveness: 0.35,
    riskLevel: "critical"
  },
  {
    id: "5",
    name: "Fake Security Update Push",
    type: "push_notification",
    platform: "ios",
    status: "completed",
    targetDevices: 450,
    interactionCount: 267,
    successCount: 134,
    createdAt: "2024-01-11T14:30:00Z",
    description: "Push notifications prompting fake iOS security updates",
    effectiveness: 0.50,
    riskLevel: "high"
  }
];

const mockMobileVectors: MobileVector[] = [
  {
    id: "1",
    name: "App Store Phishing",
    type: "app_clone",
    description: "Create fake versions of popular apps to harvest credentials",
    platforms: ["Android", "iOS"],
    difficulty: "medium",
    effectiveness: 0.82,
    detectionRate: 0.23,
    requirements: ["App development skills", "Domain registration", "Apple/Google certificates"]
  },
  {
    id: "2",
    name: "Rogue WiFi Access Point",
    type: "network_attack",
    description: "Set up fake WiFi hotspots to intercept mobile traffic",
    platforms: ["Android", "iOS", "All devices"],
    difficulty: "easy",
    effectiveness: 0.67,
    detectionRate: 0.15,
    requirements: ["WiFi adapter", "Captive portal setup", "SSL certificates"]
  },
  {
    id: "3",
    name: "SMS Hijacking",
    type: "sms_attack",
    description: "Intercept SMS messages including 2FA codes",
    platforms: ["Android", "iOS"],
    difficulty: "hard",
    effectiveness: 0.91,
    detectionRate: 0.08,
    requirements: ["SIM swapping", "Social engineering", "Carrier access"]
  },
  {
    id: "4",
    name: "QR Code Poisoning",
    type: "visual_attack",
    description: "Replace legitimate QR codes with malicious ones",
    platforms: ["Android", "iOS", "All devices"],
    difficulty: "easy",
    effectiveness: 0.58,
    detectionRate: 0.31,
    requirements: ["Physical access", "QR code generator", "Malicious landing page"]
  },
  {
    id: "5",
    name: "Push Notification Spoofing",
    type: "notification_attack",
    description: "Send fake push notifications to trigger user actions",
    platforms: ["Android", "iOS"],
    difficulty: "medium",
    effectiveness: 0.74,
    detectionRate: 0.19,
    requirements: ["FCM/APNS access", "App registration", "Message crafting"]
  }
];

const mockDeviceProfiles: DeviceProfile[] = [
  {
    id: "1",
    deviceName: "John's iPhone",
    os: "iOS",
    version: "17.2.1",
    brand: "Apple",
    model: "iPhone 15 Pro",
    vulnerabilities: ["Outdated apps", "Jailbroken device"],
    securityFeatures: ["Face ID", "App Store verification", "Automatic updates"],
    lastSeen: "2024-01-16T14:30:00Z",
    riskScore: 35
  },
  {
    id: "2",
    deviceName: "Sarah's Galaxy",
    os: "Android",
    version: "14",
    brand: "Samsung",
    model: "Galaxy S24",
    vulnerabilities: ["Sideloaded apps", "Developer options enabled"],
    securityFeatures: ["Knox security", "Biometric unlock", "Play Protect"],
    lastSeen: "2024-01-16T11:15:00Z",
    riskScore: 67
  },
  {
    id: "3",
    deviceName: "Mike's Pixel",
    os: "Android",
    version: "14",
    brand: "Google",
    model: "Pixel 8",
    vulnerabilities: ["Root access", "Unknown sources enabled"],
    securityFeatures: ["Titan M chip", "Stock Android", "Monthly security patches"],
    lastSeen: "2024-01-16T16:45:00Z",
    riskScore: 89
  }
];

export default function MobileSimulations() {
  const [newSimulation, setNewSimulation] = useState({
    name: "",
    type: "app_clone",
    platform: "both",
    targetDevices: 100,
    description: ""
  });
  const { toast } = useToast();

  const { data: mobileSimulations = mockMobileSimulations } = useQuery<MobileSimulation[]>({
    queryKey: ["/api/mobile-simulations"],
    queryFn: () => Promise.resolve(mockMobileSimulations),
  });

  const { data: mobileVectors = mockMobileVectors } = useQuery<MobileVector[]>({
    queryKey: ["/api/mobile-vectors"],
    queryFn: () => Promise.resolve(mockMobileVectors),
  });

  const { data: deviceProfiles = mockDeviceProfiles } = useQuery<DeviceProfile[]>({
    queryKey: ["/api/device-profiles"],
    queryFn: () => Promise.resolve(mockDeviceProfiles),
  });

  const createSimulationMutation = useMutation({
    mutationFn: async (simulationData: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, simulationId: Date.now().toString() };
    },
    onSuccess: (data) => {
      toast({
        title: "Mobile Simulation Created",
        description: `Simulation created successfully with ID: ${data.simulationId}`,
      });
      setNewSimulation({ 
        name: "", 
        type: "app_clone", 
        platform: "both", 
        targetDevices: 100, 
        description: "" 
      });
    },
  });

  const launchSimulationMutation = useMutation({
    mutationFn: async (simulationId: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, devicesTargeted: Math.floor(Math.random() * 200) + 50 };
    },
    onSuccess: (data) => {
      toast({
        title: "Simulation Launched",
        description: `Mobile simulation launched targeting ${data.devicesTargeted} devices`,
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

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'app_clone': return <Smartphone className="w-4 h-4" />;
      case 'fake_wifi': return <Wifi className="w-4 h-4" />;
      case 'qr_code': return <Camera className="w-4 h-4" />;
      case 'bluetooth': return <Signal className="w-4 h-4" />;
      case 'nfc': return <Target className="w-4 h-4" />;
      case 'push_notification': return <AlertTriangle className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'android': return '🤖';
      case 'ios': return '🍎';
      case 'both': return '📱';
      default: return '📱';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mobile App Phishing Simulations</h1>
            <p className="text-muted-foreground">Advanced mobile-specific phishing attacks and device exploitation simulations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Device Scanner
            </Button>
            <Button>
              <Smartphone className="w-4 h-4 mr-2" />
              New Simulation
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Mobile Simulation Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Simulations</p>
                  <p className="text-2xl font-bold">{mobileSimulations.filter(s => s.status === 'active').length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Devices Targeted</p>
                  <p className="text-2xl font-bold">
                    {mobileSimulations.reduce((acc, s) => acc + s.targetDevices, 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (mobileSimulations.reduce((acc, s) => acc + s.successCount, 0) / 
                       mobileSimulations.reduce((acc, s) => acc + s.interactionCount, 0)) * 100
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
                    {Math.round(mobileSimulations.reduce((acc, s) => acc + s.effectiveness, 0) / mobileSimulations.length * 100)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="simulations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="simulations">Simulations</TabsTrigger>
            <TabsTrigger value="create">Create Simulation</TabsTrigger>
            <TabsTrigger value="vectors">Attack Vectors</TabsTrigger>
            <TabsTrigger value="devices">Device Profiles</TabsTrigger>
            <TabsTrigger value="analytics">Mobile Analytics</TabsTrigger>
          </TabsList>

          {/* Simulations Tab */}
          <TabsContent value="simulations" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {mobileSimulations.map((simulation) => (
                <Card key={simulation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(simulation.type)}
                        <div>
                          <CardTitle>{simulation.name}</CardTitle>
                          <CardDescription>{simulation.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getPlatformIcon(simulation.platform)}</span>
                        <Badge className={getStatusColor(simulation.status)}>
                          {simulation.status.toUpperCase()}
                        </Badge>
                        <Badge className={getRiskColor(simulation.riskLevel)}>
                          {simulation.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Target Progress</p>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(simulation.interactionCount / simulation.targetDevices) * 100} 
                              className="h-2 flex-1" 
                            />
                            <span className="text-sm font-medium">
                              {simulation.interactionCount}/{simulation.targetDevices}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={simulation.interactionCount > 0 ? (simulation.successCount / simulation.interactionCount) * 100 : 0} 
                              className="h-2 flex-1" 
                            />
                            <span className="text-sm font-medium">
                              {simulation.interactionCount > 0 ? 
                                Math.round((simulation.successCount / simulation.interactionCount) * 100) : 0}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Effectiveness</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={simulation.effectiveness * 100} className="h-2 flex-1" />
                            <span className="text-sm font-medium">
                              {Math.round(simulation.effectiveness * 100)}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Created</p>
                          <p className="text-sm font-medium">
                            {new Date(simulation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {simulation.status === 'draft' && (
                          <Button 
                            size="sm"
                            onClick={() => launchSimulationMutation.mutate(simulation.id)}
                            disabled={launchSimulationMutation.isPending}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Launch Simulation
                          </Button>
                        )}
                        {simulation.status === 'active' && (
                          <Button size="sm" variant="outline">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pause Simulation
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="w-3 h-3 mr-1" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Simulation Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Simulation Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Simulation Configuration</span>
                  </CardTitle>
                  <CardDescription>Create a new mobile phishing simulation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Simulation Name</Label>
                    <Input 
                      value={newSimulation.name}
                      onChange={(e) => setNewSimulation(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Fake Banking App Attack"
                    />
                  </div>

                  <div>
                    <Label>Attack Vector</Label>
                    <Select 
                      value={newSimulation.type}
                      onValueChange={(value) => setNewSimulation(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app_clone">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-4 h-4" />
                            <span>Malicious App Clone</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fake_wifi">
                          <div className="flex items-center space-x-2">
                            <Wifi className="w-4 h-4" />
                            <span>Fake WiFi Hotspot</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="qr_code">
                          <div className="flex items-center space-x-2">
                            <Camera className="w-4 h-4" />
                            <span>Malicious QR Code</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bluetooth">
                          <div className="flex items-center space-x-2">
                            <Signal className="w-4 h-4" />
                            <span>Bluetooth Attack</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="nfc">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>NFC Exploitation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="push_notification">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Push Notification Spoofing</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Platform</Label>
                    <Select 
                      value={newSimulation.platform}
                      onValueChange={(value) => setNewSimulation(prev => ({ ...prev, platform: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="android">🤖 Android Only</SelectItem>
                        <SelectItem value="ios">🍎 iOS Only</SelectItem>
                        <SelectItem value="both">📱 Both Platforms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Device Count</Label>
                    <Input 
                      type="number"
                      value={newSimulation.targetDevices}
                      onChange={(e) => setNewSimulation(prev => ({ ...prev, targetDevices: parseInt(e.target.value) }))}
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input 
                      value={newSimulation.description}
                      onChange={(e) => setNewSimulation(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the simulation"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Simulation Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Simulation Preview</span>
                  </CardTitle>
                  <CardDescription>Preview how the simulation will appear to targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg">
                      <div className="flex items-center justify-center h-40 bg-muted rounded">
                        <div className="text-center">
                          {getTypeIcon(newSimulation.type)}
                          <p className="text-sm text-muted-foreground mt-2">
                            Simulation preview will appear here
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Attack Vector:</span>
                        <span className="font-medium capitalize">{newSimulation.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Platform:</span>
                        <span className="font-medium">{getPlatformIcon(newSimulation.platform)} {newSimulation.platform}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target Devices:</span>
                        <span className="font-medium">{newSimulation.targetDevices}</span>
                      </div>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This simulation will test mobile-specific security awareness and device security configurations.
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-2">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Mobile View
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Test Configuration
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Ready to Create Simulation</h3>
                    <p className="text-muted-foreground">
                      Configure your mobile phishing simulation parameters and launch when ready
                    </p>
                  </div>
                  
                  <Button 
                    size="lg"
                    onClick={() => createSimulationMutation.mutate(newSimulation)}
                    disabled={createSimulationMutation.isPending || !newSimulation.name}
                  >
                    {createSimulationMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Creating Simulation...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4 mr-2" />
                        Create Mobile Simulation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attack Vectors Tab */}
          <TabsContent value="vectors" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {mobileVectors.map((vector) => (
                <Card key={vector.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div>
                            <h3 className="font-semibold">{vector.name}</h3>
                            <p className="text-sm text-muted-foreground">{vector.type}</p>
                          </div>
                          <Badge variant={
                            vector.difficulty === 'easy' ? 'default' : 
                            vector.difficulty === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {vector.difficulty}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{vector.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Effectiveness</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={vector.effectiveness * 100} className="h-2 flex-1" />
                              <span className="font-bold text-sm">
                                {Math.round(vector.effectiveness * 100)}%
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Detection Rate</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={vector.detectionRate * 100} className="h-2 flex-1" />
                              <span className="font-bold text-sm text-red-600">
                                {Math.round(vector.detectionRate * 100)}%
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Platforms</p>
                            <div className="flex space-x-1">
                              {vector.platforms.map((platform, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Requirements:</p>
                          <div className="grid grid-cols-1 gap-1">
                            {vector.requirements.map((req, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                <span className="text-xs">{req}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            Use Vector
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="w-3 h-3 mr-1" />
                            Get Resources
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Device Profiles Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {deviceProfiles.map((device) => (
                <Card key={device.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {device.os === 'iOS' ? <Smartphone className="w-5 h-5" /> : <Tablet className="w-5 h-5" />}
                          <div>
                            <h3 className="font-semibold">{device.deviceName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {device.brand} {device.model} - {device.os} {device.version}
                            </p>
                          </div>
                          <Badge className={
                            device.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                            device.riskScore >= 50 ? 'bg-orange-100 text-orange-800' :
                            device.riskScore >= 30 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            Risk: {device.riskScore}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Vulnerabilities:</p>
                            <div className="space-y-1">
                              {device.vulnerabilities.map((vuln, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                  <span className="text-xs">{vuln}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Security Features:</p>
                            <div className="space-y-1">
                              {device.securityFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  <span className="text-xs">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Last seen: {new Date(device.lastSeen).toLocaleDateString()}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              Device Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Target className="w-3 h-3 mr-1" />
                              Target Device
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Settings className="w-3 h-3 mr-1" />
                              Security Scan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mobile Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Platform Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Mobile platform targeting effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>🤖 Android Devices</span>
                        <span className="font-bold">67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>🍎 iOS Devices</span>
                        <span className="font-bold">33%</span>
                      </div>
                      <Progress value={33} className="h-2" />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <p className="font-bold text-lg text-green-600">78%</p>
                        <p className="text-muted-foreground">Android Success Rate</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-blue-600">61%</p>
                        <p className="text-muted-foreground">iOS Success Rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attack Vector Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Attack Vector Performance</CardTitle>
                  <CardDescription>Effectiveness by attack type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>App Clone Attacks</span>
                        <span className="font-bold">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Push Notification Spoofing</span>
                        <span className="font-bold">74%</span>
                      </div>
                      <Progress value={74} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fake WiFi Hotspots</span>
                        <span className="font-bold">67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>QR Code Attacks</span>
                        <span className="font-bold">58%</span>
                      </div>
                      <Progress value={58} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bluetooth Attacks</span>
                        <span className="font-bold">35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mobile Security Insights</CardTitle>
                <CardDescription>Key findings from mobile phishing simulations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Device Vulnerabilities</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Outdated OS versions</span>
                        <span className="font-bold text-red-600">34% of devices</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sideloaded apps</span>
                        <span className="font-bold text-orange-600">18% of devices</span>
                      </div>
                      <div className="flex justify-between">
                        <span>No screen lock</span>
                        <span className="font-bold text-yellow-600">12% of devices</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jailbroken/Rooted</span>
                        <span className="font-bold text-red-600">8% of devices</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">User Behavior Patterns</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>67% click suspicious links on mobile</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>45% install apps from unknown sources</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>78% connect to public WiFi</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>23% share personal data via QR codes</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>Focus on app store awareness training</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>Implement mobile device management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>Regular OS update campaigns</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>WiFi security education</span>
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