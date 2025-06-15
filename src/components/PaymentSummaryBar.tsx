
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const PaymentSummaryBar = () => {
  const { user } = useAuth();

  const { data: paymentRequests, isLoading } = useQuery({
    queryKey: ['payment-summary', user?.id],
    queryFn: async () => {
      console.log('Fetching payment summary for contractor:', user?.id);
      
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          milestones!inner(
            title,
            projects!inner(project_name, contractor_id)
          )
        `)
        .eq('milestones.projects.contractor_id', user?.id);

      if (error) {
        console.error('Error fetching payment summary:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentRequests || paymentRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-gray-600 text-sm">No payment requests to display</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const totalAmount = paymentRequests.reduce((sum, request) => sum + request.amount, 0);
  const paidAmount = paymentRequests
    .filter(request => request.status === 'paid')
    .reduce((sum, request) => sum + request.amount, 0);
  const pendingAmount = paymentRequests
    .filter(request => request.status === 'pending')
    .reduce((sum, request) => sum + request.amount, 0);
  const overdueAmount = paymentRequests
    .filter(request => request.status === 'overdue')
    .reduce((sum, request) => sum + request.amount, 0);

  const paymentProgress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <div className="text-lg font-bold">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">Paid</span>
            </div>
            <div className="text-lg font-bold text-green-700">
              ${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="text-sm font-medium text-yellow-600">Pending</span>
            </div>
            <div className="text-lg font-bold text-yellow-700">
              ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm font-medium text-red-600">Overdue</span>
            </div>
            <div className="text-lg font-bold text-red-700">
              ${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Payment Progress</span>
            <span className="text-sm text-gray-600">{Math.round(paymentProgress)}%</span>
          </div>
          <Progress value={paymentProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummaryBar;
