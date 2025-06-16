
import React from 'react';

interface SubscriptionBannerProps {
  onUpgrade: (type: 'subscription' | 'project') => void;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ onUpgrade }) => {
  // Return null to hide the banner completely for free access
  return null;
};

export default SubscriptionBanner;
