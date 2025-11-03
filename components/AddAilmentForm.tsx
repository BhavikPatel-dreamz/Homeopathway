'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { generateSlug, createUniqueSlugFromName } from '@/lib/slugUtils';

export default function AddAilmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [slugLoading, setSlugLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
  });

  // Generate slug when name changes
  useEffect(() => {
    const generateSlugFromName = async () => {
      if (formData.name.trim()) {
        setSlugLoading(true);
        try {
          const uniqueSlug = await createUniqueSlugFromName(formData.name);
          setGeneratedSlug(uniqueSlug);
        } catch (error) {
          console.error('Error generating slug:', error);
          setGeneratedSlug(generateSlug(formData.name));
        } finally {
          setSlugLoading(false);
        }
      } else {
        setGeneratedSlug('');
      }
    };

    const timeoutId = setTimeout(generateSlugFromName, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate final unique slug
      const finalSlug = await createUniqueSlugFromName(formData.name);
      
      const { error: insertError } = await supabase
        .from('ailments')
        .insert([
          {
            name: formData.name,
            slug: finalSlug,
            icon: formData.icon,
            description: formData.description,
            created_by: user?.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Success - redirect back to ailments page
      router.push('/admin/dashboard/ailments');
    } catch (err: unknown) {
      console.error('Error adding ailment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add ailment';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/admin/dashboard/ailments"
          className="text-teal-600 hover:text-teal-700 flex items-center gap-2 mb-4"
        >
          ← Back to Ailments
        </Link>
        <h1 className="text-3xl font-serif text-gray-900">Add New Ailment</h1>
        <p className="text-gray-600 mt-2">Create a new health condition or ailment</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ailment Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Headache, Anxiety, Cold & Flu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Slug Preview */}
          {formData.name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug (Auto-generated)
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
                This URL will be used to access the ailment page
              </p>
            </div>
          )}

          {/* Icon Field */}
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
              Icon (Emoji) *
            </label>
            <input
              type="text"
              id="icon"
              name="icon"
              required
              value={formData.icon}
              onChange={handleChange}
              placeholder="e.g., 🤕, 😰, 🤧"
              maxLength={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-3xl"
            />
            <p className="text-sm text-gray-500 mt-1">
              Use an emoji to represent this ailment
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the ailment, its symptoms, and characteristics..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Adding...' : 'Add Ailment'}
            </button>
            <Link
              href="/admin/dashboard/ailments"
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Preview Card */}
      {(formData.name || formData.icon) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{formData.icon || '❓'}</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {formData.name || 'Ailment Name'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.description || 'Description will appear here...'}
                </p>
                <p className="text-xs text-gray-500 mt-2">0 remedies</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
