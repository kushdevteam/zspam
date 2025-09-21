import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, FileText, Image, Paperclip } from 'lucide-react';

const templateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  campaignType: z.string().optional(),
  description: z.string().optional(),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface EmailTemplateFormProps {
  onSubmit: (data: TemplateFormData & { attachments?: File[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<TemplateFormData>;
}

export function EmailTemplateForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  initialData 
}: EmailTemplateFormProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      subject: initialData?.subject || '',
      campaignType: initialData?.campaignType || '',
      description: initialData?.description || '',
      htmlContent: initialData?.htmlContent || '',
      textContent: initialData?.textContent || '',
      tags: initialData?.tags || [],
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const handlePreviewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (data: TemplateFormData) => {
    onSubmit({ ...data, attachments });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>{initialData ? 'Edit' : 'Create'} Email Template</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="e.g., Coinbase Security Alert"
                className={form.formState.errors.name ? 'border-red-500' : ''}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaignType">Campaign Type</Label>
              <Select 
                value={form.watch('campaignType')} 
                onValueChange={(value) => form.setValue('campaignType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="office365">Office 365</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="generic">Generic</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              {...form.register('subject')}
              placeholder="e.g., Urgent: Verify your account security"
              className={form.formState.errors.subject ? 'border-red-500' : ''}
            />
            {form.formState.errors.subject && (
              <p className="text-red-500 text-sm">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Brief description of this template..."
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML Content</TabsTrigger>
              <TabsTrigger value="text">Text Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="space-y-2">
              <Label htmlFor="htmlContent">HTML Content *</Label>
              <Textarea
                id="htmlContent"
                {...form.register('htmlContent')}
                placeholder="Enter your HTML email content..."
                rows={12}
                className={`font-mono ${form.formState.errors.htmlContent ? 'border-red-500' : ''}`}
              />
              {form.formState.errors.htmlContent && (
                <p className="text-red-500 text-sm">{form.formState.errors.htmlContent.message}</p>
              )}
              <div className="text-sm text-muted-foreground">
                You can use placeholders like {'{{name}}'}, {'{{email}}'}, {'{{company}}'}, etc. for personalization.
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="textContent">Text Content (Plain Text Alternative)</Label>
              <Textarea
                id="textContent"
                {...form.register('textContent')}
                placeholder="Plain text version of your email..."
                rows={12}
              />
              <div className="text-sm text-muted-foreground">
                Plain text alternative for email clients that don't support HTML.
              </div>
            </TabsContent>
          </Tabs>

          {/* File Attachments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Attachments</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </span>
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Image */}
          <div className="space-y-2">
            <Label>Preview Image (Optional)</Label>
            <div className="flex items-center space-x-4">
              <Label htmlFor="preview-upload" className="cursor-pointer">
                <Button type="button" size="sm" variant="outline" asChild>
                  <span>
                    <Image className="w-4 h-4 mr-2" />
                    Upload Preview
                  </span>
                </Button>
              </Label>
              <input
                id="preview-upload"
                type="file"
                accept="image/*"
                onChange={handlePreviewImageUpload}
                className="hidden"
              />
              {previewImage && (
                <div className="relative">
                  <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}