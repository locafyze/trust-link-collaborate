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
  invoice_date: string;
  due_date: string;
  // Company details
  company_name: string;
  company_address: string;
  company_phone: string;
  company_gstin: string;
  // Client details
  client_name: string;
  client_address: string;
  client_gstin: string;
  // Payment details
  payment_method: string;
  payment_details: string;
  payment_instructions: string;
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
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      company_name: '',
      company_address: '',
      company_phone: '',
      company_gstin: '',
      client_name: '',
      client_address: '',
      client_gstin: '',
      payment_method: 'bank_transfer',
      payment_details: '',
      payment_instructions: '',
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

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const generateInvoiceHTML = (invoiceData: InvoiceFormData, selectedProject: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoiceData.invoice_number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 40px; 
              color: #333; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
            }
            .invoice-title { 
              font-size: 42px; 
              color: #2563eb; 
              margin-bottom: 10px; 
              font-weight: bold;
            }
            .invoice-meta { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px; 
              font-size: 16px;
            }
            .details-section { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 40px; 
              gap: 40px;
            }
            .company-details, .client-details { 
              flex: 1; 
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .section-title { 
              font-weight: bold; 
              margin-bottom: 15px; 
              color: #2563eb; 
              font-size: 18px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .detail-line { 
              margin-bottom: 8px; 
              font-size: 14px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 15px; 
              text-align: left; 
            }
            .items-table th { 
              background-color: #2563eb; 
              color: white; 
              font-weight: bold; 
              font-size: 14px;
            }
            .items-table td { 
              font-size: 14px; 
            }
            .total-row { 
              font-weight: bold; 
              background-color: #f1f5f9; 
              font-size: 16px;
            }
            .amount { text-align: right; }
            .payment-section { 
              margin-top: 40px; 
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .notes-section { 
              margin-top: 30px; 
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .payment-method {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta">
              <span><strong>Invoice #:</strong> ${invoiceData.invoice_number}</span>
              <span><strong>Date:</strong> ${new Date(invoiceData.invoice_date).toLocaleDateString('en-IN')}</span>
              <span><strong>Due:</strong> ${new Date(invoiceData.due_date).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          
          <div class="details-section">
            <div class="company-details">
              <div class="section-title">From (Service Provider)</div>
              <div class="detail-line"><strong>${invoiceData.company_name || 'Your Company Name'}</strong></div>
              ${invoiceData.company_address ? `<div class="detail-line">${invoiceData.company_address}</div>` : ''}
              ${invoiceData.company_phone ? `<div class="detail-line">Phone: ${invoiceData.company_phone}</div>` : ''}
              ${invoiceData.company_gstin ? `<div class="detail-line">GSTIN: ${invoiceData.company_gstin}</div>` : ''}
            </div>
            
            <div class="client-details">
              <div class="section-title">To (Bill To)</div>
              <div class="detail-line"><strong>${invoiceData.client_name || selectedProject.client_email}</strong></div>
              ${invoiceData.client_address ? `<div class="detail-line">${invoiceData.client_address}</div>` : ''}
              <div class="detail-line">Email: ${selectedProject.client_email}</div>
              ${invoiceData.client_gstin ? `<div class="detail-line">GSTIN: ${invoiceData.client_gstin}</div>` : ''}
              <div class="detail-line"><strong>Project:</strong> ${selectedProject.project_name}</div>
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
                  <td>${formatIndianCurrency(item.rate)}</td>
                  <td class="amount">${formatIndianCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>Total Amount</strong></td>
                <td class="amount"><strong>${formatIndianCurrency(calculateTotal())}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="payment-section">
            <div class="section-title">Payment Information</div>
            <div class="detail-line">
              <span class="payment-method">${invoiceData.payment_method.replace('_', ' ').toUpperCase()}</span>
            </div>
            ${invoiceData.payment_details ? `<div class="detail-line"><strong>Payment Details:</strong> ${invoiceData.payment_details}</div>` : ''}
            ${invoiceData.payment_instructions ? `<div class="detail-line"><strong>Instructions:</strong> ${invoiceData.payment_instructions}</div>` : ''}
          </div>

          ${invoiceData.notes ? `
            <div class="notes-section">
              <div class="section-title">Additional Notes</div>
              <p>${invoiceData.notes}</p>
            </div>
          ` : ''}
          
          <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p>Thank you for your business!</p>
            <p>This invoice was generated on ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </body>
      </html>
    `;
  };

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const selectedProject = projects?.find(p => p.id === data.project_id);
      if (!selectedProject) throw new Error('Project not found');

      setIsGenerating(true);
      
      try {
        // Generate the HTML content for the invoice
        const htmlContent = generateInvoiceHTML(data, selectedProject);
        
        // Convert HTML to blob
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const fileName = `invoice-${data.invoice_number}.html`;
        const filePath = `invoices/${user.id}/${fileName}`;

        // Upload the invoice file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(filePath, blob, {
            contentType: 'text/html',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Create a document record in the database
        const { error: dbError } = await supabase
          .from('project_documents')
          .insert({
            project_id: data.project_id,
            document_name: fileName,
            document_type: 'invoice',
            file_path: filePath,
            file_size: blob.size,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;

        return data;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-documents'] });
      queryClient.invalidateQueries({ queryKey: ['client-invoices'] });
      toast({
        title: 'Invoice Created & Sent',
        description: 'Professional invoice has been created and sent to the client. They can now view it in their dashboard.',
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
          Send Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Create Professional Invoice
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive business invoice that will be automatically sent to your client.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Invoice Info */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    name="invoice_date"
                    rules={{ required: 'Invoice date is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle>Your Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    rules={{ required: 'Company name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your Business Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 98765 43210" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Company Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="123 Business Street, City, State, PIN Code" rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN (GST Registration Number)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="22AAAAA0000A1Z5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name/Company</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Client's full name or company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client GSTIN (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Client's GST number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Client Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Client's billing address" rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
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
                          <FormLabel>Rate (₹)</FormLabel>
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
                          <FormLabel>Amount (₹)</FormLabel>
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
                    <span>{formatIndianCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="paytm">Paytm</SelectItem>
                            <SelectItem value="phonepe">PhonePe</SelectItem>
                            <SelectItem value="gpay">Google Pay</SelectItem>
                            <SelectItem value="razorpay">Razorpay</SelectItem>
                            <SelectItem value="check">Cheque</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Details</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Account number, UPI ID, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_instructions"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Payment Instructions</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional payment instructions..." rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Terms and conditions, thank you note, etc..."
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
                {isGenerating ? 'Creating & Sending Invoice...' : 'Create & Send Invoice'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
