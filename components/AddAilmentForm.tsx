'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AddAilmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error: insertError } = await supabase
        .from('ailments')
        .insert([
          {
            name: formData.name,
            icon: formData.icon,
            description: formData.description,
            created_by: user?.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Success - redirect back to ailments page
      router.push('/admin/dashboard/ailments');
    } catch (err: any) {
      console.error('Error adding ailment:', err);
      setError(err.message || 'Failed to add ailment');
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
