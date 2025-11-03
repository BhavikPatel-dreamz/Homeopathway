'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { generateSlug, createUniqueSlugFromName } from '@/lib/slugUtils';
import AilmentRemedyManager from './AilmentRemedyManager';
import { AilmentRemedy } from '@/types';

export default function AddAilmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [slugLoading, setSlugLoading] = useState(false);
  const [selectedRemedyRelations, setSelectedRemedyRelations] = useState<AilmentRemedy[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'remedies'>('basic');
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    personalizedApproach: '',
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('=== ADD AILMENT SUBMISSION STARTED ===');
    console.log('Form data:', formData);
    console.log('Selected remedy relations:', selectedRemedyRelations);
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Ailment name is required');
      setActiveTab('basic'); // Switch to basic tab to show the error
      console.log('Validation failed: Missing name');
      return;
    }
    
    if (!formData.icon.trim()) {
      setError('Icon is required');
      setActiveTab('basic');
      console.log('Validation failed: Missing icon');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      setActiveTab('basic');
      console.log('Validation failed: Missing description');
      return;
    }

    if (!formData.personalizedApproach.trim()) {
      setError('Personalized approach is required');
      setActiveTab('basic');
      console.log('Validation failed: Missing personalized approach');
      return;
    }

    console.log('Validation passed, starting submission...');
    setLoading(true);
    setError(null);

    try {
      console.log('Getting current user...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to add an ailment');
      }
      
      console.log('Current user:', user.id);
      
      // Generate final unique slug
      console.log('Generating slug...');
      const finalSlug = await createUniqueSlugFromName(formData.name);
      console.log('Generated slug:', finalSlug);
      
      // Check if ailment with this name already exists
      console.log('Checking for existing ailment...');
      const { data: existingAilment, error: checkError } = await supabase
        .from('ailments')
        .select('id, name')
        .eq('name', formData.name)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is what we want
        console.error('Error checking for existing ailment:', checkError);
        throw new Error('Failed to verify ailment uniqueness. Please try again.');
      }
      
      if (existingAilment) {
        throw new Error(`An ailment named "${formData.name}" already exists. Please choose a different name.`);
      }
      
      console.log('Ailment name is unique, proceeding with insert...');
      
      console.log('Inserting ailment...');
      const { data: ailmentData, error: insertError } = await supabase
        .from('ailments')
        .insert([
          {
            name: formData.name,
            slug: finalSlug,
            icon: formData.icon,
            description: formData.description,
            personalized_approach: formData.personalizedApproach,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Ailment insert error:', insertError);
        console.error('Error details:', JSON.stringify(insertError, null, 2));
        console.error('Insert data was:', {
          name: formData.name,
          slug: finalSlug,
          icon: formData.icon,
          description: formData.description,
          created_by: user?.id,
        });
        
        // Provide more specific error messages
        if (insertError.code === '23505') {
          // Unique constraint violation
          if (insertError.message.includes('ailments_name_key')) {
            throw new Error(`An ailment named "${formData.name}" already exists. Please choose a different name.`);
          } else if (insertError.message.includes('ailments_slug_key')) {
            throw new Error(`The URL slug "${finalSlug}" is already taken. Please modify the ailment name.`);
          } else {
            throw new Error('This ailment already exists. Please check the name and try again.');
          }
        } else if (insertError.message.includes('permission denied')) {
          throw new Error('Database permission error. Please check if you have admin access.');
        } else if (insertError.message.includes('violates foreign key')) {
          throw new Error('Invalid user reference. Please try logging out and back in.');
        } else if (insertError.message.includes('violates not-null constraint')) {
          throw new Error('Missing required field. Please fill in all required information.');
        } else {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }

      console.log('Ailment created successfully:', ailmentData);

      // If we have selected remedy relations, create them
      if (selectedRemedyRelations.length > 0) {
        console.log('Creating remedy relations:', selectedRemedyRelations.length);
        const remedyRelations = selectedRemedyRelations.map(relation => ({
          ailment_id: ailmentData.id,
          remedy_id: relation.remedy_id,
        }));

        console.log('Remedy relations to insert:', remedyRelations);

        const { error: relationsError } = await supabase
          .from('ailment_remedies')
          .insert(remedyRelations);

        if (relationsError) {
          console.error('Error creating remedy relations:', relationsError);
          throw relationsError;
        }
        
        console.log('Remedy relations created successfully');
      } else {
        console.log('No remedy relations to create');
      }

      console.log('=== ADD AILMENT SUBMISSION COMPLETED ===');
      
      // Success - redirect back to ailments page
      router.push('/admin/dashboard/ailments');
    } catch (err: unknown) {
      console.error('Error adding ailment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add ailment';
      setError(errorMessage);
    } finally {
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
    <div className="max-w-4xl mx-auto space-y-6">
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
              Related Remedies {selectedRemedyRelations.length > 0 && `(${selectedRemedyRelations.length})`}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
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

              {/* Generated Slug Preview */}
              {generatedSlug && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">URL Slug:</span>
                    <code className="text-sm bg-white px-2 py-1 rounded border text-gray-800">
                      {generatedSlug}
                    </code>
                    {slugLoading && (
                      <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be the URL for this ailment page
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

              {/* Personalized Approach Field */}
              <div>
                <label htmlFor="personalizedApproach" className="block text-sm font-medium text-gray-700 mb-2">
                  Personalized Approach *
                </label>
                <textarea
                  id="personalizedApproach"
                  name="personalizedApproach"
                  required
                  value={formData.personalizedApproach}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the personalized approach and treatment recommendations for this ailment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'remedies' && (
            <AilmentRemedyManager
              onRemedyRelationsChange={setSelectedRemedyRelations}
            />
          )}
        </div>

        {/* Action Buttons - Always visible */}
        <div className="border-t border-gray-200 p-6">
          {/* Status Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Form Status:</span>
                <div className="flex gap-4 text-xs">
                  <span className={formData.name ? 'text-green-600' : 'text-red-600'}>
                    Name: {formData.name ? '✓' : '✗'}
                  </span>
                  <span className={formData.icon ? 'text-green-600' : 'text-red-600'}>
                    Icon: {formData.icon ? '✓' : '✗'}
                  </span>
                  <span className={formData.description ? 'text-green-600' : 'text-red-600'}>
                    Description: {formData.description ? '✓' : '✗'}
                  </span>
                  <span className={formData.personalizedApproach ? 'text-green-600' : 'text-red-600'}>
                    Approach: {formData.personalizedApproach ? '✓' : '✗'}
                  </span>
                  <span className="text-blue-600">
                    Remedies: {selectedRemedyRelations.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSubmit()}
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
        </div>
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
                {formData.personalizedApproach && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    <strong>Approach:</strong> {formData.personalizedApproach}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {selectedRemedyRelations.length} remedies selected
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}