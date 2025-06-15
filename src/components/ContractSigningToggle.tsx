
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ContractSigningToggleProps {
  document: {
    id: string;
    document_name: string;
    document_type: string;
    is_signed: boolean;
    signed_at: string | null;
    signed_by: string | null;
  };
  projectId: string;
  projectName: string;
  onSigningUpdate: () => void;
}

const ContractSigningToggle = ({ document, projectId, projectName, onSigningUpdate }: ContractSigningToggleProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSigningToggle = async (checked: boolean) => {
    if (!user || profile?.role !== 'client') return;

    setIsUpdating(true);
    try {
      const updateData = checked 
        ? {
            is_signed: true,
            signed_at: new Date().toISOString(),
            signed_by: user.id
          }
        : {
            is_signed: false,
            signed_at: null,
            signed_by: null
          };

      const { error } = await supabase
        .from('project_documents')
        .update(updateData)
        .eq('id', document.id);

      if (error) throw error;

      if (checked) {
        // Get contractor details for notification
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select(`
            contractor_id,
            profiles!projects_contractor_id_fkey(email, full_name)
          `)
          .eq('id', projectId)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError);
        } else if (project?.profiles) {
          // Send notification to contractor
          try {
            await supabase.functions.invoke('notify-contract-signed', {
              body: {
                contractorEmail: project.profiles.email,
                contractorName: project.profiles.full_name || 'Contractor',
                projectName: projectName,
                documentName: document.document_name,
                clientName: profile?.full_name || 'Client'
              }
            });
          } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
          }
        }

        toast({
          title: 'Contract signed successfully',
          description: `${document.document_name} has been marked as signed.`,
        });
      } else {
        toast({
          title: 'Contract unsigned',
          description: `${document.document_name} has been marked as unsigned.`,
        });
      }

      onSigningUpdate();
    } catch (error) {
      console.error('Error updating contract signing status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contract signing status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Only show for clients and contract documents
  if (profile?.role !== 'client' || document.document_type !== 'contract') {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {document.is_signed ? (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Signed</span>
          {document.signed_at && (
            <span className="text-xs text-gray-500">
              on {new Date(document.signed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-600">Awaiting signature</span>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch
          id={`sign-${document.id}`}
          checked={document.is_signed}
          onCheckedChange={handleSigningToggle}
          disabled={isUpdating}
        />
        <Label htmlFor={`sign-${document.id}`} className="text-sm">
          Mark as signed
        </Label>
      </div>
    </div>
  );
};

export default ContractSigningToggle;
