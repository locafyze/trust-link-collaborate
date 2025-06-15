
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentRequestFormData {
  amount: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface AddPaymentRequestDialogProps {
  milestoneId: string;
  milestoneTitle: string;
}

const AddPaymentRequestDialog = ({ milestoneId, milestoneTitle }: AddPaymentRequestDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const form = useForm<PaymentRequestFormData>({
    defaultValues: {
      amount: '',
      due_date: '',
      status: 'pending',
    },
  });

  const addPaymentRequestMutation = useMutation({
    mutationFn: async (data: PaymentRequestFormData) => {
      console.log('Adding payment request:', data);
      
      const { data: result, error } = await supabase
        .from('payment_requests')
        .insert({
          milestone_id: milestoneId,
          amount: parseFloat(data.amount),
          due_date: data.due_date,
          status: data.status,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding payment request:', error);
        throw error;
      }

      console.log('Payment request added successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
      toast.success('Payment request added successfully');
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Failed to add payment request:', error);
      toast.error('Failed to add payment request');
    },
  });

  const onSubmit = (data: PaymentRequestFormData) => {
    addPaymentRequestMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Add Payment Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Request</DialogTitle>
          <DialogDescription>
            Create a payment request for milestone: {milestoneTitle}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              rules={{
                required: 'Amount is required',
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Please enter a valid amount'
                },
                min: {
                  value: 0.01,
                  message: 'Amount must be greater than 0'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              rules={{
                required: 'Due date is required'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addPaymentRequestMutation.isPending}
              >
                {addPaymentRequestMutation.isPending ? 'Adding...' : 'Add Payment Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentRequestDialog;
