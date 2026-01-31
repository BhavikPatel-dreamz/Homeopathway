"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Send, Reply, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { getReviewComments, addReviewComment, updateReviewComment, deleteReviewComment, ReviewComment } from '@/lib/reviewInteractions';
import { useAuth } from '@/lib/authContext';

interface ReviewCommentsProps {
  reviewId: string;
  onCommentCountChange?: (count: number) => void;
}

const ReviewComments: React.FC<ReviewCommentsProps> = ({ reviewId, onCommentCountChange }) => {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const { user } = useAuth();

  // fetchComments returns the raw result; refreshComments applies it to state.
  const fetchComments = useCallback(async () => {
    return await getReviewComments(reviewId);
  }, [reviewId]);

  const refreshComments = useCallback(async () => {
    const result = await fetchComments();
    if (result.success && result.comments) {
      setComments(result.comments);
      if (onCommentCountChange) {
        onCommentCountChange(result.comments.length);
      }
    } else {
      console.error('Failed to load comments:', result.error);
      if (typeof window !== 'undefined') {
        alert('Failed to load comments: ' + (result.error || 'Unknown error'));
      }
    }
    return result;
  }, [fetchComments, onCommentCountChange]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await fetchComments();
      if (!mounted) return;
      if (result.success && result.comments) {
        setComments(result.comments);
        if (onCommentCountChange) {
          onCommentCountChange(result.comments.length);
        }
      } else {
        console.error('Failed to load comments:', result.error);
        if (typeof window !== 'undefined') {
          alert('Failed to load comments: ' + (result.error || 'Unknown error'));
        }
      }
    })();
    return () => { mounted = false; };
  }, [reviewId, fetchComments, onCommentCountChange]);

  const handleAddComment = async (parentCommentId?: string) => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }

    const content = parentCommentId ? newComment : newComment;
    if (!content.trim()) return;

    setLoading(true);
    const result = await addReviewComment(reviewId, content, parentCommentId);

    if (result.success && result.comment) {
      // Optimistically update comments list with returned comment (avoid slow full reload)
      setNewComment('');
      setReplyingTo(null);
      setComments(prev => [...prev, result.comment as ReviewComment]);
      if (onCommentCountChange) onCommentCountChange((comments.length || 0) + 1);
    } else {
      console.error('Failed to add review comment:', result.error);
      alert('Failed to add comment: ' + (result.error || 'Unknown error'));
    }
    setLoading(false);
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    const result = await updateReviewComment(commentId, editContent);

    if (result.success) {
      setEditingComment(null);
      setEditContent('');
      await refreshComments();
    } else {
      alert('Failed to update comment: ' + result.error);
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    const result = await deleteReviewComment(commentId);

    if (result.success) {
      await refreshComments();
    } else {
      alert('Failed to delete comment: ' + result.error);
    }
    setLoading(false);
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

  const parentComments = comments.filter(comment => !comment.parent_comment_id);
  const childComments = comments.filter(comment => comment.parent_comment_id);

  const getChildComments = (parentId: string) =>
    childComments.filter(comment => comment.parent_comment_id === parentId);

  const renderComment = (comment: ReviewComment, isReply: boolean = false) => {
    const isEditing = editingComment === comment.id;
    const isOwner = user && user.id === comment.user_id;
    const userInitial = comment.user_first_name?.[0] || comment.user_name?.[0] || '?';
    const userName = `${comment.user_first_name || ''} ${comment.user_last_name || ''}`.trim() || comment.user_name || 'Anonymous';

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''} pt-3`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4B544A] text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
              {comment.user_profile_img ? (
                <img
                  src={comment.user_profile_img}
                  alt={userInitial}
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitial.toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</p>
            </div>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(showDropdown === comment.id ? null : comment.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {showDropdown === comment.id && (
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                      setShowDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm flex items-center gap-2 text-[#20231E]"
                  >
                    <Edit className="w-3 h-3 text-[#20231E]" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteComment(comment.id);
                      setShowDropdown(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none bg-white text-[#0B0C0A] placeholder:text-gray-400"
              rows={3}
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEditComment(comment.id)}
                disabled={loading || !editContent.trim()}
                className="px-3 py-1 bg-[#6C7463] text-white text-sm font-semibold rounded-full hover:bg-[#41463B] disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                className="px-3 py-1 bg-gray-500 text-white text-sm font-semibold rounded-full hover:bg-[#41463B] hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
            {!isReply && user && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-sm font-medium leading-[22px] text-[#0B0C0A] flex items-center gap-1 cursor-pointer"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}
          </>
        )}

        {replyingTo === comment.id && (
          <div className="mt-3 ml-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Reply to ${userName}...`}
              className="w-full p-2 border border-[#D3D6D1] rounded-[8px] text-sm resize-none bg-white text-[#0B0C0A] placeholder:text-[#41463B]"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleAddComment(comment.id)}
                disabled={loading || !newComment.trim()}
                className="px-3 py-1 bg-[#6C7463] text-white text-sm font-semibold rounded-full hover:bg-[#41463B] disabled:opacity-50 flex gap-1 items-center"
              >
                <Send className="w-3 h-3" />
                Reply
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment('');
                }}
                className="px-3 py-1 bg-gray-500 text-white text-sm font-semibold rounded-full hover:bg-[#41463B] hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Child comments */}
        {!isReply && getChildComments(comment.id).map(childComment => renderComment(childComment, true))}
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="font-semibold text-sm text-gray-900 mb-3 font-family-montserrat">
        Comments ({comments.length})
      </h4>

      {/* Add new comment */}
      {user && !replyingTo && (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none text-[#0B0C0A] placeholder:text-[#41463B]"
            rows={3}
          />
          <button
            onClick={() => handleAddComment()}
            disabled={loading || !newComment.trim()}
            className="mt-2 px-4 py-2 bg-[#6C7463] text-white text-sm font-semibold rounded-full hover:bg-[#41463B] disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      )}

      {!user && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
          Please <Link href="/login" className="text-[#0B0C0A] hover:underline">log in</Link> to comment
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-1">
        {parentComments.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        ) : (
          parentComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default ReviewComments;