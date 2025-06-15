
-- Create messages table for in-app messaging
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contractor', 'client')),
  message_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages for their projects"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = messages.project_id 
      AND (
        projects.contractor_id = auth.uid() OR 
        projects.client_email = (
          SELECT email FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can send messages for their projects"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = messages.project_id 
      AND (
        projects.contractor_id = auth.uid() OR 
        projects.client_email = (
          SELECT email FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- Create index for better performance
CREATE INDEX idx_messages_project_id_created_at ON public.messages(project_id, created_at DESC);
