import { getUserProfile, isAdmin } from '../../../../lib/auth';
import { createClient } from '../../../../lib/supabase/server';


export const metadata = {
  title: 'Manage Users - Admin Dashboard',
};

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId || !(await isAdmin(userId))) {
    return <div>Access Denied</div>;
  }

  const { profile } = await getUserProfile(userId);

  return (
   
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl">👥</span>
        </div>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Users Management</h2>
        <p className="text-gray-600">This page is ready for your content</p>
      </div>
   
  );
}
