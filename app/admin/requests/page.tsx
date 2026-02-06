import AdminRequestsManager from '@/components/admin/AdminRequestsManager';

export const metadata = {
  title: 'Manage Requests - Admin Dashboard',
};

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-[#0B0C0A] mb-2 cursor-pointer">Manage Requests</h1>
        <p className="text-gray-600">Review and approve user-submitted ailments and remedies</p>
      </div>

      {/* Requests Manager */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <AdminRequestsManager />
      </div>
    </div>
  );
}
