
-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', true);

-- Create storage policies for project documents
CREATE POLICY "Allow authenticated users to upload project documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-documents');

CREATE POLICY "Allow authenticated users to view project documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'project-documents');

CREATE POLICY "Allow contractors to delete their project documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE contractor_id = auth.uid() 
    AND id::text = split_part(name, '/', 1)
  )
);

-- Create project_documents table
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'invoice')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Allow contractors to manage documents for their projects
CREATE POLICY "Contractors can manage documents for their projects"
ON public.project_documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_documents.project_id 
    AND projects.contractor_id = auth.uid()
  )
);

-- Allow clients to view documents for projects where they are the client
CREATE POLICY "Clients can view documents for their projects"
ON public.project_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_documents.project_id 
    AND projects.client_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  )
);
