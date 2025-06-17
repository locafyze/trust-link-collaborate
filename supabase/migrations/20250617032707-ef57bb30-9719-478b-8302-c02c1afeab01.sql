
-- Add metadata column to project_documents table to store invoice status and amount
ALTER TABLE public.project_documents 
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
