export interface Ailment {
  id: string;
  name: string;
  slug?: string;
  icon: string;
  remedies_count: number;
  description?: string;
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
  description: string;
  scientific_name?: string;
  common_name?: string;
  key_symptoms?: string[];
  constitutional_type?: string;
  dosage_forms?: string[];
  safety_precautions?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
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