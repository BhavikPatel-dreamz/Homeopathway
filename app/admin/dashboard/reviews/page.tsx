import AdminReviewsManager from '@/components/admin/AdminReviewsManager';
import { isAdmin } from '../../../../lib/auth-server';
import { createClient } from '../../../../lib/supabase/server';
import { Review } from '@/types';


export const metadata = {
  title: 'Manage Reviews - Admin Dashboard',
};

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId || !(await isAdmin(userId))) {
    return <div>Access Denied</div>;
  }

  // Fetch reviews with related data using RPC or raw query approach
  // First, let's try a simple approach without complex joins
  const { data: reviewsData, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return (
        <div className="text-center py-16">
          <div className="text-red-600 mb-4">Error loading reviews</div>
          <p className="text-gray-600">Failed to load reviews. Please try again.</p>
        </div>
    );
  }

  // Fetch related data separately
  const remedyIds = reviewsData?.map(r => r.remedy_id).filter(Boolean) || [];
  const userIds = reviewsData?.map(r => r.user_id).filter(Boolean) || [];

  // Fetch remedies
  const { data: remediesData } = await supabase
    .from('remedies')
    .select('id, name, slug')
    .in('id', remedyIds);

  // Fetch profiles
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', userIds);

  // Manually join the data
  const reviewsWithProfiles: Review[] = (reviewsData || []).map(review => ({
    id: review.id,
    remedy_id: review.remedy_id,
    user_id: review.user_id,
    star_count: review.star_count,
    potency: review.potency,
    potency_2: review.potency_2,
    dosage: review.dosage,
    duration_used: review.duration_used,
    effectiveness: review.effectiveness,
    notes: review.notes,
    experienced_side_effects: review.experienced_side_effects,
    created_at: review.created_at,
    updated_at: review.updated_at,
    profiles: profilesData?.find(p => p.id === review.user_id),
    remedies: remediesData?.find(r => r.id === review.remedy_id) ? {
      id: remediesData.find(r => r.id === review.remedy_id)!.id,
      name: remediesData.find(r => r.id === review.remedy_id)!.name,
      slug: remediesData.find(r => r.id === review.remedy_id)?.slug,
      average_rating: 0,
      review_count: 0,
      description: '',
    } : undefined
  }));

  // Fetch remedies for the filter dropdown
  // Fetch remedies for the filter dropdown
  const { data: remedies } = await supabase
    .from('remedies')
    .select('id, name, slug')
    .order('name');

  return (
      <AdminReviewsManager 
        initialReviews={reviewsWithProfiles || []} 
        remedies={remedies || []}
      />
  );
}
