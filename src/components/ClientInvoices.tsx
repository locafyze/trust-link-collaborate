
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ClientInvoices = () => {
  const { profile } = useAuth();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['client-invoices', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      
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
          projects!inner(project_name, contractor_id)
        `)
        .eq('document_type', 'invoice')
        .eq('projects.client_email', profile.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.email,
  });

  const handleDownload = async (invoice: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-documents')
        .download(invoice.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = invoice.document_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: `${invoice.document_name} is downloading.`,
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getInvoiceStatus = (invoice: any) => {
    const metadata = invoice.metadata || {};
    if (metadata.status === 'paid') return { status: 'Paid', variant: 'default' as const };
    if (metadata.status === 'sent_to_client') return { status: 'Sent', variant: 'secondary' as const };
    return { status: 'Draft', variant: 'outline' as const };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Your Invoices
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
          Your Invoices
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
            <p className="text-gray-600">No invoices available yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Invoices from your contractors will appear here once they upload them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const { status, variant } = getInvoiceStatus(invoice);
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
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {invoice.file_size ? formatFileSize(invoice.file_size) : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(invoice)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
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

export default ClientInvoices;
