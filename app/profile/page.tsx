import { getUserProfile } from '../../lib/auth-server';
import { createClient } from '../../lib/supabase/server';
import AccountSettings from '../../components/AccountSettings';
import Link from 'next/link';

export const metadata = {
  title: 'Account Settings - Homeopathway',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-serif mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be signed in to view your profile.</p>
          <Link href="/login">
            <button className="px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { profile } = await getUserProfile(userId);

  return (
    <AccountSettings 
      user={{
        id: userId,
        email: user?.email || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
      }}
    />
  );
}
