"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { createUniqueSlugFromName, generateSlug } from '@/lib/slugUtils';

export default function AddRemedyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    scientific_name: '',
    common_name: '',
    description: '',
    key_symptoms: '',
    constitutional_type: '',
    dosage_forms: '',
    safety_precautions: '',
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

      const dosageForms = formData.dosage_forms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const { error: insertError } = await supabase
        .from('remedies')
        .insert([
          {
            name: formData.name,
            slug: slug,
            scientific_name: formData.scientific_name || null,
            common_name: formData.common_name || null,
            description: formData.description,
            key_symptoms: keySymptoms,
            constitutional_type: formData.constitutional_type || null,
            dosage_forms: dosageForms,
            safety_precautions: formData.safety_precautions || null,
            created_by: user?.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Success - redirect back to remedies page
      router.push('/admin/dashboard/remedies');
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
          href="/admin/dashboard/remedies"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
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

              {/* Scientific Name */}
              <div>
                <label htmlFor="scientific_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Scientific Name
                </label>
                <input
                  type="text"
                  id="scientific_name"
                  name="scientific_name"
                  value={formData.scientific_name}
                  onChange={handleChange}
                  placeholder="e.g., Arnica montana"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Common Name */}
              <div>
                <label htmlFor="common_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Common Name
                </label>
                <input
                  type="text"
                  id="common_name"
                  name="common_name"
                  value={formData.common_name}
                  onChange={handleChange}
                  placeholder="e.g., Mountain Arnica, Deadly Nightshade"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
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
            </div>
          </div>

          {/* Clinical Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Information</h3>
            
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

              {/* Constitutional Type */}
              <div>
                <label htmlFor="constitutional_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Constitutional Type
                </label>
                <input
                  type="text"
                  id="constitutional_type"
                  name="constitutional_type"
                  value={formData.constitutional_type}
                  onChange={handleChange}
                  placeholder="e.g., Nervous, Robust, Phlegmatic"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Dosage Forms */}
              <div>
                <label htmlFor="dosage_forms" className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage Forms *
                </label>
                <input
                  type="text"
                  id="dosage_forms"
                  name="dosage_forms"
                  required
                  value={formData.dosage_forms}
                  onChange={handleChange}
                  placeholder="30C, 200C, 6C, 1M"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-500 mt-1">Separate potencies with commas</p>
              </div>
            </div>
          </div>

          {/* Safety Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Information</h3>
            
            <div>
              <label htmlFor="safety_precautions" className="block text-sm font-medium text-gray-700 mb-2">
                Safety Precautions
              </label>
              <textarea
                id="safety_precautions"
                name="safety_precautions"
                value={formData.safety_precautions}
                onChange={handleChange}
                rows={3}
                placeholder="List any contraindications, warnings, or special precautions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              />
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
              href="/admin/dashboard/remedies"
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
            <h4 className="text-xl font-bold text-gray-900">{formData.name}</h4>
            {formData.scientific_name && (
              <p className="text-sm italic text-gray-600 mt-1">{formData.scientific_name}</p>
            )}
            {formData.common_name && (
              <p className="text-sm text-gray-600">Common: {formData.common_name}</p>
            )}
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
            {formData.dosage_forms && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Available Potencies:</p>
                <div className="flex gap-2">
                  {formData.dosage_forms.split(',').map((dosage, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-mono"
                    >
                      {dosage.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
