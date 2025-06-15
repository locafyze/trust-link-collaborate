
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Home, MessageSquare, Calendar, DollarSign, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ProjectChat from './ProjectChat';

const ClientQuickActions = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{id: string, name: string} | null>(null);

  // Fetch client's projects for messaging
  const { data: projects } = useQuery({
    queryKey: ['client-projects', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name')
        .eq('client_email', profile.email);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.email,
  });

  const handleStartNewProject = () => {
    // Open email to contact contractor
    const subject = encodeURIComponent('New Project Inquiry');
    const body = encodeURIComponent('Hi,\n\nI would like to start a new project. Please contact me to discuss the details.\n\nThank you!');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Project Inquiry Email Created",
      description: "Your email client has opened with a project inquiry template.",
    });
  };

  const handleMessageContractor = () => {
    if (!projects || projects.length === 0) {
      toast({
        title: "No Projects Found",
        description: "You need to have an active project to message your contractor.",
        variant: "destructive",
      });
      return;
    }

    // If only one project, open chat directly
    if (projects.length === 1) {
      setSelectedProject({ id: projects[0].id, name: projects[0].project_name });
      setIsChatDialogOpen(true);
    } else {
      // For multiple projects, we'll use the first one for now
      // In a more complete implementation, you'd show a project selector
      setSelectedProject({ id: projects[0].id, name: projects[0].project_name });
      setIsChatDialogOpen(true);
      
      toast({
        title: "Chat Opened",
        description: `Opening chat for project: ${projects[0].project_name}`,
      });
    }
  };

  const handleScheduleSiteVisit = () => {
    // Open email for site visit scheduling
    const subject = encodeURIComponent('Site Visit Request');
    const body = encodeURIComponent('Hi,\n\nI would like to schedule a site visit for our project. Please let me know your availability.\n\nThank you!');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Site Visit Email Created",
      description: "Your email client has opened with a site visit request template.",
    });
  };

  const handleViewInvoices = () => {
    // For now, show info about invoices
    toast({
      title: "Invoice Information",
      description: "Invoice viewing feature is being developed. Check your email for invoice notifications.",
    });
  };

  const handleAccountSettings = () => {
    navigate('/settings');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your projects and communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleStartNewProject}
            >
              <Home className="h-4 w-4 mr-2" />
              Start New Project
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleMessageContractor}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Contractor
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleScheduleSiteVisit}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Site Visit
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleViewInvoices}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              View Invoices
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleAccountSettings}
            >
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Message Your Contractor</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="overflow-y-auto">
              <ProjectChat
                projectId={selectedProject.id}
                projectName={selectedProject.name}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientQuickActions;
