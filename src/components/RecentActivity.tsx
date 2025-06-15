
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RecentActivity = () => {
  const { user } = useAuth();

  const { data: recentProjects } = useQuery({
    queryKey: ['recent-projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('contractor_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      return data.map(project => {
        const now = new Date();
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);
        
        let status = 'Planning';
        let progress = 0;
        
        if (now >= startDate && now <= endDate) {
          status = 'In Progress';
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          progress = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
        } else if (now > endDate) {
          status = 'Completed';
          progress = 100;
        }

        return {
          ...project,
          status,
          progress
        };
      });
    },
    enabled: !!user?.id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest project updates and milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProjects?.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">{project.project_name}</h4>
                <p className="text-sm text-gray-600">{project.client_email}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
                <div className="text-sm text-gray-600 mt-1">{project.progress}%</div>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-4">
              No recent projects found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
