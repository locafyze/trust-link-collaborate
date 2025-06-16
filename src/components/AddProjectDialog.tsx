import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSubscription } from '@/hooks/useSubscription';

import { validateEmail, validateProjectName, validateDateRange, sanitizeInput, checkRateLimit } from '@/lib/security';

interface AddProjectDialogProps {
  onSuccess: () => void;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { onUpgrade } = useSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!checkRateLimit(`create-project-${user?.id}`, 5, 300000)) { // 5 requests per 5 minutes
      toast({
        title: 'Too Many Requests',
        description: 'Please wait before creating another project.',
        variant: 'destructive',
      });
      return;
    }

    // Input validation
    if (!validateProjectName(projectName)) {
      toast({
        title: 'Invalid Project Name',
        description: 'Project name must be between 1 and 255 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(clientEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateDateRange(new Date(startDate), new Date(endDate))) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedProjectName = sanitizeInput(projectName);
      const sanitizedClientEmail = clientEmail.trim().toLowerCase();

      // Consume credit first (atomic operation)
      const { data: creditConsumed, error: creditError } = await supabase
        .rpc('consume_project_credit', { user_id_param: user?.id });

      if (creditError) {
        console.error('Credit consumption error:', creditError);
        toast({
          title: 'Credit Error',
          description: 'Failed to consume project credit. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (!creditConsumed) {
        onUpgrade('project');
        return;
      }

      // Create project with validated data
      const { error } = await supabase
        .from('projects')
        .insert({
          project_name: sanitizedProjectName,
          start_date: startDate,
          end_date: endDate,
          client_email: sanitizedClientEmail,
          contractor_id: user?.id,
        });

      if (error) {
        console.error('Project creation error:', error);
        
        // If project creation fails, we should ideally rollback the credit
        // This would require a more sophisticated transaction handling
        toast({
          title: 'Creation Failed',
          description: 'Failed to create project. Please contact support.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Project created successfully!',
      });

      onSuccess();
      setProjectName('');
      setStartDate('');
      setEndDate('');
      setClientEmail('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new project to start managing your tasks and milestones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Project Name
            </Label>
            <Input
              type="text"
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(new Date(startDate), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DatePicker
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => setStartDate(date ? date.toISOString() : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(new Date(endDate), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DatePicker
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => setEndDate(date ? date.toISOString() : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Client Email
            </Label>
            <Input
              type="email"
              id="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
