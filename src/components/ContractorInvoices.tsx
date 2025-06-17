
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ContractorInvoices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['contractor-invoices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('project_documents')
        .select(`
          id,
          document_name,
          file_path,
          file_size,
          created_at,
          project_id,
          metadata,
          projects!inner(project_name, contractor_id, client_email)
        `)
        .eq('document_type', 'invoice')
        .eq('projects.contractor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase
        .from('project_documents')
        .update({ 
          metadata: { 
            ...invoices?.find(inv => inv.id === invoiceId)?.metadata,
            status: 'paid',
            paid_at: new Date().toISOString()
          }
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-invoices'] });
      toast({
        title: 'Invoice marked as paid',
        description: 'The invoice has been marked as paid successfully.',
      });
    },
    onError: (error) => {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as paid. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getInvoiceStatus = (invoice: any) => {
    const metadata = invoice.metadata || {};
    if (metadata.status === 'paid') return { status: 'Paid', variant: 'default' as const };
    if (metadata.status === 'sent_to_client') return { status: 'Sent to Client', variant: 'secondary' as const };
    return { status: 'Draft', variant: 'outline' as const };
  };

  const getInvoiceAmount = (invoice: any) => {
    const metadata = invoice.metadata || {};
    return metadata.amount || 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            My Invoices
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
          My Invoices
          {invoices && invoices.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {invoices.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!invoices || invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No invoices created yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Create invoices for your projects and manage payments here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const { status, variant } = getInvoiceStatus(invoice);
                  const amount = getInvoiceAmount(invoice);
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{invoice.document_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{invoice.projects.project_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{invoice.projects.client_email}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          <span>₹{amount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{status}</Badge>
                      </TableCell>
                      <TableCell>
                        {status !== 'Paid' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => markAsPaidMutation.mutate(invoice.id)}
                            disabled={markAsPaidMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Paid
                          </Button>
                        )}
                        {status === 'Paid' && (
                          <span className="text-green-600 text-sm font-medium">Completed</span>
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

export default ContractorInvoices;
