# Supabase Database Setup

Run these SQL commands in your Supabase SQL Editor to set up the required tables:

## 1. Create Profiles Table

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  full_name TEXT NOT NULL,
  student_id TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow public insert for new users
CREATE POLICY "Allow profile creation for new users" ON profiles
  FOR INSERT WITH CHECK (true);
```

## 2. Create Attendance Table

```sql
-- Create attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  class_name TEXT NOT NULL,
  faculty_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_lat DECIMAL,
  location_lng DECIMAL,
  qr_code_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view their own attendance" ON attendance
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Faculty can view attendance for their classes" ON attendance
  FOR SELECT USING (auth.uid() = faculty_id);

CREATE POLICY "Admins can view all attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can insert their own attendance" ON attendance
  FOR INSERT WITH CHECK (auth.uid() = student_id);
```

## 3. Create Sessions Table

```sql
-- Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name TEXT NOT NULL,
  faculty_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  qr_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active sessions" ON sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Faculty can manage their own sessions" ON sessions
  FOR ALL USING (auth.uid() = faculty_id);

CREATE POLICY "Admins can view all sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

## 4. Create Activities Table

```sql
-- Create activities table
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('academic', 'career', 'skill', 'extracurricular')),
  target_roles TEXT[] DEFAULT ARRAY['student'],
  duration_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active activities" ON activities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Faculty and admins can create activities" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('faculty', 'admin')
    )
  );
```

## 5. Create Updated At Trigger Function

```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

After running these commands, your database will be ready for the enhanced TimeTrack Learn application!