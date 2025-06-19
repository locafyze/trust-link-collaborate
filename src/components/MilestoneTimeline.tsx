import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image, Video, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  projects: {
    project_name: string;
  };
}

const MilestoneTimeline = () => {
  const { user } = useAuth();

  const { data: milestones, isLoading, error } = useQuery({
    queryKey: ['client-milestones', user?.email],
    queryFn: async () => {
      console.log('Fetching milestones for client:', user?.email);
      
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!inner(project_name, client_email)
        `)
        .eq('projects.client_email', user?.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }

      console.log('Fetched client milestones:', data);
      return data as Milestone[];
    },
    enabled: !!user?.email,
  });

  const renderMediaPreview = (milestone: Milestone) => {
    if (!milestone.media_url) {
      return (
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      );
    }

    if (milestone.media_type === 'image') {
      return (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={milestone.media_url}
            alt={milestone.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = '';
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Image className="h-6 w-6 text-white" />
          </div>
        </div>
      );
    }

    if (milestone.media_type === 'video') {
      return (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          <video
            src={milestone.media_url}
            className="w-full h-full object-cover"
            muted
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <Video className="h-6 w-6 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Loading milestone progress...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Error loading timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load project timeline. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>No milestones yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Your contractor hasn't added any milestones yet. Check back soon for updates!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
        <CardDescription>Track the progress of your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400 to-gray-200"></div>
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex items-start space-x-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                </div>
                
                {/* Milestone content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      {/* Media preview */}
                      <div className="flex-shrink-0">
                        {renderMediaPreview(milestone)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {milestone.title}
                          </h4>
                          <Badge variant="outline" className="mt-1 sm:mt-0 self-start sm:self-center">
                            {milestone.projects.project_name}
                          </Badge>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                            {milestone.description}
                          </p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(milestone.created_at), 'PPP')} at {format(new Date(milestone.created_at), 'p')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Timeline end */}
          <div className="relative flex items-center space-x-4 mt-6">
            <div className="relative z-10 flex-shrink-0">
              <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-md"></div>
            </div>
            <div className="text-sm text-gray-500 italic">
              Project started
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTimeline;