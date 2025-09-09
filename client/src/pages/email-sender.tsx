import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Zap, 
  Mail, 
  Server,
  FileText
} from "lucide-react";
import { SmtpServer, EmailTemplate } from "@shared/schema";

export default function EmailSenderPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SMTP servers
  const { data: smtpServers = [], isLoading: smtpLoading } = useQuery<SmtpServer[]>({
    queryKey: ["/api/smtp-servers"],
  });

  // Fetch email templates
  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  // Delete SMTP server mutation
  const deleteSmtpMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/smtp-servers/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP server deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/smtp-servers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete SMTP server.",
        variant: "destructive",
      });
    },
  });

  // Activate SMTP server mutation
  const activateSmtpMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/smtp-servers/${id}/activate`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP server activated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/smtp-servers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate SMTP server.",
        variant: "destructive",
      });
    },
  });

  // Test SMTP server
  const testSmtpMutation = useMutation({
    mutationFn: async (data: { id: string; testEmail: string }) => {
      const response = await apiRequest("POST", `/api/smtp-servers/${data.id}/test`, { testEmail: data.testEmail });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP server test successful!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "SMTP server test failed.",
        variant: "destructive",
      });
    },
  });

  // Create SMTP server mutation
  const createSmtpMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/smtp-servers", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP server created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/smtp-servers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create SMTP server.",
        variant: "destructive",
      });
    },
  });

  // Create email template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/email-templates", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email template created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create email template.",
        variant: "destructive",
      });
    },
  });

  // Delete email template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/email-templates/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email template deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete email template.",
        variant: "destructive",
      });
    },
  });

  // Handle add SMTP server
  const handleAddSmtpServer = () => {
    const name = prompt("Server Name:");
    if (!name) return;
    
    const host = prompt("SMTP Host:");
    if (!host) return;
    
    const portStr = prompt("SMTP Port (587 for TLS, 465 for SSL):");
    const port = parseInt(portStr || "587");
    if (isNaN(port)) return;
    
    const username = prompt("Username:");
    if (!username) return;
    
    const password = prompt("Password:");
    if (!password) return;
    
    const fromEmail = prompt("From Email Address:");
    if (!fromEmail) return;
    
    const secure = confirm("Use SSL/TLS? (Cancel for STARTTLS)");
    
    createSmtpMutation.mutate({
      name,
      host,
      port,
      username,
      password,
      fromEmail,
      secure
    });
  };

  // Handle create template
  const handleCreateTemplate = () => {
    const name = prompt("Template Name:");
    if (!name) return;
    
    const subject = prompt("Email Subject:");
    if (!subject) return;
    
    const htmlContent = prompt("HTML Content (basic HTML):");
    if (!htmlContent) return;
    
    createTemplateMutation.mutate({
      name,
      subject,
      htmlContent,
      textContent: htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });
  };

  // Handle test SMTP
  const handleTestSmtp = (serverId: string) => {
    const testEmail = prompt("Enter test email address:");
    if (!testEmail) return;
    
    testSmtpMutation.mutate({ id: serverId, testEmail });
  };

  // Handle refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/smtp-servers"] });
    queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
    toast({
      title: "Refreshed",
      description: "Data refreshed successfully.",
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Email Sender</h1>
          <div className="flex items-center space-x-3">
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleAddSmtpServer}
              disabled={createSmtpMutation.isPending}
              data-testid="button-add-smtp"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add SMTP Server
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleCreateTemplate}
              disabled={createTemplateMutation.isPending}
              data-testid="button-create-template"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
            <Button 
              variant="default" 
              onClick={handleRefresh}
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* SMTP Servers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">SMTP Servers</h3>
            <Badge variant="destructive">{smtpServers.length}</Badge>
          </div>
          
          {smtpLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading SMTP servers...</p>
              </CardContent>
            </Card>
          ) : smtpServers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                  <Server className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">No SMTP servers configured</h4>
                <p className="text-muted-foreground mb-4">Add an SMTP server to start sending emails.</p>
                <Button 
                  onClick={handleAddSmtpServer}
                  disabled={createSmtpMutation.isPending}
                  data-testid="button-add-first-smtp"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add SMTP Server
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {smtpServers.map((server: SmtpServer) => (
                <Card key={server.id} className={server.isActive ? "border-green-500/30" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-green-500/30 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-foreground">{server.name}</h4>
                          {server.isActive && (
                            <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Host:</span>
                        <span className="ml-2 text-foreground">{server.host}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Port:</span>
                        <span className="ml-2 text-foreground">{server.port}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User:</span>
                        <span className="ml-2 text-foreground">{server.username}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Security:</span>
                        <span className="ml-2 text-foreground">{server.secure ? "SSL/TLS" : "None"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleTestSmtp(server.id)}
                        disabled={testSmtpMutation.isPending}
                        data-testid={`button-test-${server.id}`}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          toast({ 
                            title: "Info", 
                            description: "SMTP server editing functionality needs backend update route" 
                          });
                        }}
                        data-testid={`button-edit-${server.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {!server.isActive && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => activateSmtpMutation.mutate(server.id)}
                          disabled={activateSmtpMutation.isPending}
                          data-testid={`button-activate-${server.id}`}
                        >
                          Activate
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteSmtpMutation.mutate(server.id)}
                        disabled={deleteSmtpMutation.isPending}
                        data-testid={`button-delete-${server.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Email Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Email Templates</h3>
            <Badge variant="destructive">{emailTemplates.length}</Badge>
          </div>
          
          {templatesLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading email templates...</p>
              </CardContent>
            </Card>
          ) : emailTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                  <Mail className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">No email templates found</h4>
                <p className="text-muted-foreground mb-4">Create your first email template to get started with campaigns.</p>
                <Button 
                  onClick={handleCreateTemplate}
                  disabled={createTemplateMutation.isPending}
                  data-testid="button-create-first-template"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emailTemplates.map((template: EmailTemplate) => (
                <Card key={template.id} className="hover:bg-muted/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.campaignType || "General"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">Subject:</p>
                      <p className="text-sm text-foreground truncate">{template.subject}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => {
                          const name = prompt("Template Name:", template.name);
                          if (!name) return;
                          const subject = prompt("Email Subject:", template.subject);
                          if (!subject) return;
                          const htmlContent = prompt("HTML Content:", template.htmlContent);
                          if (!htmlContent) return;
                          // Note: Edit functionality would need proper update mutation
                          toast({ title: "Info", description: "Edit functionality needs backend update route" });
                        }}
                        data-testid={`button-edit-template-${template.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => {
                          if (confirm(`Delete template "${template.name}"?`)) {
                            deleteTemplateMutation.mutate(template.id);
                          }
                        }}
                        disabled={deleteTemplateMutation.isPending}
                        data-testid={`button-delete-template-${template.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
