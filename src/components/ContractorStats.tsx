
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const ContractorStats = () => {
  const { user } = useAuth();

  const { data: projectStats } = useQuery({
    queryKey: ['contractor-project-stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('contractor_id', user?.id);

      if (error) throw error;

      const now = new Date();
      const totalProjects = data.length;
      const activeProjects = data.filter(project => {
        const endDate = new Date(project.end_date);
        return endDate >= now;
      }).length;

      return { totalProjects, activeProjects };
    },
    enabled: !!user?.id,
  });

  const { data: earningsData } = useQuery({
    queryKey: ['contractor-earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          amount,
          status,
          milestones!inner(
            projects!inner(contractor_id)
          )
        `)
        .eq('milestones.projects.contractor_id', user?.id);

      if (error) throw error;

      const totalEarnings = data
        .filter(payment => payment.status === 'paid')
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      const pendingEarnings = data
        .filter(payment => payment.status === 'pending')
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      return { totalEarnings, pendingEarnings };
    },
    enabled: !!user?.id,
  });

  const { data: upcomingDeadlines } = useQuery({
    queryKey: ['contractor-deadlines', user?.id],
    queryFn: async () => {
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

      const { data, error } = await supabase
        .from('projects')
        .select('end_date')
        .eq('contractor_id', user?.id)
        .lte('end_date', oneWeekFromNow.toISOString())
        .gte('end_date', new Date().toISOString());

      if (error) throw error;
      return data.length;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Briefcase className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectStats?.totalProjects || 0}</div>
          <p className="text-xs text-gray-600">All time projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectStats?.activeProjects || 0}</div>
          <p className="text-xs text-gray-600">Currently ongoing</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${earningsData?.totalEarnings?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-gray-600">
            ${earningsData?.pendingEarnings?.toLocaleString() || '0'} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          <Calendar className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingDeadlines || 0}</div>
          <p className="text-xs text-gray-600">This week</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorStats;
