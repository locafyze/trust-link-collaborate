
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Bill {
  id: string;
  bill_number: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  metadata: any;
  invoice_id: string;
  project_id: string;
}

const ClientBills = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['client-bills', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('client_email', profile.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Bill[];
    },
    enabled: !!profile?.email,
  });

  const markBillAsPaidMutation = useMutation({
    mutationFn: async (billId: string) => {
      const { data, error } = await supabase
        .from('bills')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', billId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bills'] });
      toast({
        title: 'Bill marked as paid',
        description: 'The bill has been marked as paid successfully.',
      });
    },
    onError: (error) => {
      console.error('Error marking bill as paid:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark bill as paid. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { status: 'Paid', variant: 'default' as const, icon: CheckCircle };
      case 'overdue':
        return { status: 'Overdue', variant: 'destructive' as const, icon: AlertCircle };
      default:
        return { status: 'Pending', variant: 'secondary' as const, icon: FileText };
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status === 'pending';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Bills
          {bills && bills.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {bills.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!bills || bills.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bills available yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Bills will appear here when contractors mark invoices as paid.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => {
                  const { status, variant, icon: StatusIcon } = getBillStatusColor(
                    isOverdue(bill.due_date, bill.status) ? 'overdue' : bill.status
                  );
                  const projectName = bill.metadata?.project_name || 'Unknown Project';
                  
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{bill.bill_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{projectName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          <span className="font-medium">{formatAmount(bill.amount)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(bill.due_date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant} className="flex items-center w-fit">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bill.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => markBillAsPaidMutation.mutate(bill.id)}
                            disabled={markBillAsPaidMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Paid
                          </Button>
                        )}
                        {bill.status === 'paid' && (
                          <span className="text-green-600 text-sm font-medium">Paid</span>
                        )}
                        {isOverdue(bill.due_date, bill.status) && bill.status === 'pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => markBillAsPaidMutation.mutate(bill.id)}
                            disabled={markBillAsPaidMutation.isPending}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Pay Overdue
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientBills;
