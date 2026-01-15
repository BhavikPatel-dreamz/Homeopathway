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
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
  profile_img?: string;
}

// Review Types
export interface DatabaseReview {
  id: string;
  remedy_id: string;
  user_id: string | null;
  star_count: number;
  potency: string | null;
  potency_2: string | null;
  dosage: string | null;
  duration_used: string | null;
  effectiveness: number | null;
  notes: string | null;
  experienced_side_effects: boolean;
  created_at: string;
  updated_at: string;
}