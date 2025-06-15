
-- Create milestones table
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for milestones table
CREATE POLICY "Contractors can view milestones for their projects"
  ON public.milestones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = milestones.project_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can create milestones for their projects"
  ON public.milestones
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = milestones.project_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can update milestones for their projects"
  ON public.milestones
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = milestones.project_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can delete milestones for their projects"
  ON public.milestones
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = milestones.project_id 
      AND projects.contractor_id = auth.uid()
    )
  );

-- Create storage bucket for milestone media
INSERT INTO storage.buckets (id, name, public)
VALUES ('milestone-media', 'milestone-media', true);

-- Create storage policies for milestone media
CREATE POLICY "Anyone can view milestone media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'milestone-media');

CREATE POLICY "Contractors can upload milestone media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'milestone-media' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Contractors can update their milestone media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'milestone-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Contractors can delete their milestone media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'milestone-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
