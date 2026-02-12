/* eslint-disable @typescript-eslint/no-explicit-any */
import Breadcrumb from "@/components/Breadcrumb";
import UserReviewListPage from "@/components/UserReview";
import { supabase } from "@/lib/supabaseClient";

export default async function UserProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  // Fetch user with their reviews. Try matching `user_name` first,
  // then fall back to matching by profile `id` (UUID). Using two
  // sequential queries is more robust than a single `.or()` when
  // slugs contain special characters or UUIDs.
  let user: any = null;
  let error: any = null;

  try {
    const byName = await supabase
      .from("profiles")
      .select("*")
      .eq("user_name", slug)
      .single();
    user = byName.data;
    // Supabase returns error code 'PGRST116' when zero rows are found
    // for `.single()` — treat that as a non-fatal "no match" and
    // don't set `error` here so it doesn't get logged when we
    // successfully find the user by id in the next step.
    if (byName.error && byName.error.code !== 'PGRST116') {
      error = byName.error;
    }
  } catch (e) {
    console.error("Supabase error when querying by user_name:", e);
  }

  if (!user) {
    try {
      const byId = await supabase
        .from("profiles")
        .select("*")
        .eq("id", slug)
        .single();
      user = byId.data;
      // Only treat non-empty-query errors as notable. If `.single()`
      // returned the PGRST116 (0 rows) error, that just means no id
      // matched and will be handled by the `if (!user)` check below.
      if (byId.error && byId.error.code !== 'PGRST116') {
        error = error || byId.error;
      }
    } catch (e) {
      console.error("Supabase error when querying by id:", e);
    }
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

  // Log any non-fatal errors but don't block rendering when a user was found
  // (we may have had a recoverable error during the name/id lookup sequence).
  if (error) {
    console.error("Non-fatal error fetching user (proceeded with available data):", error);
  }



  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <section className="main-wrapper py-6">
        <UserReviewListPage user={userData} />
      </section>
    </div>
  );
}