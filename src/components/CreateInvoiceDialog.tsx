
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, FileText, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceFormData {
  project_id: string;
  invoice_number: string;
  due_date: string;
  notes: string;
  items: InvoiceItem[];
}

const CreateInvoiceDialog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<InvoiceFormData>({
    defaultValues: {
      project_id: '',
      invoice_number: `INV-${Date.now()}`,
      due_date: '',
      notes: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Fetch contractor's projects
  const { data: projects } = useQuery({
    queryKey: ['contractor-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, client_email')
        .eq('contractor_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const calculateItemAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const generateInvoicePDF = async (invoiceData: InvoiceFormData) => {
    const selectedProject = projects?.find(p => p.id === invoiceData.project_id);
    if (!selectedProject) throw new Error('Project not found');

    // Create HTML content for the invoice
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoiceData.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .invoice-title { font-size: 32px; color: #2563eb; margin-bottom: 10px; }
            .invoice-number { font-size: 18px; color: #666; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .from, .to { flex: 1; }
            .to { text-align: right; }
            .section-title { font-weight: bold; margin-bottom: 10px; color: #2563eb; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f8f9fa; }
            .notes { margin-top: 30px; }
            .amount { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${invoiceData.invoice_number}</div>
          </div>
          
          <div class="details">
            <div class="from">
              <div class="section-title">From:</div>
              <div>Contractor</div>
            </div>
            <div class="to">
              <div class="section-title">To:</div>
              <div>${selectedProject.client_email}</div>
              <div><strong>Project:</strong> ${selectedProject.project_name}</div>
              <div><strong>Due Date:</strong> ${new Date(invoiceData.due_date).toLocaleDateString()}</div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.rate.toFixed(2)}</td>
                  <td class="amount">$${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>Total</strong></td>
                <td class="amount"><strong>$${calculateTotal().toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          ${invoiceData.notes ? `
            <div class="notes">
              <div class="section-title">Notes:</div>
              <p>${invoiceData.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    // Convert HTML to PDF (using browser's print functionality)
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Could not open print window');
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 500);

    return `invoice-${invoiceData.invoice_number}.pdf`;
  };

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      setIsGenerating(true);
      
      try {
        // Generate the PDF
        const fileName = await generateInvoicePDF(data);
        
        // Create a document record in the database
        const { error } = await supabase
          .from('project_documents')
          .insert({
            project_id: data.project_id,
            document_name: fileName,
            document_type: 'invoice',
            file_path: `invoices/${fileName}`,
            uploaded_by: user.id,
          });

        if (error) throw error;

        return data;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-documents'] });
      toast({
        title: 'Invoice Created',
        description: 'Invoice has been generated and saved to the project.',
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Failed to create invoice:', error);
      toast({
        title: 'Failed to create invoice',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    // Update item amounts before submitting
    const updatedData = {
      ...data,
      items: data.items.map(item => ({
        ...item,
        amount: calculateItemAmount(item.quantity, item.rate),
      })),
    };
    createInvoiceMutation.mutate(updatedData);
  };

  const addItem = () => {
    append({ description: '', quantity: 1, rate: 0, amount: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const updateItemAmount = (index: number, quantity: number, rate: number) => {
    const amount = calculateItemAmount(quantity, rate);
    form.setValue(`items.${index}.amount`, amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Create Invoice
          </DialogTitle>
          <DialogDescription>
            Generate a professional invoice for your project work.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_id"
                rules={{ required: 'Please select a project' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.project_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_number"
                rules={{ required: 'Invoice number is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                rules={{ required: 'Due date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Invoice Items
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      rules={{ required: 'Description is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Work description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => {
                                const quantity = parseFloat(e.target.value) || 0;
                                field.onChange(quantity);
                                const rate = form.getValues(`items.${index}.rate`);
                                updateItemAmount(index, quantity, rate);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.rate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                field.onChange(rate);
                                const quantity = form.getValues(`items.${index}.quantity`);
                                updateItemAmount(index, quantity, rate);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount ($)</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-gray-50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={fields.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional notes or payment terms..."
                      rows={3}
                    />
                  </FormControl>
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
                disabled={createInvoiceMutation.isPending || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
