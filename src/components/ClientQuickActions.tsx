
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare, Calendar, DollarSign, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ClientQuickActions = () => {
  const navigate = useNavigate();

  const handleStartNewProject = () => {
    toast({
      title: "Start New Project",
      description: "Please contact a contractor to start a new project. They will add you to the project.",
    });
  };

  const handleMessageContractor = () => {
    toast({
      title: "Message Contractor",
      description: "Messaging feature will be available soon.",
    });
  };

  const handleScheduleSiteVisit = () => {
    toast({
      title: "Schedule Site Visit",
      description: "Site visit scheduling will be available soon.",
    });
  };

  const handleViewInvoices = () => {
    toast({
      title: "View Invoices",
      description: "Invoice viewing feature will be available soon.",
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
