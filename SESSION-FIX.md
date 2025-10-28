# Supabase Session Storage Fix

## Changes Made

### 1. Updated Supabase Client Configuration
**File:** `lib/supabaseClient.ts`
- Added proper auth configuration with:
  - `persistSession: true` - Enables session persistence
  - `storageKey: 'sb-auth-token'` - Custom storage key
  - `storage: window.localStorage` - Uses browser localStorage
  - `autoRefreshToken: true` - Auto-refreshes expired tokens
  - `detectSessionInUrl: true` - Handles OAuth redirects

### 2. Created Separate Client Utilities
**Files:** 
- `lib/supabase/client.ts` - Browser client using `@supabase/ssr`
- `lib/supabase/server.ts` - Server client using cookies
- `lib/supabase/middleware.ts` - Middleware helper for session refresh

### 3. Updated Authentication Functions
**File:** `lib/auth.ts`
- Updated `signInWithEmail()` to explicitly set session after login
- Added user metadata to signup for first_name and last_name
- Better error handling for profile creation

### 4. Updated Login/Register Pages
**Files:** 
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- Now use proper server client (`lib/supabase/server.ts`)
- Better session detection

### 5. Enhanced Middleware
**File:** `middleware.ts`
- Now properly refreshes sessions on every request
- Uses `@supabase/ssr` for cookie management
- Matches all routes except static files

## How Session Storage Works Now

### Login Flow:
1. User submits login form
2. `signInWithEmail()` authenticates with Supabase
3. Session is explicitly set: `await supabase.auth.setSession(result.data.session)`
4. Session stored in localStorage with key `sb-auth-token`
5. Cookies are also set for server-side access
6. User is redirected based on role

### Session Persistence:
- **Browser**: Session stored in `localStorage` under key `sb-auth-token`
- **Server**: Session accessible via cookies in middleware and server components
- **Auto-refresh**: Token automatically refreshed when expired

### Session Access:
- **Client Components**: Use `supabase.auth.getSession()`
- **Server Components**: Use `createClient()` from `lib/supabase/server.ts`
- **Middleware**: Session automatically refreshed on every request

## Testing

### Test 1: Login and Session Persistence
```bash
1. Open browser DevTools → Application → Local Storage
2. Navigate to http://localhost:3000/login
3. Login with: admin@homeopathway.com / AdminPass@123
4. Check Local Storage - should see: sb-auth-token-* keys
5. Check Cookies - should see: sb-access-token, sb-refresh-token
6. Should redirect to /admin/dashboard
```

### Test 2: Session Survives Page Refresh
```bash
1. Login successfully
2. Refresh the page (F5)
3. Should still be logged in (no redirect to login)
4. Check browser console for any auth errors
```

### Test 3: Session Works Across Tabs
```bash
1. Login in Tab 1
2. Open Tab 2 → Navigate to /admin/dashboard
3. Should have access (not redirect to login)
```

### Test 4: Logout Clears Session
```bash
1. Login successfully
2. Click logout button
3. Check Local Storage - sb-auth-token-* should be cleared
4. Try accessing /admin/dashboard - should redirect to /login
```

## Debug Commands

### Check Supabase Connection
Open browser console and run:
```javascript
// Get current session
const { data, error } = await window.supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);

// Check storage
console.log('LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('sb')));
```

### Clear Session (if stuck)
```javascript
// Clear all Supabase data
Object.keys(localStorage).forEach(key => {
  if (key.includes('sb-')) localStorage.removeItem(key);
});
location.reload();
```

## Common Issues & Solutions

### Issue: "Session not persisting after login"
**Solution:** 
- Check browser localStorage is enabled
- Check cookies are not blocked
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct in `.env.local`

### Issue: "Redirects to login after page refresh"
**Solution:**
- Check middleware matcher is not too restrictive
- Verify session is being refreshed in middleware
- Check browser console for auth errors

### Issue: "OAuth redirect doesn't work"
**Solution:**
- Add callback URL in Supabase Dashboard: `http://localhost:3000/auth/callback`
- Check `lib/auth.ts` has correct redirect URL

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps

1. Run `npm run dev`
2. Test login with test credentials
3. Check browser DevTools for session storage
4. Verify session persists across page refreshes
5. Test admin and user role redirects
