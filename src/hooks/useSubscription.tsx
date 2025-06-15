
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  hasActiveSubscription: boolean;
  availableCredits: number;
  loading: boolean;
  refreshData: () => Promise<void>;
}

export const useSubscription = (): SubscriptionData => {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check subscription status
      const { data: subscriptionStatus } = await supabase
        .rpc('check_subscription_status', { user_id_param: user.id });

      // Get available credits
      const { data: credits } = await supabase
        .rpc('get_available_credits', { user_id_param: user.id });

      setHasActiveSubscription(subscriptionStatus || false);
      setAvailableCredits(credits || 0);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
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
    refreshData
  };
};
