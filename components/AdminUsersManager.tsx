"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Pagination from './Pagination';
import { User } from '@/types'

// interface User {
//   id: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: string;
//   created_at: string;
// }

export default function AdminUsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // Build query
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      // Apply role filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalUsers(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, itemsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setLoading(true);
    try {
      // Note: You'll need to set up proper user deletion in Supabase
      // This should also delete the auth user, not just the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== id));
      setMessage({ type: 'success', text: 'User deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'Failed to delete user. You may need admin privileges.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: 'success', text: `User role updated to ${newRole}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error updating role:', error);
      setMessage({ type: 'error', text: 'Failed to update user role' });
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change and debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    const tableSection = document.querySelector('.bg-white.rounded-lg.shadow-md');
    tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
          <p className="text-gray-600 mt-1">View and manage user accounts and permissions</p>
        </div>
        <Link
          href="/admin/users/add"
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          + Add User
        </Link>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 pt-4 border-t">
          <div className="text-sm">
            <span className="text-gray-600">Total: </span>
            <span className="font-semibold text-gray-900">{totalUsers}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Current Page: </span>
            <span className="font-semibold text-gray-900">{users.length} users</span>
          </div>
          {users.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-600">Showing: </span>
              <span className="font-semibold text-gray-900">
                {((currentPage - 1) * itemsPerPage) + 1}-{((currentPage - 1) * itemsPerPage) + users.length} of {totalUsers}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={loading}
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        } disabled:opacity-50`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/users/edit/${user.id}`}
                        className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || roleFilter !== 'all' ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first user'}
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <Link
                href="/admin/users/add"
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                + Add User
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showTotal={true}
              totalItems={totalUsers}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
