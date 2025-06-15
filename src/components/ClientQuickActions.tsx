
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare, Calendar, DollarSign, Settings } from 'lucide-react';

const ClientQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your projects and communications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Button className="w-full justify-start" variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Start New Project
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message Contractor
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Site Visit
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <DollarSign className="h-4 w-4 mr-2" />
            View Invoices
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientQuickActions;
