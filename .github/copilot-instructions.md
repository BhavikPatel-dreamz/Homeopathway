# Copilot Instructions for HomeoPathway

## Project Overview
- This is a Next.js app using the `/app` directory structure, bootstrapped with `create-next-app`.
- Supabase is used for authentication, user management, and role-based access (user/admin).
- The main entry point for pages is `app/page.tsx`.

## Key Workflows
- **Development:**
  - Start with `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`).
  - Main app runs at `http://localhost:3000`.
- **Authentication:**
  - Uses Supabase for email/password and Google login.
  - User registration requires: first name, last name, email, password, confirm password.
  - Roles: `user` (access profile management), `admin` (access dashboard).
- **Profile Management:**
  - Users can update their profile and password from the frontend.
- **Admin Dashboard:**
  - Only users with the `admin` role can access `/admin` routes/pages.

## Patterns & Conventions
- Use React Server Components and Next.js routing in the `/app` directory.
- Supabase client is initialized in a shared utility (e.g., `lib/supabaseClient.ts`).
- Role management is handled via a custom field in the Supabase user table (e.g., `role`).
- Protect routes using middleware or server-side checks for role-based access.
- Store environment variables in `.env.local` (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Integration Points
- External dependency: `@supabase/supabase-js` for all auth and database operations.
- Google login is enabled via Supabase OAuth provider configuration.

## Example Files
- `app/page.tsx`: Main landing page.
- `lib/supabaseClient.ts`: Supabase client setup (create if missing).
- `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`: Auth pages (create if missing).
- `app/profile/page.tsx`: User profile management.
- `app/admin/page.tsx`: Admin dashboard.

## Tips for AI Agents
- Always check for role-based access before rendering protected pages.
- Use Supabase client for all user, profile, and auth operations.
- Follow Next.js conventions for file-based routing and React Server Components.
- Reference this file for project-specific patterns and integration details.
