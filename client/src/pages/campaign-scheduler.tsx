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
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, addHours, addDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Send, 
  Pause, 
  Play,
  Settings,
  Users,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";

const scheduleSchema = z.object({
  campaignId: z.string().min(1, "Please select a campaign"),
  scheduledAt: z.date(),
  batchSize: z.number().min(1).max(1000),
  delayBetweenBatches: z.number().min(1).max(60),
});

type ScheduleData = z.infer<typeof scheduleSchema>;

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface ScheduledCampaign {
  id: string;
  campaignId: string;
  campaignName: string;
  campaignType: string;
  scheduledAt: string;
  executedAt?: string;
  status: string;
  batchSize: number;
  delayBetweenBatches: number;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  errorMessage?: string;
}

interface SchedulingStats {
  statusCounts: {
    pending: number;
    executing: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  totalScheduled: number;
  upcoming: Array<{
    id: string;
    campaignName: string;
    scheduledAt: string;
    totalRecipients: number;
  }>;
}

const quickScheduleOptions = [
  { label: "In 1 hour", value: 1 },
  { label: "In 4 hours", value: 4 },
  { label: "Tomorrow 9 AM", value: "tomorrow_9am" },
  { label: "Next Monday 9 AM", value: "next_monday_9am" },
];

export default function CampaignScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScheduleData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      campaignId: "",
      batchSize: 50,
      delayBetweenBatches: 5,
    },
  });

  // Get campaigns for scheduling
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Get scheduled campaigns
  const { data: scheduledCampaigns = [], isLoading: scheduledLoading } = useQuery<ScheduledCampaign[]>({
    queryKey: ["/api/scheduling/campaigns/scheduled"],
  });

  // Get scheduling statistics
  const { data: stats } = useQuery<SchedulingStats>({
    queryKey: ["/api/scheduling/statistics"],
  });

  const scheduleCampaignMutation = useMutation({
    mutationFn: async (data: ScheduleData) => {
      const response = await apiRequest("POST", `/api/scheduling/campaigns/${data.campaignId}/schedule`, {
        scheduledAt: data.scheduledAt.toISOString(),
        batchSize: data.batchSize,
        delayBetweenBatches: data.delayBetweenBatches,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Scheduled",
        description: "Your campaign has been scheduled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduling/campaigns/scheduled"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduling/statistics"] });
      form.reset();
      setSelectedDate(undefined);
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule the campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await apiRequest("DELETE", `/api/scheduling/campaigns/${scheduleId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Schedule Cancelled",
        description: "Campaign schedule has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduling/campaigns/scheduled"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduling/statistics"] });
    },
    onError: () => {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel the schedule.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleData) => {
    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for scheduling.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes);

    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    scheduleCampaignMutation.mutate({
      ...data,
      scheduledAt: scheduledDateTime,
    });
  };

  const handleQuickSchedule = (option: any) => {
    let scheduledAt: Date;
    
    if (typeof option.value === "number") {
      scheduledAt = addHours(new Date(), option.value);
    } else if (option.value === "tomorrow_9am") {
      scheduledAt = addDays(new Date(), 1);
      scheduledAt.setHours(9, 0, 0, 0);
    } else if (option.value === "next_monday_9am") {
      scheduledAt = new Date();
      const daysUntilMonday = (1 + 7 - scheduledAt.getDay()) % 7 || 7;
      scheduledAt = addDays(scheduledAt, daysUntilMonday);
      scheduledAt.setHours(9, 0, 0, 0);
    } else {
      return;
    }

    setSelectedDate(scheduledAt);
    setSelectedTime(format(scheduledAt, "HH:mm"));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "executing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "executing": return <Play className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "failed": return <AlertTriangle className="w-4 h-4" />;
      case "cancelled": return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaign Scheduler</h1>
            <p className="text-muted-foreground">Schedule campaigns for automated execution</p>
          </div>
          <div className="flex items-center space-x-4">
            {stats && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Active Schedules</p>
                <p className="text-xl font-semibold">{stats.statusCounts.pending}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Schedule New Campaign */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-primary" />
                  <CardTitle>Schedule New Campaign</CardTitle>
                </div>
                <CardDescription>
                  Set up automated campaign execution with custom timing and batching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Campaign Selection */}
                  <div>
                    <Label>Campaign</Label>
                    <Select 
                      onValueChange={(value) => form.setValue("campaignId", value)}
                      data-testid="select-campaign"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign to schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns
                          .filter((campaign: any) => campaign.status === 'draft')
                          .map((campaign: any) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name} ({campaign.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Schedule Options */}
                  <div>
                    <Label>Quick Schedule</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {quickScheduleOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSchedule(option)}
                          data-testid={`button-quick-${option.value}`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid="button-select-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date <= new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        data-testid="input-schedule-time"
                      />
                    </div>
                  </div>

                  {/* Batch Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batchSize">Batch Size</Label>
                      <Input
                        id="batchSize"
                        type="number"
                        min="1"
                        max="1000"
                        {...form.register("batchSize", { valueAsNumber: true })}
                        data-testid="input-batch-size"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Emails per batch (1-1000)
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="delayBetweenBatches">Batch Delay (minutes)</Label>
                      <Input
                        id="delayBetweenBatches"
                        type="number"
                        min="1"
                        max="60"
                        {...form.register("delayBetweenBatches", { valueAsNumber: true })}
                        data-testid="input-batch-delay"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Delay between batches (1-60 min)
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={scheduleCampaignMutation.isPending}
                    data-testid="button-schedule-campaign"
                  >
                    {scheduleCampaignMutation.isPending ? (
                      "Scheduling..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Schedule Campaign
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Campaigns */}
          <div className="space-y-6">
            
            {/* Statistics Overview */}
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-xl font-semibold">{stats.statusCounts.pending}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-xl font-semibold">{stats.statusCounts.completed}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-semibold">{stats.totalScheduled}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Scheduled Campaigns List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Campaigns</CardTitle>
                <CardDescription>
                  Manage your scheduled campaign executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledLoading ? (
                  <p>Loading scheduled campaigns...</p>
                ) : scheduledCampaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No campaigns scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledCampaigns.map((schedule: any) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`schedule-${schedule.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(schedule.status)}>
                              {getStatusIcon(schedule.status)}
                              <span className="ml-1">{schedule.status}</span>
                            </Badge>
                            <h4 className="font-medium">{schedule.campaignName}</h4>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Scheduled:</span>{" "}
                              {format(new Date(schedule.scheduledAt), "PPp")}
                            </div>
                            <div>
                              <span className="font-medium">Recipients:</span>{" "}
                              {schedule.totalRecipients || 0}
                            </div>
                            <div>
                              <span className="font-medium">Batch Size:</span>{" "}
                              {schedule.batchSize}
                            </div>
                            <div>
                              <span className="font-medium">Progress:</span>{" "}
                              {schedule.sentCount || 0}/{schedule.totalRecipients || 0}
                            </div>
                          </div>
                        </div>
                        
                        {(schedule.status === "pending" || schedule.status === "failed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelScheduleMutation.mutate(schedule.id)}
                            disabled={cancelScheduleMutation.isPending}
                            data-testid={`button-cancel-${schedule.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}