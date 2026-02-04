/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import { useRef } from 'react';
import { getCurrentUser } from '@/lib/auth';
import Image from 'next/image';
import RemedyMultiSelect from './RemedyMultiSelect';
import RequestAilmentRemedyModal from './RequestAilmentRemedyModal';
import supabase from '@/lib/supabaseClient';
import type { RemedyOption, Ailment } from "@/types";



interface AddReviewFormProps {
  onClose: () => void;
  remedyId: string;
  remedyName: string;
  condition?: string;
  ailmentId?: string;
}

export default function AddReviewForm({ onClose, remedyId, remedyName, condition = 'your condition', ailmentId }: AddReviewFormProps) {
  const router = useRouter();
  const [selectedRemedies, setSelectedRemedies] = useState<RemedyOption[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [ailments, setAilments] = useState<Ailment[]>([]);
  const [selectedAilment, setSelectedAilment] = useState<string>(ailmentId || '');
  const [ailmentQuery, setAilmentQuery] = useState<string>('');
  const [ailmentActiveIndex, setAilmentActiveIndex] = useState<number>(-1);
  const ailmentInputRef = useRef<HTMLInputElement | null>(null);
  const remedyDropdownRef = useRef<HTMLDivElement | null>(null);
  const [showRequestAilmentModal, setShowRequestAilmentModal] = useState(false);
  const [showRequestRemedyModal, setShowRequestRemedyModal] = useState(false);
  const [ailmentsLoading, setAilmentsLoading] = useState(true);
  const [remediesList, setRemediesList] = useState<{ id: string; name: string }[]>([]);
  const [isRemedyOpen, setIsRemedyOpen] = useState(false);

  // Allow selecting primary remedy instead of forcing the incoming prop
  const [primaryRemedyId, setPrimaryRemedyId] = useState<string>(remedyId);
  const [primaryRemedyName, setPrimaryRemedyName] = useState<string>(remedyName);
  const [remedyPotencies, setRemedyPotencies] = useState<Record<string, string>>({
    [primaryRemedyId]: ''
  });

  const [formData, setFormData] = useState({
    remedy: remedyName,
    condition: condition,
    rating: 0,
    potencyType: '',
    potency: '',
    dosage: '',
    duration: '',
    effectiveness: '',
    sideEffects: '',
    notes: ''
  });

  type RemedyExtra = {
    potencyType: string;
    notes: string;
  };

  const [remedyExtras, setRemedyExtras] = useState<Record<string, RemedyExtra>>({
    [primaryRemedyId]: {
      potencyType: '',
      notes: ''
    }
  });

  const totalSteps = 8;
  const allRemedies = [
    { id: primaryRemedyId, name: primaryRemedyName },
    ...selectedRemedies
  ];


  useEffect(() => {
    const allRemedies = [
      { id: primaryRemedyId, name: primaryRemedyName },
      ...selectedRemedies
    ];

    allRemedies.forEach(rem => {
      setRemedyExtras(prev => {
        if (prev[rem.id]) return prev;
        return {
          ...prev,
          [rem.id]: { potencyType: '', notes: '' }
        };
      });
    });
  }, [selectedRemedies, primaryRemedyId, primaryRemedyName]);

  // Fetch ailments from database
  useEffect(() => {
    const fetchAilments = async () => {
      try {
        setAilmentsLoading(true);
        const { data, error } = await supabase
          .from('ailments')
          .select('id, name, slug, icon, remedies_count')
          .order('name', { ascending: true });

        if (error) throw error;
        setAilments(data || []);
      } catch (err) {
        console.error('Error fetching ailments:', err);
      } finally {
        setAilmentsLoading(false);
      }
    };

    fetchAilments();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
          router.push('/login');
          onClose();
          return;
        }
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Authentication check failed:', err);
        router.push('/login');
        onClose();
      }
    };

    checkAuth();
  }, [router, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Save original body overflow style
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Restore original styles on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  const handleClose = () => {
    onClose();
    setShowSuccess(false);
  };

  // Fetch remedies list for dropdown (simple id/name list)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('remedies')
          .select('id, name')
          .order('name', { ascending: true });
        if (error) {
          console.error('Error fetching remedies list:', error);
          return;
        }
        if (cancelled) return;
        setRemediesList((data || []).map((r: any) => ({ id: String(r.id), name: r.name })));
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submitReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const reviewData = {
        remedy_id: primaryRemedyId,
        // Use the selected ailment from the form (fallback to null)
        ailment_id: selectedAilment || null,
        star_count: formData.rating,
        secondary_remedy_ids: selectedRemedies.map(r => r.id),
        // Combines the global type with the primary remedy potency
        potency:
          remedyExtras[primaryRemedyId]?.potencyType && remedyPotencies[primaryRemedyId]
            ? `${remedyExtras[primaryRemedyId].potencyType} ${remedyPotencies[primaryRemedyId]}`
            : null,
        dosage: formData.dosage,
        duration_used: formData.duration,
        effectiveness: formData.effectiveness === 'Completely resolved symptoms' ? 5 :
          formData.effectiveness === 'Significantly improved' ? 4 :
            formData.effectiveness === 'Moderately improved' ? 3 :
              formData.effectiveness === 'Slightly improved' ? 2 :
                formData.effectiveness === 'No change' ? 1 :
                  formData.effectiveness === 'Symptoms worsened' ? 0 : null,
        notes: formData.notes,
        experienced_side_effects: formData.sideEffects,
        // NEW: Sending detailed potency map if your API supports it
        all_potencies: remedyPotencies
      };

      // Submit primary review
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      // Also create matching review records for each selected secondary remedy
      if (selectedRemedies.length > 0) {
        const secondaryPromises = selectedRemedies.map((rem) => {
          const secondaryData = {
            ...reviewData,
            remedy_id: rem.id,
            // ensure secondary entries include the same selected ailment (or null)
            ailment_id: selectedAilment || null,
            // keep secondary_remedy_ids as-is so backend can store relations if used
          };
          return fetch('/api/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(secondaryData),
          });
        });

        const secondaryResponses = await Promise.all(secondaryPromises);
        const failed = secondaryResponses.find(r => !r.ok);
        if (failed) {
          const failedData = await failed.json().catch(() => ({}));
          throw new Error(failedData.error || 'Failed to submit review for one or more secondary remedies');
        }
      }

      setShowSuccess(true);
      // onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === totalSteps - 1) {
      submitReview();
    } else {
      setStep((prev) => prev + 1);
    }
  };


  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleRating = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handlePotencyType = (id: string, type: string) => {
    setRemedyExtras(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        potencyType: type
      }
    }));
  };

  const handleNotes = (id: string, notes: string) => {
    setRemedyExtras(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes
      }
    }));
  };

  const handleSpecificPotency = (id: string, pot: string) => {
    setRemedyPotencies(prev => ({ ...prev, [id]: pot }));
  };

  const handleDosage = (dosage: string) => {
    setFormData({ ...formData, dosage });
  };

  const handleDuration = (duration: string) => {
    setFormData({ ...formData, duration });
  };

  const handleEffectiveness = (effectiveness: string) => {
    setFormData({ ...formData, effectiveness });
  };

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[9999]">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg relative">
          <div className="p-6 sm:p-10 pt-8 sm:pt-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[5.5px] flex items-center justify-center p-3 sm:p-4 z-[9999]">
      <div className="bg-white rounded-xl w-full max-w-lg relative max-h-[95vh] overflow-y-auto">
        {/* Close Button -comment icon by Zankhana bcz 2 close icon shown on front end*/}
        <button
          onClick={handleClose}
          className="zzzzzzzzzzzzzzzzz absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={20} className="sm:hidden" />
          <X size={24} className="hidden sm:block" />
        </button>

        {/* Content */}
        <div className="pb-5 px-6 pt-8 sm:pt-10 sm:pt-15">
          {/* Header */}
          <div className="mb-2 pr-8">
            <h3 className=" font-kingred font-normal text-[24px] sm:text-[28px] lg:text-[32px] leading-[32px] sm:leading-[36px] lg:leading-[40px] text-[#0B0C0A] break-words ">
              Review a Remedy
            </h3>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Step 0: Select Ailment */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="font-montserrat font-medium text-[14px] leading-[24px] text-[#20231E] mb-2">
                Select Ailment
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-[#9A9A96] pointer-events-none z-10" />

                <input
                  ref={ailmentInputRef}
                  value={ailmentQuery}
                  onChange={(e) => {
                    setAilmentQuery(e.target.value);
                    setAilmentActiveIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    const filtered = ailmentQuery.trim().length === 0
                      ? []
                      : ailments.filter(a => a.name.toLowerCase().includes(ailmentQuery.toLowerCase()));

                    if (!filtered.length) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setAilmentActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setAilmentActiveIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const pick = filtered[ailmentActiveIndex >= 0 ? ailmentActiveIndex : 0];
                      if (pick) {
                        setSelectedAilment(pick.id);
                        setAilmentQuery('');
                      }
                    }
                  }}
                  placeholder={ailmentsLoading ? 'Loading ailments...' : 'Search ailments...'}
                  disabled={ailmentsLoading}
                  className="w-full h-[44px] rounded-[8px] border-2 border-[#F8F6F2] pl-10 pr-4 text-[14px] text-[#41463B] font-medium placeholder:text-[#9A9A96] focus:outline-none focus:border-[#6C7463]"
                />

                {/* Dropdown */}
                {ailmentQuery && (
                  <div className="border border-[#E6E6E3] rounded-[12px] bg-white shadow-[0px_0px_12px_-4px_rgba(26,26,26,0.16)] overflow-hidden mt-2">
                    <div className="max-h-[120px] overflow-y-auto pl-1 pr-4 py-1 scrollbar">
                      {!ailmentsLoading && ailments.filter(a => a.name.toLowerCase().includes(ailmentQuery.toLowerCase())).length === 0 && (
                        <p className="text-sm text-center py-3 text-[#8E8E8A]">No ailments found</p>
                      )}

                      {ailments.filter(a => a.name.toLowerCase().includes(ailmentQuery.toLowerCase())).map((a, idx) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => { setSelectedAilment(a.id); setAilmentQuery(''); }}
                          className={`w-full flex items-center gap-3 px-2 py-1 rounded-[8px] text-left transition ${idx === ailmentActiveIndex ? 'bg-[#F3F4F0] border border-[#6C7463]' : 'hover:bg-[#F7F7F5]'}`}
                        >
                          <span className="w-[24px] h-[24px] bg-[#F9F7F2] rounded-[45px] flex items-center justify-center text-[16px]">{a.icon || '🌿'}</span>
                          <span className="flex-1 font-medium text-[16px] leading-[24px] text-[#0B0C0A]">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected chip */}
                {selectedAilment && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#F5F3ED] font-medium text-[14px] text-[#41463B]">
                      {ailments.find(a => a.id === selectedAilment)?.name || 'Selected'}
                      <button type="button" onClick={() => setSelectedAilment('')} className="text-[#8E8E8A] hover:text-[#0B0C0A]">×</button>
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-[#41463B] font-normal text-center gap-2">
                Can&apos;t find what you&apos;re looking for?{" "}
                <button
                  type="button"
                  onClick={() => setShowRequestAilmentModal(true)}
                  className="text-[#2B2E28] hover:text-[#1a2a29] leading-normal font-semibold transition-colors rounded-full text-center border border-[#6C7463] px-3 py-1 hover:bg-gray-300 cursor-pointer"
                >
                  Add an Ailment
                </button>
              </p>
            </div>
          )}

          {/* Step 1: Combination Remedies */}
          {step === 1 && (
            <div className="space-y-2">

              {/* Line 1 */}
              {/* Line 1 */}
              <div className="font-montserrat font-medium sm:text-[20px] text-[16px] leading-[28px] text-[#4B544A]">
                <div className="inline-block">Select Remedy:</div>

                <span className="inline-block ml-2 relative w-[50%]">
                  <div ref={remedyDropdownRef} className="relative max-w-[300px] inline-block">
                    {/* Button (selected value) */}
                    <button
                      type="button"
                      onClick={() => setIsRemedyOpen(prev => !prev)}
                      className="w-full flex items-center justify-between text-[#41463B] bg-white gap-3"
                    >
                      <span className="truncate">
                        {primaryRemedyName || "Belladonna"}
                      </span>

                      <svg className={`h-3 w-3 transition-transform ${isRemedyOpen ? "rotate-180" : "rotate-0"}`} width="11" height="7" viewBox="0 0 11 7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.30333 4.125L9.42833 0L10.6067 1.17833L5.30333 6.48167L0 1.17833L1.17833 0L5.30333 4.125Z" fill="#20231E" />
                      </svg>

                    </button>

                    {/* Dropdown List */}
                    {isRemedyOpen && (
                      <ul className="absolute z-20 mt-1 left-0 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto w-[250px]">

                        {/* Keep current primary remedy if it's not in list */}
                        {primaryRemedyId &&
                          !remediesList.find(r => r.id === primaryRemedyId) && (
                            <li
                              onClick={() => setIsRemedyOpen(false)}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-[#6c746333] whitespace-nowrap"
                            >
                              {primaryRemedyName}
                            </li>
                          )}

                        {remediesList.map(r => (
                          <li
                            key={r.id}
                            onClick={() => {
                              setPrimaryRemedyId(r.id);
                              setPrimaryRemedyName(r.name);

                              // same logic as tamara select ma hati
                              setRemedyPotencies(prev => ({ ...prev, [r.id]: prev[r.id] ?? '' }));
                              setRemedyExtras(prev => ({
                                ...prev,
                                [r.id]: prev[r.id] ?? { potencyType: '', notes: '' }
                              }));

                              setIsRemedyOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors whitespace-nowrap ${primaryRemedyId === r.id
                              ? "bg-[#6C7463] text-white font-medium"
                              : "text-gray-700 hover:bg-[#6c746333]"
                              }`}
                          >
                            {r.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </span>
              </div>


              {/* Line 2 */}
              <p className="font-montserrat font-medium text-[16px] leading-[24px] text-[#41463B] flex items-center gap-1">
                Select multiple if used in combination
                <span className="font-montserrat font-normal text-[12px] leading-[20px] text-[#41463B]">
                  (optional)
                </span>
              </p>

              <RemedyMultiSelect
                primaryRemedyId={primaryRemedyId}
                primaryRemedyName={primaryRemedyName}
                selected={selectedRemedies}
                onChange={setSelectedRemedies}
              />

              <p className="text-sm font-normal text-[#41463B] mt-3 flex justify-center items-center gap-2 text-center flex-col">
                Can&apos;t find what you&apos;re looking for?{" "}
                <button
                  type="button"
                  onClick={() => setShowRequestRemedyModal(true)}
                  className="text-[#2B2E28] hover:text-[#1a2a29] leading-normal font-semibold transition-colors rounded-full text-center border border-[#6C7463] px-3 py-1 hover:bg-gray-300 cursor-pointer">
                  Add a Remedy
                </button>
              </p>
            </div>
          )}


          {/* Step 2: Rating */}
          {step === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-gray-800 text-sm sm:text-base">How do you rate the remedy?</p>
              <div className="flex gap-2 sm:gap-3 justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="focus:outline-none transition-all hover:scale-110"
                  >
                    {star <= formData.rating ? (
                      <Image src="/star.svg" alt="Filled Star" width={44} height={44} />
                    ) : (
                      <Image src="/star-line.svg" alt="Empty Star" width={44} height={44} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Potency - Multi-Remedy Support */}
          {step === 3 && (
            <div className="flex flex-col gap-[16px]">
              {/* Form Type */}
              <div>
                <p className="text-[#20231E] sm:text-xl text-sm font-medium mb-3">
                  What form was the combined remedy?
                </p>
                <div className="flex gap-2">
                  {['Liquid', 'Pellets', 'Ointment'].map(type => (
                    <button
                      key={type}
                      onClick={() => handlePotencyType(primaryRemedyId, type)}
                      className={`px-4 py-2 sm:rounded-lg rounded-md border transition-all font-medium sm:text-sm text-xs text-[#41463B] ${remedyExtras[primaryRemedyId]?.potencyType === type
                        ? 'border-[#6C7463] border-2 text-[#0B0C0A]'
                        : 'border-[#B5B6B1] text-[#41463B]'
                        }`}
                    >
                      {type}
                      {remedyExtras[primaryRemedyId]?.potencyType === type && (
                        <span className="ml-2 inline-flex">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="11" viewBox="0 0 15 11" fill="none">
                            <path d="M5.30333 7.66083L12.9633 0L14.1425 1.17833L5.30333 10.0175L0 4.71417L1.17833 3.53583L5.30333 7.66083Z" fill="#0B0C0A" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Potency for each remedy */}
              <div>
                <p className="text-[#20231E] sm:text-xl text-sm font-medium mb-3">
                  What was the potency?
                </p>

                {allRemedies.map(rem => (
                  <div key={rem.id} className="mb-6">
                    {/* Remedy Name */}
                    <p className="sm:text-base text-sm font-medium text-[#41463B] mb-2">
                      {rem.name}:
                    </p>

                    {/* Potency Buttons */}
                    <div className="flex flex-wrap gap-[8px] mb-2">
                      {['6C', '6X', '12C', '30C', '200C', '1M', '10M', 'CM'].map(pot => (
                        <button
                          key={pot}
                          onClick={() => handleSpecificPotency(rem.id, pot)}
                          className={`px-[12px] py-[8px] rounded-lg border sm:text-sm text-xs font-medium ${remedyPotencies[rem.id] === pot
                            ? 'border-[#6C7463] border-2 text-[#0B0C0A]'
                            : 'border-[#D1D1CB] text-[#41463B]'
                            }`}
                        >
                          {pot}
                        </button>
                      ))}
                    </div>

                    {/* Free Text Input */}
                    <input
                      type="text"
                      placeholder="Free text..."
                      value={remedyExtras[rem.id]?.notes || ''}
                      onChange={e => handleNotes(rem.id, e.target.value)}
                      className="w-32 px-3 py-2 border-2 border-[#6C7463] rounded-[8px] sm:text-sm text-xs text-[#0B0C0A] placeholder:text-[#83857D]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Step 4: Dosage */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-[#41463B] font-medium text-sm sm:text-base">What was the dosage?</p>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  'One-time dose',
                  'Once daily',
                  'Twice daily',
                  'Three times daily',
                  'Every few minutes',
                  'Every other day',
                  'Once a week',
                  'Every 14 days'
                ].map((dose) => (
                  <button
                    key={dose}
                    onClick={() => handleDosage(dose)}
                    className={`px-2 py-2 sm:px-4 sm:py-2 rounded-[8px] transition-all font-medium text-xs sm:text-base flex items-center flex-nowrap ${formData.dosage === dose
                      ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A] border-2'
                      : 'border-[#B5B6B1] hover:border-gray-400 text-[#83857D] border'
                      }`}
                  >
                    <span> {dose}</span>
                    {formData.dosage === dose && (
                      <span className="ml-2">
                        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.30333 7.66083L12.9633 0L14.1425 1.17833L5.30333 10.0175L0 4.71417L1.17833 3.53583L5.30333 7.66083Z" fill="#0B0C0A" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Duration */}
          {step === 5 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-[#41463B] font-medium text-sm sm:text-base">How long did you use it?</p>

              <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 sm:gap-3">
                {[
                  '1 day',
                  '2-3 days',
                  '4-7 days',
                  '1-2 weeks',
                  '2-4 weeks',
                  '1-3 months',
                  '3-6 months',
                  'More than 6 months'
                ].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleDuration(dur)}
                    className={`px-2 py-2 sm:px-4 sm:py-2 rounded-[8px] transition-all font-medium text-xs sm:text-base flex items-center justify-center flex-nowrap ${formData.duration === dur
                      ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A] border-2'
                      : 'border-[#B5B6B1] hover:border-gray-400 text-[#83857D] border'
                      }`}
                  >
                    {dur}
                    {formData.duration === dur && (
                      <span className="ml-2">
                        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.30333 7.66083L12.9633 0L14.1425 1.17833L5.30333 10.0175L0 4.71417L1.17833 3.53583L5.30333 7.66083Z" fill="#0B0C0A" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Effectiveness */}
          {step === 6 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-[#41463B] font-medium text-sm sm:text-base">How effective was it?</p>

              <div className="space-y-2 sm:space-y-3">
                {[
                  'Completely resolved symptoms',
                  'Significantly improved',
                  'Moderately improved',
                  'Slightly improved',
                  'No change',
                  'Symptoms worsened'
                ].map((eff) => (
                  <button
                    key={eff}
                    onClick={() => handleEffectiveness(eff)}
                    className={`w-full px-2 py-2 sm:px-4 sm:py-2 rounded-[8px] transition-all font-medium text-xs sm:text-base flex items-center justify-center flex-nowrap ${formData.effectiveness === eff
                      ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A] border-2'
                      : 'border-[#B5B6B1] hover:border-gray-400 text-[#83857D] border'
                      }`}
                  >
                    {eff}
                    {formData.effectiveness === eff && (
                      <span className="float-right ml-2">
                        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.30333 7.66083L12.9633 0L14.1425 1.17833L5.30333 10.0175L0 4.71417L1.17833 3.53583L5.30333 7.66083Z" fill="#0B0C0A" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Additional Notes */}
          {step === 7 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-[#41463B] font-medium text-sm sm:text-base mb-4">Share details of your situation, what you did, and the outcome.</p>

              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Type your message..."
                className="w-full sm:h-[328px] h-[200px] px-3 py-2 sm:px-4 sm:py-2 border-2 border-[#6C7463] rounded-lg sm:rounded-xl focus:border-[#6C7463] focus:outline-none resize-none text-black text-sm sm:text-base font-medium placeholder:text-[#0B0C0A]"
                rows={5}
                autoFocus
              />
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex gap-1 sm:gap-1.5 mt-6 sm:mt-10 mb-6 sm:mb-8">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-xl transition-all ${idx <= step ? 'bg-[#4B544A]' : 'bg-[#4B544A1A]'
                  }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2 sm:gap-3 justify-end items-center">
            {/* UPDATED: Changed condition from step > 1 to step > 0 to allow back from step 1 */}
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 h-[44px] min-w-[80px] sm:px-8 transition-all font-semibold text-[#2B2E28] text-sm sm:text-base hover:bg-[#F1F2F0] rounded-full cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={
                loading ||
                (step === 0 && !selectedAilment) ||
                (step === 2 && formData.rating === 0) ||
                (step === 3 &&
                  (
                    !remedyExtras[primaryRemedyId]?.potencyType ||
                    !remedyPotencies[primaryRemedyId]
                  )
                )
                ||
                (step === 4 && !formData.dosage) ||
                (step === 5 && !formData.duration) ||
                (step === 6 && !formData.effectiveness)
              }
              className="px-5 py-2.5 h-[44px] min-w-[138px] rounded-full bg-[#F1F2F0] text-[#2B2E28] hover:text-white disabled:bg-[#F1F2F0] disabled:text-[#2B2E28] disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-base cursor-pointer hover:bg-[#4B544A]"
            >
              {loading
                ? "Submitting..."
                : step === totalSteps - 1
                  ? "Done"
                  : "Next"}
            </button>
          </div>

          {/* ---- Success Modal ---- */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
              <div className="bg-white w-[368px] h-[312] sm:w-[495px] sm:h-[328px] rounded-xl shadow-2xl w-full max-w-md relative text-center p-10 animate-fadeIn scale-100">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-[#41463B] hover:[#41463B]"
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col items-center space-y-3">
                  <Image
                    src="/login-logo.svg"
                    alt="icon"
                    width={120}
                    height={120}
                    className="sm:w-30 sm:h-30 w-20 h-20 mx-auto"
                  />

                  <h2 className="text-[22px] sm:text-[32px] font-medium text-gray-900 mb-0">
                    Thanks for Sharing!
                  </h2>

                  <p className="text-[#41463B] text-[16px] sm:text-[15px] leading-relaxed">
                    Your review goes a long way to helping the homeopathic community.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Request Ailment Modal */}
        <RequestAilmentRemedyModal
          isOpen={showRequestAilmentModal}
          onClose={() => setShowRequestAilmentModal(false)}
          type="ailment"
        />

        {/* Request Remedy Modal */}
        <RequestAilmentRemedyModal
          isOpen={showRequestRemedyModal}
          onClose={() => setShowRequestRemedyModal(false)}
          type="remedy"
        />
      </div>
    </div>
  );
}