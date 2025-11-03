export interface Ailment {
  id: string;
  name: string;
  icon: string;
  remedies_count: number;
}

export interface Remedy {
  name: string;
  average_rating: number;
  review_count: number;
  description: string;
}