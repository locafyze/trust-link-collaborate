
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';

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
  onSigningUpdate?: () => void;
}

const ContractSigningToggle = ({ document, projectId, projectName, onSigningUpdate }: ContractSigningToggleProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleSigningToggle = async (checked: boolean) => {
    if (!user || document.document_type !== 'contract') return;

    setIsUpdating(true);
    try {
      const updateData = checked 
        ? {
            is_signed: true,
            signed_at: new Date().toISOString(),
            signed_by: user.id,
          }
        : {
            is_signed: false,
            signed_at: null,
            signed_by: null,
          };

      const { error } = await supabase
        .from('project_documents')
        .update(updateData)
        .eq('id', document.id);

      if (error) throw error;

      if (checked) {
        // Send notification to contractor
        try {
          // Get contractor details
          const { data: project } = await supabase
            .from('projects')
            .select(`
              contractor_id,
              profiles!inner(full_name, email)
            `)
            .eq('id', projectId)
            .single();

          if (project) {
            await fetch('/functions/v1/notify-contract-signed', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contractorEmail: project.profiles.email,
                contractorName: project.profiles.full_name || 'Contractor',
                projectName: projectName,
                documentName: document.document_name,
                clientName: profile?.full_name || 'Client',
              }),
            });
          }
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Don't fail the signing process if email fails
        }

        toast({
          title: 'Contract signed successfully',
          description: `${document.document_name} has been marked as signed. The contractor has been notified.`,
        });
      } else {
        toast({
          title: 'Contract unsigned',
          description: `${document.document_name} has been marked as unsigned.`,
        });
      }

      onSigningUpdate?.();
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

  if (document.document_type !== 'contract') {
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
          <Switch
            checked={document.is_signed || false}
            onCheckedChange={handleSigningToggle}
            disabled={isUpdating}
          />
          <Label htmlFor="contract-signing" className="text-sm">
            Mark as Signed
          </Label>
        </div>
      )}
    </div>
  );
};

export default ContractSigningToggle;
