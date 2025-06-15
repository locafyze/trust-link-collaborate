
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import AddProjectDialog from './AddProjectDialog';
import CreateInvoiceDialog from './CreateInvoiceDialog';

interface QuickActionsProps {
  onProjectAdded: () => void;
}

const QuickActions = ({ onProjectAdded }: QuickActionsProps) => {
  const navigate = useNavigate();

  const handleScheduleMeeting = () => {
    // Open default calendar app or create a simple meeting scheduler
    const subject = encodeURIComponent('Project Meeting');
    const body = encodeURIComponent('Meeting to discuss project details and progress.');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Meeting Email Created",
      description: "Your email client has opened with a meeting invitation template.",
    });
  };

  const handleManageProfile = () => {
    navigate('/settings');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <AddProjectDialog onProjectAdded={onProjectAdded} />
          <CreateInvoiceDialog />
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleScheduleMeeting}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleManageProfile}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
