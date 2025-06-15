
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface PaymentStatusToggleProps {
  paymentRequestId: string;
  currentStatus: 'pending' | 'paid' | 'overdue';
  amount: number;
  milestoneTitle: string;
}

const PaymentStatusToggle = ({ 
  paymentRequestId, 
  currentStatus, 
  amount, 
  milestoneTitle 
}: PaymentStatusToggleProps) => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      console.log('Updating payment request status:', { paymentRequestId, newStatus });
      
      const { data, error } = await supabase
        .from('payment_requests')
        .update({ status: newStatus })
        .eq('id', paymentRequestId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment request status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['client-payment-requests'] });
      toast.success('Payment status updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update payment status:', error);
      toast.error('Failed to update payment status');
    },
  });

  const handleStatusToggle = (checked: boolean) => {
    const newStatus = checked ? 'paid' : 'pending';
    updateStatusMutation.mutate(newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{milestoneTitle}</p>
            <p className="text-xs text-gray-600">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Badge variant={getStatusColor(currentStatus)} className="text-xs">
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor={`payment-${paymentRequestId}`} className="text-sm">
          Mark as Paid
        </Label>
        <Switch
          id={`payment-${paymentRequestId}`}
          checked={currentStatus === 'paid'}
          onCheckedChange={handleStatusToggle}
          disabled={updateStatusMutation.isPending}
        />
      </div>
    </div>
  );
};

export default PaymentStatusToggle;
