import { getUserProfile, isAdmin } from '../../../lib/auth';
import DashboardLayout from '../../../components/admin/DashboardLayout';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard - Homeopathway',
};

export default async function DashboardPage() {
  // Server-side check: ensure current user is admin
  const { data: udata } = await (await import('../../../lib/supabaseClient')).supabase.auth.getUser();
  const userId = udata.user?.id;

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-serif mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be signed in to view this page.</p>
          <Link href="/login">
            <button className="px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const admin = await isAdmin(userId);
  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⛔</span>
          </div>
          <h2 className="text-2xl font-serif mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Link href="/">
            <button className="px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors">
              Go to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { profile } = await getUserProfile(userId);

  return (
    <DashboardLayout userName={profile?.first_name || 'Admin'}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">142</h3>
          <p className="text-sm text-gray-600">Total Ailments</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🧪</span>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+8%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">1,248</h3>
          <p className="text-sm text-gray-600">Total Remedies</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">+24%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">3,567</h3>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">+16%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">4,892</h3>
          <p className="text-sm text-gray-600">Total Reviews</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/dashboard/ailments" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
            <span className="text-sm text-blue-600">→</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Ailments</h3>
          <p className="text-sm text-gray-600">Add, edit, or remove ailments from your database</p>
        </Link>

        <Link href="/admin/dashboard/remedies" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🧪</span>
            </div>
            <span className="text-sm text-purple-600">→</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Remedies</h3>
          <p className="text-sm text-gray-600">Control remedy information and recommendations</p>
        </Link>

        <Link href="/admin/dashboard/users" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-sm text-green-600">→</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Users</h3>
          <p className="text-sm text-gray-600">View and moderate user accounts and permissions</p>
        </Link>
      </div>

      {/* Recent Activity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New ailment added', item: 'Migraine', time: '2 hours ago', icon: '💊' },
              { action: 'Remedy updated', item: 'Arnica Montana', time: '5 hours ago', icon: '🧪' },
              { action: 'New user registered', item: 'John Doe', time: '1 day ago', icon: '👥' },
              { action: 'Review submitted', item: 'Belladonna', time: '2 days ago', icon: '⭐' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Remedies</h3>
          <div className="space-y-4">
            {[
              { name: 'Arnica Montana', rating: 4.9, reviews: 234 },
              { name: 'Nux Vomica', rating: 4.8, reviews: 189 },
              { name: 'Belladonna', rating: 4.7, reviews: 324 },
              { name: 'Pulsatilla', rating: 4.6, reviews: 156 },
            ].map((remedy, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{remedy.name}</p>
                    <p className="text-xs text-gray-500">{remedy.reviews} reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-semibold text-gray-900">{remedy.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
