
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Clock, DollarSign, Calendar } from 'lucide-react';
import AnimatedStatsCard from './AnimatedStatsCard';

const ContractorStats = () => {
  const { profile } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ['contractor-projects', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('contractor_id', profile.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: milestones } = useQuery({
    queryKey: ['contractor-milestones', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('milestones')
        .select('*, projects!inner(*)')
        .eq('projects.contractor_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: payments } = useQuery({
    queryKey: ['contractor-payments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*, milestones!inner(*, projects!inner(*))')
        .eq('milestones.projects.contractor_id', profile.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const totalProjects = projects?.length || 0;
  // Calculate active projects as those with end_date in the future
  const activeProjects = projects?.filter(p => new Date(p.end_date) > new Date())?.length || 0;
  const totalEarnings = payments?.filter(p => p.status === 'paid')?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const pendingEarnings = payments?.filter(p => p.status === 'pending')?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const nextMilestone = milestones?.[0];
  // Calculate days since milestone creation as a simple metric
  const daysSinceLastMilestone = nextMilestone 
    ? Math.ceil((new Date().getTime() - new Date(nextMilestone.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AnimatedStatsCard
        title="Total Projects"
        value={totalProjects}
        subtitle={`${activeProjects} active`}
        icon={Home}
        iconColor="text-blue-600"
        delay={0.1}
      />
      <AnimatedStatsCard
        title="Total Earnings"
        value={`$${totalEarnings.toLocaleString()}`}
        subtitle={`$${pendingEarnings.toLocaleString()} pending`}
        icon={DollarSign}
        iconColor="text-green-600"
        delay={0.2}
      />
      <AnimatedStatsCard
        title="Active Projects"
        value={activeProjects}
        subtitle="Currently working"
        icon={Clock}
        iconColor="text-yellow-600"
        delay={0.3}
      />
      <AnimatedStatsCard
        title="Recent Activity"
        value={daysSinceLastMilestone !== null ? `${daysSinceLastMilestone} days` : 'None'}
        subtitle={nextMilestone?.title || 'No recent milestones'}
        icon={Calendar}
        iconColor="text-red-600"
        delay={0.4}
      />
    </div>
  );
};

export default ContractorStats;
