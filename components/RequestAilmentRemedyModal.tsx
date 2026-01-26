/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { healthEmojis } from "@/lib/emojiList";
import { createUniqueSlugFromName } from "@/lib/slugUtils";

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

  // Auto-generate slug when name changes
  useEffect(() => {
    const generateSlug = async () => {
      if (formData.name.trim()) {
        const tableName = requestType === "ailment" ? "ailments" : "remedies";
        const newSlug = await createUniqueSlugFromName(formData.name, tableName);
        setFormData((prev) => ({
          ...prev,
          slug: newSlug,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          slug: "",
        }));
      }
    };

    generateSlug();
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

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setError("Please login to submit a request");
        setLoading(false);
        return;
      }

      const slug = await createUniqueSlugFromName(
        formData.name,
        requestType === "ailment" ? "ailments" : "remedies"
      );

      // Insert into ailments or remedies table with pending status
      const tableName = requestType === "ailment" ? "ailments" : "remedies";
      const insertData: any = {
        name: formData.name,
        icon: formData.emoji,
        slug: slug,
        description: formData.description || null,
        status: "pending",
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
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header - Hide when success */}
        {!success && (
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0B0C0A]">
              Request a new ailment or remedy
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="relative flex flex-col items-center justify-center py-12 px-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              className="mb-6"
            >
              <path
                d="M50 95C74.8528 95 95 74.8528 95 50C95 25.1472 74.8528 5 50 5C25.1472 5 5 25.1472 5 50C5 74.8528 25.1472 95 50 95Z"
                stroke="#2C3E3E"
                strokeWidth="2"
              />
              <path
                d="M30 50L45 65L70 35"
                stroke="#2C3E3E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-3xl font-bold text-[#0B0C0A] mb-3 text-center">
              Request Submitted Successfully!
            </h2>
            <p className="text-lg text-[#7D5C4E] text-center mb-2">
              Your request is under review.
            </p>
            <p className="text-lg text-[#7D5C4E] text-center mb-8">
              We&apos;ll notify you once it&apos;s approved.
            </p>
            <button
              onClick={() => {
                onClose();
                router.push('/my-requests');
              }}
              className="w-full px-6 py-3 bg-[#5D7B6F] hover:bg-[#4a5f56] text-white font-semibold rounded-full transition-colors"
            >
              View Request
            </button>
          </div>
        )}

        {!success && (
          <>
            {/* Error Message */}
            {error && (
              <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Radio Buttons - Only show if type is "both" */}
          {type === "both" && (
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="ailment"
                  checked={requestType === "ailment"}
                  onChange={(e) => setRequestType(e.target.value as "ailment" | "remedy")}
                  className="w-4 h-4"
                />
                <span className="text-lg font-medium text-[#0B0C0A]">Ailment</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="remedy"
                  checked={requestType === "remedy"}
                  onChange={(e) => setRequestType(e.target.value as "ailment" | "remedy")}
                  className="w-4 h-4"
                />
                <span className="text-lg font-medium text-[#0B0C0A]">Remedy</span>
              </label>
            </div>
          )}

          {/* Form Title */}
          <h3 className="text-lg font-semibold text-[#0B0C0A]">
            {requestType === "ailment" ? "Ailment" : "Remedy"} Details
          </h3>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
              {requestType === "ailment" ? "Ailment" : "Remedy"} Name
              <span className="text-red-500">*</span>
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
              {requestType === "ailment" ? "Ailment" : "Remedy"} Emoji (optional)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <span className="text-xl">{formData.emoji}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showEmojiPicker ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
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
                <span className="text-red-500">*</span>
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

          {/* Slug Field (optional) */}
          <div>
            <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
              {requestType === "ailment" ? "Ailment" : "Remedy"} Slug (auto-generated)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              readOnly
              placeholder="auto-generated from name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-[#0B0C0A] bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
              {requestType === "ailment" ? "Ailment" : "Remedy"} Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] text-[#0B0C0A] resize-none"
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#5D7B6F] hover:bg-[#4a5f56] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
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
