"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import UserAvatar from "./UserAvatar";
import Breadcrumb from "./Breadcrumb";

interface AccountSettingsProps {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  accountContext?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Independent eye toggles for each password input
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    password: "",
    newpassword: "",
    confirmpassword: "",
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, password: "" }));

      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Logout error:", error);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="px-3 sm:px-5">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Account Settings", isActive: true },
          ]}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-5 py-6 sm:py-9">
        <div className="bg-white rounded-[12px] py-8 sm:py-10 px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-semibold text-[#20231E]">
              Account Settings
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 py-2 text-[#20231E] pr-3 xs:pr-5 sm:pl-0 cursor-pointer rounded-lg transition-colors whitespace-nowrap text-xs xs:text-sm sm:text-base"
              >
                <img src="/edit-profile.svg" alt="" className="w-4 h-4" />
                <span className="font-medium mt-0.5">Edit Profile</span>
              </button>
            )}
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg break-words ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
                Full Name
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 xs:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Full Name"
                  className="w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2 xs:py-2.5 border border-[#D3D6D1] text-xs xs:text-sm sm:text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] disabled:bg-[#F1F2F0] disabled:text-[#41463B] text-gray-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
                Email Address
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 xs:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2 xs:py-2.5 border border-[#D3D6D1] text-xs xs:text-sm sm:text-[16px] rounded-lg bg-[#F1F2F0] text-[#41463B] cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] xs:text-xs text-gray-500 mt-1 xs:mt-1.5">
                Email address cannot be changed.
              </p>
            </div>

            <div className="pt-2 xs:pt-3 sm:pt-4">
              <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-[#20231E] mb-3 xs:mb-4">
                Password
              </h2>

              {/* Current Password */}
              <div className="mb-3 xs:mb-4">
                <label className="block text-xs xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 xs:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={!isEditing}
                    autoComplete="off"
                    placeholder={
                      isEditing ? "Enter current password" : "••••••••••"
                    }
                    className="w-full pl-9 xs:pl-10 sm:pl-12 pr-10 xs:pr-12 py-2 xs:py-2.5 sm:py-3 border border-[#D3D6D1] text-xs xs:text-sm sm:text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] disabled:bg-[#F1F2F0] disabled:text-[#41463B] text-gray-500"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((s) => !s)}
                      className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <svg
                          className="w-4 h-4 xs:w-5 xs:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 xs:w-5 xs:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3 xs:mb-4">
                <label className="block text-xs xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
                  New Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 xs:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newpassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newpassword: e.target.value })
                    }
                    disabled={!isEditing}
                    autoComplete="new-password"
                    placeholder={
                      isEditing ? "Enter new password" : "••••••••••"
                    }
                    className="w-full pl-9 xs:pl-10 sm:pl-12 pr-10 xs:pr-12 py-2 xs:py-2.5 sm:py-3 border border-[#D3D6D1] text-xs xs:text-sm sm:text-[16px] text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((s) => !s)}
                      className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <svg
                          className="w-4 h-4 xs:w-5 xs:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 xs:w-5 xs:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 mt-1 xs:mt-1.5">
                  Minimum 8 characters, one special character, one number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 xs:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmpassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmpassword: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder={
                      isEditing ? "Confirm new password" : "••••••••••"
                    }
                    className="w-full pl-9 xs:pl-10 sm:pl-12 pr-10 xs:pr-12 py-2 xs:py-2.5 sm:py-3 border border-[#D3D6D1] text-xs xs:text-sm sm:text-[16px] text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="w-4 h-4 xs:w-5 xs:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 xs:w-5 xs:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: `${user.first_name} ${user.last_name}`.trim(),
                      email: user.email,
                      password: "",
                      newpassword: "",
                      confirmpassword: "",
                    });
                    setMessage(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2.5 text-[#2B2E28] rounded-[50px] font-semibold transition-all duration-500"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-[#6C7463] text-white rounded-[50px] font-semibold hover:bg-[#5A6A4D] transition-all duration-500"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex justify-center mt-6 px-3">
            <button
              onClick={handleLogout}
              className="px-4 py-3 sm:px-6 w-full lg:w-auto bg-[#FCEBEC] text-[#B62E31] rounded-[50px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <img src="/logout.svg" alt="" className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
