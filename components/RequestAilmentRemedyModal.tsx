/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";
import { healthEmojis } from "@/lib/emojiList";
import { createUniqueSlugFromName, generateSlug } from "@/lib/slugUtils";

interface RequestAilmentRemedyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "ailment" | "remedy" | "both"; // 'both' shows radio buttons, 'ailment' shows only ailment form, 'remedy' shows only remedy form
}

export default function RequestAilmentRemedyModal({
  isOpen,
  onClose,
  type = "both",
}: RequestAilmentRemedyModalProps) {
  const router = useRouter();
  const [requestType, setRequestType] = useState<"ailment" | "remedy">(type === "ailment" ? "ailment" : type === "remedy" ? "remedy" : "ailment");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    emoji: "😊",
    slug: "",
    description: "",
    key_symptoms: "",
  });
  const [slugLoading, setSlugLoading] = useState(false);

  // Reset internal state when modal opens so reopening shows the form (not the previous success state)
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setLoading(false);
      setShowEmojiPicker(false);
      setFormData({
        name: "",
        emoji: "😊",
        slug: "",
        description: "",
        key_symptoms: "",
      });
      // default requestType when modal opens according to prop
      setRequestType(type === "ailment" ? "ailment" : type === "remedy" ? "remedy" : "ailment");
    }
  }, [isOpen, type]);

  // Generate slug: show immediate client-side slug, then debounce server uniqueness check
  useEffect(() => {
    let mounted = true;
    let debounceId: NodeJS.Timeout | null = null;

    if (formData.name.trim()) {
      // immediate client-side slug for instant feedback
      const base = generateSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug: base }));

      // debounce server uniqueness check
      setSlugLoading(true);
      debounceId = setTimeout(async () => {
        try {
          const tableName = requestType === "ailment" ? "ailments" : "remedies";
          const unique = await createUniqueSlugFromName(formData.name, tableName);
          if (!mounted) return;
          setFormData((prev) => ({ ...prev, slug: unique }));
        } catch (err) {
          console.error('Error generating unique slug:', err);
        } finally {
          if (mounted) setSlugLoading(false);
        }
      }, 400);
    } else {
      setFormData((prev) => ({ ...prev, slug: "" }));
      setSlugLoading(false);
    }

    return () => {
      mounted = false;
      if (debounceId) clearTimeout(debounceId);
    };
  }, [formData.name, requestType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData((prev) => ({
      ...prev,
      emoji,
    }));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        setError(`${requestType === "ailment" ? "Ailment" : "Remedy"} name is required`);
        setLoading(false);
        return;
      }

      // For remedies, ensure key symptoms are provided (required)
      if (requestType === 'remedy' && formData.key_symptoms.trim().length === 0) {
        setError('Key symptoms are required for remedies');
        setLoading(false);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setError("Please login to submit a request");
        setLoading(false);
        return;
      }

      const tableName = requestType === "ailment" ? "ailments" : "remedies";

      // Resolve slug safely: prefer a server-unique slug, but fall back to a client-generated slug
      let slug = generateSlug(formData.name);

      try {
        if (slugLoading) {
          // If a background uniqueness check is still running, wait up to 3s for it
          slug = await Promise.race([
            createUniqueSlugFromName(formData.name, tableName),
            new Promise<string>((res) => setTimeout(() => res(slug), 3000)),
          ]);
        } else {
          // Try a quick uniqueness request but timeout after 2s to avoid hanging
          slug = await Promise.race([
            createUniqueSlugFromName(formData.name, tableName),
            new Promise<string>((res) => setTimeout(() => res(slug), 2000)),
          ]);
        }
      } catch (slugErr) {
        console.error('Slug generation timed out or failed, using client slug:', slugErr);
        slug = generateSlug(formData.name);
      }
      const insertData: any = {
        name: formData.name,
        icon: formData.emoji,
        slug: slug,
        description: formData.description || null,
        status: "approved",
        requested_by_user_id: authUser.id,
        is_user_submission: true,
      };

      // Add remedy-specific fields
      if (requestType === "remedy") {
        insertData.key_symptoms = formData.key_symptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      const { error: insertError } = await supabase
        .from(tableName)
        .insert([insertData]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to submit request. Please try again.";
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1001] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full md:max-w-[542px] max-w-md max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header - Hide when success */}
        {!success && (
          <div className="sticky top-0 bg-white px-6 pb-4 pt-10 sm:pt-15 flex items-center justify-between z-20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 transition-colors z-[9999] cursor-pointer group"
            >
              <svg className="w-5 h-5 fill-[#83857D] hover:fill-[#0B0C0A] transition-colors cursor-pointer" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.6067 8.25L18.8567 0L21.2133 2.35667L12.9633 10.6067L21.2133 18.8567L18.8567 21.2133L10.6067 12.9633L2.35667 21.2133L0 18.8567L8.25 10.6067L0 2.35667L2.35667 0L10.6067 8.25Z" />
              </svg>
            </button>
            <h2 className="sm:text-[32px] text-3xl font-normal sm:leading-[40px] leading-8 text-[#0B0C0A]">
              {type === 'both' ? 'Request a new ailment or remedy' : `Request a new ${requestType === 'ailment' ? 'Ailment' : 'Remedy'}`}
            </h2>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="relative flex flex-col items-center justify-center py-4.5 px-6">
            <button
              onClick={onClose}
              className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5 fill-[#83857D] hover:fill-[#0B0C0A] transition-colors cursor-pointer" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.6067 8.25L18.8567 0L21.2133 2.35667L12.9633 10.6067L21.2133 18.8567L18.8567 21.2133L10.6067 12.9633L2.35667 21.2133L0 18.8567L8.25 10.6067L0 2.35667L2.35667 0L10.6067 8.25Z" />
              </svg>
            </button>
            <Image
              src="/login-logo.svg"
              alt="icon"
              width={120}
              height={120}
              className="sm:w-30 sm:h-30 w-20 h-20 mx-auto"
            />
            <h2 className="sm:text-[32px] text-3xl font-normal sm:leading-[40px] leading-10 text-[#0B0C0A] mb-4 text-center">
              Request Submitted Successfully!
            </h2>
            <p className="text-base font-medium text-[#41463B] text-center mb-8">
              Your {requestType} is under review.
            </p>
            <button
              onClick={() => {
                onClose();
                router.push('/my-requests');
              }}
              className="w-full px-6 py-3 bg-[#6C7463] text-base cursor-pointer hover:bg-[#4a5f56] text-white font-semibold rounded-full transition-colors"
            >
              View Request
            </button>
          </div>
        )}

        {!success && (
          <>
            {/* Error Message - show only the message (hide the 'Error' label) */}
            {error && (
              <div aria-live="polite" className="m-4">
                <p className="m-0 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
              {/* Radio Buttons - Only show if type is "both" */}
              {type === "both" && (
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group relative">
                    <input
                      type="radio"
                      value="ailment"
                      checked={requestType === "ailment"}
                      onChange={(e) => setRequestType(e.target.value as "ailment" | "remedy")}
                      className="peer w-4 h-4 border-2 border-[#B5B6B1] cursor-pointer appearance-none
                        checked:bg-[#83857D] checked:border-[#83857D] rounded-full
                        transition"
                    />
                    <svg
                      className="w-3 h-3 text-white absolute left-0.5 pointer-events-none"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="sm:text-lg text-base font-medium text-[#0B0C0A]">Ailment</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer relative">
                    <input
                      type="radio"
                      value="remedy"
                      checked={requestType === "remedy"}
                      onChange={(e) => setRequestType(e.target.value as "ailment" | "remedy")}
                      className="peer w-4 h-4 border-2 border-[#B5B6B1] cursor-pointer appearance-none
                        checked:bg-[#83857D] checked:border-[#83857D] rounded-full
                        transition"
                    />
                    <svg
                      className="w-3 h-3 text-white absolute left-0.5 pointer-events-none"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="sm:text-lg text-base font-medium text-[#0B0C0A]">Remedy</span>
                  </label>
                </div>
              )}

              {/* Form Title */}
              <h3 className="sm:text-xl text-lg leading-7 font-medium text-[#0B0C0A] font-family-montserrat">
                {requestType === "ailment" ? "Ailment" : "Remedy"} Details
              </h3>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#20231E] mb-2">
                  {requestType === "ailment" ? "Ailment" : "Remedy"} Name
                  <span className="text-red-500">&nbsp;*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={requestType === "ailment" ? "e.g., Headache" : "e.g., Belladonna"}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] text-[#0B0C0A]"
                  disabled={loading}
                />
              </div>

              {/* Emoji Field */}
              <div>
                <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                  {requestType === "ailment" ? "Ailment" : "Remedy"} Emoji <span className="text-xs font-normal text-[#41463B]">(optional)</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    <span className="text-xl">{formData.emoji}</span>

                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="6" viewBox="0 0 9 6" fill="none" className={`w-3 h-3 text-gray-400 transition-transform ${showEmojiPicker ? "rotate-180" : ""
                      }`}>
                      <path d="M4.24267 3.3L7.54267 0L8.48533 0.942666L4.24267 5.18533L0 0.942666L0.942667 0L4.24267 3.3Z" fill="#41463B" />
                    </svg>
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-2">
                        {healthEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Remedy-specific: Key Symptoms */}
              {requestType === "remedy" && (
                <div>
                  <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                    Key Symptoms
                    <span className="text-red-500">&nbsp;*</span>
                  </label>
                  <input
                    type="text"
                    name="key_symptoms"
                    value={formData.key_symptoms}
                    onChange={handleInputChange}
                    placeholder="e.g., fever, cough, headache (comma-separated)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] text-[#0B0C0A]"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Slug is auto-generated server-side; not shown to end users */}

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                  {requestType === "ailment" ? "Ailment" : "Remedy"} Description <span className="text-xs font-normal text-[#41463B]">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] text-[#0B0C0A] resize-none"
                  rows={10}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6C7463] hover:bg-[#4a5f56] disabled:bg-gray-400 text-white text-base font-semibold rounded-full transition-colors duration-200 cursor-pointer"
              >
                {loading
                  ? "Submitting..."
                  : `Request for New ${requestType === "ailment" ? "Ailment" : "Remedy"}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
