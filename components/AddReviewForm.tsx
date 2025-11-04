"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddReviewFormProps {
  onClose: () => void;
  remedyId: string;
  remedyName: string;
  condition?: string;
}

export default function AddReviewForm({ onClose, remedyId, remedyName, condition = 'your condition' }: AddReviewFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleClose = () => {
    onClose();
  };

  const submitReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const reviewData = {
        remedy_id: remedyId,
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
      console.log('Review submitted successfully:', result);
      
      // Close the form on success
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
      // Submit form
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

  return (
    <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-10 pt-12">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-serif text-gray-900 leading-tight">
              Your experience with
            </h2>
            <h3 className="text-2xl font-serif text-gray-900 leading-tight">
              <span className="font-semibold">{formData.remedy}</span> for {formData.condition}
            </h3>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Rating */}
          {step === 1 && (
            <div className="space-y-8">
              <p className="text-gray-800 text-base">How do you rate the remedy?</p>
              <div className="flex gap-3 justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="focus:outline-none transition-all hover:scale-110"
                  >
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 24 24"
                      fill={star <= formData.rating ? "#F59E0B" : "none"}
                      stroke={star <= formData.rating ? "#F59E0B" : "#D1D5DB"}
                      strokeWidth="1.5"
                      className="transition-all"
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
            <div className="space-y-6">
              <p className="text-gray-800 text-base">What was the potency?</p>
              
              {/* Potency Type */}
              <div className="flex gap-3">
                {['Pellet', 'Tincture', 'Ointment'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handlePotencyType(type)}
                    className={`px-6 py-3 rounded-xl border-2 transition-all font-medium ${
                      formData.potencyType === type
                        ? 'border-gray-800 bg-gray-50 text-gray-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {type}
                    {formData.potencyType === type && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Potency Level */}
              <div className="grid grid-cols-3 gap-3">
                {['6C', '6X', '12C', '30C', '200C', '1M', '10M', 'CM'].map((pot) => (
                  <button
                    key={pot}
                    onClick={() => handlePotency(pot)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                      formData.potency === pot
                        ? 'border-gray-800 bg-gray-50 text-gray-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {pot}
                    {formData.potency === pot && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Dosage */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-gray-800 text-base">What was the dosage?</p>
              
              <div className="grid grid-cols-2 gap-3">
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
                    className={`px-4 py-3 rounded-xl border-2 transition-all text-left font-medium ${
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
            <div className="space-y-6">
              <p className="text-gray-800 text-base">How long did you use it?</p>
              
              <div className="grid grid-cols-2 gap-3">
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
                    className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
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
            <div className="space-y-6">
              <p className="text-gray-800 text-base">How effective was it?</p>
              
              <div className="space-y-3">
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
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left font-medium ${
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
            <div className="space-y-6">
              <p className="text-gray-800 text-base">Any additional notes?</p>
              
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Share any other details about your experience..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-800 focus:outline-none resize-none text-gray-700"
                rows={6}
              />
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => setFormData({ ...formData, sideEffects: e.target.checked ? 'Yes' : 'No' })}
                    className="mt-1 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">
                    I experienced side effects or aggravations
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex gap-1.5 mt-10 mb-8">
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
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-8 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                loading ||
                (step === 1 && formData.rating === 0) ||
                (step === 2 && (!formData.potencyType || !formData.potency)) ||
                (step === 3 && !formData.dosage) ||
                (step === 4 && !formData.duration) ||
                (step === 5 && !formData.effectiveness)
              }
              className="flex-1 px-8 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Submitting...' : (step === totalSteps ? 'Submit Review' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}