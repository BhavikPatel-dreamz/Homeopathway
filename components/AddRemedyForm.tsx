"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { createUniqueSlugFromName, generateSlug } from '@/lib/slugUtils';
import { healthEmojis } from '@/lib/emojiList';

export default function AddRemedyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    key_symptoms: '',
    icon: '',
    image_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate unique slug for the remedy
      const slug = await createUniqueSlugFromName(formData.name, 'remedies');

      // Convert comma-separated strings to arrays
      const keySymptoms = formData.key_symptoms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);


      const { error: insertError } = await supabase
        .from('remedies')
        .insert([
          {
            name: formData.name,
            slug: slug,
            description: formData.description,
            key_symptoms: keySymptoms,
            icon: formData.icon || null,
            image_url: formData.image_url || null,
            created_by: user?.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Success - redirect back to remedies page
      router.push('/admin/remedies');
    } catch (err: unknown) {
      console.error('Error adding remedy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add remedy';
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
        <h1 className="text-3xl font-bold text-gray-900">Add New Remedy</h1>
        <p className="text-gray-600 mt-2">Create a new homeopathic remedy</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-2xl text-center"
                  />
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Use an emoji to represent this remedy (optional)
                </p>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/remedy-image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Add a URL to an image of the remedy plant/substance
                </p>
                {formData.image_url && (
                  <div className="mt-2">
                    <Image
                      src={formData.image_url}
                      alt="Remedy preview"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              {loading ? 'Adding...' : 'Add Remedy'}
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
      {formData.name && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {/* Icon/Image Section */}
              <div className="flex-shrink-0">
                {formData.image_url ? (
                  <Image
                    src={formData.image_url}
                    alt={formData.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : formData.icon ? (
                  <div className="w-20 h-20 flex items-center justify-center text-4xl bg-gray-50 rounded-lg border border-gray-200">
                    {formData.icon}
                  </div>
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-gray-400 text-xs text-center">No icon/image</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">{formData.name}</h4>

                {formData.description && (
                  <p className="text-gray-700 mt-3">{formData.description}</p>
                )}
                {formData.key_symptoms && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.key_symptoms.split(',').map((symptom, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs"
                        >
                          {symptom.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
