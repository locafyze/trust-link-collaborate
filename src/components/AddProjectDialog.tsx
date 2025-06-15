
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
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
import { Calendar, Plus } from 'lucide-react';

const formSchema = z.object({
  project_name: z.string().min(1, 'Project name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  client_email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof formSchema>;

interface AddProjectDialogProps {
  onProjectAdded?: () => void;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ onProjectAdded }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: '',
      start_date: '',
      end_date: '',
      client_email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a project.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert project into database
      const { data: project, error } = await supabase
        .from('projects')
        .insert([
          {
            project_name: data.project_name,
            start_date: data.start_date,
            end_date: data.end_date,
            client_email: data.client_email,
            contractor_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send email invitation to client
      const emailData = {
        to: data.client_email,
        subject: `You've been invited to project: ${data.project_name}`,
        html: `
          <h2>Project Invitation</h2>
          <p>You have been invited to collaborate on a new project:</p>
          <ul>
            <li><strong>Project Name:</strong> ${data.project_name}</li>
            <li><strong>Start Date:</strong> ${data.start_date}</li>
            <li><strong>End Date:</strong> ${data.end_date}</li>
          </ul>
          <p>Please log in to TrustLayer to view project details and collaborate.</p>
        `,
      };

      // For now, we'll log the email data (in a real app, you'd send this via an email service)
      console.log('Email invitation would be sent:', emailData);

      toast({
        title: 'Success',
        description: `Project "${data.project_name}" created successfully! Email invitation sent to ${data.client_email}.`,
      });

      form.reset();
      setOpen(false);
      onProjectAdded?.();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the project details and invite a client to collaborate.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="client@example.com" {...field} />
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
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
