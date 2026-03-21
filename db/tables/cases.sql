-- Enum for case status
CREATE TYPE public.case_status AS ENUM ('open', 'assigned', 'completed', 'closed');

-- Case table for medical inquiries
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status public.case_status NOT NULL DEFAULT 'open',
    images TEXT[] DEFAULT '{}', -- Array of image URLs or storage paths
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Indexing for performance
CREATE INDEX idx_cases_patient_id ON public.cases(patient_id);
CREATE INDEX idx_cases_status ON public.cases(status);

-- RLS Policies

-- Patients can view their own cases
CREATE POLICY "Patients can view their own cases." ON public.cases
    FOR SELECT USING (auth.uid() = patient_id);

-- Patients can create their own cases
CREATE POLICY "Patients can create their own cases." ON public.cases
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own open cases
CREATE POLICY "Patients can update their own cases." ON public.cases
    FOR UPDATE USING (auth.uid() = patient_id);

-- Assessors can view all open and assigned cases (depending on platform logic)
-- For now, let's allow all authenticated users (assessors) to see open cases to pick them up
CREATE POLICY "Assessors can view open cases." ON public.cases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (role = 'assessor' OR role = 'admin')
        )
    );

-- Trigger to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_cases_updated
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
