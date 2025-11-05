"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { generateSlug, createUniqueSlugFromName } from '@/lib/slugUtils';
import { healthEmojis } from '@/lib/emojiList';
import AilmentRemedyManager from './AilmentRemedyManager';

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
  const [activeTab, setActiveTab] = useState<'basic' | 'remedies'>('basic');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    personalizedApproach: '',
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
        personalizedApproach: data.personalized_approach || '',
      });
      setOriginalName(data.name || '');
      setGeneratedSlug(data.slug || '');
    } catch (err) {
      console.error('Error fetching ailment:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ailment');
    } finally {
      setFetching(false);
    }
  }, [ailmentId]);

  useEffect(() => {
    fetchAilment();
  }, [fetchAilment]);

  // Generate slug when name changes (and is different from original)
  useEffect(() => {
    const generateSlugFromName = async () => {
      if (formData.name.trim() && formData.name !== originalName) {
        setSlugLoading(true);
        try {
          const uniqueSlug = await createUniqueSlugFromName(formData.name, 'ailments', ailmentId);
          setGeneratedSlug(uniqueSlug);
        } catch (error) {
          console.error('Error generating slug:', error);
          setGeneratedSlug(generateSlug(formData.name));
        } finally {
          setSlugLoading(false);
        }
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
        finalSlug = await createUniqueSlugFromName(formData.name, 'ailments', ailmentId);
      }

      const updateData: Record<string, unknown> = {
        name: formData.name,
        icon: formData.icon,
        description: formData.description,
        personalized_approach: formData.personalizedApproach,
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
      router.push('/admin/ailments');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/ailments"
          className="text-teal-600 hover:text-teal-800 flex items-center mb-4"
        >
          ← Back to Ailments
        </Link>
        <h1 className="text-3xl font-serif text-gray-900">Edit Ailment</h1>
        <p className="text-gray-600 mt-2">Update the ailment information and manage related remedies</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('remedies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'remedies'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Related Remedies
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                          <code>{generatedSlug}</code>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        This will be the new URL for this ailment
                      </p>
                    </div>
                  )}

                  {/* Icon Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon (Emoji) *
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
                        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                          {healthEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, icon: emoji });
                                setShowEmojiPicker(false);
                              }}
                              className={`p-2 text-2xl rounded-lg border transition-all hover:bg-teal-50 hover:border-teal-300 ${
                                formData.icon === emoji
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
                        required
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        maxLength={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-2xl text-center"
                        placeholder="Type or paste emoji here"
                      />
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      Select an emoji that best represents this ailment
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Describe the ailment, its symptoms, and characteristics..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personalized Approach *
                    </label>
                    <textarea
                      required
                      value={formData.personalizedApproach}
                      onChange={(e) =>
                        setFormData({ ...formData, personalizedApproach: e.target.value })
                      }
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Describe the personalized approach and treatment recommendations for this ailment..."
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
                      href="/admin/ailments"
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div>
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
                      <p className="text-sm text-gray-600 mb-2">
                        {formData.description || 'Description will appear here...'}
                      </p>
                      {formData.personalizedApproach && (
                        <p className="text-sm text-gray-600 italic">
                          <strong>Approach:</strong> {formData.personalizedApproach}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'remedies' && (
            <AilmentRemedyManager ailmentId={ailmentId} />
          )}
        </div>
      </div>
    </div>
  );
}