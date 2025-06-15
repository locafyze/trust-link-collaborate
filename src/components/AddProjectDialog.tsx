import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
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
import { Plus, Lock } from 'lucide-react';
import UpgradeDialog from './UpgradeDialog';

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
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { hasActiveSubscription, availableCredits, refreshData } = useSubscription();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: '',
      start_date: '',
      end_date: '',
      client_email: '',
    },
  });

  const canCreateProject = hasActiveSubscription && availableCredits > 0;

  const handleCreateProject = () => {
    if (!canCreateProject) {
      if (!hasActiveSubscription) {
        setUpgradeOpen(true);
      } else if (availableCredits === 0) {
        setUpgradeOpen(true);
      }
      return;
    }
    setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a project.',
        variant: 'destructive',
      });
      return;
    }

    if (!canCreateProject) {
      toast({
        title: 'Error',
        description: 'You need an active subscription and available credits to create a project.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Consume project credit
      const { data: creditConsumed, error: creditError } = await supabase
        .rpc('consume_project_credit', { user_id_param: user.id });

      if (creditError || !creditConsumed) {
        throw new Error('Failed to consume project credit');
      }

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

      toast({
        title: 'Success',
        description: `Project "${data.project_name}" created successfully! Email invitation sent to ${data.client_email}.`,
      });

      form.reset();
      setOpen(false);
      onProjectAdded?.();
      refreshData(); // Refresh subscription data
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

  const handleUpgradeSuccess = () => {
    refreshData();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="w-full justify-start" 
            variant={canCreateProject ? "default" : "outline"}
            onClick={handleCreateProject}
            disabled={!hasActiveSubscription}
          >
            {canCreateProject ? (
              <Plus className="h-4 w-4 mr-2" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            {!hasActiveSubscription 
              ? 'Subscribe to Create Projects' 
              : availableCredits === 0 
                ? 'Buy Credits to Create Projects'
                : 'Add New Project'
            }
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the project details and invite a client to collaborate.
              {availableCredits > 0 && (
                <span className="block mt-1 text-green-600">
                  Available credits: {availableCredits}
                </span>
              )}
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

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        type={!hasActiveSubscription ? 'subscription' : 'project'}
        onSuccess={handleUpgradeSuccess}
      />
    </>
  );
};

export default AddProjectDialog;
