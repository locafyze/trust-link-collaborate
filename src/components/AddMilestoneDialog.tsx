
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  media: z.instanceof(FileList).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddMilestoneDialogProps {
  projectId: string;
  onMilestoneAdded?: () => void;
}

const AddMilestoneDialog: React.FC<AddMilestoneDialogProps> = ({ 
  projectId, 
  onMilestoneAdded 
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const uploadMedia = async (file: File): Promise<{ url: string; type: string } | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    // Determine media type
    const mediaType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : null;
    
    if (!mediaType) {
      throw new Error('Invalid file type. Please upload an image or video.');
    }

    const { data, error } = await supabase.storage
      .from('milestone-media')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('milestone-media')
      .getPublicUrl(fileName);

    return { url: publicUrl, type: mediaType };
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a milestone.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if provided
      if (data.media && data.media.length > 0) {
        const file = data.media[0];
        const uploadResult = await uploadMedia(file);
        if (uploadResult) {
          mediaUrl = uploadResult.url;
          mediaType = uploadResult.type;
        }
      }

      // Insert milestone into database
      const { error } = await supabase
        .from('milestones')
        .insert([
          {
            project_id: projectId,
            title: data.title,
            description: data.description || null,
            media_url: mediaUrl,
            media_type: mediaType,
          },
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: `Milestone "${data.title}" created successfully!`,
      });

      form.reset();
      setOpen(false);
      onMilestoneAdded?.();
      
      // Invalidate and refetch projects query to update milestone count
      queryClient.invalidateQueries({ queryKey: ['contractor-projects'] });
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to create milestone. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Add Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
          <DialogDescription>
            Add a milestone to track progress on your project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter milestone title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe this milestone..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="media"
              render={({ field: { onChange, name } }) => (
                <FormItem>
                  <FormLabel>Photo/Video (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        name={name}
                        accept="image/*,video/*"
                        onChange={(e) => onChange(e.target.files)}
                        className="flex-1"
                      />
                      <Upload className="h-4 w-4 text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Milestone'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMilestoneDialog;
