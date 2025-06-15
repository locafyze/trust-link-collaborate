
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  client_email TEXT NOT NULL,
  contractor_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Contractors can view their own projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete their own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = contractor_id);
