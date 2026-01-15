"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { createUniqueSlugFromName, generateSlug } from '@/lib/slugUtils';
import { healthEmojis } from '@/lib/emojiList';

interface EditRemedyFormProps {
  remedyId: string;
}

export default function EditRemedyForm({ remedyId }: EditRemedyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [rating, setRating] = useState<number>(0);
const [reviewCount, setReviewCount] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    key_symptoms: '',
    icon: '',
  });

  useEffect(() => {
    const fetchRemedy = async () => {
      try {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(remedyId)) {
          throw new Error('Invalid remedy ID format. Please use a valid UUID from your database.');
        }

        const { data, error } = await supabase
          .from('remedies')
          .select('*')
          .eq('id', remedyId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error('Remedy not found');
        }

        setFormData({
  name: data.name || '',
  slug: data.slug || '',
  description: data.description || '',
  key_symptoms: Array.isArray(data.key_symptoms) ? data.key_symptoms.join(', ') : '',
  icon: data.icon || '',
});

// ✅ NEW
setRating(data.average_rating || 0);
setReviewCount(data.review_count || 0);

      } catch (err: unknown) {
        console.error('Error fetching remedy:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load remedy';
        setError(errorMessage);
      } finally {
        setFetching(false);
      }
    };

    fetchRemedy();
  }, [remedyId]);

  const renderStars = (value: number) => {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rounded ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate unique slug if needed (for new names or edited slugs)
      let finalSlug = formData.slug;
      if (!finalSlug || finalSlug.trim() === '') {
        finalSlug = await createUniqueSlugFromName(formData.name, 'remedies', remedyId);
      }

      // Convert comma-separated strings to arrays
      const keySymptoms = formData.key_symptoms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const { error: updateError } = await supabase
        .from('remedies')
        .update({
          name: formData.name,
          slug: finalSlug,
          description: formData.description,
          key_symptoms: keySymptoms,
          icon: formData.icon || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', remedyId);

      if (updateError) throw updateError;

      // Success - redirect back to remedies page
      router.push('/admin/remedies');
    } catch (err: unknown) {
      console.error('Error updating remedy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update remedy';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug when name changes
    if (name === 'name' && value.trim()) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug,
      }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = generateSlug(e.target.value);
    setFormData(prev => ({
      ...prev,
      slug: newSlug,
    }));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading remedy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/remedies"
          className="text-teal-600 hover:text-teal-700 flex items-center gap-2 mb-4"
        >
          ← Back to Remedies
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Remedy</h1>
        <p className="text-gray-600 mt-2">Update the remedy information</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="border-b pb-6">

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Remedy Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Arnica Montana, Belladonna"
                  className="w-full px-4 py-2 border text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="e.g., arnica-montana, belladonna"
                  className="w-full px-4 py-2 border text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-500 mt-1">Auto-generated from remedy name, but can be edited</p>
              </div>

              {/* Description */}
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
                  placeholder="Describe the remedy, its uses, and characteristics..."
                  className="w-full px-4 py-2 text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>

              {/* Icon */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                  Icon (Emoji)
                </label>

                {/* Current Selection Display */}
                <div className="mb-3">
                  <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-3xl">
                      {formData.icon || '❓'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {formData.icon ? 'Selected Emoji' : 'No emoji selected'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.icon ? 'Click on a different emoji below to change' : 'Choose an emoji from the options below'}
                      </p>
                    </div>
                    {formData.icon && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: '' })}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Emoji Picker */}
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      {showEmojiPicker ? 'Hide' : 'Show'} Emoji Options
                    </button>
                  </div>

                  {showEmojiPicker && (
                    <div className="grid grid-cols-12 gap-2 max-h-48 overflow-y-auto">
                      {healthEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, icon: emoji });
                            setShowEmojiPicker(false);
                          }}
                          className={`p-2 text-xl rounded-lg border transition-all hover:bg-teal-50 hover:border-teal-300 ${formData.icon === emoji
                            ? 'bg-teal-100 border-teal-500 ring-2 ring-teal-200'
                            : 'bg-gray-50 border-gray-200 hover:shadow-sm'
                            }`}
                          title={`Select ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {!showEmojiPicker && (
                    <div className="text-sm text-gray-500">
                      Click &ldquo;Show Emoji Options&rdquo; to browse available emojis
                    </div>
                  )}
                </div>

                {/* Manual Input Option */}
                <div className="mt-3">
                  <label className="text-xs text-gray-600 block mb-1">
                    Or enter manually:
                  </label>
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="Type or paste emoji here"
                    maxLength={2}
                    className="w-full px-3 py-2 text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-2xl text-center"
                  />
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Use an emoji to represent this remedy (optional)
                </p>
              </div>

            </div>
          </div>

          {/* Clinical Information */}
          <div className="border-b pb-6">

            <div className="space-y-4">
              {/* Key Symptoms */}
              <div>
                <label htmlFor="key_symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                  Key Symptoms *
                </label>
                <input
                  type="text"
                  id="key_symptoms"
                  name="key_symptoms"
                  required
                  value={formData.key_symptoms}
                  onChange={handleChange}
                  placeholder="Bruising, Muscle soreness, Trauma, Shock"
                  className="w-full px-4 py-2 text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-500 mt-1">Separate symptoms with commas</p>
              </div>

            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Updating...' : 'Update Remedy'}
            </button>
            <Link
              href="/admin/remedies"
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Preview Card */}
      {/* Preview Card */}
{formData.name && (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

    <div className="border border-gray-200 rounded-xl p-5 flex items-center gap-5">
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-50 text-3xl">
          {formData.icon || '💊'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="text-xl font-bold text-gray-900">
          {formData.name}
        </h4>

        {/* Subtitle (first key symptom like 2nd image) */}
        {formData.key_symptoms && (
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {formData.key_symptoms.split(',')[0].trim()}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          {renderStars(rating)}
          <span className="text-sm text-gray-500">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>

        {/* Description */}
        {formData.description && (
          <p className="text-gray-700 mt-2 text-sm">
            {formData.description}
          </p>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
