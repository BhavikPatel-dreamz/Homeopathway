"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Breadcrumb from "../../../components/Breadcrumb";
import { healthEmojis } from "@/lib/emojiList";

interface Request {
  id: string;
  name: string;
  icon: string;
  slug: string;
  description: string | null;
  status: string;
  created_at: string;
  type: 'ailment' | 'remedy';
  key_symptoms?: string[] | null;
}

interface EditFormData {
  name: string;
  emoji: string;
  description: string;
  key_symptoms: string;
}

export default function MyRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'ailment' | 'remedy' | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    emoji: "😊",
    description: "",
    key_symptoms: "",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
  };

  // Fetch user requests from ailments and remedies tables
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();

        // Fetch from ailments table where is_user_submission = true
        const { data: ailmentRequests, error: ailmentsError } = await supabase
          .from('ailments')
          .select('id, name, icon, slug, description, status, created_at, is_user_submission')
          .eq('requested_by_user_id', authUser?.id || '')
          .eq('is_user_submission', true)
          .order('created_at', { ascending: false });

        if (ailmentsError) throw ailmentsError;

        // Fetch from remedies table where is_user_submission = true
        const { data: remedyRequests, error: remediesError } = await supabase
          .from('remedies')
          .select('id, name, icon, slug, description, status, created_at, is_user_submission, key_symptoms')
          .eq('requested_by_user_id', authUser?.id || '')
          .eq('is_user_submission', true)
          .order('created_at', { ascending: false });

        if (remediesError) throw remediesError;

        // Combine and format requests
        const allRequests: Request[] = [
          ...(ailmentRequests || []).map(a => ({
            ...a,
            type: 'ailment' as const,
          })),
          ...(remedyRequests || []).map(r => ({
            ...r,
            type: 'remedy' as const,
          })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setRequests(allRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        showToast("error", "Failed to load requests");
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleEditClick = (request: Request) => {
    setEditingId(request.id);
    setEditType(request.type);
    setEditFormData({
      name: request.name,
      emoji: request.icon,
      description: request.description || "",
      key_symptoms: request.key_symptoms?.join(", ") || "",
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditType(null);
    setShowEmojiPicker(false);
  };

  const handleEditSave = async () => {
    if (!editingId || !editType) return;

    if (!editFormData.name.trim()) {
      showToast("error", "Name is required");
      return;
    }

    try {
      setEditLoading(true);
      const tableName = editType === 'ailment' ? 'ailments' : 'remedies';

      const updateData: Record<string, unknown> = {
        name: editFormData.name,
        icon: editFormData.emoji,
        description: editFormData.description || null,
      };

      // Add remedy-specific fields
      if (editType === 'remedy') {
        updateData.key_symptoms = editFormData.key_symptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingId);

      if (error) throw error;

      // Update local state
      setRequests(requests.map(r => 
        r.id === editingId 
          ? {
              ...r,
              name: editFormData.name,
              icon: editFormData.emoji,
              description: editFormData.description,
              key_symptoms: editType === 'remedy' 
                ? editFormData.key_symptoms.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
                : undefined,
            }
          : r
      ));

      setEditingId(null);
      setEditType(null);
      showToast("success", "Request updated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update request";
      showToast("error", errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string, type: 'ailment' | 'remedy') => {
    try {
      const tableName = type === 'ailment' ? 'ailments' : 'remedies';
      await supabase.from(tableName).delete().eq('id', requestId);
      setRequests(requests.filter(r => r.id !== requestId));
      showToast("success", "Request deleted successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete request";
      showToast("error", errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2
sm:left-auto sm:right-4 sm:translate-x-0
z-50 animate-in slide-in-from-top-2
">
          <div
            className={`min-w-[300px] max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.text}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-3 sm:px-5">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Account Settings", href: "/profile" },
            { label: "My Requests", isActive: true },
          ]}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-5 py-6 sm:py-9">
        <div className="bg-white rounded-[12px] py-8 sm:py-10 px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-normal text-[#20231E]">My Requests</h1>
            <p className="text-gray-600 mt-2">View and manage all your ailment and remedy requests</p>
          </div>

          {/* Content */}
          {requestsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7B5E] mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No requests yet</p>
              <p className="text-gray-400 text-sm mt-1">Your submitted ailments and remedies will appear here</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ailments Section */}
              {requests.filter(r => r.type === 'ailment').length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#20231E] mb-6">Ailment</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Req No 1</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Ailment Name</th>
                          <th className="px-4 py-4 text-center text-sm font-semibold text-[#0B0C0A]">Emoji</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Slug</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Description</th>
                          <th className="px-4 py-4 text-right text-sm font-semibold text-[#0B0C0A]">Status</th>
                          <th className="px-4 py-4 text-right text-sm font-semibold text-[#0B0C0A]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.filter(r => r.type === 'ailment').map((request, index) => (
                          <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-600">Req #{index + 1}</td>
                            <td className="px-4 py-4 text-sm text-[#0B0C0A]">{request.name}</td>
                            <td className="px-4 py-4 text-center text-lg">{request.icon}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">N/A</td>
                            <td className="px-4 py-4 text-sm text-gray-600">Lorem ipsum...</td>
                            <td className="px-4 py-4 text-right">
                              <span className={`text-xs font-semibold ${
                                request.status === 'approved' ? 'text-green-600' :
                                request.status === 'declined' ? 'text-red-600' :
                                'text-orange-600'
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleEditClick(request)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${
                                    request.status === 'approved' 
                                      ? 'opacity-40 cursor-not-allowed' 
                                      : 'hover:text-gray-700'
                                  }`}
                                  title={request.status === 'approved' ? 'Cannot edit approved requests' : 'Edit'}
                                >
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRequest(request.id, request.type)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${
                                    request.status === 'approved'
                                      ? 'opacity-40 cursor-not-allowed'
                                      : 'hover:text-red-700'
                                  }`}
                                  title={request.status === 'approved' ? 'Cannot delete approved requests' : 'Delete'}
                                >
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-center items-center gap-3">
                    <button className="p-1 text-gray-600 hover:text-gray-900">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {[1, 2, 3, 4].map((page) => (
                      <button
                        key={page}
                        className={`w-7 h-7 rounded-full text-xs font-medium transition-colors flex items-center justify-center ${
                          page === 1
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="p-1 text-gray-600 hover:text-gray-900">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Remedies Section */}
              {requests.filter(r => r.type === 'remedy').length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-[#20231E] mb-6">Remedy</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Req No 1</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Remedy Name</th>
                          <th className="px-4 py-4 text-center text-sm font-semibold text-[#0B0C0A]">Emoji</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Slug</th>
                          <th className="px-4 py-4 text-left text-sm font-semibold text-[#0B0C0A]">Description</th>
                          <th className="px-4 py-4 text-right text-sm font-semibold text-[#0B0C0A]">Status</th>
                          <th className="px-4 py-4 text-right text-sm font-semibold text-[#0B0C0A]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.filter(r => r.type === 'remedy').map((request, index) => (
                          <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-600">Req #{index + 1}</td>
                            <td className="px-4 py-4 text-sm text-[#0B0C0A]">{request.name}</td>
                            <td className="px-4 py-4 text-center text-lg">{request.icon}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">N/A</td>
                            <td className="px-4 py-4 text-sm text-gray-600">Lorem ipsum...</td>
                            <td className="px-4 py-4 text-right">
                              <span className={`text-xs font-semibold ${
                                request.status === 'approved' ? 'text-green-600' :
                                request.status === 'declined' ? 'text-red-600' :
                                'text-orange-600'
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleEditClick(request)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${
                                    request.status === 'approved' 
                                      ? 'opacity-40 cursor-not-allowed' 
                                      : 'hover:text-gray-700'
                                  }`}
                                  title={request.status === 'approved' ? 'Cannot edit approved requests' : 'Edit'}
                                >
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRequest(request.id, request.type)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${
                                    request.status === 'approved'
                                      ? 'opacity-40 cursor-not-allowed'
                                      : 'hover:text-red-700'
                                  }`}
                                  title={request.status === 'approved' ? 'Cannot delete approved requests' : 'Delete'}
                                >
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-center items-center gap-3">
                    <button className="p-1 text-gray-600 hover:text-gray-900">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {[1, 2, 3, 4].map((page) => (
                      <button
                        key={page}
                        className={`w-7 h-7 rounded-full text-xs font-medium transition-colors flex items-center justify-center ${
                          page === 1
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="p-1 text-gray-600 hover:text-gray-900">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Modal - Shown when editing */}
              {editingId && editType && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-[#0B0C0A]">
                        Edit {editType === 'ailment' ? 'Ailment' : 'Remedy'}
                      </h2>
                      <button
                        onClick={handleEditCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleEditSave(); }} className="p-6 space-y-6">
                      {/* Form Title */}
                      <h3 className="text-lg font-semibold text-[#0B0C0A]">
                        {editType === 'ailment' ? 'Ailment' : 'Remedy'} Details
                      </h3>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                          {editType === 'ailment' ? 'Ailment' : 'Remedy'} Name
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          placeholder={editType === 'ailment' ? 'e.g., Headache' : 'e.g., Belladonna'}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] text-[#0B0C0A] placeholder-gray-400"
                          disabled={editLoading}
                        />
                      </div>

                      {/* Emoji Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                          {editType === 'ailment' ? 'Ailment' : 'Remedy'} Emoji (optional)
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-[#0B0C0A]"
                            disabled={editLoading}
                          >
                            <span className="text-xl">{editFormData.emoji}</span>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showEmojiPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </button>

                          {showEmojiPicker && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 max-h-48 overflow-y-auto">
                              <div className="grid grid-cols-6 gap-2">
                                {healthEmojis.map((emoji, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setEditFormData({...editFormData, emoji});
                                      setShowEmojiPicker(false);
                                    }}
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
                      {editType === 'remedy' && (
                        <div>
                          <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                            Key Symptoms
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editFormData.key_symptoms}
                            onChange={(e) => setEditFormData({...editFormData, key_symptoms: e.target.value})}
                            placeholder="e.g., fever, cough, headache (comma-separated)"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] text-[#0B0C0A] placeholder-gray-400"
                            disabled={editLoading}
                          />
                        </div>
                      )}

                      {/* Description Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                          {editType === 'ailment' ? 'Ailment' : 'Remedy'} Description (optional)
                        </label>
                        <textarea
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                          placeholder="Type your message..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] text-[#0B0C0A] placeholder-gray-400 resize-none"
                          rows={4}
                          disabled={editLoading}
                        />
                      </div>

                      {/* Action Buttons */}
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="w-full py-3 bg-[#5D7B6F] hover:bg-[#4a5f56] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        {editLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        disabled={editLoading}
                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 flex justify-start">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 text-sm font-semibold text-[#6B7B5E] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
