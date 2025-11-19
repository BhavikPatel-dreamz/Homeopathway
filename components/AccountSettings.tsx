"use client";
import { useState, useRef, useEffect } from "react";
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
    profile_img?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Independent eye toggles for each password input
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(user.profile_img || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    password: "",
    newpassword: "",
    confirmpassword: "",
  });

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    setAvatarLoading(true);
    setMessage(null);

    try {
      // Create a preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Upload to the new API endpoint
      const response = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to upload avatar.");
      }

      const newAvatarUrl = data.path;

      // Update user profile with the new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_img: newAvatarUrl })
        .eq("id", user.id);

      if (updateError) {
        // If the DB update fails, try to remove the uploaded file
        await fetch("/api/avatar/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: newAvatarUrl }),
        });
        throw updateError;
      }

      // If there was an old avatar, remove it
      if (avatarUrl) {
        await fetch("/api/avatar/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: avatarUrl }),
        });
      }

      setAvatarUrl(newAvatarUrl);
      setMessage({ type: "success", text: "Avatar updated successfully!" });
    } catch (error:any) {
      console.error("Avatar upload error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to upload avatar. Please try again.",
      });
      // Reset preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    setAvatarLoading(true);
    try {
      // Call the new remove endpoint
      const response = await fetch("/api/avatar/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: avatarUrl }),
      });

      const data = await response.json();

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_img: null })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl("");
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Avatar removed successfully!" });
    } catch (error:any) {
      console.error("Avatar removal error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to remove avatar.",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

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
      <main className="max-w-5xl mx-auto px-3 sm:px-5 py-6 sm:py-9">
        <div className="bg-white rounded-[12px] py-8 sm:py-10 px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-4xl font-normal text-[#20231E]">
              Account Settings
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 py-2 text-[#20231E] pr-3 xs:pr-5 sm:pl-0 cursor-pointer rounded-lg transition-colors whitespace-nowrap text-xs xs:text-sm sm:text-base"
              >
                <img src="/edit-profile.svg" alt="" className="w-4 h-4" />
                <span className="font-semibold mt-0.5">Edit Profile</span>
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

          {/* Avatar Section - New Feature */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer transition-all duration-200 ${
                    isEditing ? "hover:border-[#6B7B5E] hover:shadow-lg" : ""
                  } ${avatarLoading ? "opacity-50" : ""}`}
                  onClick={handleAvatarClick}
                >
                  {previewUrl || avatarUrl ? (
                    <img
                      src={previewUrl || avatarUrl}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xl">
                        {user.first_name.charAt(0)}
                        {user.last_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6B7B5E]"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {isEditing && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleAvatarClick}
                      className="px-4 py-2 flex items-center justify-center gap-1 text-[12px] md:text-sm bg-[#6C7463] text-white font-semibold rounded-3xl hover:bg-[#5A6A4D] transition-colors disabled:opacity-50"
                      disabled={avatarLoading}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.833985 12.0833C0.833472 11.1629 1.06767 10.2575 1.51444 9.45275C1.96122 8.648 2.60582 7.97046 3.38732 7.48416C3.59358 5.8759 4.37882 4.39792 5.59608 3.32679C6.81335 2.25567 8.37922 1.66483 10.0007 1.66483C11.6221 1.66483 13.188 2.25567 14.4052 3.32679C15.6225 4.39792 16.4077 5.8759 16.614 7.48416C17.5833 8.08724 18.3374 8.98117 18.7684 10.0383C19.1994 11.0955 19.2854 12.2618 19.0141 13.3707C18.7428 14.4796 18.128 15.4745 17.2576 16.2132C16.3872 16.9519 15.3056 17.3968 14.1673 17.4842L5.83399 17.5C3.03732 17.2717 0.833985 14.935 0.833985 12.0833ZM14.0407 15.8225C14.8288 15.7619 15.5777 15.4538 16.1803 14.9421C16.7829 14.4305 17.2084 13.7415 17.396 12.9735C17.5837 12.2056 17.5238 11.398 17.225 10.6661C16.9262 9.93427 16.4038 9.31554 15.7323 8.89833L15.0598 8.47916L14.9598 7.69416C14.804 6.4889 14.2147 5.38161 13.302 4.57924C12.3892 3.77686 11.2155 3.33432 10.0002 3.33432C8.78495 3.33432 7.61125 3.77686 6.6985 4.57924C5.78576 5.38161 5.19642 6.4889 5.04065 7.69416L4.94065 8.47916L4.26982 8.89833C3.5984 9.31549 3.07597 9.93415 2.77715 10.666C2.47833 11.3978 2.41839 12.2053 2.60591 12.9732C2.79342 13.7411 3.2188 14.4301 3.82128 14.9418C4.42376 15.4535 5.17253 15.7617 5.96065 15.8225L6.10482 15.8333H13.8965L14.0407 15.8225ZM10.834 10.8333V14.1667H9.16732V10.8333H6.66732L10.0007 6.66666L13.334 10.8333H10.834Z"
                          fill="white"
                        />
                      </svg>
                      Upload Image
                    </button>
                    {fileInputRef && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="px-4 py-2 flex items-center justify-center gap-1 text-[12px] md:text-sm text-red-600 bg-[#FCEBEC] font-semibold rounded-3xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        disabled={avatarLoading}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.166 4.99999H18.3327V6.66666H16.666V17.5C16.666 17.721 16.5782 17.933 16.4219 18.0892C16.2657 18.2455 16.0537 18.3333 15.8327 18.3333H4.16602C3.945 18.3333 3.73304 18.2455 3.57676 18.0892C3.42048 17.933 3.33268 17.721 3.33268 17.5V6.66666H1.66602V4.99999H5.83268V2.49999C5.83268 2.27898 5.92048 2.06701 6.07676 1.91073C6.23304 1.75445 6.445 1.66666 6.66602 1.66666H13.3327C13.5537 1.66666 13.7657 1.75445 13.9219 1.91073C14.0782 2.06701 14.166 2.27898 14.166 2.49999V4.99999ZM14.9993 6.66666H4.99935V16.6667H14.9993V6.66666ZM7.49935 9.16666H9.16602V14.1667H7.49935V9.16666ZM10.8327 9.16666H12.4993V14.1667H10.8327V9.16666ZM7.49935 3.33332V4.99999H12.4993V3.33332H7.49935Z"
                            fill="#B62E31"
                          />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-[14px] xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
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
              <label className="block text-[14px] xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
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
              <p className="text-[20px] xs:text-lg sm:text-xl font-semibold text-[#20231E] mb-3 xs:mb-4">
                Password
              </p>

              {/* Current Password */}
              <div className="mb-3 xs:mb-4">
                <label className="block text-[14px] xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
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
                <label className="block text-[14px] xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
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
                <label className="block text-[14px] xs:text-sm font-medium text-[#41463B] mb-1.5 xs:mb-2">
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
                      isEditing ? "Enter Confirm new password" : "••••••••••"
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
                    // Reset avatar preview
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                    setMessage(null);
                  }}
                  disabled={loading || avatarLoading}
                  className="px-4 py-2 text-[12px] md:text-sm text-gray-600 font-semibold rounded-3xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || avatarLoading}
                  className="px-4 py-2 text-[12px] md:text-sm bg-[#6C7463] font-semibold text-white rounded-3xl hover:bg-[#5A6A4D] transition-colors disabled:opacity-50"
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
