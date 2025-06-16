
-- Add comprehensive RLS policies for all tables

-- Messages table policies
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

-- Milestones table policies
CREATE POLICY "Contractors can manage milestones for their projects"
  ON public.milestones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.project_id 
      AND projects.contractor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.project_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view milestones for their projects"
  ON public.milestones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.project_id 
      AND projects.client_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Payment requests table policies
CREATE POLICY "Contractors can manage payment requests for their projects"
  ON public.payment_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM milestones 
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.contractor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM milestones 
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view and update payment requests for their projects"
  ON public.payment_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM milestones 
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.client_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Clients can update payment status"
  ON public.payment_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM milestones 
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.client_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM milestones 
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = payment_requests.milestone_id 
      AND projects.client_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Payment transactions table policies
CREATE POLICY "Users can view their own payment transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payment transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service can update payment transactions"
  ON public.payment_transactions
  FOR UPDATE
  USING (true);

-- Project credits table policies
CREATE POLICY "Users can view their own project credits"
  ON public.project_credits
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own project credits"
  ON public.project_credits
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service can update project credits"
  ON public.project_credits
  FOR UPDATE
  USING (true);

-- User subscriptions table policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service can update user subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (true);

-- Subscription plans table policies (public read access)
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (true);

-- Project documents table policies
CREATE POLICY "Contractors can manage documents for their projects"
  ON public.project_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_documents.project_id 
      AND projects.contractor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_documents.project_id 
      AND projects.contractor_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view and sign documents for their projects"
  ON public.project_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_documents.project_id 
      AND projects.client_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Enable RLS on all tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Fix database functions for better security
CREATE OR REPLACE FUNCTION public.consume_project_credit(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  credits_consumed boolean := false;
BEGIN
  -- Use atomic update to prevent race conditions
  UPDATE public.project_credits 
  SET 
    available_credits = available_credits - 1,
    used_credits = used_credits + 1,
    updated_at = now()
  WHERE user_id = user_id_param 
    AND available_credits > 0;
  
  GET DIAGNOSTICS credits_consumed = FOUND;
  RETURN credits_consumed;
END;
$$;

-- Add input validation trigger for payment requests
CREATE OR REPLACE FUNCTION public.validate_payment_request()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate amount is positive
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;
  
  -- Validate due date is not in the past
  IF NEW.due_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Due date cannot be in the past';
  END IF;
  
  -- Validate status is valid
  IF NEW.status NOT IN ('pending', 'paid', 'overdue') THEN
    RAISE EXCEPTION 'Invalid payment status';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_payment_request_trigger
  BEFORE INSERT OR UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_payment_request();

-- Add input validation for projects
CREATE OR REPLACE FUNCTION public.validate_project()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate project name is not empty
  IF LENGTH(TRIM(NEW.project_name)) = 0 THEN
    RAISE EXCEPTION 'Project name cannot be empty';
  END IF;
  
  -- Validate email format
  IF NEW.client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate date range
  IF NEW.start_date >= NEW.end_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_project_trigger
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.validate_project();
