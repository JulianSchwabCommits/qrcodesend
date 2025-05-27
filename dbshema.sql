
-- Create a table for secret messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read messages (since no authentication is required)
CREATE POLICY "Anyone can read messages" 
  ON public.messages 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to create messages
CREATE POLICY "Anyone can create messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (true);
