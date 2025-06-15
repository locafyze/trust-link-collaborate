
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ClientProjectCard from './ClientProjectCard';
import MobileProjectCard from './MobileProjectCard';

interface Project {
  id: string;
  project_name: string;
  start_date: string;
  end_date: string;
  client_email: string;
  contractor_id: string;
  created_at: string;
}

const ClientProjectsList = () => {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['client-projects', profile?.email],
    queryFn: async () => {
      console.log('Fetching projects for client:', profile?.email);
      console.log('Current user profile:', profile);
      
      if (!profile?.email) {
        throw new Error('No client email available');
      }
      
      // First, let's check all projects in the database for debugging
      const { data: allProjects, error: allProjectsError } = await supabase
        .from('projects')
        .select('*');
      
      console.log('All projects in database:', allProjects);
      console.log('Error fetching all projects:', allProjectsError);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_email', profile.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client projects:', error);
        throw error;
      }

      console.log('Fetched client projects:', data);
      console.log('Query was looking for client_email:', profile.email);
      
      // Let's also log what emails exist in the projects
      if (allProjects) {
        console.log('Client emails in all projects:', allProjects.map(p => p.client_email));
      }
      
      return data as Project[];
    },
    enabled: !!profile?.email,
  });

  // Transform database projects to match the expected format
  const transformedProjects = projects?.map((project) => {
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
    } else if (now < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      status = daysUntilStart <= 7 ? 'Starting Soon' : 'Planning';
    }
    
    return {
      id: project.id,
      name: project.project_name,
      contractor: project.contractor_id, // You might want to fetch contractor name later
      status,
      progress,
      budget: 'TBD', // You might want to add budget field to the database
    };
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className={isMobile ? 'pb-4' : ''}>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Active Projects
          </CardTitle>
          <CardDescription className="text-sm">
            Loading your projects...
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
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
        <CardHeader className={isMobile ? 'pb-4' : ''}>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Active Projects
          </CardTitle>
          <CardDescription className="text-sm">
            Error loading projects
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          <p className="text-red-600">Failed to load projects. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-4' : ''}>
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Active Projects
        </CardTitle>
        <CardDescription className="text-sm">
          {transformedProjects.length === 0 
            ? "No projects found. Ask your contractor to add you to a project."
            : "Your current construction projects with documents and communications"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? 'pt-0' : ''}>
        {transformedProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any projects yet. Once a contractor adds you to a project, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {transformedProjects.map((project) => 
              isMobile ? (
                <MobileProjectCard key={project.id} project={project} />
              ) : (
                <ClientProjectCard key={project.id} project={project} />
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientProjectsList;
