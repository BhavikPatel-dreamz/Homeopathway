'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Remedy, AilmentRemedy } from '@/types';

interface AilmentRemedyManagerProps {
  ailmentId?: string; // Optional for add mode
  onRemedyRelationsChange?: (relations: AilmentRemedy[]) => void;
}

interface RemedyWithRelation extends Remedy {
  isSelected: boolean;
  relation_id?: string;
}

export default function AilmentRemedyManager({
  ailmentId,
  onRemedyRelationsChange
}: AilmentRemedyManagerProps) {
  const [activeTab, setActiveTab] = useState<'available' | 'related'>('available');
  const [remedies, setRemedies] = useState<RemedyWithRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingRelation, setSavingRelation] = useState<string | null>(null);


  const loadRemedies = useCallback(async () => {
    try {
      setLoading(true);

      // Load all remedies
      const { data: remediesData, error: remediesError } = await supabase
        .from('remedies')
        .select('*')
        .order('name');

      if (remediesError) {
        console.error('Error loading remedies:', remediesError);
        throw remediesError;
      }


      // If we have an ailmentId, load existing relations
      let existingRelations: AilmentRemedy[] = [];
      if (ailmentId) {
        const { data: relationsData, error: relationsError } = await supabase
          .from('ailment_remedies')
          .select('*')
          .eq('ailment_id', ailmentId);

        if (relationsError) {
          console.error('Error loading relations:', relationsError);
          throw relationsError;
        }
        existingRelations = relationsData || [];

      }

      // Combine remedies with relation status
      const remediesWithRelations: RemedyWithRelation[] = (remediesData || []).map(remedy => {
        const existingRelation = existingRelations.find(r => r.remedy_id === remedy.id);
        return {
          ...remedy,
          isSelected: !!existingRelation,
          relation_id: existingRelation?.id,
        };
      });

      setRemedies(remediesWithRelations);

      // Notify parent of current relations
      const currentRelations = existingRelations;
      onRemedyRelationsChange?.(currentRelations);

    } catch (err) {
      console.error('Error loading remedies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load remedies');
    } finally {
      setLoading(false);
    }
  }, [ailmentId, onRemedyRelationsChange]);

  // Load all remedies and existing relations
  useEffect(() => {
    loadRemedies();
  }, [loadRemedies]);

  const handleRemedyToggle = async (remedyId: string) => {
    if (!ailmentId) {
      // In add mode, just toggle selection locally and notify parent
      const updatedRemedies = remedies.map(remedy =>
        remedy.id === remedyId
          ? { ...remedy, isSelected: !remedy.isSelected }
          : remedy
      );
      setRemedies(updatedRemedies);

      // Create relations array for selected remedies to pass to parent
      const selectedRelations = updatedRemedies
        .filter(r => r.isSelected)
        .map(r => ({
          id: '', // Will be set when saved
          ailment_id: '', // Will be set when ailment is created
          remedy_id: r.id!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      onRemedyRelationsChange?.(selectedRelations);
      return;
    }

    try {
      setSavingRelation(remedyId);
      const remedy = remedies.find(r => r.id === remedyId);

      if (!remedy) {
        throw new Error('Remedy not found');
      }

      if (remedy.isSelected) {
        // Remove relation
        if (remedy.relation_id) {
          const { error } = await supabase
            .from('ailment_remedies')
            .delete()
            .eq('id', remedy.relation_id);

          if (error) {
            console.error('Database error removing relation:', error);
            throw new Error(`Failed to remove remedy relation: ${error.message}`);
          }
        }
      } else {
        // Add relation
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Auth error:', userError);
          throw new Error('Authentication failed');
        }

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Try a simple insert with minimal data first
        const insertData = {
          ailment_id: ailmentId,
          remedy_id: remedyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('ailment_remedies')
          .insert(insertData)
          .select();

        if (error) {
          console.error('Database error adding relation:', error);
          console.error('Full error details:', JSON.stringify(error, null, 2));
          console.error('Insert data:', insertData);

          // Try to provide more specific error information
          if (error.message.includes('permission denied')) {
            throw new Error('Database permission error. The RLS policies may be blocking this operation. Please run the permission fix SQL script.');
          } else if (error.message.includes('duplicate key')) {
            throw new Error('This remedy is already associated with this ailment.');
          } else if (error.message.includes('violates foreign key')) {
            throw new Error('Invalid ailment or remedy ID. Please check that both exist.');
          } else {
            throw new Error(`Failed to add remedy relation: ${error.message}`);
          }
        }

        console.log('Successfully inserted relation:', data);
      }

      // Reload to get updated data
      await loadRemedies();

    } catch (err) {
      console.error('Error toggling remedy relation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update remedy relation';
      setError(errorMessage);
    } finally {
      setSavingRelation(null);
    }
  };

  const filteredRemedies = remedies.filter(remedy => {
    const matchesSearch = remedy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remedy.scientific_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remedy.common_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'available') {
      return matchesSearch;
    } else {
      return matchesSearch && remedy.isSelected;
    }
  });

  const relatedRemediesCount = remedies.filter(r => r.isSelected).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Manage Related Remedies
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          {ailmentId
            ? "Add or remove remedies that are effective for treating this ailment"
            : "Select remedies to relate with this ailment (will be saved when ailment is created)"
          }
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 ml-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'available'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              All Remedies ({remedies.length})
            </button>
            <button
              onClick={() => setActiveTab('related')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'related'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Related Remedies ({relatedRemediesCount})
            </button>
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search remedies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Remedies List */}
      <div className="px-6 pb-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRemedies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No remedies found matching your search' : 'No remedies available'}
            </div>
          ) : (
            filteredRemedies.map((remedy) => (
              <div key={remedy.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={remedy.isSelected}
                      onChange={() => handleRemedyToggle(remedy.id!)}
                      disabled={savingRelation === remedy.id}
                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {remedy.name}
                      </h4>
                      {remedy.scientific_name && (
                        <p className="text-xs text-gray-500 italic">
                          {remedy.scientific_name}
                        </p>
                      )}
                      {remedy.common_name && (
                        <p className="text-xs text-gray-600">
                          {remedy.common_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {remedy.description}
                      </p>
                    </div>
                  </div>

                  {savingRelation === remedy.id && (
                    <div className="ml-2">
                      <div className="animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}