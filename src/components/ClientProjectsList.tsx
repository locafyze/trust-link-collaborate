
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import ClientProjectCard from './ClientProjectCard';

const ClientProjectsList = () => {
  // Mock project data - in a real app, this would come from the database
  const mockProjects = [
    { id: '1', name: 'Kitchen Renovation', contractor: 'Elite Builders', status: 'In Progress', progress: 60, budget: '$35,000' },
    { id: '2', name: 'Bathroom Remodel', contractor: 'Modern Homes', status: 'Planning', progress: 15, budget: '$18,000' },
    { id: '3', name: 'Deck Installation', contractor: 'Outdoor Pro', status: 'Starting Soon', progress: 0, budget: '$12,000' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="h-5 w-5 mr-2" />
          Active Projects
        </CardTitle>
        <CardDescription>Your current construction projects with documents and communications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockProjects.map((project) => (
            <ClientProjectCard key={project.id} project={project} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProjectsList;
