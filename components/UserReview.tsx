"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, ChevronDown, SlidersHorizontal, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

// Mock data for demonstration
const mockReviews = [
  {
    id: 1,
    user: { firstName: "Emily", lastName: "R.", initial: "E" },
    rating: 4.8,
    tags: ["Stress"],
    comment: "I used to get tension headaches every week from work stress. After a few doses of Nux Vomica, the pain eased within an hour. I feel calmer and more balanced now!",
    timeAgo: "1 hour ago",
    likes: 15,
    comments: 3
  },
  {
    id: 2,
    user: { firstName: "Emily", lastName: "R.", initial: "E" },
    rating: 4.8,
    tags: ["Stress"],
    comment: "I used to get tension headaches every week from work stress. After a few doses of Nux Vomica, the pain eased within an hour. I feel calmer and more balanced now!",
    timeAgo: "1 hour ago",
    likes: 15,
    comments: 3
  },
  {
    id: 3,
    user: { firstName: "Emily", lastName: "R.", initial: "E" },
    rating: 4.8,
    tags: ["Stress"],
    comment: "I used to get tension headaches every week from work stress. After a few doses of Nux Vomica, the pain eased within an hour. I feel calmer and more balanced now!",
    timeAgo: "1 hour ago",
    likes: 15,
    comments: 3
  },
  {
    id: 4,
    user: { firstName: "Emily", lastName: "R.", initial: "E" },
    rating: 4.8,
    tags: ["Stress"],
    comment: "I used to get tension headaches every week from work stress. After a few doses of Nux Vomica, the pain eased within an hour. I feel calmer and more balanced now!",
    timeAgo: "1 hour ago",
    likes: 15,
    comments: 3
  },
  {
    id: 5,
    user: { firstName: "Emily", lastName: "R.", initial: "E" },
    rating: 4.8,
    tags: ["Stress"],
    comment: "I used to get tension headaches every week from work stress. After a few doses of Nux Vomica, the pain eased within an hour. I feel calmer and more balanced now!",
    timeAgo: "1 hour ago",
    likes: 15,
    comments: 3
  }
];

const mockUserProfile = {
  initial: "E",
  name: "Emily R.",
  username: "@mack_co",
  followers: 201,
  following: 97,
  location: "NY, USA",
  memberSince: "October 2025"
};

// const renderStars = (rating: number) => {
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <svg
//           key={star}
//           width="16"
//           height="16"
//           viewBox="0 0 16 16"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             d="M8 1.5L10.163 5.88L15 6.607L11.5 10.012L12.326 14.835L8 12.565L3.674 14.835L4.5 10.012L1 6.607L5.837 5.88L8 1.5Z"
//             fill={star <= Math.floor(rating) ? "#FFA500" : star === Math.ceil(rating) && rating % 1 >= 0.5 ? "#FFA500" : "none"}
//             fillOpacity={star === Math.ceil(rating) && rating % 1 >= 0.5 ? "0.5" : "1"}
//             stroke="#FFA500"
//             strokeWidth="1"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       ))}
//       <span className="ml-1.5 text-sm font-medium text-gray-700">{rating}</span>
//     </div>
//   );
// };

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
export default function ReviewListPage() {
  const [reviews, setReviews] = useState(mockReviews);

//   return (
//     <div className="p-4">
//       <div className="w-[1248px] h-[830px] mx-auto">
//         <div className="flex gap-5">
//           {/* Left Sidebar - User Profile */}
//           <div className="w-[400px] h-[216px] p-[24px] gap-[24px] bg-white rounded-2xl shadow-sm">
//             {/* <div className="bg-white rounded-2xl shadow-sm p-6 "> */}
//               {/* User Avatar */}
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center text-xl font-semibold">
//                   {mockUserProfile.initial}
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-base text-gray-900">{mockUserProfile.name}</h3>
//                   <p className="text-sm text-gray-500">{mockUserProfile.username}</p>
//                 </div>
//               </div>

//               {/* Stats */}
//               <div className="flex gap-5 mb-1">
//                 <div>
//                   <div className="text-xs text-gray-500 mb-1">Followers</div>
//                   <div className="font-semibold text-gray-900">{mockUserProfile.followers}</div>
//                 </div>
//                 <div>
//                   <div className="text-xs text-gray-500 mb-1">Following</div>
//                   <div className="font-semibold text-gray-900">{mockUserProfile.following}</div>
//                 </div>
//               </div>

//               {/* Location & Member Since */}
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">From</span>
//                   <span className="text-sm font-medium text-gray-900">{mockUserProfile.location}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Member Since</span>
//                   <span className="text-sm font-medium text-gray-900">{mockUserProfile.memberSince}</span>
//                 </div>
//               </div>
//             {/* </div> */}
//           </div>

//           {/* Right Panel - Reviews */}
//           <div className="w-[824px] h-[830px] p-[24px] gap-[24px] bg-white rounded-2xl shadow-sm h-full flex flex-col">
//             {/* <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col"> */}
//               {/* Header */}
//               <div className="gap-[10px] h-[38px] w-[776px]">
//                 <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
//               </div>
//                   {/* Reviews List */}
//              <div className="flex-1 overflow-y-auto space-y-3 w-[776px] h-[720px] gap-[16px]">
//                 <div className="divide-y divide-gray-200 w-[748px] h-[734px] pb-[24px]">
//              {reviews.map((review, index) => (
//             <div key={review.id} className={`pb-3 ${index !== reviews.length - 1 ? 'border-b border-gray-200' : '' }`}>
//        {/* Review Header */}
//       <div className="flex items-start justify-between mt-5 mb-3">
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-base font-semibold flex-shrink-0">
//             {review.user.initial}
//           </div>
//           <div>
//             <h4 className="font-semibold text-base text-gray-900 mb-1">
//               {review.user.firstName} {review.user.lastName}
//             </h4>
//             {renderStars(review.rating)}
//           </div>
//         </div>
//         <span className="text-sm text-gray-500">{review.timeAgo}</span>
//       </div>

//       {/* Tags */}
//       {review.tags && review.tags.length > 0 && (
//         <div className="flex gap-2 flex-wrap">
//           {review.tags.map((tag, idx) => (
//             <span
//               key={idx}
//               className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-300"
//             >
//               {tag}
//             </span>
//           ))}
//         </div>
//       )}

//       {/* Review Text */}
//       <p className="text-sm text-gray-700 leading-6 mb-4 mt-3">
//         {review.comment}
//       </p>

//       {/* Actions */}
//       <div className="flex items-center gap-6">
//         <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors">
//           <Heart className="w-4 h-4" />
//           <span>{review.likes} like</span>
//         </button>
//         <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">
//           <MessageCircle className="w-4 h-4" />
//           <span>{review.comments} comments</span>
//         </button>
//       </div>
//     </div>
//              ))}
//           </div>
//          </div>
//             {/* </div> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

return <div className="p-4">
  <div className="max-w-[1248px] mx-auto">
    <div className="flex flex-col lg:flex-row gap-5">
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-[400px] lg:h-[216px] p-6 bg-white rounded-2xl shadow-sm">
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center text-xl font-semibold">
            {mockUserProfile.initial}
          </div>
          <div>
            <h3 className="font-semibold text-base text-gray-900">{mockUserProfile.name}</h3>
            <p className="text-sm text-gray-500">{mockUserProfile.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-5 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Followers</div>
            <div className="font-semibold text-gray-900">{mockUserProfile.followers}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Following</div>
            <div className="font-semibold text-gray-900">{mockUserProfile.following}</div>
          </div>
        </div>

        {/* Extra Info */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">From</span>
            <span className="text-sm font-medium text-gray-900">{mockUserProfile.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Member Since</span>
            <span className="text-sm font-medium text-gray-900">{mockUserProfile.memberSince}</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Reviews */}
      <div className="w-full lg:w-[824px] p-6 bg-white rounded-2xl shadow-sm flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>

        <div className="flex-1 overflow-y-auto space-y-4 max-h-[70vh] lg:max-h-[780px]">

          {reviews.map((review, index) => (
            <div key={review.id} className={`pb-3 border-b border-gray-200 last:border-none`}>
              
              {/* Header */}
              <div className="flex items-start justify-between mt-5 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-base font-semibold flex-shrink-0">
                    {review.user.initial}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-900 mb-1">
                      {review.user.firstName} {review.user.lastName}
                    </h4>
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.timeAgo}</span>
              </div>

              {/* Tags */}
              {review.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-300 font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment */}
              <p className="text-sm text-black-700 leading-6 mb-4 mt-3 ">
                {review.comment}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors font-semibold">
                  <Heart className="w-4 h-4" />
                  <span>{review.likes} like</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  <span>{review.comments} comments</span>
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  </div>
</div>

}