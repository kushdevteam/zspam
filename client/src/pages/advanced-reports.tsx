import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail,
  Shield,
  Globe,
  Download,
  FileText,
  PieChart,
  Calendar as CalendarIcon,
  Filter
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data for reports
const campaignPerformanceData = [
  { name: 'Coinbase Security Alert', sent: 450, opened: 380, clicked: 125, submitted: 45 },
  { name: 'Coinbase Account Suspension', sent: 320, opened: 295, clicked: 180, submitted: 78 },
  { name: 'Coinbase Earn Opportunity', sent: 280, opened: 240, clicked: 150, submitted: 62 },
  { name: 'Coinbase Pro Upgrade', sent: 190, opened: 165, clicked: 88, submitted: 41 },
];

const timeSeriesData = [
  { date: '2024-01-15', campaigns: 12, sessions: 1450, submissions: 287 },
  { date: '2024-01-16', campaigns: 8, sessions: 980, submissions: 198 },
  { date: '2024-01-17', campaigns: 15, sessions: 1820, submissions: 356 },
  { date: '2024-01-18', campaigns: 10, sessions: 1200, submissions: 245 },
  { date: '2024-01-19', campaigns: 18, sessions: 2100, submissions: 412 },
  { date: '2024-01-20', campaigns: 6, sessions: 720, submissions: 143 },
  { date: '2024-01-21', campaigns: 14, sessions: 1680, submissions: 334 },
];

const deviceTypeData = [
  { name: 'Desktop', value: 1245, percentage: 62 },
  { name: 'Mobile', value: 587, percentage: 29 },
  { name: 'Tablet', value: 168, percentage: 9 },
];

const geographicData = [
  { region: 'London', sessions: 456, submissions: 89, rate: '19.5%' },
  { region: 'Manchester', sessions: 321, submissions: 67, rate: '20.9%' },
  { region: 'Birmingham', sessions: 287, submissions: 54, rate: '18.8%' },
  { region: 'Leeds', sessions: 234, submissions: 41, rate: '17.5%' },
  { region: 'Glasgow', sessions: 198, submissions: 38, rate: '19.2%' },
];

export default function AdvancedReports() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [reportType, setReportType] = useState("executive");
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');

  // Get campaigns for filtering
  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const { data: reportData } = useQuery({
    queryKey: ["/api/reports/data", { dateRange: selectedDateRange, campaignFilter: selectedCampaign }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      const response = await fetch(`/api/reports/data?${new URLSearchParams(params as Record<string, string>)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch report data');
      return response.json();
    }
  });

  const generateReport = async (type: string) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          reportType: type, 
          filters: { dateRange: selectedDateRange, campaignFilter: selectedCampaign }
        })
      });
      
      const result = await response.json();
      console.log(`Generated ${type} report:`, result);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const exportReport = async (format: string) => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          format, 
          data: reportData 
        })
      });
      
      const result = await response.json();
      console.log(`Exported report as ${format}:`, result);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const calculateMetrics = () => {
    const data = reportData?.campaignPerformanceData || campaignPerformanceData;
    const totalSent = data.reduce((sum, item) => sum + item.sent, 0);
    const totalOpened = data.reduce((sum, item) => sum + item.opened, 0);
    const totalClicked = data.reduce((sum, item) => sum + item.clicked, 0);
    const totalSubmitted = data.reduce((sum, item) => sum + item.submitted, 0);

    return {
      totalSent,
      openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0',
      clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0',
      submissionRate: totalSent > 0 ? ((totalSubmitted / totalSent) * 100).toFixed(1) : '0.0',
      totalSubmitted
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Advanced Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights and executive dashboards</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => generateReport(reportType)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Report Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Report Configuration</span>
            </CardTitle>
            <CardDescription>Configure date ranges, campaigns, and report parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Analytics</SelectItem>
                    <SelectItem value="compliance">Compliance Report</SelectItem>
                    <SelectItem value="performance">Performance Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Date Range</Label>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Campaign Filter</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    <SelectItem value="banking">UK Banking Only</SelectItem>
                    <SelectItem value="email">Email Platforms</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Export Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="excel">Excel Workbook</SelectItem>
                    <SelectItem value="json">JSON Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-semibold">{metrics.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-semibold text-green-600">{metrics.openRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-semibold text-orange-600">{metrics.clickRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Submissions</p>
                <p className="text-2xl font-semibold text-red-600">{metrics.totalSubmitted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-semibold text-purple-600">{metrics.submissionRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Report Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Time Series Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Activity Over Time</CardTitle>
                  <CardDescription>Daily campaign sessions and submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value as string), 'PPP')}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="sessions" 
                          stackId="1" 
                          stroke="#8884d8" 
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="submissions" 
                          stackId="1" 
                          stroke="#82ca9d" 
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Performance Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance Comparison</CardTitle>
                  <CardDescription>Success rates by campaign type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={campaignPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                        <Bar dataKey="clicked" fill="#82ca9d" name="Clicked" />
                        <Bar dataKey="submitted" fill="#ffc658" name="Submitted" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
                <CardDescription>Campaign-by-campaign breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Campaign Type</th>
                        <th className="text-right p-2">Emails Sent</th>
                        <th className="text-right p-2">Opened</th>
                        <th className="text-right p-2">Clicked</th>
                        <th className="text-right p-2">Submitted</th>
                        <th className="text-right p-2">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignPerformanceData.map((campaign, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{campaign.name}</td>
                          <td className="p-2 text-right">{campaign.sent.toLocaleString()}</td>
                          <td className="p-2 text-right text-blue-600">{campaign.opened.toLocaleString()}</td>
                          <td className="p-2 text-right text-green-600">{campaign.clicked.toLocaleString()}</td>
                          <td className="p-2 text-right text-red-600">{campaign.submitted.toLocaleString()}</td>
                          <td className="p-2 text-right">
                            <Badge className="bg-primary/10 text-primary">
                              {((campaign.submitted / campaign.sent) * 100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Geographic Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Performance by UK regions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{region.region}</p>
                            <p className="text-sm text-muted-foreground">
                              {region.sessions} sessions • {region.submissions} submissions
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {region.rate}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Sessions by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={deviceTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                        >
                          {deviceTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
        </Tabs>
      </div>
    </div>
  );
}