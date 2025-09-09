import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Globe, 
  Clock,
  Monitor,
  Smartphone,
  MapPin,
  Calendar
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EnhancedStatisticsPage() {
  const { data: overviewStats } = useQuery({
    queryKey: ["/api/statistics/overview"],
  });

  const { data: campaignStats } = useQuery({
    queryKey: ["/api/statistics/campaigns"],
  });

  const { data: sessionStats } = useQuery({
    queryKey: ["/api/statistics/sessions"],
  });

  // Mock enhanced data for demonstration
  const mockCampaignPerformance = [
    { name: 'Coinbase', sent: 150, clicked: 45, submitted: 12, rate: 30.0 },
    { name: 'Barclays', sent: 200, clicked: 78, submitted: 23, rate: 39.0 },
    { name: 'HSBC', sent: 180, clicked: 52, submitted: 15, rate: 28.9 },
    { name: 'Lloyds', sent: 160, clicked: 64, submitted: 19, rate: 40.0 },
    { name: 'NatWest', sent: 140, clicked: 41, submitted: 11, rate: 29.3 },
  ];

  const mockTimelineData = [
    { time: '09:00', clicks: 12, submissions: 3 },
    { time: '10:00', clicks: 24, submissions: 8 },
    { time: '11:00', clicks: 35, submissions: 12 },
    { time: '12:00', clicks: 28, submissions: 9 },
    { time: '13:00', clicks: 15, submissions: 4 },
    { time: '14:00', clicks: 31, submissions: 11 },
    { time: '15:00', clicks: 42, submissions: 15 },
    { time: '16:00', clicks: 38, submissions: 13 },
  ];

  const mockDeviceData = [
    { name: 'Desktop', value: 62, count: 186 },
    { name: 'Mobile', value: 28, count: 84 },
    { name: 'Tablet', value: 10, count: 30 },
  ];

  const mockLocationData = [
    { country: 'United Kingdom', clicks: 245, percentage: 81.7 },
    { country: 'United States', clicks: 32, percentage: 10.7 },
    { country: 'Canada', clicks: 15, percentage: 5.0 },
    { country: 'Australia', clicks: 8, percentage: 2.7 },
  ];

  const totalSent = mockCampaignPerformance.reduce((sum, item) => sum + item.sent, 0);
  const totalClicked = mockCampaignPerformance.reduce((sum, item) => sum + item.clicked, 0);
  const totalSubmitted = mockCampaignPerformance.reduce((sum, item) => sum + item.submitted, 0);

  return (
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enhanced Analytics</h1>
            <p className="text-muted-foreground">Comprehensive campaign performance and security awareness metrics</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((totalClicked / totalSent) * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Industry avg: 22.8%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credential Submission</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((totalSubmitted / totalClicked) * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {totalSubmitted} of {totalClicked} clicks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Time to Click</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4m</div>
                  <p className="text-xs text-muted-foreground">
                    Median: 1.8 minutes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Timeline */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Click-through and submission rates by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Clicks"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Submissions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Comparison</CardTitle>
                <CardDescription>Success rates across different campaign types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockCampaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                    <Bar dataKey="clicked" fill="#82ca9d" name="Clicked" />
                    <Bar dataKey="submitted" fill="#ffc658" name="Submitted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Success Rate by Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCampaignPerformance.map((campaign) => (
                    <div key={campaign.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{campaign.name}</span>
                        <span className="text-sm text-muted-foreground">{campaign.rate}%</span>
                      </div>
                      <Progress value={campaign.rate} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">Lloyds Security Alert</p>
                      <p className="text-sm text-muted-foreground">Banking template</p>
                    </div>
                    <Badge variant="secondary">40.0%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">Barclays Account Verification</p>
                      <p className="text-sm text-muted-foreground">Banking template</p>
                    </div>
                    <Badge variant="secondary">39.0%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">Coinbase 2FA Required</p>
                      <p className="text-sm text-muted-foreground">Crypto template</p>
                    </div>
                    <Badge variant="secondary">30.0%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Clicks by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockDeviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockDeviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Performance</CardTitle>
                  <CardDescription>Submission rates by device</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockDeviceData.map((device, index) => (
                    <div key={device.name} className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {device.name === 'Desktop' && <Monitor className="w-5 h-5 text-muted-foreground" />}
                        {device.name === 'Mobile' && <Smartphone className="w-5 h-5 text-muted-foreground" />}
                        {device.name === 'Tablet' && <Monitor className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{device.name}</span>
                          <span className="text-sm text-muted-foreground">{device.count} clicks</span>
                        </div>
                        <Progress value={device.value} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Click sources by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLocationData.map((location, index) => (
                    <div key={location.country} className="flex items-center space-x-4">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{location.country}</span>
                          <span className="text-sm text-muted-foreground">{location.clicks} clicks</span>
                        </div>
                        <Progress value={location.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}