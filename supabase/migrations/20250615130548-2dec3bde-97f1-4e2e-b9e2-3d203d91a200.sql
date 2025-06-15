
-- Add signed status tracking to project_documents table
ALTER TABLE public.project_documents 
ADD COLUMN is_signed BOOLEAN DEFAULT FALSE,
ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN signed_by UUID REFERENCES auth.users(id);

-- Update the policy to allow clients to update signing status for contracts
CREATE POLICY "Clients can mark contracts as signed for their projects"
ON public.project_documents
FOR UPDATE
TO authenticated
USING (
  document_type = 'contract' AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_documents.project_id 
    AND projects.client_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  )
)
WITH CHECK (
  document_type = 'contract' AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_documents.project_id 
    AND projects.client_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  )
);
