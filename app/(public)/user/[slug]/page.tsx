import Breadcrumb from "@/components/Breadcrumb";
import UserReviewListPage from "@/components/UserReview";
import { supabase } from "@/lib/supabaseClient";

export default async function UserProfilePage({ params }: { params: { slug: string } }) {
  const { slug } =await params;
 
  // Fetch user with their reviews
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_name", slug)
    .single();

 const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(`
      *,
      remedies(id, name, slug, scientific_name),
      ailments(id, name, slug)
    `)
    .eq("user_id", user.id)
    .order('created_at', { ascending: false });

// Combine the data
const userData = {
  ...user,
  reviews: reviews || []
};

  if (error) {
    console.error("Error fetching user:", error);
    return (
      <div className="min-h-screen bg-[#F5F1E8] p-10">
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6">
          <p className="text-red-600">Error loading user profile. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] p-10">
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6">
          <p className="text-gray-600">User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <section className="main-wrapper py-6">
        <UserReviewListPage user={userData} />
      </section>
    </div>
  );
}