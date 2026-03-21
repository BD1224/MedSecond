-- Create custom type for assessor verification status safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
    END IF;
END $$;

CREATE TABLE assessor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    credentials_summary TEXT,
    institution VARCHAR(255),
    bio TEXT,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE assessor_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Assessor profiles are viewable by authenticated users." ON assessor_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Assessors can insert own profile." ON assessor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Assessors can update own profile (except status/rating)." ON assessor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update everything." ON assessor_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
