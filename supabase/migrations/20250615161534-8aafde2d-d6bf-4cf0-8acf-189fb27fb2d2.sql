
-- Add RLS policies so clients can view projects where their email matches
CREATE POLICY "Clients can view projects they are associated with"
  ON public.projects
  FOR SELECT
  USING (client_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Also ensure we have an index on client_email for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects(client_email);
