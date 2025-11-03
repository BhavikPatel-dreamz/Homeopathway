// Supabase User Types
export interface UserIdentity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
  };
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface UserAppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  email_verified?: boolean;
  [key: string]: unknown;
}

export interface SupabaseUser {
  id: string;
  aud: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: UserAppMetadata;
  user_metadata: UserMetadata;
  identities?: UserIdentity[];
  created_at: string;
  updated_at: string;
  is_anonymous?: boolean;
}

// Profile Types
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}