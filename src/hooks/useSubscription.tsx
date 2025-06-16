
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  hasActiveSubscription: boolean;
  availableCredits: number;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  onUpgrade: (type: 'subscription' | 'project') => void;
}

export const useSubscription = (): SubscriptionData => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, return free access values
  const hasActiveSubscription = true; // Always true for free access
  const availableCredits = 999; // Unlimited credits

  const refreshData = async () => {
    // No-op for now since we're not checking subscriptions
    setLoading(false);
  };

  const onUpgrade = (type: 'subscription' | 'project') => {
    // For now, just log the upgrade request
    console.log('Upgrade requested:', type, '- Feature temporarily disabled');
  };

  return {
    hasActiveSubscription,
    availableCredits,
    loading,
    error,
    refreshData,
    onUpgrade
  };
};
