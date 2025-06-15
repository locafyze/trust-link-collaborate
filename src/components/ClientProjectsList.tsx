
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ClientProjectCard from './ClientProjectCard';
import MobileProjectCard from './MobileProjectCard';

const ClientProjectsList = () => {
  const isMobile = useIsMobile();
  
  // Mock project data - in a real app, this would come from the database
  const mockProjects = [
    { id: '1', name: 'Kitchen Renovation', contractor: 'Elite Builders', status: 'In Progress', progress: 60, budget: '$35,000' },
    { id: '2', name: 'Bathroom Remodel', contractor: 'Modern Homes', status: 'Planning', progress: 15, budget: '$18,000' },
    { id: '3', name: 'Deck Installation', contractor: 'Outdoor Pro', status: 'Starting Soon', progress: 0, budget: '$12,000' },
  ];

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-4' : ''}>
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Active Projects
        </CardTitle>
        <CardDescription className="text-sm">
          Your current construction projects with documents and communications
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? 'pt-0' : ''}>
        <div className="space-y-3 sm:space-y-4">
          {mockProjects.map((project) => 
            isMobile ? (
              <MobileProjectCard key={project.id} project={project} />
            ) : (
              <ClientProjectCard key={project.id} project={project} />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProjectsList;
