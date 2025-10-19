-- Migration: Add user profile fields
-- Date: 2025-10-18
-- Description: Add profile_json (JSONB) for professional profile and update orcidId field

-- Add profile_json field for storing professional profile data
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_json JSONB DEFAULT '{}';

-- Ensure orcidId column exists (might already exist from previous migrations)
ALTER TABLE users ADD COLUMN IF NOT EXISTS orcidId VARCHAR(50);

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_users_profile_json ON users USING GIN (profile_json);

-- Create index for ORCID searches
CREATE INDEX IF NOT EXISTS idx_users_orcid ON users (orcidId);

-- Add comment to document the structure
COMMENT ON COLUMN users.profile_json IS 'Professional profile data: {academicDegree, fieldOfStudy, professionalRole, yearsOfExperience, institution, medicalSpecialty, researchArea, englishProficiency, ehealsScore, ehealsAnswers}';

-- Example profile_json structure:
-- {
--   "academicDegree": "phd",
--   "fieldOfStudy": "Medicina",
--   "professionalRole": "researcher",
--   "yearsOfExperience": 5,
--   "institution": "USP",
--   "medicalSpecialty": "Geneticista",
--   "researchArea": "Doenças Raras",
--   "englishProficiency": "advanced",
--   "ehealsScore": 35,
--   "ehealsAnswers": [5, 4, 5, 4, 5, 4, 4, 4]
-- }
