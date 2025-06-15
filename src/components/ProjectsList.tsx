
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User } from 'lucide-react';

interface Project {
  id: string;
  project_name: string;
  start_date: string;
  end_date: string;
  client_email: string;
  created_at: string;
}

const ProjectsList = () => {
  const { user } = useAuth();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['contractor-projects', user?.id],
    queryFn: async () => {
      console.log('Fetching projects for contractor:', user?.id);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('contractor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Fetched projects:', data);
      return data as Project[];
    },
    enabled: !!user?.id,
  });

  const getProjectStatus = (project: Project) => {
    const now = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);

    if (now < startDate) {
      return { status: 'Planning', variant: 'secondary' as const };
    } else if (now <= endDate) {
      return { status: 'Ongoing', variant: 'default' as const };
    } else {
      return { status: 'Completed', variant: 'outline' as const };
    }
  };

  const getMilestoneProgress = (project: Project) => {
    // Mock milestone calculation based on time elapsed
    const now = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    if (elapsed < 0) return 0; // Project hasn't started
    if (elapsed > totalDuration) return 100; // Project is complete
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Loading your projects...</CardDescription>
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
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Error loading projects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load projects. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>You haven't created any projects yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Get started by adding your first project using the "Add New Project" button above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Projects</CardTitle>
        <CardDescription>Manage and track your project progress</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Timeline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const { status, variant } = getProjectStatus(project);
              const progress = getMilestoneProgress(project);
              
              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.project_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      {project.client_email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant}>{status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={progress} className="w-16" />
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectsList;
