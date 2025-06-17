
-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.project_documents(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  bill_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create policies for bills table
CREATE POLICY "Clients can view their own bills"
  ON public.bills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.email = bills.client_email 
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Contractors can view bills for their projects"
  ON public.bills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = bills.project_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "System can insert bills"
  ON public.bills
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clients can update their own bills"
  ON public.bills
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.email = bills.client_email 
      AND profiles.id = auth.uid()
    )
  );

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to auto-generate bill number
CREATE OR REPLACE FUNCTION public.generate_bill_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  bill_count INTEGER;
  bill_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO bill_count FROM public.bills;
  bill_number := 'BILL-' || LPAD(bill_count::TEXT, 6, '0');
  RETURN bill_number;
END;
$$;

-- Create function to create bill when invoice is marked as paid
CREATE OR REPLACE FUNCTION public.create_bill_on_invoice_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invoice_amount DECIMAL(10,2);
  project_rec RECORD;
  client_user_id UUID;
  bill_number TEXT;
BEGIN
  -- Check if status changed to 'paid'
  IF NEW.metadata->>'status' = 'paid' AND 
     (OLD.metadata IS NULL OR OLD.metadata->>'status' != 'paid') THEN
    
    -- Get invoice amount from metadata
    invoice_amount := COALESCE((NEW.metadata->>'amount')::DECIMAL(10,2), 0);
    
    -- Get project details
    SELECT * INTO project_rec 
    FROM public.projects 
    WHERE id = NEW.project_id;
    
    -- Get client user ID
    SELECT id INTO client_user_id 
    FROM public.profiles 
    WHERE email = project_rec.client_email;
    
    -- Generate bill number
    bill_number := public.generate_bill_number();
    
    -- Create bill
    INSERT INTO public.bills (
      invoice_id,
      project_id,
      client_email,
      amount,
      bill_number,
      due_date,
      metadata
    ) VALUES (
      NEW.id,
      NEW.project_id,
      project_rec.client_email,
      invoice_amount,
      bill_number,
      CURRENT_DATE + INTERVAL '30 days',
      jsonb_build_object(
        'invoice_name', NEW.document_name,
        'project_name', project_rec.project_name
      )
    );
    
    -- Create notification for client if user exists
    IF client_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
      ) VALUES (
        client_user_id,
        'bill_created',
        'New Bill Generated',
        'A new bill has been generated for project ' || project_rec.project_name,
        jsonb_build_object(
          'bill_number', bill_number,
          'project_name', project_rec.project_name,
          'amount', invoice_amount,
          'project_id', NEW.project_id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create bills when invoices are marked as paid
CREATE TRIGGER create_bill_on_invoice_paid_trigger
  AFTER UPDATE ON public.project_documents
  FOR EACH ROW
  WHEN (NEW.document_type = 'invoice')
  EXECUTE FUNCTION public.create_bill_on_invoice_paid();
