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
  name: string;
  average_rating: number;
  review_count: number;
  description: string;
}