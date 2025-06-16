
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  hasActiveSubscription: boolean;
  availableCredits: number;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useSubscription = (): SubscriptionData => {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      
      // Check subscription status with proper error handling
      const { data: subscriptionStatus, error: subError } = await supabase
        .rpc('check_subscription_status', { user_id_param: user.id });

      if (subError) {
        console.error('Subscription status error:', subError);
        setError('Failed to check subscription status');
        return;
      }

      // Get available credits with proper error handling
      const { data: credits, error: creditsError } = await supabase
        .rpc('get_available_credits', { user_id_param: user.id });

      if (creditsError) {
        console.error('Credits error:', creditsError);
        setError('Failed to get available credits');
        return;
      }

      setHasActiveSubscription(subscriptionStatus || false);
      setAvailableCredits(credits || 0);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  const refreshData = async () => {
    setLoading(true);
    await fetchSubscriptionData();
  };

  return {
    hasActiveSubscription,
    availableCredits,
    loading,
    error,
    refreshData
  };
};
