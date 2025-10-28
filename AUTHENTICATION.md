# Authentication & Role-Based Redirect

## Overview
The application now supports comprehensive role-based redirects:
- **After login**: Admin users → `/admin/dashboard`, Regular users → `/` (home page)
- **Accessing login/register while logged in**: Auto-redirect based on role

## How It Works

### 1. Email/Password Login
When a user logs in via `LoginForm.tsx`:
1. Credentials are verified via `signInWithEmail()`
2. User profile is fetched to check the `role` field
3. Based on the role:
   - `role === 'admin'` → Redirect to `/admin/dashboard`
   - `role === 'user'` → Redirect to `/` (home page)

### 2. Google OAuth Login
When a user logs in via Google:
1. User is redirected to Google OAuth
2. After authentication, user returns to `/auth/callback`
3. The callback page:
   - Gets the user session
   - Fetches the user profile to check role
   - Redirects to dashboard (admin) or home (user)

### 3. Accessing Login/Register While Logged In
Both `/login` and `/register` pages now check authentication status:
- If user is already logged in:
  - Checks user profile for role
  - **Admin** → Redirected to `/admin/dashboard`
  - **Regular user** → Redirected to `/` (home page)
- This prevents logged-in users from seeing login/register forms

### 4. Middleware Protection
The `middleware.ts` file provides route protection:
- **Admin routes** (`/admin/*`): Requires authentication
- **Login/Register pages**: Basic token check for logged-in users

### 5. Server-Side Protection
Admin pages also have server-side checks:
- Verifies user is logged in
- Checks if user has `admin` role
- Shows access denied page if not authorized

## Setup Instructions

### Step 1: Configure Supabase
1. Run the SQL script in `supabase-setup.sql` to create the profiles table
2. Create test users:
   - **Admin**: `admin@homeopathway.com` / `AdminPass@123` (role: 'admin')
   - **User 1**: `user1@homeopathway.com` / `User1Pass@123` (role: 'user')
   - **User 2**: `user2@homeopathway.com` / `User2Pass@123` (role: 'user')

### Step 2: Configure OAuth Redirect URL
In your Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

## Files Modified

### Pages
- `app/(auth)/login/page.tsx`: Server-side check for existing session, redirects logged-in users
- `app/(auth)/register/page.tsx`: Server-side check for existing session, redirects logged-in users

### Components
- `components/LoginForm.tsx`: Added role-based redirect logic after login
- `app/auth/callback/page.tsx`: New OAuth callback handler

### Libraries
- `lib/auth.ts`: Updated `signInWithGoogle()` to use callback URL

### Configuration
- `middleware.ts`: Added route protection for admin area
- `package.json`: Added `@supabase/ssr` dependency

## Testing

### Test Admin Login
1. Navigate to `/login`
2. Login with: `admin@homeopathway.com` / `AdminPass@123`
3. Should redirect to `/admin/dashboard`

### Test Regular User Login
1. Navigate to `/login`
2. Login with: `user1@homeopathway.com` / `User1Pass@123`
3. Should redirect to `/` (home page)

### Test Login Page While Logged In (NEW)
1. Login as admin (`admin@homeopathway.com`)
2. Try to navigate to `/login` or `/register`
3. Should automatically redirect to `/admin/dashboard`
4. Logout
5. Login as regular user (`user1@homeopathway.com`)
6. Try to navigate to `/login` or `/register`
7. Should automatically redirect to `/` (home page)

### Test Protected Routes
1. Try accessing `/admin/dashboard` without login
2. Should redirect to `/login`
3. Login as regular user
4. Try accessing `/admin/dashboard`
5. Should redirect to `/` (not authorized)

## Notes
- The role is stored in the `profiles` table with values: `'user'` or `'admin'`
- Role checking happens both client-side (for UX) and server-side (for security)
- Admin pages are protected at multiple levels: middleware, server components, and role checks
