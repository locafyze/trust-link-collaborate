
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, Download, Calendar, User, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from './DocumentUpload';
import { Badge } from '@/components/ui/badge';

interface ProjectDocumentsProps {
  projectId: string;
  isContractor?: boolean;
}

interface ProjectDocument {
  id: string;
  document_name: string;
  document_type: 'contract' | 'invoice';
  file_path: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

const ProjectDocuments = ({ projectId, isContractor = false }: ProjectDocumentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: async () => {
      console.log('Fetching documents for project:', projectId);
      
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log('Fetched documents:', data);
      return data as ProjectDocument[];
    },
    enabled: !!user && !!projectId,
  });

  const handleDownload = async (document: ProjectDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.document_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: `${document.document_name} is downloading.`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'invoice':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Project Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Project Documents
            {documents && documents.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {documents.length}
              </Badge>
            )}
          </CardTitle>
          {isContractor && (
            <DocumentUpload projectId={projectId} onDocumentUploaded={refetch} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            {isContractor ? 'No documents uploaded yet. Upload contracts and invoices using the button above.' : 'No documents available for this project.'}
          </p>
        ) : (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="flex items-center">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  {isOpen ? 'Hide Documents' : 'Show Documents'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <h4 className="font-medium text-sm">{document.document_name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Badge className={getDocumentTypeColor(document.document_type)}>
                          {document.document_type}
                        </Badge>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(document.created_at).toLocaleDateString()}
                        </span>
                        <span>{formatFileSize(document.file_size)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDocuments;
