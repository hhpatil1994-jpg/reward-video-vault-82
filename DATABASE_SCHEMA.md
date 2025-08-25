
# RewardAd Database Schema

This document outlines the database structure needed for the RewardAd application using Supabase.

## Tables

### 1. user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER NOT NULL DEFAULT 0,
  watched_ads TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. ads
```sql
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 10,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. ad_views
```sql
CREATE TABLE ad_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  points_earned INTEGER NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);
```

### 4. rewards
```sql
CREATE TABLE rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. redemptions
```sql
CREATE TABLE redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  points_used INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

## Row Level Security (RLS) Policies

### user_profiles
```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### ads
```sql
-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Everyone can view ads
CREATE POLICY "Anyone can view ads" ON ads
  FOR SELECT USING (true);

-- Only admins can create, update, delete ads
CREATE POLICY "Admins can manage ads" ON ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### ad_views
```sql
-- Enable RLS
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own ad views
CREATE POLICY "Users can view own ad views" ON ad_views
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own ad views
CREATE POLICY "Users can insert own ad views" ON ad_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all ad views
CREATE POLICY "Admins can view all ad views" ON ad_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Sample Data

### Insert sample rewards
```sql
INSERT INTO rewards (name, description, points_required) VALUES
('$10 Amazon Gift Card', 'Digital Amazon gift card delivered via email', 1000),
('$25 PayPal Cash', 'PayPal cash transfer to your account', 2500),
('Premium Subscription', '1 month premium subscription', 5000),
('$50 Visa Gift Card', 'Physical Visa gift card', 5000),
('Gaming Mouse', 'High-quality gaming mouse', 3000);
```

## Environment Variables

Create a `.env.local` file with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Instructions

1. Create a new Supabase project
2. Run the SQL commands above in the Supabase SQL editor
3. Enable authentication in your Supabase project
4. Configure authentication providers as needed
5. Set up your environment variables
6. Deploy your application

## File Upload Configuration (Optional)

For direct file uploads to Supabase Storage:

1. Create a storage bucket named 'ad-videos'
2. Set up RLS policies for the bucket
3. Configure upload policies to allow admins to upload videos

```sql
-- Storage bucket RLS policy
CREATE POLICY "Admins can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ad-videos' AND 
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```
