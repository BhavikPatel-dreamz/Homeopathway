"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface EditUserFormProps {
  userId: string;
}

export default function EditUserForm({ userId }: EditUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
  });
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isTargetAdmin, setIsTargetAdmin] = useState<boolean>(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error('Invalid user ID format. Please use a valid UUID from your database.');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('User not found');
      }

      setFormData({
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        role: data.role || 'user',
      });
      setIsTargetAdmin(data.role === 'admin');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to load user');
    } finally {
      setFetching(false);
    }
  };

  // Load current user role to enforce moderator limitations in UI
  useEffect(() => {
    async function loadCurrentRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setCurrentUserRole(null);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setCurrentUserRole(profile?.role || null);
      } catch (err) {
        console.error('Failed to load current user role', err);
      }
    }

    loadCurrentRole();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Success - redirect back to users page
      router.push('/admin/users');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/users"
          className="text-teal-600 hover:text-teal-800 flex items-center mb-4"
        >
          ← Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600 mt-2">Update user information and permissions</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            
            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  User Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={currentUserRole === 'moderator' && isTargetAdmin}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin" disabled={currentUserRole === 'moderator'}>Admin</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Admins have full access to the dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Password Changes</h4>
                <p className="text-sm text-blue-700">
                  Users can change their own password from their profile page. 
                  Password resets can be initiated through the forgot password flow.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || (currentUserRole === 'moderator' && isTargetAdmin)}
              className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
            <Link
              href="/admin/users"
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {(formData.first_name?.[0] || formData.email[0]).toUpperCase()}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">
              {formData.first_name} {formData.last_name}
            </h4>
            <p className="text-sm text-gray-600">{formData.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
              formData.role === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
