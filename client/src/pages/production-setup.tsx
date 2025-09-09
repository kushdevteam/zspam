import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Server,
  Shield,
  Database,
  Globe,
  Zap,
  Clock,
  Settings,
  Lock,
  Monitor,
  FileText,
  Download
} from "lucide-react";

interface SystemCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  category: 'security' | 'performance' | 'database' | 'infrastructure';
  message: string;
  recommendation?: string;
  critical: boolean;
}

interface DeploymentConfig {
  environment: 'staging' | 'production';
  domain: string;
  ssl: boolean;
  cdn: boolean;
  monitoring: boolean;
  backups: boolean;
  scaling: 'manual' | 'auto';
  region: string;
}

const mockSystemChecks: SystemCheck[] = [
  {
    id: "1",
    name: "SSL Certificate",
    description: "HTTPS encryption and valid SSL certificate",
    status: "pass",
    category: "security",
    message: "Valid SSL certificate installed and configured",
    critical: true
  },
  {
    id: "2",
    name: "Database Security",
    description: "Database connections, encryption, and access controls",
    status: "pass",
    category: "security", 
    message: "Database encrypted with proper access controls",
    critical: true
  },
  {
    id: "3",
    name: "Environment Variables",
    description: "Secure handling of sensitive configuration",
    status: "warning",
    category: "security",
    message: "Some secrets detected in environment files",
    recommendation: "Move all sensitive data to secure secret management",
    critical: true
  },
  {
    id: "4",
    name: "API Rate Limiting",
    description: "Protection against API abuse and DDoS",
    status: "pass",
    category: "security",
    message: "Rate limiting configured with 1000 req/min per IP",
    critical: false
  },
  {
    id: "5",
    name: "Input Validation",
    description: "SQL injection and XSS protection",
    status: "pass",
    category: "security",
    message: "All inputs validated with Zod schemas",
    critical: true
  },
  {
    id: "6",
    name: "Database Performance",
    description: "Query optimization and connection pooling",
    status: "pass",
    category: "performance",
    message: "Connection pooling active, queries optimized",
    critical: false
  },
  {
    id: "7",
    name: "Memory Usage",
    description: "Application memory consumption and limits",
    status: "warning",
    category: "performance",
    message: "Memory usage at 78% - consider scaling",
    recommendation: "Increase memory allocation or optimize large operations",
    critical: false
  },
  {
    id: "8",
    name: "Response Times",
    description: "API endpoint performance and latency",
    status: "pass",
    category: "performance",
    message: "Average response time: 245ms",
    critical: false
  },
  {
    id: "9",
    name: "Database Backups",
    description: "Automated backup system and recovery testing",
    status: "fail",
    category: "infrastructure",
    message: "No automated backup system configured",
    recommendation: "Set up daily encrypted backups with point-in-time recovery",
    critical: true
  },
  {
    id: "10",
    name: "Monitoring & Alerts",
    description: "System monitoring and alerting configuration",
    status: "warning",
    category: "infrastructure",
    message: "Basic monitoring active, no alerting configured",
    recommendation: "Configure alerts for critical system metrics",
    critical: false
  },
  {
    id: "11",
    name: "Log Management",
    description: "Centralized logging and log retention",
    status: "pass",
    category: "infrastructure",
    message: "Logs centralized with 90-day retention",
    critical: false
  },
  {
    id: "12",
    name: "Scaling Configuration",
    description: "Auto-scaling and load balancing setup",
    status: "pending",
    category: "infrastructure",
    message: "Auto-scaling not configured",
    recommendation: "Configure horizontal scaling based on CPU/memory usage",
    critical: false
  }
];

const mockDeploymentConfig: DeploymentConfig = {
  environment: 'staging',
  domain: 'phishing-sim-staging.company.com',
  ssl: true,
  cdn: true,
  monitoring: true,
  backups: false,
  scaling: 'manual',
  region: 'us-east-1'
};

export default function ProductionSetup() {
  const [selectedConfig, setSelectedConfig] = useState<DeploymentConfig>(mockDeploymentConfig);
  const [runningCheck, setRunningCheck] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: systemChecks = mockSystemChecks } = useQuery<SystemCheck[]>({
    queryKey: ["/api/production/system-checks"],
    queryFn: () => Promise.resolve(mockSystemChecks),
  });

  const runSystemCheckMutation = useMutation({
    mutationFn: async (checkId: string) => {
      setRunningCheck(checkId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRunningCheck(null);
      return { checkId, status: 'pass' };
    },
    onSuccess: () => {
      toast({
        title: "Check Complete",
        description: "System check completed successfully",
      });
    },
  });

  const deployToProductionMutation = useMutation({
    mutationFn: async (config: DeploymentConfig) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, deploymentId: Date.now().toString() };
    },
    onSuccess: (data) => {
      toast({
        title: "Deployment Initiated",
        description: `Production deployment started. ID: ${data.deploymentId}`,
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      pass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
      fail: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      pending: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'infrastructure': return <Server className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const calculateReadiness = () => {
    const total = systemChecks.length;
    const passed = systemChecks.filter(c => c.status === 'pass').length;
    const failed = systemChecks.filter(c => c.status === 'fail').length;
    const criticalFailed = systemChecks.filter(c => c.status === 'fail' && c.critical).length;
    
    return {
      total,
      passed,
      failed,
      criticalFailed,
      readinessScore: Math.round((passed / total) * 100),
      productionReady: criticalFailed === 0 && passed >= total * 0.8
    };
  };

  const readiness = calculateReadiness();

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Production Readiness & Deployment</h1>
            <p className="text-muted-foreground">System validation and production deployment configuration</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => console.log("Exporting configuration")}>
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </Button>
            <Button 
              onClick={() => deployToProductionMutation.mutate(selectedConfig)}
              disabled={!readiness.productionReady || deployToProductionMutation.isPending}
              className={readiness.productionReady ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {deployToProductionMutation.isPending ? "Deploying..." : "Deploy to Production"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Readiness Overview */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Production Readiness Score</h2>
                <p className="text-muted-foreground">Overall system health and deployment readiness</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{readiness.readinessScore}%</div>
                <Badge className={readiness.productionReady ? 
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }>
                  {readiness.productionReady ? "Production Ready" : "Issues Found"}
                </Badge>
              </div>
            </div>
            
            <Progress value={readiness.readinessScore} className="h-3 mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Checks</span>
                <p className="font-semibold text-lg">{readiness.total}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Passed</span>
                <p className="font-semibold text-lg text-green-600">{readiness.passed}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Failed</span>
                <p className="font-semibold text-lg text-red-600">{readiness.failed}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Critical Issues</span>
                <p className="font-semibold text-lg text-red-600">{readiness.criticalFailed}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* System Health Alerts */}
        {readiness.criticalFailed > 0 && (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Critical Issues Found:</strong> {readiness.criticalFailed} critical security or infrastructure issues must be resolved before production deployment.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="checks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checks">System Checks</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          {/* System Checks Tab */}
          <TabsContent value="checks" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {systemChecks.map((check) => (
                <Card key={check.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getCategoryIcon(check.category)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{check.name}</h3>
                            <Badge className={getStatusBadgeColor(check.status)}>
                              {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                            </Badge>
                            {check.critical && (
                              <Badge variant="destructive" className="text-xs">
                                Critical
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{check.description}</p>
                          <p className="text-sm">{check.message}</p>
                          {check.recommendation && (
                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Recommendation:</strong> {check.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(check.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runSystemCheckMutation.mutate(check.id)}
                          disabled={runningCheck === check.id}
                        >
                          {runningCheck === check.id ? (
                            <>
                              <Clock className="w-3 h-3 mr-1 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            "Re-check"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Security Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security Checklist</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { item: "HTTPS/SSL Certificate", status: true },
                    { item: "Database Encryption", status: true },
                    { item: "API Authentication", status: true },
                    { item: "Input Validation", status: true },
                    { item: "Rate Limiting", status: true },
                    { item: "Secret Management", status: false },
                    { item: "Security Headers", status: true },
                    { item: "CORS Configuration", status: true }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.item}</span>
                      {item.status ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Security Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Security Hardening</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High Priority:</strong> Implement proper secret management using environment variables or a secure vault system.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Recommended Actions:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Enable WAF (Web Application Firewall)</li>
                      <li>Set up intrusion detection system</li>
                      <li>Configure automated security scanning</li>
                      <li>Implement audit logging</li>
                      <li>Regular security penetration testing</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Response Time</span>
                        <span className="font-medium">245ms</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Performance</span>
                        <span className="font-medium">Good</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        Memory usage is approaching limits. Consider scaling.
                      </AlertDescription>
                    </Alert>
                    
                    <div>
                      <p><strong>Recommendations:</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Enable response compression</li>
                        <li>Implement Redis caching</li>
                        <li>Optimize database queries</li>
                        <li>Set up CDN for static assets</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scaling Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Scaling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Instances</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Auto Scaling</span>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Max Instances</span>
                      <span className="font-medium">5</span>
                    </div>
                    
                    <Separator />
                    
                    <Button variant="outline" size="sm" className="w-full">
                      Configure Auto Scaling
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Monitoring & Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>Monitoring & Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { service: "Application Monitoring", status: "active", health: "healthy" },
                      { service: "Database Monitoring", status: "active", health: "healthy" },
                      { service: "Server Monitoring", status: "active", health: "healthy" },
                      { service: "Error Tracking", status: "active", health: "healthy" },
                      { service: "Alert Notifications", status: "inactive", health: "warning" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.service}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.status === 'active' ? 'default' : 'outline'}>
                            {item.status}
                          </Badge>
                          {item.health === 'healthy' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Backup & Recovery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Backup & Recovery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      <strong>Critical:</strong> No automated backup system configured.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Backup Requirements:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Daily automated database backups</li>
                      <li>Point-in-time recovery capability</li>
                      <li>Cross-region backup replication</li>
                      <li>Backup testing and verification</li>
                      <li>Application configuration backups</li>
                    </ul>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    Configure Backup System
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Deployment Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Deployment Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Environment</span>
                      <Badge>{selectedConfig.environment}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Domain</span>
                      <span className="text-sm font-mono">{selectedConfig.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SSL/HTTPS</span>
                      {selectedConfig.ssl ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CDN</span>
                      {selectedConfig.cdn ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Region</span>
                      <span className="text-sm">{selectedConfig.region}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pre-deployment Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Pre-deployment Checklist</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { task: "Run all system checks", completed: true },
                    { task: "Verify SSL certificate", completed: true },
                    { task: "Configure monitoring", completed: true },
                    { task: "Set up backup system", completed: false },
                    { task: "Configure auto-scaling", completed: false },
                    { task: "Security audit complete", completed: true },
                    { task: "Performance testing", completed: true },
                    { task: "Database migration ready", completed: true }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${item.completed ? '' : 'text-muted-foreground'}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Deployment Action */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Ready for Production Deployment</h3>
                    <p className="text-muted-foreground">
                      {readiness.productionReady ? 
                        "All critical checks passed. System is ready for production deployment." :
                        `${readiness.criticalFailed} critical issues must be resolved before deployment.`
                      }
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline">
                      Run Final Checks
                    </Button>
                    <Button 
                      onClick={() => deployToProductionMutation.mutate(selectedConfig)}
                      disabled={!readiness.productionReady || deployToProductionMutation.isPending}
                      className={readiness.productionReady ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {deployToProductionMutation.isPending ? "Deploying..." : "Deploy to Production"}
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