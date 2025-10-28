"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface EditAilmentFormProps {
  ailmentId: string;
}

export default function EditAilmentForm({ ailmentId }: EditAilmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
  });

  useEffect(() => {
    fetchAilment();
  }, [ailmentId]);

  const fetchAilment = async () => {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(ailmentId)) {
        throw new Error('Invalid ailment ID format. Please use a valid UUID from your database.');
      }

      const { data, error } = await supabase
        .from('ailments')
        .select('*')
        .eq('id', ailmentId)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Ailment not found');
      }

      setFormData({
        name: data.name || '',
        icon: data.icon || '',
        description: data.description || '',
      });
    } catch (err: any) {
      console.error('Error fetching ailment:', err);
      setError(err.message || 'Failed to load ailment');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('ailments')
        .update({
          name: formData.name,
          icon: formData.icon,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ailmentId);

      if (updateError) throw updateError;

      // Success - redirect back to ailments page
      router.push('/admin/dashboard/ailments');
    } catch (err: any) {
      console.error('Error updating ailment:', err);
      setError(err.message || 'Failed to update ailment');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ailment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/dashboard/ailments"
          className="text-teal-600 hover:text-teal-800 flex items-center mb-4"
        >
          ← Back to Ailments
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Ailment</h1>
        <p className="text-gray-600 mt-2">Update the ailment information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ailment Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Headache, Common Cold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon/Emoji
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🤕"
                maxLength={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter an emoji to represent this ailment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the ailment, its symptoms, and characteristics..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Updating...' : 'Update Ailment'}
              </button>
              <Link
                href="/admin/dashboard/ailments"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preview
          </h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {formData.icon || '❓'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {formData.name || 'Ailment Name'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {formData.description || 'Description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
