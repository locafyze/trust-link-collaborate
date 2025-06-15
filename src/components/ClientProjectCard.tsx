
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calendar, DollarSign, FileText, MessageSquare } from 'lucide-react';
import ProjectDocuments from './ProjectDocuments';
import ProjectChat from './ProjectChat';

interface ClientProjectCardProps {
  project: {
    id: string;
    name: string;
    contractor: string;
    status: string;
    progress: number;
    budget: string;
  };
}

const ClientProjectCard = ({ project }: ClientProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Starting Soon': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <p className="text-sm text-gray-600">{project.contractor}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <div className="text-sm font-medium text-green-600 mt-1">{project.budget}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Progress:</span>
            <Progress value={project.progress} className="w-20" />
            <span className="text-sm text-gray-600">{project.progress}%</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </span>
            <span className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </span>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProjectDocuments 
                projectId={project.id} 
                projectName={project.name}
                isContractor={false} 
              />
              <ProjectChat
                projectId={project.id}
                projectName={project.name}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ClientProjectCard;
