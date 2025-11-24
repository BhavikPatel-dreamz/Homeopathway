export interface Ailment {
  id: string;
  name: string;
  slug?: string;
  icon: string;
  remedies_count: number;
  description?: string;
  personalized_approach?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Remedy {
  id?: string;
  name: string;
  slug?: string;
  average_rating: number;
  review_count: number;
  description?: string;
  scientific_name?: string;
  common_name?: string;
  key_symptoms?: string[];
  constitutional_type?: string;
  dosage_forms?: string[];
  safety_precautions?: string;
  icon?: string; // Emoji icon for the remedy
  image_url?: string; // URL to remedy image
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  rating?: number; // Renamed from rating
  reviewCount?: number; // Renamed from reviewCount
  indication?:string
}

export interface AilmentRemedy {
  id: string;
  ailment_id: string;
  remedy_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;  // Made optional
  // Related data when joined
  ailment?: Ailment;
  remedy?: Remedy;
}

export interface Review {
  id: string;
  remedy_id: string;
  user_id: string | null;
  star_count: number; // 1-5 rating
  potency?: string; // e.g., "6C", "30C", "200C", "1M"
  potency_2?: string; // Secondary potency if applicable
  dosage?: string; // How much and how often
  duration_used?: string; // How long used
  effectiveness?: number; // 1-5 scale for effectiveness
  notes?: string; // Additional notes
  experienced_side_effects: boolean; // Checkbox for side effects/aggravations
  created_at: string;
  updated_at: string;
  // Related data when joined
  remedies?: Remedy;
  profiles?: {
    id:string
    first_name: string;
    last_name: string;
    email: string;
    user_name?:string;
  };
  // Legacy support for old structure
  remedy?: Remedy;
  user_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  user?: string;
  rating: number;
  verified?: boolean;
  date?: string;
  comment?: string;
  form?: string;
}
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}
