"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, ChevronDown, SlidersHorizontal, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex text-yellow-400 gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`}>
          <Image src="/star.svg" alt="Star" width={16} height={16} />
        </span>
      ))}
      {hasHalfStar && (
        <span key="half">
          <Image src="/star-half-fill.svg" alt="Half Star" width={16} height={16} />
        </span>
      )}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <span key={`empty-${i}`}>
          <Image src="/star-line.svg" alt="Empty Star" width={16} height={16} />
        </span>
      ))}
    </div>
  );
};
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [secondsInUnit, label] of intervals) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval > 1) return `${interval} ${label}s ago`;
    if (interval === 1) return `1 ${label} ago`;
  }

  return "Just now";
};
const formatMemberSince = (dateString: string) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};

export default function UserReviewListPage({ user }: any ) {
  const [reviews] = useState(user?.reviews || []);
  console.log(reviews,)
  const userProfile = {
    initial: user?.first_name?.[0] || "",
    name: `${user?.first_name || ""} ${user?.last_name || ""}`,
    username: user?.username || "",
    email:user?.email,
    followers: user?.followers || 10,
    following: user?.following || 15,
    location: user?.location || "N/A",
    memberSince: formatMemberSince(user?.created_at || ""),
  };
  
  return (
    <>
      <div className="p-4">
        <div className="max-w-[1248px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-5">
            
            {/* Left Sidebar */}
            <div className="w-full lg:w-[400px] lg:h-[216px] p-6 bg-white rounded-2xl shadow-sm">
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#4B544A] text-white flex items-center justify-center text-xl font-semibold">
                  {userProfile.initial.charAt(0).toUpperCase()}
                </div>
               <div className="relative">
                 <p className="font-semibold text-base text-xl text-[#2B2E28]">{userProfile.name}</p>
                 <p className="text-sm text-[#2B2E28] pr-5">@{userProfile.name}</p>
                 <img
                   src="/edit-box-line.svg"
                   className="absolute right-[1] mt-4 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer z-10"
                   alt="Edit"
                 />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-5 mb-3">
                <div>
                  <div className="text-xs text-[#2B2E28] mb-1">Followers</div>
                  <div className="font-semibold text-[#2B2E28]">{userProfile.followers}</div>
                </div>
                <div>
                  <div className="text-xs text-[#2B2E28] mb-1">Following</div>
                  <div className="font-semibold text-[#2B2E28]">{userProfile.following}</div>
                </div>
              </div>

              {/* Extra Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#2B2E28] font-medium ">From</span>
                  <span className="text-sm font-semibold text-[#2B2E28]">{userProfile.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#2B2E28] font-medium">Member Since</span>
                  <span className="text-sm font-semibold text-[#2B2E28]">{userProfile.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Right Panel - Reviews */}
           <div className="w-full lg:w-[824px] p-4 sm:p-6 bg-white rounded-2xl shadow-sm flex flex-col">
           <p className="text-base text-black mb-4">Reviews</p>
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[70vh] lg:max-h-[780px] my-scrollbar pr-4">
         {reviews.map((review: any) => {
        const tags = [review.dosage, review.potency].filter(Boolean);

      return (
        <div
          key={review.id}
          className="border-b border-[#D9D9D6] last:border-none pb-6"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4B544A] text-white flex items-center justify-center text-base font-semibold">
                {userProfile.initial.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-gray-900 text-[15px]">
                  {userProfile.name}
                </p>

                <div className="flex items-center gap-1 mt-[2px]">
                  {renderStars(review.star_count)}
                  <span className="text-[14px] text-[#0B0C0A]">
                    {review.star_count.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-gray-500 whitespace-nowrap">
              {formatTimeAgo(review.created_at)}
            </p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[12px] px-2 py-1 rounded-md text-[#2B2E28] border border-[#9EA09A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {review.notes && (
            <p className="text-[14px] leading-[22px] text-[#0B0C0A] mb-4">
              {review.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 text-[14px] font-semibold">
            <button className="flex items-center gap-2 text-black  transition">
              <Heart className="w-4 h-4" />
              <span>{review.likes || 15} like</span>
            </button>

            <button className="flex items-center gap-2 text-black transition">
              <img
                src="/message-2-line.svg"
                className="w-4 h-4"
                alt="comments"
              />
              <span>{review.comments || 10} comments</span>
            </button>
          </div>
        </div>
      );
    })}

  </div>
</div>

          </div>
        </div>
      </div>
    </>
  );
}
