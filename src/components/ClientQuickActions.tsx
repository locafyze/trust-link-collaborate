
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare, Calendar, DollarSign, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ClientQuickActions = () => {
  const navigate = useNavigate();

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
    // Open email client for messaging
    const subject = encodeURIComponent('Project Communication');
    const body = encodeURIComponent('Hi,\n\nI wanted to discuss the following regarding our project:\n\n');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Email Client Opened",
      description: "Your email client has opened to message your contractor.",
    });
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
  );
};

export default ClientQuickActions;
