CREATE TABLE patient_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(50),
    country VARCHAR(100),
    optional_health_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Patients can view own profile." ON patient_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert own profile." ON patient_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update own profile." ON patient_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all patient profiles." ON patient_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
