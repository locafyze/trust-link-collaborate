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
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
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
        .select('*, projects!inner(*)')
        .eq('projects.contractor_id', profile.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active')?.length || 0;
  const totalEarnings = payments?.filter(p => p.status === 'paid')?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const pendingEarnings = payments?.filter(p => p.status === 'pending')?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const nextMilestone = milestones?.[0];
  const daysUntilNextMilestone = nextMilestone 
    ? Math.ceil((new Date(nextMilestone.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
        title="Next Deadline"
        value={daysUntilNextMilestone !== null ? `${daysUntilNextMilestone} days` : 'None'}
        subtitle={nextMilestone?.title || 'No upcoming deadlines'}
        icon={Calendar}
        iconColor="text-red-600"
        delay={0.4}
      />
    </div>
  );
};

export default ContractorStats;
