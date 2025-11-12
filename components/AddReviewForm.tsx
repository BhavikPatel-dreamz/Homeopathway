"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

interface AddReviewFormProps {
  onClose: () => void;
  remedyId: string;
  remedyName: string;
  condition?: string;
  ailmentId?: string;
}

export default function AddReviewForm({ onClose, remedyId, remedyName, condition = 'your condition', ailmentId }: AddReviewFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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

  const totalSteps = 6;

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
  };

  const submitReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const reviewData = {
        remedy_id: remedyId,
        ailment_id: ailmentId,
        star_count: formData.rating,
        potency: formData.potencyType && formData.potency ? `${formData.potencyType} ${formData.potency}` : null,
        dosage: formData.dosage,
        duration_used: formData.duration,
        effectiveness: formData.effectiveness === 'Completely resolved symptoms' ? 5 :
                      formData.effectiveness === 'Significantly improved' ? 4 :
                      formData.effectiveness === 'Moderately improved' ? 3 :
                      formData.effectiveness === 'Slightly improved' ? 2 :
                      formData.effectiveness === 'No change' ? 1 :
                      formData.effectiveness === 'Symptoms worsened' ? 0 : null,
        notes: formData.notes,
        experienced_side_effects: formData.sideEffects
      };

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

      const result = await response.json();
      
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      submitReview();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRating = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handlePotencyType = (type: string) => {
    setFormData({ ...formData, potencyType: type, potency: '' });
  };

  const handlePotency = (potency: string) => {
    setFormData({ ...formData, potency });
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
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[9999]">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg relative max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 transition-colors z-[9999]"
        >
          <X size={20} className="sm:hidden" />
          <X size={24} className="hidden sm:block" />
        </button>

        {/* Content */}
        <div className="p-5 pt-8 sm:p-10 sm:pt-12">
          {/* Header */}
          <div className="mb-6 sm:mb-10 pr-8">
            <h2 className="text-lg sm:text-2xl font-serif text-gray-900 leading-tight">
              Your experience with
            </h2>
            <h3 className="text-lg sm:text-2xl font-serif text-gray-900 leading-tight break-words">
              <span className="font-semibold">{formData.remedy}</span> for {formData.condition}
            </h3>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Rating */}
          {step === 1 && (
            <div className="space-y-6 sm:space-y-8">
              <p className="text-gray-800 text-sm sm:text-base">How do you rate the remedy?</p>
              <div className="flex gap-2 sm:gap-3 justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="focus:outline-none transition-all hover:scale-110"
                  >
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 24 24"
                      fill={star <= formData.rating ? "#F59E0B" : "none"}
                      stroke={star <= formData.rating ? "#F59E0B" : "#D1D5DB"}
                      strokeWidth="1.5"
                      className="transition-all sm:w-14 sm:h-14"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Potency */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-gray-800 text-sm sm:text-base">What was the potency?</p>
              
              {/* Potency Type */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {['Pellet', 'Tincture', 'Ointment'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handlePotencyType(type)}
                    className={`px-2 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all font-medium text-xs sm:text-base ${
                      formData.potencyType === type
                        ? 'border-gray-800 bg-gray-50 text-gray-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {type}
                    {formData.potencyType === type && (
                      <span className="ml-1 sm:ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Potency Level */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {['6C', '6X', '12C', '30C', '200C', '1M', '10M', 'CM'].map((pot) => (
                  <button
                    key={pot}
                    onClick={() => handlePotency(pot)}
                    className={`px-2 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all font-medium text-xs sm:text-base ${
                      formData.potency === pot
                        ? 'border-gray-800 bg-gray-50 text-gray-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {pot}
                    {formData.potency === pot && (
                      <span className="ml-1 sm:ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Dosage */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-gray-800 text-sm sm:text-base">What was the dosage?</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-left font-medium text-xs sm:text-base ${
                      formData.dosage === dose
                        ? 'border-gray-800 bg-gray-50 text-gray-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {dose}
                    {formData.dosage === dose && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Duration */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-gray-800 text-sm sm:text-base">How long did you use it?</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all font-medium text-xs sm:text-base ${
                      formData.duration === dur
                        ? 'border-gray-800 bg-gray-50 text-gray-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {dur}
                    {formData.duration === dur && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Effectiveness */}
          {step === 5 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-gray-800 text-sm sm:text-base">How effective was it?</p>
              
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
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-left font-medium text-xs sm:text-base ${
                      formData.effectiveness === eff
                        ? 'border-gray-800 bg-gray-50 text-gray-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {eff}
                    {formData.effectiveness === eff && (
                      <span className="float-right">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Additional Notes */}
          {step === 6 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-gray-800 text-sm sm:text-base">Any additional notes?</p>
              
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Share any other details about your experience..."
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:border-gray-800 focus:outline-none resize-none text-gray-700 text-sm sm:text-base"
                rows={5}
                autoFocus
              />
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => setFormData({ ...formData, sideEffects: e.target.checked ? 'Yes' : 'No' })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">
                    I experienced side effects or aggravations
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex gap-1 sm:gap-1.5 mt-6 sm:mt-10 mb-6 sm:mb-8">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all ${
                  idx < step ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2 sm:gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700 text-sm sm:text-base"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                loading ||
                (step === 1 && formData.rating === 0) ||
                (step === 2 && (!formData.potency)) ||
                (step === 3 && !formData.dosage) ||
                (step === 4 && !formData.duration) ||
                (step === 5 && !formData.effectiveness)
              }
              className="flex-1 px-5 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium text-sm sm:text-base"
            >
              {loading ? 'Submitting...' : (step === totalSteps ? 'Submit Review' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}