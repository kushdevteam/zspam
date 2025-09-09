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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Edit,
  Trash2,
  Mail,
  Calendar,
  Building,
  Activity,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "campaign_manager", "analyst", "viewer"]),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
  permissions: z.object({
    createCampaigns: z.boolean().default(false),
    manageCampaigns: z.boolean().default(false),
    viewAnalytics: z.boolean().default(true),
    manageUsers: z.boolean().default(false),
    exportData: z.boolean().default(false),
    systemConfig: z.boolean().default(false),
  })
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  campaignsCreated?: number;
  permissions: {
    createCampaigns: boolean;
    manageCampaigns: boolean;
    viewAnalytics: boolean;
    manageUsers: boolean;
    exportData: boolean;
    systemConfig: boolean;
  };
}

const rolePermissions = {
  admin: {
    createCampaigns: true,
    manageCampaigns: true,
    viewAnalytics: true,
    manageUsers: true,
    exportData: true,
    systemConfig: true,
  },
  campaign_manager: {
    createCampaigns: true,
    manageCampaigns: true,
    viewAnalytics: true,
    manageUsers: false,
    exportData: true,
    systemConfig: false,
  },
  analyst: {
    createCampaigns: false,
    manageCampaigns: false,
    viewAnalytics: true,
    manageUsers: false,
    exportData: true,
    systemConfig: false,
  },
  viewer: {
    createCampaigns: false,
    manageCampaigns: false,
    viewAnalytics: true,
    manageUsers: false,
    exportData: false,
    systemConfig: false,
  },
};

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@company.com",
    role: "admin",
    department: "IT Security",
    isActive: true,
    lastLogin: "2024-01-20T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    campaignsCreated: 15,
    permissions: rolePermissions.admin
  },
  {
    id: "2",
    username: "security_manager",
    email: "manager@company.com",
    role: "campaign_manager",
    department: "IT Security",
    isActive: true,
    lastLogin: "2024-01-20T09:15:00Z",
    createdAt: "2024-01-02T00:00:00Z",
    campaignsCreated: 8,
    permissions: rolePermissions.campaign_manager
  },
  {
    id: "3",
    username: "data_analyst",
    email: "analyst@company.com",
    role: "analyst",
    department: "Risk Management",
    isActive: true,
    lastLogin: "2024-01-19T16:45:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    campaignsCreated: 0,
    permissions: rolePermissions.analyst
  },
  {
    id: "4",
    username: "hr_viewer",
    email: "hr@company.com",
    role: "viewer",
    department: "Human Resources",
    isActive: false,
    lastLogin: "2024-01-15T11:20:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    campaignsCreated: 0,
    permissions: rolePermissions.viewer
  }
];

export default function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "viewer",
      department: "",
      isActive: true,
      permissions: rolePermissions.viewer
    },
  });

  // Fetch users from API
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await apiRequest('/api/users', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      form.reset();
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<UserFormData> }) => {
      return await apiRequest(`/api/users/${userId}`, 'PUT', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return await apiRequest(`/api/users/${userId}/status`, 'PATCH', { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const onSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  const handleRoleChange = (role: string) => {
    form.setValue("role", role as any);
    form.setValue("permissions", rolePermissions[role as keyof typeof rolePermissions]);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      role: user.role as any,
      department: user.department || "",
      isActive: user.isActive,
      permissions: user.permissions,
      password: "" // Don't populate password for editing
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      campaign_manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      analyst: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    campaignManagers: users.filter(u => u.role === 'campaign_manager').length
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage team access and permissions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-user">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new team member with specific role and permissions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...form.register("username")}
                      placeholder="Enter username"
                      data-testid="input-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="user@company.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      placeholder="Enter password"
                      data-testid="input-password"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select 
                      value={form.watch("role")} 
                      onValueChange={handleRoleChange}
                      data-testid="select-role"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                        <SelectItem value="analyst">Analyst - View & export data</SelectItem>
                        <SelectItem value="campaign_manager">Campaign Manager - Create & manage campaigns</SelectItem>
                        <SelectItem value="admin">Administrator - Full access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    {...form.register("department")}
                    placeholder="e.g., IT Security, Risk Management"
                    data-testid="input-department"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                    data-testid="switch-active"
                  />
                  <Label htmlFor="isActive">User is active</Label>
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
                    disabled={createUserMutation.isPending}
                    data-testid="button-submit-user"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold">{userStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-semibold text-green-600">{userStats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Administrators</p>
                <p className="text-2xl font-semibold text-red-600">{userStats.admins}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Campaign Managers</p>
                <p className="text-2xl font-semibold text-blue-600">{userStats.campaignManagers}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`user-${user.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user.isActive)}
                          <div>
                            <h4 className="font-medium flex items-center space-x-2">
                              <span>{user.username}</span>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{user.email}</span>
                              </span>
                              {user.department && (
                                <span className="flex items-center space-x-1">
                                  <Building className="w-3 h-3" />
                                  <span>{user.department}</span>
                                </span>
                              )}
                              {user.lastLogin && (
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Permissions:</span>
                        {Object.entries(user.permissions)
                          .filter(([_, hasPermission]) => hasPermission)
                          .map(([permission]) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        className={user.isActive ? "text-red-600" : "text-green-600"}
                        data-testid={`button-toggle-${user.id}`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((data) => {
            if (selectedUser) {
              updateUserMutation.mutate({ userId: selectedUser.id, data });
            }
          })} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  {...form.register("username")}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...form.register("email")}
                  placeholder="user@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select 
                  value={form.watch("role")} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="campaign_manager">Campaign Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  {...form.register("department")}
                  placeholder="e.g., IT Security"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={form.watch("isActive")}
                onCheckedChange={(checked) => form.setValue("isActive", checked)}
              />
              <Label htmlFor="edit-isActive">User is active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}