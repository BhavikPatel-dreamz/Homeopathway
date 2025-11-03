"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { generateSlug, createUniqueSlugFromName } from '@/lib/slugUtils';

interface EditAilmentFormProps {
  ailmentId: string;
}

export default function EditAilmentForm({ ailmentId }: EditAilmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [slugLoading, setSlugLoading] = useState(false);
  const [originalName, setOriginalName] = useState(''); // Track original name to avoid unnecessary slug updates
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
  });

  const fetchAilment = useCallback(async () => {
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
      
      // Set original name for slug comparison
      setOriginalName(data.name || '');
    } catch (err: unknown) {
      console.error('Error fetching ailment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ailment';
      setError(errorMessage);
    } finally {
      setFetching(false);
    }
  }, [ailmentId]);

  useEffect(() => {
    fetchAilment();
  }, [fetchAilment]);

  // Generate slug when name changes (only if different from original)
  useEffect(() => {
    const generateSlugFromName = async () => {
      if (formData.name.trim() && formData.name !== originalName) {
        setSlugLoading(true);
        try {
          // For edit form, we need to exclude current ailment from uniqueness check
          const uniqueSlug = await createUniqueSlugFromName(formData.name, ailmentId);
          setGeneratedSlug(uniqueSlug);
        } catch (error) {
          console.error('Error generating slug:', error);
          setGeneratedSlug(generateSlug(formData.name));
        } finally {
          setSlugLoading(false);
        }
      } else if (formData.name === originalName) {
        // If name is same as original, no need to generate new slug
        setGeneratedSlug('');
      } else {
        setGeneratedSlug('');
      }
    };

    const timeoutId = setTimeout(generateSlugFromName, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [formData.name, originalName, ailmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate final unique slug if name changed
      let finalSlug = null;
      if (formData.name !== originalName) {
        finalSlug = await createUniqueSlugFromName(formData.name, ailmentId);
      }

      const updateData: Record<string, unknown> = {
        name: formData.name,
        icon: formData.icon,
        description: formData.description,
        updated_at: new Date().toISOString(),
      };

      // Only update slug if name changed
      if (finalSlug) {
        updateData.slug = finalSlug;
      }

      const { error: updateError } = await supabase
        .from('ailments')
        .update(updateData)
        .eq('id', ailmentId);

      if (updateError) throw updateError;

      // Success - redirect back to ailments page
      router.push('/admin/dashboard/ailments');
    } catch (err: unknown) {
      console.error('Error updating ailment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ailment';
      setError(errorMessage);
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

            {/* Slug Preview - only show if name changed */}
            {formData.name && formData.name !== originalName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug (Auto-generated from new name)
                </label>
                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  {slugLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                      <span>Generating unique slug...</span>
                    </div>
                  ) : (
                    <span className="font-mono">
                      /ailments/{generatedSlug || generateSlug(formData.name)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This URL will be updated when you save the changes
                </p>
              </div>
            )}

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
