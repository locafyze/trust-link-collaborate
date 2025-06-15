
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  DollarSign, 
  FileText, 
  MessageSquare,
  MoreVertical 
} from 'lucide-react';
import ProjectDocuments from './ProjectDocuments';
import ProjectChat from './ProjectChat';

interface MobileProjectCardProps {
  project: {
    id: string;
    name: string;
    contractor: string;
    status: string;
    progress: number;
    budget: string;
  };
  isContractor?: boolean;
}

const MobileProjectCard = ({ project, isContractor = false }: MobileProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Starting Soon': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {project.contractor}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {project.budget}
              </span>
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
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Project Documents</DialogTitle>
                      </DialogHeader>
                      <ProjectDocuments 
                        projectId={project.id} 
                        projectName={project.name}
                        isContractor={isContractor}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Project Chat</DialogTitle>
                      </DialogHeader>
                      <ProjectChat
                        projectId={project.id}
                        projectName={project.name}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default MobileProjectCard;
