-- Table for medical second opinions provided by assessors
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    assessor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Indexing for performance
CREATE INDEX idx_responses_case_id ON public.responses(case_id);
CREATE INDEX idx_responses_assessor_id ON public.responses(assessor_id);

-- RLS Policies

-- Patients can view responses to their own cases
CREATE POLICY "Patients can view responses to their own cases." ON public.responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE id = responses.case_id AND patient_id = auth.uid()
        )
    );

-- Assessors can view their own responses
CREATE POLICY "Assessors can view their own responses." ON public.responses
    FOR SELECT USING (auth.uid() = assessor_id);

-- Assessors can submit responses to cases
CREATE POLICY "Assessors can insert their own responses." ON public.responses
    FOR INSERT WITH CHECK (
        auth.uid() = assessor_id AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'assessor'
        )
    );

-- Assessors can update their own responses
CREATE POLICY "Assessors can update their own responses." ON public.responses
    FOR UPDATE USING (auth.uid() = assessor_id);

-- Admins can manage all responses
CREATE POLICY "Admins can manage all responses." ON public.responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger to update 'updated_at' column automatically
-- Note: Assumes public.handle_updated_at() is already defined in the database
CREATE TRIGGER on_responses_updated
    BEFORE UPDATE ON public.responses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
