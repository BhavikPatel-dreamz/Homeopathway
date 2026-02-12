/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Loader2, ChevronDown, SlidersHorizontal, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { toggleReviewLike, getReviewInteractionCounts, ReviewInteractionCounts } from '@/lib/reviewInteractions';
import { useAuth } from '@/lib/authContext';
import ReviewComments from './ReviewComments';
import supabase from '@/lib/supabaseClient';

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
    [60, "min"],
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

export default function UserReviewListPage({ user }: any) {
  const [reviews] = useState(user?.reviews || []);
  // Prefill map from any names already present in `user.reviews` so names render immediately
  const initialRemedyMap = useMemo(() => {
    const m: Record<string, string> = {};
    (user?.reviews || []).forEach((rev: any) => {
      // primary remedy from several possible shapes
      const primaryId = rev?.remedy?.id ?? rev?.remedy_id;
      const primaryName =
        rev?.remedy?.name ??
        rev?.remedy_name ??
        rev?.primary_remedy ??
        rev?.remedyName ??
        rev?.remedies?.name;
      if (primaryId && primaryName) m[String(primaryId)] = primaryName;

      // secondary_remedies could be array of objects, strings, or ids
      if (Array.isArray(rev?.secondary_remedies)) {
        rev.secondary_remedies.forEach((r: any) => {
          if (!r) return;
          if (typeof r === 'string') {
            // if string and looks like "id:name" or name itself, try to split (best-effort)
            const parts = r.split(':');
            if (parts.length === 2 && parts[0]) m[parts[0]] = parts[1];
          } else {
            if (r.id && r.name) m[String(r.id)] = r.name;
            else if (r.id && r.label) m[String(r.id)] = r.label;
          }
        });
      }

      // If there are parallel arrays of ids and names, pair up to the smaller length (best-effort)
      if (Array.isArray(rev?.secondary_remedy_ids) && Array.isArray(rev?.secondary_remedy_names)) {
        const ids = rev.secondary_remedy_ids;
        const names = rev.secondary_remedy_names;
        const len = Math.min(ids.length, names.length);
        for (let i = 0; i < len; i++) {
          const id = ids[i];
          const name = names[i];
          if (id && name) m[String(id)] = name;
        }
      } else {
        // fallback: if only names array present, try to map them to any provided ids array (best-effort)
        if (Array.isArray(rev?.secondary_remedy_names) && Array.isArray(rev?.secondary_remedy_ids)) {
          const ids = rev.secondary_remedy_ids;
          const names = rev.secondary_remedy_names;
          const len = Math.min(ids.length, names.length);
          for (let i = 0; i < len; i++) {
            const id = ids[i];
            const name = names[i];
            if (id && name) m[String(id)] = name;
          }
        }
      }

      // sometimes reviews include direct mapping fields
      if (rev?.remedy_id && rev?.remedy_name) m[String(rev.remedy_id)] = rev.remedy_name;
      // also map any listed remedies object array if present
      if (Array.isArray(rev?.remedies)) {
        rev.remedies.forEach((r: any) => {
          if (r?.id && r?.name) m[String(r.id)] = r.name;
        });
      }
    });
    return m;
  }, [user]);

  // Prefill map for remedy icons from incoming reviews (if present)
  const initialRemedyIconMap = useMemo(() => {
    const m: Record<string, string> = {};
    (user?.reviews || []).forEach((rev: any) => {
      const primaryId = rev?.remedy?.id ?? rev?.remedy_id;
      const primaryIcon =
        rev?.remedy?.icon ??
        rev?.remedy_icon ??
        rev?.remedy?.image_url ??
        rev?.remedyImageUrl ??
        null;
      if (primaryId && primaryIcon) m[String(primaryId)] = primaryIcon;

      // also collect icons from remedies array if present
      if (Array.isArray(rev?.remedies)) {
        rev.remedies.forEach((r: any) => {
          if (r?.id && (r?.image_url || r?.icon)) m[String(r.id)] = r.image_url || r.icon;
        });
      }
    });
    return m;
  }, [user]);

  const [remedyNameMap, setRemedyNameMap] = useState<Record<string,string>>(initialRemedyMap);
  const [remedyIconMap, setRemedyIconMap] = useState<Record<string,string>>(initialRemedyIconMap);
  const [isFetchingRemedyNames, setIsFetchingRemedyNames] = useState(false);
  // Prefill ailment map from incoming review payloads (if available)
  const initialAilmentMap = useMemo(() => {
    const m: Record<string, { name: string; icon?: string }> = {};
    (user?.reviews || []).forEach((rev: any) => {
      // Support multiple possible payload shapes that may contain the ailment info
      const aObj = rev?.ailment && typeof rev.ailment === 'object' ? rev.ailment : undefined;
      const aid = rev?.ailment_id ?? (typeof rev?.ailment === 'string' ? rev.ailment : aObj?.id);
      const name =
        aObj?.name ||
        rev?.ailment_name ||
        rev?.ailmentName ||
        rev?.ailment_name_text ||
        aObj?.label ||
        '';
      const icon =
        aObj?.icon ||
        rev?.ailment_icon ||
        rev?.ailmentIcon ||
        aObj?.emoji ||
        '';

      if (aid && (name || icon)) {
        m[String(aid)] = { name: name || '', icon: icon || '' };
      }
     });
     return m;
   }, [user]);
  const [ailmentMap, setAilmentMap] = useState<Record<string, { name: string; icon?: string }>>(initialAilmentMap);
  const [isFetchingAilments, setIsFetchingAilments] = useState(false);
  const [reviewInteractions, setReviewInteractions] = useState<Record<string, ReviewInteractionCounts>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [loadingLikes, setLoadingLikes] = useState<Record<string, boolean>>({});
  const { user: currentUser } = useAuth();
  useEffect(() => {
    const loadInteractionCounts = async () => {
      // Fetch all counts in parallel to improve performance
      try {
        const promises = reviews.map((review: any) => getReviewInteractionCounts(review.id));
        const results = await Promise.all(promises);
        const interactions: Record<string, ReviewInteractionCounts> = {};
        results.forEach((res, idx) => {
          const reviewId = reviews[idx].id;
          interactions[reviewId] = res;
        });
        setReviewInteractions(interactions);
      } catch (error) {
        console.error('Error loading interaction counts in parallel:', error);
      }
    };

    if (reviews.length > 0) {
      loadInteractionCounts();
    }
  }, [reviews]);

  // Fetch remedy names for any ids present in reviews so we can show names instead of ids
  useEffect(() => {
    const idsToFetch = new Set<string>();
    reviews.forEach((review: any) => {
      const rid = review?.remedy_id ?? (review?.remedy?.id);

      // If name missing, fetch name; if icon/image missing, fetch icon as well.
      const needsName = rid && !(review?.remedy && review.remedy.name) && !initialRemedyMap[String(rid)] && !remedyNameMap[String(rid)];
      const hasExplicitIcon = !!(review?.remedy && (review.remedy.image_url || review.remedy.icon)) || !!review?.remedy_icon;
      const needsIcon = rid && !hasExplicitIcon && !initialRemedyIconMap[String(rid)] && !remedyIconMap[String(rid)];

      if (needsName || needsIcon) idsToFetch.add(String(rid));

      // secondary remedies - handle arrays of ids or arrays of objects (also fetch icons if needed)
      if (Array.isArray(review.secondary_remedy_ids)) {
        review.secondary_remedy_ids.forEach((id: any) => {
          if (!id) return;
          if (!initialRemedyMap[String(id)] && !remedyNameMap[String(id)]) idsToFetch.add(String(id));
          if (!initialRemedyIconMap[String(id)] && !remedyIconMap[String(id)]) idsToFetch.add(String(id));
        });
      } else if (Array.isArray(review.secondary_remedies)) {
        review.secondary_remedies.forEach((r: any) => {
          if (!r) return;
          if (typeof r === 'string') idsToFetch.add(String(r));
          if (r.id && !r.name) idsToFetch.add(String(r.id));
          if (r.id && !(r.image_url || r.icon)) idsToFetch.add(String(r.id));
        });
      }
    });

    const ids = Array.from(idsToFetch);
    if (ids.length === 0) return;

    let cancelled = false;
    setIsFetchingRemedyNames(true);
    (async () => {
      try {
        // Request icon/image fields as well so we can render remedy icons
        const { data, error } = await supabase
          .from('remedies')
          .select('id, name, image_url, icon')
          .in('id', ids);
        if (error) {
          console.error('Error fetching remedy names:', error);
          return;
        }
        if (cancelled) return;
        setRemedyNameMap(prev => {
          const copy = { ...prev };
          (data || []).forEach((r: any) => {
            if (r?.id && r?.name) copy[r.id] = r.name;
          });
          return copy;
        });
        setRemedyIconMap(prev => {
          const copy = { ...prev };
          (data || []).forEach((r: any) => {
            const icon = r?.image_url || r?.icon;
            if (r?.id && icon) copy[r.id] = icon;
          });
          return copy;
        });
      } catch (err) {
        console.error('Error fetching remedy names:', err);
      } finally {
        if (!cancelled) setIsFetchingRemedyNames(false);
      }
    })();

    return () => { cancelled = true; };
  }, [reviews, initialRemedyMap, initialRemedyIconMap, remedyNameMap, remedyIconMap]);

  // Fetch ailment names/icons for any ailment ids present in reviews
  useEffect(() => {
    const idsToFetch = new Set<string>();
    reviews.forEach((review: any) => {
      const aid = review?.ailment_id || review?.ailment?.id;
      if (aid && !initialAilmentMap[aid] && !ailmentMap[aid]) idsToFetch.add(String(aid));
    });

    const ids = Array.from(idsToFetch);
    if (ids.length === 0) return;

    let cancelled = false;
    setIsFetchingAilments(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from('ailments')
          .select('id, name, icon')
          .in('id', ids);
        if (error) {
          console.error('Error fetching ailments:', error);
          return;
        }
        if (cancelled) return;
        setAilmentMap(prev => {
          const copy = { ...prev };
          (data || []).forEach((a: any) => {
            if (a?.id && (a?.name || a?.icon)) copy[a.id] = { name: a.name || '', icon: a.icon || '' };
          });
          return copy;
        });
      } catch (err) {
        console.error('Error fetching ailments:', err);
      } finally {
        if (!cancelled) setIsFetchingAilments(false);
      }
    })();

    return () => { cancelled = true; };
  }, [reviews, initialAilmentMap, ailmentMap]);

  const userProfile = {
    initial: user?.first_name?.[0] || "",
    name: `${user?.first_name || ""} ${user?.last_name || ""}`,
    username: user?.user_name || "",
    email: user?.email,
    followers: user?.followers || 10,
    following: user?.following || 15,
    location: user?.location || "N/A",
    profileImg: user?.profile_img || "",
    memberSince: formatMemberSince(user?.created_at || ""),
  };

  const handleLikeToggle = async (reviewId: string) => {
    if (!currentUser) {
      alert('Please log in to like reviews');
      return;
    }

    setLoadingLikes(prev => ({ ...prev, [reviewId]: true }));

    const result = await toggleReviewLike(reviewId);

    if (result.success) {
      setReviewInteractions(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          likes: result.totalLikes,
          userHasLiked: result.userHasLiked
        }
      }));
    } else {
      alert('Failed to update like: ' + result.error);
    }

    setLoadingLikes(prev => ({ ...prev, [reviewId]: false }));
  };

  const handleCommentCountChange = (reviewId: string, count: number) => {
    setReviewInteractions(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        comments: count
      }
    }));
  };

  const toggleComments = (reviewId: string) => {
    setShowComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
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
                <div className="w-10 h-10 rounded-full bg-[#4B544A] text-white flex items-center justify-center text-xl font-semibold overflow-hidden">
                  {userProfile.profileImg ? (
                    <img
                      src={userProfile.profileImg}
                      alt={userProfile.initial}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userProfile.initial.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="relative">
                  <p className="font-semibold text-base text-xl text-[#2B2E28]">{userProfile.name}</p>
                  <p className="text-sm text-[#2B2E28] pr-5">@{userProfile.username}</p>
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
                  // Build tags robustly: include potency fields, dosage, duration
                  const tagsSet = new Set<string>();
                  if (review?.potency) tagsSet.add(String(review.potency));
                  if (review?.potency_2) tagsSet.add(String(review.potency_2));
                  if (review?.potencyType) tagsSet.add(String(review.potencyType));
                  // if all_potencies map exists and primary remedy id present, prefer that
                  if (review?.all_potencies && review.remedy_id && review.all_potencies[review.remedy_id]) {
                    tagsSet.add(String(review.all_potencies[review.remedy_id]));
                  }
                  // legacy single potency field or combined string
                  if (review?.potency_str) tagsSet.add(String(review.potency_str));
                  if (review?.dosage) tagsSet.add(String(review.dosage));
                  if (review?.duration_used) tagsSet.add(String(review.duration_used));
                  const tags = Array.from(tagsSet).filter(Boolean);

                  // Resolve ailment display (icon + name) with several fallback field names and fetched map
                  // Prefer explicit fields (support many possible keys), then fallback to fetched map by id
                  let ailmentIcon =
                    review?.ailment?.icon ??
                    review?.ailment_icon ??
                    review?.ailmentIcon ??
                    review?.ailment?.emoji ??
                    null;

                  let ailmentName =
                    review?.ailment?.name ??
                    review?.ailment_name ??
                    review?.ailmentName ??
                    review?.ailment?.label ??
                    null;

                  const ailmentIdRaw =
                    review?.ailment_id ??
                    (typeof review?.ailment === 'string' ? review.ailment : review?.ailment?.id);
                  const ailmentId = ailmentIdRaw ? String(ailmentIdRaw) : null;

                  if ((!ailmentName || !ailmentIcon) && ailmentId) {
                    const fetched = ailmentMap[ailmentId];
                    if (fetched) {
                      ailmentName = ailmentName || fetched.name || null;
                      ailmentIcon = ailmentIcon || fetched.icon || null;
                    }
                  }

                  // Resolve primary remedy name with fallbacks, use fetched map if needed
                  let primaryRemedyName =
                    review?.remedy?.name ||
                    review?.primary_remedy ||
                    review?.remedy_name ||
                    (review?.remedies && review.remedies.name) ||
                    null;
                  if (!primaryRemedyName && review?.remedy_id) {
                    // don't show raw id while fetching; show name only if available
                    primaryRemedyName = remedyNameMap[review.remedy_id] || null;
                  }
                  // Resolve primary remedy icon (prefer explicit fields, fallback to fetched map)
                  let primaryRemedyIcon =
                    review?.remedy?.icon ??
                    review?.remedy_icon ??
                    review?.remedy?.image_url ??
                    review?.remedyImageUrl ??
                    null;
                  if (!primaryRemedyIcon && review?.remedy_id) {
                    primaryRemedyIcon = remedyIconMap[String(review.remedy_id)] || null;
                  }

                  // Resolve combination/secondary remedies (prefer array of objects with names).
                  // If only ids are present, replace with fetched names from remedyNameMap
                  let combinationNames: string[] = [];
                  if (Array.isArray(review?.secondary_remedies) && review.secondary_remedies.length > 0) {
                    combinationNames = review.secondary_remedies.map((r: any) => {
                      if (!r) return '';
                      if (typeof r === 'string') return remedyNameMap[r] || r;
                      return r?.name || r?.label || (r?.id ? (remedyNameMap[r.id] || String(r.id)) : String(r));
                    }).filter(Boolean);
                  } else if (Array.isArray(review?.secondary_remedy_names) && review.secondary_remedy_names.length > 0) {
                    combinationNames = review.secondary_remedy_names;
                  } else if (Array.isArray(review?.secondary_remedy_ids) && review.secondary_remedy_ids.length > 0) {
                    // while fetching, avoid showing ids -> use empty string when no name yet
                    combinationNames = review.secondary_remedy_ids.map((id: any) => remedyNameMap[id] || '').filter(Boolean);
                  }

                  return (
                    <div
                      key={review.id}
                      className="border-b border-[#D9D9D6] last:border-none pb-6"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3 custom-320">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#4B544A] text-white flex items-center justify-center text-xl font-semibold overflow-hidden">
                            {userProfile.profileImg ? (
                              <img
                                src={userProfile.profileImg}
                                alt={userProfile.initial}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              userProfile.initial.charAt(0).toUpperCase()
                            )}
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

                      {/* Ailment / Primary Remedy / Combination */}
                      {(ailmentName || ailmentIcon || primaryRemedyName || combinationNames.length > 0) && (
                        <div className="mb-3 text-sm text-[#41463B]">
                          <div className="flex justify-between gap-4 flex-wrap flex-col gap-2">
                            <div className="flex flex-col gap-2">
                              {ailmentName && (
                                <div className="flex items-center gap-1">
                                  {/* If icon is a URL, show image; otherwise render emoji/text */}
                                  <span className="text-xs text-[#2B2E28] font-medium">Ailment:</span>
                                  {/* Ailment icon intentionally hidden in chips per UI request
                                  {ailmentIcon && (typeof ailmentIcon === 'string' && (ailmentIcon.startsWith('http') || ailmentIcon.startsWith('/'))) ? (
                                     <span className="rounded-full w-[24px] h-[24px] bg-[#F5F3ED] flex justify-center items-center"><img src={ailmentIcon} alt={ailmentName} className="w-[16px] h-[16px]" /></span>
                                  ) : (
                                    <span className="text-xs font-medium leading-none rounded-full w-[24px] h-[24px] bg-[#F5F3ED] flex justify-center items-center">{ailmentIcon ?? '🌿'}</span>
                                  )} */}
                                  <span className="font-medium bg-[#F5F3ED] px-2 py-1 text-xs"> {ailmentName}</span>
                                </div>
                              )}                              

                              <div className="flex flex-wrap gap-4">
                                {primaryRemedyName && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-[#2B2E28]">Primary Remedy:</span>
                                    {/* Primary remedy icon hidden in chips per UI request
                                    <span className="rounded-full w-[24px] h-[24px] bg-[#F5F3ED] flex justify-center items-center">
                                      {primaryRemedyIcon && (typeof primaryRemedyIcon === 'string' && (primaryRemedyIcon.startsWith('http') || primaryRemedyIcon.startsWith('/'))) ? (
                                        <img src={primaryRemedyIcon} alt={primaryRemedyName || 'remedy'} className="w-[16px] h-[16px]" />
                                      ) : (
                                        <span className="text-sm">{primaryRemedyIcon ?? '🌿'}</span>
                                      )}
                                    </span> */}
                                    <span className="px-2 py-1 bg-[#F5F3ED] text-[#2B2E28] text-xs font-medium">{primaryRemedyName}</span>
                                  </div>
                                )}

                                {combinationNames.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-[#2B2E28]">Used in Combination with:</span>
                                    {combinationNames.map((c, i) => (
                                      <span key={i} className="px-2 py-1 bg-[#F5F3ED] text-[#2B2E28] text-xs font-medium">
                                        [{c}]
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            
                          </div>
                        </div>
                      )}

                      {/* Tags (potency, dosage, duration, etc.) */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[12px] font-medium px-2 py-1 rounded-[4px] text-[#2B2E28] border border-[#B5B6B1]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {review.notes && (
                        <p className="text-[14px] font-medium leading-[22px] text-[#0B0C0A] mb-4">
                          {review.notes}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-6 text-[16px] font-semibold">
                        <button
                          onClick={() => handleLikeToggle(review.id)}
                          disabled={loadingLikes[review.id]}
                          className={`flex items-center gap-2 transition text-[16px] font-semibold ${reviewInteractions[review.id]?.userHasLiked
                            ? 'text-[#41463B]'
                            : 'text-[#20231E] transition hover:text-[#41463B]'
                            } disabled:opacity-50`}
                        >
                          <Heart
                            className={`w-4 h-4 ${reviewInteractions[review.id]?.userHasLiked ? 'fill-current' : ''
                              }`}
                          />
                          <span>
                            {reviewInteractions[review.id]?.likes ?? 0} like{(reviewInteractions[review.id]?.likes ?? 0) !== 1 ? 's' : ''}
                          </span>
                        </button>

                        <button
                          onClick={() => toggleComments(review.id)}
                          className="flex items-center gap-2 text-[#20231E] transition hover:text-[#41463B] text-[16px] font-semibold"
                        >
                          <img
                            src="/message-2-line.svg"
                            className="w-4 h-4"
                            alt="comments"
                          />
                          <span>
                            {reviewInteractions[review.id]?.comments ?? 0} comment{(reviewInteractions[review.id]?.comments ?? 0) !== 1 ? 's' : ''}
                          </span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments[review.id] && (
                        <ReviewComments
                          reviewId={review.id}
                          onCommentCountChange={(count) => handleCommentCountChange(review.id, count)}
                        />
                      )}
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
