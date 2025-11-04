import { getUserProfile, isAdmin } from '../../../../lib/auth-server';
import { createClient } from '../../../../lib/supabase/server';
import DashboardLayout from '../../../../components/admin/DashboardLayout';
import Link from 'next/link';

export const metadata = {
  title: 'Analytics - Admin Dashboard',
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId || !(await isAdmin(userId))) {
    return <div>Access Denied</div>;
  }

  const { profile } = await getUserProfile(userId);

  return (
 
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl">📈</span>
        </div>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">This page is ready for your content</p>
      </div>

  );
}
