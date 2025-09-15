-- Fix activities table constraints
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_activity_type_check;

-- Add proper constraint for activity types
ALTER TABLE public.activities ADD CONSTRAINT activities_activity_type_check 
CHECK (activity_type IN ('Academic', 'Sports', 'Arts', 'Technology', 'Social', 'Other'));

-- Add constraint for difficulty levels  
ALTER TABLE public.activities ADD CONSTRAINT activities_difficulty_check 
CHECK (difficulty_level IS NULL OR difficulty_level IN ('Beginner', 'Intermediate', 'Advanced'));

-- Ensure target_roles is not empty
ALTER TABLE public.activities ADD CONSTRAINT activities_target_roles_check 
CHECK (array_length(target_roles, 1) > 0);