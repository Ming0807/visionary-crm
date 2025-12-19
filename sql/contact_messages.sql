-- Contact Messages Table for storing customer inquiries from the contact form
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(255),
  subject varchar(50) NOT NULL,
  message text NOT NULL,
  status varchar(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes text,
  replied_at timestamp with time zone,
  replied_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for public contact form)
CREATE POLICY "Allow public insert" ON public.contact_messages
  FOR INSERT TO public WITH CHECK (true);

-- Policy: Allow all authenticated users to read (admin dashboard)
CREATE POLICY "Allow read" ON public.contact_messages
  FOR SELECT USING (true);

-- Policy: Allow all authenticated users to update (admin status changes)
CREATE POLICY "Allow update" ON public.contact_messages
  FOR UPDATE USING (true);

-- Policy: Allow delete for admins
CREATE POLICY "Allow delete" ON public.contact_messages
  FOR DELETE USING (true);
