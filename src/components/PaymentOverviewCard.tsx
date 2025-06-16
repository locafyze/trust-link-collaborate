
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentRequest {
  id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  milestones: {
    title: string;
    projects: {
      project_name: string;
      client_email: string;
    };
  };
}

const PaymentOverviewCard = () => {
  const { profile } = useAuth();

  const { data: paymentRequests, isLoading, error } = useQuery({
    queryKey: ['client-payment-requests', profile?.email],
    queryFn: async () => {
      if (!profile?.email) {
        throw new Error('User email not available');
      }

      console.log('Fetching payment requests for client:', profile?.email);
      
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          milestones!inner(
            title,
            projects!inner(project_name, client_email)
          )
        `)
        .eq('milestones.projects.client_email', profile?.email)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching payment requests:', error);
        throw new Error('Failed to fetch payment requests');
      }

      console.log('Fetched payment requests for client:', data);
      return data as PaymentRequest[];
    },
    enabled: !!profile?.email,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
          <CardDescription>Loading payment information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
          <CardDescription>Error loading payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load payment data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!paymentRequests || paymentRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
          <CardDescription>No payment requests found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No payments are currently due for your projects.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate payment statistics
  const totalAmount = paymentRequests.reduce((sum, request) => sum + request.amount, 0);
  const totalPaid = paymentRequests
    .filter(request => request.status === 'paid')
    .reduce((sum, request) => sum + request.amount, 0);
  const remainingBalance = totalAmount - totalPaid;
  const paymentProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  // Get upcoming due dates
  const upcomingPayments = paymentRequests
    .filter(request => request.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  const overduePayments = paymentRequests.filter(request => request.status === 'overdue');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Payment Overview
        </CardTitle>
        <CardDescription>Track your project payments and upcoming due dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-green-600">Total Paid</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">
              ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-orange-600">Remaining Balance</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-blue-600">Total Project Value</p>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Payment Progress</span>
            <span className="text-sm text-gray-600">{Math.round(paymentProgress)}%</span>
          </div>
          <Progress value={paymentProgress} className="h-3" />
        </div>

        {/* Overdue Alerts */}
        {overduePayments.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">Overdue Payments</span>
            </div>
            <div className="space-y-2">
              {overduePayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{payment.milestones.projects.project_name}</p>
                    <p className="text-xs text-gray-600">{payment.milestones.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-700">
                      ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-red-600">
                      Due: {format(new Date(payment.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Due Dates */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Upcoming Due Dates
          </h4>
          {upcomingPayments.length === 0 ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">No upcoming payments</span>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{payment.milestones.projects.project_name}</p>
                    <p className="text-xs text-gray-600">{payment.milestones.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(payment.status)} className="text-xs">
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(payment.due_date), 'MMM dd')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentOverviewCard;
