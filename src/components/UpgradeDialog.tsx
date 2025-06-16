
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Calendar } from 'lucide-react';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'project' | 'subscription';
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({ open, onOpenChange, type, onSuccess }) => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (paymentType: 'project_credit' | 'subscription') => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to continue',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      const amount = paymentType === 'project_credit' ? 499 : 199;

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount,
          currency: 'INR',
          paymentType,
          userId: user.id
        }
      });

      if (orderError) throw orderError;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TrustLayer',
        description: paymentType === 'project_credit' ? 'Additional Project Credit' : 'Monthly Subscription',
        order_id: orderData.orderId,
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async (response: any) => {
          try {
            const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                userId: user.id
              }
            });

            if (verifyError) throw verifyError;

            toast({
              title: 'Payment Successful!',
              description: paymentType === 'project_credit' 
                ? 'Your project credit has been added successfully.'
                : 'Your subscription is now active!',
            });

            onSuccess?.();
            onOpenChange(false);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support if the amount was deducted.',
              variant: 'destructive',
            });
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'project' ? 'Purchase Project Credit' : 'Subscribe to Monthly Plan'}
          </DialogTitle>
          <DialogDescription>
            {type === 'project' 
              ? 'Get an additional project credit to create more projects.'
              : 'Subscribe to keep your projects active and unlock premium features.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {type === 'project' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Project Credit
                  <Badge variant="secondary">₹499</Badge>
                </CardTitle>
                <CardDescription>
                  One-time payment for additional project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>1 additional project credit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No expiry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>All project features included</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePayment('project_credit')}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? 'Processing...' : 'Pay ₹499'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Subscription
                  <Badge variant="secondary">₹199/month</Badge>
                </CardTitle>
                <CardDescription>
                  Keep your projects active and access premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited active projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Advanced features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Projects won't freeze</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePayment('subscription')}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? 'Processing...' : 'Subscribe for ₹199/month'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
