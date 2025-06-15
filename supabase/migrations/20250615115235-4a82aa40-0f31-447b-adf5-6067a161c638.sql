
-- Create payment_requests table
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_requests table
CREATE POLICY "Contractors can view payment requests for their milestones"
  ON public.payment_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.milestones 
      JOIN public.projects ON milestones.project_id = projects.id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can create payment requests for their milestones"
  ON public.payment_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.milestones 
      JOIN public.projects ON milestones.project_id = projects.id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can update payment requests for their milestones"
  ON public.payment_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.milestones 
      JOIN public.projects ON milestones.project_id = projects.id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can delete payment requests for their milestones"
  ON public.payment_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.milestones 
      JOIN public.projects ON milestones.project_id = projects.id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.contractor_id = auth.uid()
    )
  );

-- Create function to automatically update status based on due date
CREATE OR REPLACE FUNCTION public.update_payment_request_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status to overdue if due date has passed and status is still pending
  IF NEW.due_date < CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status = 'overdue';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update payment request status
CREATE TRIGGER update_payment_request_status_trigger
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_request_status();
