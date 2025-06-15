
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  interval_type TEXT NOT NULL CHECK (interval_type IN ('monthly', 'yearly', 'one_time')),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project credits table
CREATE TABLE public.project_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  available_credits INTEGER NOT NULL DEFAULT 1,
  used_credits INTEGER NOT NULL DEFAULT 0,
  total_purchased_credits INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'project_credit')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read access)
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for project_credits
CREATE POLICY "Users can view their own project credits"
  ON public.project_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project credits"
  ON public.project_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project credits"
  ON public.project_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price, currency, interval_type, features) VALUES
('Monthly Subscription', 199.00, 'INR', 'monthly', '{"description": "Monthly subscription to keep projects active", "benefits": ["Unlimited active projects", "Priority support", "Advanced features"]}'),
('Project Credit', 499.00, 'INR', 'one_time', '{"description": "One-time payment for additional project", "benefits": ["1 additional project credit"]}');

-- Function to initialize project credits for new users
CREATE OR REPLACE FUNCTION public.initialize_project_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.project_credits (user_id, available_credits, used_credits, total_purchased_credits)
  VALUES (NEW.id, 1, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to initialize credits when a new user profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_project_credits();

-- Function to check subscription status
CREATE OR REPLACE FUNCTION public.check_subscription_status(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_id = user_id_param 
    AND status = 'active' 
    AND current_period_end > now()
  );
$$;

-- Function to get available project credits
CREATE OR REPLACE FUNCTION public.get_available_credits(user_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(available_credits, 0)
  FROM public.project_credits 
  WHERE user_id = user_id_param;
$$;

-- Function to consume project credit
CREATE OR REPLACE FUNCTION public.consume_project_credit(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.project_credits 
  SET 
    available_credits = available_credits - 1,
    used_credits = used_credits + 1,
    updated_at = now()
  WHERE user_id = user_id_param AND available_credits > 0;
  
  RETURN FOUND;
END;
$$;
