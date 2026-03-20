-- Create custom type for assessor verification status
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE assessor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    credentials_summary TEXT,
    institution VARCHAR(255),
    bio TEXT,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
