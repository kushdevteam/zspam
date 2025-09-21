import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Server, Eye, EyeOff, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const smtpFormSchema = z.object({
  name: z.string().min(1, 'Server name is required'),
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  fromEmail: z.string().email('Valid email address required'),
  secure: z.boolean(),
  connectionType: z.enum(['external', 'internal']),
  maxEmailsPerHour: z.number().min(1).max(10000, 'Must be between 1 and 10000'),
});

type SmtpFormData = z.infer<typeof smtpFormSchema>;

interface SmtpServerFormProps {
  onSubmit: (data: SmtpFormData) => void;
  onCancel: () => void;
  onTest?: (data: SmtpFormData, testEmail: string) => Promise<boolean>;
  isLoading?: boolean;
  initialData?: Partial<SmtpFormData>;
}

export function SmtpServerForm({ 
  onSubmit, 
  onCancel, 
  onTest, 
  isLoading = false, 
  initialData 
}: SmtpServerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const form = useForm<SmtpFormData>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      host: initialData?.host || '',
      port: initialData?.port || 587,
      username: initialData?.username || '',
      password: initialData?.password || '',
      fromEmail: initialData?.fromEmail || '',
      secure: initialData?.secure ?? true,
      connectionType: initialData?.connectionType || 'external',
      maxEmailsPerHour: initialData?.maxEmailsPerHour || 100,
    },
  });

  const handlePortChange = (value: string) => {
    const port = parseInt(value);
    if (!isNaN(port)) {
      form.setValue('port', port);
      // Auto-set secure based on common ports
      if (port === 465) {
        form.setValue('secure', true);
      } else if (port === 587 || port === 25) {
        form.setValue('secure', false);
      }
    }
  };

  const handleTest = async () => {
    if (!testEmail || !onTest) return;
    
    setTestStatus('testing');
    try {
      const formData = form.getValues();
      const success = await onTest(formData, testEmail);
      if (success) {
        setTestStatus('success');
        setTestMessage('Test email sent successfully!');
      } else {
        setTestStatus('error');
        setTestMessage('Test email failed. Please check your settings.');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const commonPorts = [
    { port: 25, name: 'SMTP (Standard)', secure: false },
    { port: 587, name: 'SMTP (Submission)', secure: false },
    { port: 465, name: 'SMTPS (SSL)', secure: true },
    { port: 2525, name: 'SMTP (Alternative)', secure: false },
  ];

  const commonProviders = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
    { name: 'Outlook/Hotmail', host: 'smtp-mail.outlook.com', port: 587, secure: false },
    { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, secure: false },
    { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: false },
    { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, secure: false },
  ];

  const fillProvider = (provider: typeof commonProviders[0]) => {
    form.setValue('host', provider.host);
    form.setValue('port', provider.port);
    form.setValue('secure', provider.secure);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="w-5 h-5" />
          <span>{initialData ? 'Edit' : 'Add'} SMTP Server</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Setup */}
          <div className="space-y-2">
            <Label>Quick Setup (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonProviders.map((provider) => (
                <Button
                  key={provider.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillProvider(provider)}
                  className="justify-start"
                >
                  {provider.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Server Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="e.g., Production SMTP"
                className={form.formState.errors.name ? 'border-red-500' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select 
                value={form.watch('connectionType')} 
                onValueChange={(value: 'external' | 'internal') => form.setValue('connectionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">External SMTP</SelectItem>
                  <SelectItem value="internal">Internal Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="host">SMTP Host *</Label>
              <Input
                id="host"
                {...form.register('host')}
                placeholder="smtp.example.com"
                className={form.formState.errors.host ? 'border-red-500' : ''}
              />
              {form.formState.errors.host && (
                <p className="text-red-500 text-sm">{form.formState.errors.host.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port *</Label>
              <Select 
                value={form.watch('port').toString()} 
                onValueChange={handlePortChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commonPorts.map((p) => (
                    <SelectItem key={p.port} value={p.port.toString()}>
                      {p.port} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.port && (
                <p className="text-red-500 text-sm">{form.formState.errors.port.message}</p>
              )}
            </div>
          </div>

          {/* Authentication */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...form.register('username')}
                placeholder="your-email@example.com"
                className={form.formState.errors.username ? 'border-red-500' : ''}
              />
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  placeholder="Your password or app-specific password"
                  className={`pr-10 ${form.formState.errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromEmail">From Email Address *</Label>
            <Input
              id="fromEmail"
              {...form.register('fromEmail')}
              placeholder="noreply@yourdomain.com"
              className={form.formState.errors.fromEmail ? 'border-red-500' : ''}
            />
            {form.formState.errors.fromEmail && (
              <p className="text-red-500 text-sm">{form.formState.errors.fromEmail.message}</p>
            )}
          </div>

          {/* Security and Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Use SSL/TLS</Label>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('port') === 465 ? 'SSL (Port 465)' : 'STARTTLS (Port 587/25)'}
                  </p>
                </div>
                <Switch
                  checked={form.watch('secure')}
                  onCheckedChange={(checked) => form.setValue('secure', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxEmailsPerHour">Max Emails per Hour</Label>
              <Input
                id="maxEmailsPerHour"
                type="number"
                {...form.register('maxEmailsPerHour', { valueAsNumber: true })}
                min="1"
                max="10000"
              />
              {form.formState.errors.maxEmailsPerHour && (
                <p className="text-red-500 text-sm">{form.formState.errors.maxEmailsPerHour.message}</p>
              )}
            </div>
          </div>

          {/* Test Connection */}
          {onTest && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <Label className="text-base font-semibold">Test Connection</Label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="test-email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  type="email"
                />
                <Button
                  type="button"
                  onClick={handleTest}
                  disabled={!testEmail || testStatus === 'testing'}
                  size="sm"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testStatus === 'testing' ? 'Testing...' : 'Test'}
                </Button>
              </div>
              
              {testStatus !== 'idle' && (
                <Alert className={testStatus === 'success' ? 'border-green-500' : 'border-red-500'}>
                  <div className="flex items-center">
                    {testStatus === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <AlertDescription className="ml-2">
                      {testMessage}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save SMTP Server'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}