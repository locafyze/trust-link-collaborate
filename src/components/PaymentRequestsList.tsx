
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AddPaymentRequestDialog from './AddPaymentRequestDialog';

interface PaymentRequest {
  id: string;
  milestone_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  milestones: {
    title: string;
    projects: {
      project_name: string;
    };
  };
}

interface Milestone {
  id: string;
  title: string;
  project_id: string;
  projects: {
    project_name: string;
  };
}

const PaymentRequestsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: paymentRequests, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payment-requests', user?.id],
    queryFn: async () => {
      console.log('Fetching payment requests for contractor:', user?.id);
      
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          milestones!inner(
            title,
            projects!inner(project_name, contractor_id)
          )
        `)
        .eq('milestones.projects.contractor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment requests:', error);
        throw error;
      }

      console.log('Fetched payment requests:', data);
      return data as PaymentRequest[];
    },
    enabled: !!user?.id,
  });

  const { data: milestones } = useQuery({
    queryKey: ['contractor-milestones', user?.id],
    queryFn: async () => {
      console.log('Fetching milestones for payment requests:', user?.id);
      
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          id,
          title,
          project_id,
          projects!inner(project_name, contractor_id)
        `)
        .eq('projects.contractor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }

      return data as Milestone[];
    },
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('Updating payment request status:', { id, status });
      
      const { data, error } = await supabase
        .from('payment_requests')
        .update({ status })
        .eq('id', id)
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
      toast.success('Payment request status updated');
    },
    onError: (error: any) => {
      console.error('Failed to update payment request status:', error);
      toast.error('Failed to update status');
    },
  });

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'paid') return 'default';
    if (status === 'overdue' || (status === 'pending' && new Date(dueDate) < new Date())) return 'destructive';
    return 'secondary';
  };

  if (isLoadingPayments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>Loading payment requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Requests</CardTitle>
        <CardDescription>Manage payment requests for your project milestones</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Quick action to add payment requests for milestones without them */}
        {milestones && milestones.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Add Payment Request to Milestone:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {milestones
                .filter(milestone => 
                  !paymentRequests?.some(pr => pr.milestone_id === milestone.id)
                )
                .slice(0, 3)
                .map((milestone) => (
                  <div key={milestone.id} className="p-3 border rounded-lg">
                    <div className="text-sm font-medium truncate">{milestone.title}</div>
                    <div className="text-xs text-gray-500 mb-2">{milestone.projects.project_name}</div>
                    <AddPaymentRequestDialog 
                      milestoneId={milestone.id} 
                      milestoneTitle={milestone.title}
                    />
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {!paymentRequests || paymentRequests.length === 0 ? (
          <p className="text-gray-600">No payment requests yet. Add payment requests to your milestones to start tracking payments.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milestone</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.milestones.title}
                  </TableCell>
                  <TableCell>
                    {request.milestones.projects.project_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      {request.amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {format(new Date(request.due_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(request.status, request.due_date)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(value) => 
                        updateStatusMutation.mutate({ id: request.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-24">
                        <Edit className="h-3 w-3" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentRequestsList;
