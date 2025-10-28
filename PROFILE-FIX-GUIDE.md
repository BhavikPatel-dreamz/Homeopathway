# Fix "Profile not found" Issue

## Problem
User exists in `auth.users` but has no profile in `public.profiles` table, causing login to fail with "Profile not found" error.

## Solution (Run these SQL scripts in order)

### Step 1: Fix Profile Policies
**File:** `fix-profile-policies.sql`

This script:
- ✅ Allows users to create their own profile on first login
- ✅ Sets up correct RLS policies
- ✅ Creates auto-profile trigger for new users
- ✅ Creates profiles for existing users
- ✅ Sets admin role

**Action:** 
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste entire `fix-profile-policies.sql`
3. **IMPORTANT:** Change line 111 to your actual email:
   ```sql
   WHERE email = 'your-email@example.com'; -- CHANGE THIS
   ```
4. Click "Run"

### Step 2: Verify Setup
Check your profile exists:
```sql
SELECT * FROM public.profiles WHERE email = 'your-email@example.com';
```

Should show:
- ✅ `role = 'admin'`
- ✅ `email` matches your login email

### Step 3: Test Login
1. Clear browser cache/cookies (or use incognito)
2. Go to http://localhost:3000/login
3. Login with your email and password
4. Open browser console (F12)
5. Look for these logs:
   ```
   🔐 Attempting login...
   ✅ Login successful
   🔍 Fetching user profile...
   📋 Profile data: {role: 'admin', ...}
   👑 Redirecting admin to dashboard
   ```

### Step 4: If Profile Still Missing
The updated code will **auto-create** the profile on login. Console will show:
```
🔧 Profile not found, attempting to create...
✅ Profile created successfully
```

## What Changed

### 1. Database (SQL)
- Added policy to allow users to INSERT their own profile
- Added trigger to auto-create profiles for new users
- Created profiles for existing users without one

### 2. Code (TypeScript)
- `lib/auth.ts`: Auto-creates profile if missing during login
- `components/LoginForm.tsx`: Better error messages

## Common Issues

### Issue: "permission denied for table profiles"
**Solution:** Run `fix-profile-policies.sql` to fix RLS policies

### Issue: "Profile still not found after auto-create"
**Solution:** 
1. Check RLS policies allow INSERT
2. Manually create profile:
   ```sql
   INSERT INTO public.profiles (id, email, role)
   SELECT id, email, 'admin'
   FROM auth.users 
   WHERE email = 'your-email@example.com'
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```

### Issue: Redirects to home instead of dashboard
**Solution:** Check role is 'admin':
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Quick Test Commands

```sql
-- Check if user exists
SELECT email FROM auth.users WHERE email = 'your-email@example.com';

-- Check if profile exists  
SELECT email, role FROM public.profiles WHERE email = 'your-email@example.com';

-- Make user admin
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify
SELECT u.email, p.role 
FROM auth.users u 
LEFT JOIN public.profiles p ON u.id = p.id 
WHERE u.email = 'your-email@example.com';
```

## Success Indicators
- ✅ User exists in `auth.users`
- ✅ Profile exists in `public.profiles` with same `id`
- ✅ Profile has `role = 'admin'`
- ✅ Login redirects to `/admin/dashboard`
- ✅ Console shows profile data with admin role
