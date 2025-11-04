import AdminReviewsManager from '@/components/admin/AdminReviewsManager';
import { isAdmin } from '../../../lib/auth-server';
import { createClient } from '../../../lib/supabase/server';
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

  // Fetch initial reviews (just first page) and total count
  const [reviewsData, totalCountResult] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
  ]);

  if (reviewsData.error) {
    console.error('Error fetching reviews:', reviewsData.error);
    return (
        <div className="text-center py-16">
          <div className="text-red-600 mb-4">Error loading reviews</div>
          <p className="text-gray-600">Failed to load reviews. Please try again.</p>
        </div>
    );
  }

  const totalCount = totalCountResult.count || 0;

  // Get related data for initial reviews
  const remedyIds = reviewsData.data?.map(r => r.remedy_id).filter(Boolean) || [];
  const userIds = reviewsData.data?.map(r => r.user_id).filter(Boolean) || [];

  // Fetch remedies and profiles
  const [remediesResult, profilesResult] = await Promise.all([
    supabase
      .from('remedies')
      .select('id, name, slug')
      .in('id', remedyIds),
    userIds.length > 0 ? supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds) : { data: [] }
  ]);

  // Join the initial data
  const initialReviews: Review[] = (reviewsData.data || []).map(review => ({
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
    profiles: profilesResult.data?.find(p => p.id === review.user_id),
    remedies: remediesResult.data?.find(r => r.id === review.remedy_id) ? {
      id: remediesResult.data.find(r => r.id === review.remedy_id)!.id,
      name: remediesResult.data.find(r => r.id === review.remedy_id)!.name,
      slug: remediesResult.data.find(r => r.id === review.remedy_id)?.slug,
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
        initialReviews={initialReviews || []} 
        remedies={remedies || []}
        totalCount={totalCount}
      />
  );
}
