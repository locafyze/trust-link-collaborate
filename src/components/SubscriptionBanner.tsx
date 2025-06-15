
import React from 'react';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionBannerProps {
  onUpgrade: (type: 'subscription' | 'project') => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ onUpgrade }) => {
  const { hasActiveSubscription, availableCredits, loading } = useSubscription();

  if (loading) return null;

  if (!hasActiveSubscription) {
    return (
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-800">
            Your subscription has expired. Projects are frozen. Subscribe to reactivate them.
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUpgrade('subscription')}
            className="ml-4"
          >
            Subscribe ₹199/month
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (availableCredits === 0) {
    return (
      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <CreditCard className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-yellow-800">
            No project credits remaining. Purchase credits to create new projects.
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUpgrade('project')}
            className="ml-4"
          >
            Buy Credit ₹499
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SubscriptionBanner;
