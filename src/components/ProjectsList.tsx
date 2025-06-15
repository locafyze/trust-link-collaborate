import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AddMilestoneDialog from './AddMilestoneDialog';
import AddPaymentRequestDialog from './AddPaymentRequestDialog';
import ProjectDocuments from './ProjectDocuments';

interface Project {
  id: string;
  project_name: string;
  start_date: string;
  end_date: string;
  client_email: string;
  created_at: string;
}

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
}

interface PaymentRequest {
  id: string;
  milestone_id: string;
  amount: number;
  status: string;
}

const ProjectsList = () => {
  const { user } = useAuth();
  const [expandedProjects, setExpandedProjects] = React.useState<Set<string>>(new Set());

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

  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', user?.id],
    queryFn: async () => {
      console.log('Fetching milestones for contractor projects:', user?.id);
      
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!inner(contractor_id)
        `)
        .eq('projects.contractor_id', user?.id);

      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }

      console.log('Fetched milestones:', data);
      return data as Milestone[];
    },
    enabled: !!user?.id,
  });

  const { data: paymentRequests } = useQuery({
    queryKey: ['payment-requests-overview', user?.id],
    queryFn: async () => {
      console.log('Fetching payment requests overview:', user?.id);
      
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          milestones!inner(
            projects!inner(contractor_id)
          )
        `)
        .eq('milestones.projects.contractor_id', user?.id);

      if (error) {
        console.error('Error fetching payment requests:', error);
        throw error;
      }

      return data as PaymentRequest[];
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
    if (!milestones) return 0;
    
    const projectMilestones = milestones.filter(m => m.project_id === project.id);
    const milestoneCount = projectMilestones.length;
    
    if (milestoneCount === 0) return 0;
    
    // For now, we'll calculate progress based on time elapsed vs milestones added
    // This is a simple approach - in a real app, you might have completion status per milestone
    const now = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    if (elapsed < 0) return 0;
    if (elapsed > totalDuration) return 100;
    
    const timeProgress = (elapsed / totalDuration) * 100;
    const milestoneBonus = Math.min(milestoneCount * 10, 30); // Up to 30% bonus for milestones
    
    return Math.min(Math.round(timeProgress + milestoneBonus), 100);
  };

  const getMilestoneCount = (projectId: string) => {
    if (!milestones) return 0;
    return milestones.filter(m => m.project_id === projectId).length;
  };

  const getPaymentRequestsCount = (projectId: string) => {
    if (!milestones || !paymentRequests) return 0;
    const projectMilestones = milestones.filter(m => m.project_id === projectId);
    return paymentRequests.filter(pr => 
      projectMilestones.some(m => m.id === pr.milestone_id)
    ).length;
  };

  const getLatestMilestone = (projectId: string) => {
    if (!milestones) return null;
    const projectMilestones = milestones
      .filter(m => m.project_id === projectId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return projectMilestones[0] || null;
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
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
    <div className="space-y-6">
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const { status, variant } = getProjectStatus(project);
                const progress = getMilestoneProgress(project);
                const milestoneCount = getMilestoneCount(project.id);
                const paymentRequestsCount = getPaymentRequestsCount(project.id);
                const latestMilestone = getLatestMilestone(project.id);
                const isExpanded = expandedProjects.has(project.id);
                
                return (
                  <React.Fragment key={project.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProjectExpansion(project.id)}
                            className="p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <div>{project.project_name}</div>
                            <div className="text-sm text-gray-500">
                              {milestoneCount} milestone{milestoneCount !== 1 ? 's' : ''}
                              {paymentRequestsCount > 0 && (
                                <span className="ml-2 inline-flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {paymentRequestsCount} payment{paymentRequestsCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
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
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <AddMilestoneDialog projectId={project.id} />
                          {latestMilestone && (
                            <AddPaymentRequestDialog 
                              milestoneId={latestMilestone.id} 
                              milestoneTitle={latestMilestone.title}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-4 bg-gray-50">
                          <ProjectDocuments projectId={project.id} isContractor={true} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsList;
