
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Settings } from 'lucide-react';
import AddProjectDialog from './AddProjectDialog';

interface QuickActionsProps {
  onProjectAdded: () => void;
}

const QuickActions = ({ onProjectAdded }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <AddProjectDialog onProjectAdded={onProjectAdded} />
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <DollarSign className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
