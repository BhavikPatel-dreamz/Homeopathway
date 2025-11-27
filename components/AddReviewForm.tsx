"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import Image from 'next/image';

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
  const [showSuccess, setShowSuccess] = useState(false);
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
    setShowSuccess(false);
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
          <div className="mb-2 pr-8">
            <h2 className="text-lg sm:text-[28px] font-medium text-[#0B0C0A] leading-tight">
              Your experience with
            </h2>
            <h3 className="text-lg sm:text-[28px] font-medium text-[#0B0C0A] leading-tight break-words">
              <span className="font-medium">{formData.remedy}</span> for {formData.condition}
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

          {/* Step 2: Potency */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-[#41463B] text-sm sm:text-base">What was the potency?</p>
              
              {/* Potency Type */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {['Pellet', 'Tincture', 'Ointment'].map((type) => (
                  <button
                    key={type}
                    
                    onClick={() => handlePotencyType(type)}
                    className={`px-2 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all font-medium text-xs sm:text-base ${
                      formData.potencyType === type
                      
                        ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A]'
                        : 'border-[#B5B6B1] hover:border-gray-400 text-[#B5B6B1]'
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
                       ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A]'
                        : 'border-[#B5B6B1] hover:border-gray-400 text-[#B5B6B1]'
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
              <p className="text-[#41463B] text-sm sm:text-base">What was the dosage?</p>
              
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
                       ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A]'
                        : 'border-[#B5B6B1] hover:border-gray-400 text-[#B5B6B1]'
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
              <p className="text-[#41463B] text-sm sm:text-base">How long did you use it?</p>

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
                        ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A]'
                        : 'border-[#B5B6B1] hover:border-gray-400 text-[#B5B6B1]'
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
              <p className="text-[#41463B] text-sm sm:text-base">How effective was it?</p>
              
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
                        ? 'border-[#6C7463] bg-gray-50 text-[#0B0C0A]'
                        : 'border-[#B5B6B1] hover:border-gray-400 text-[#B5B6B1]'
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
              <p className="text-[#41463B] text-sm sm:text-base">Share details of your situation, what you did, and the outcome.</p>
              
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Type your message..."
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-[#B5B6B1] rounded-lg sm:rounded-xl focus:border-[#6C7463] focus:outline-none resize-none text-black text-sm sm:text-base"
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
                className={`h-2 flex-1 rounded-xl transition-all ${
                  idx < step ? 'bg-[#4B544A]' : 'bg-[#4B544A1A]'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
        <div className="flex gap-2 sm:gap-3 justify-end">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="px-5 py-2.5 h-[44px] w-[80px]  sm:px-8 sm:py-3 rounded-full  transition-all font-medium text-gray-700 text-sm sm:text-base"
          >
            Back
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={
            loading ||
            (step === 1 && formData.rating === 0) ||
            (step === 2 && !formData.potency) ||
            (step === 3 && !formData.dosage) ||
            (step === 4 && !formData.duration) ||
            (step === 5 && !formData.effectiveness)
          }
          className="px-5 py-2.5 h-[44px] w-[138px] sm:px-8 text-[#4B544A] rounded-full bg-[#4B544A] text-white disabled:bg-[#F1F2F0] disabled:text-[#2B2E28] disabled:cursor-not-allowed transition-all font-medium text-sm sm:text-base"
        >
          {loading ? "Submitting.." : step === totalSteps ? "Done" : "Next"}
        </button>
      </div>

      {/* ---- Success Modal ---- */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white w-[368px] h-[312] sm:w-[495px] sm:h-[328px] rounded-2xl shadow-2xl w-full max-w-md relative text-center p-10 animate-fadeIn scale-100">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#41463B] hover:[#41463B]"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center space-y-3">
              <img
                src="/login-logo.svg"
                alt="icon"
                className="sm:w-30 sm:h-30 w-20 h-20 mx-auto"
              />

              <h2 className="text-[22px] sm:text-[32px] font-medium text-gray-900">
                Thanks for Sharing!
              </h2>

              <p className="text-[#41463B] text-[16px] sm:text-[15px] leading-relaxed">
                Review your post below. If everything looks good, submit it to
                share with your community.
              </p>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}