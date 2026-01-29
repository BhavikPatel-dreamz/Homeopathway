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
            className={`min-w-[300px] max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 ${toast.type === "success"
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
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="my-requests-card">
          {/* Header */}
          {/* <div className="mb-8">
            <h1 className="text-4xl font-normal text-[#20231E]">My Requests</h1>
            <p className="text-gray-600 mt-2">View and manage all your ailment and remedy requests</p>
          </div> */}

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
                  <h2 className="sm:text-[40px] text-3xl font-normal sm:leading-[40px] leading-8 text-[#0B0C0A] mb-6">Ailment</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-8 border-b-[#F5F3ED] bg-white">
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[120px] w-[120px]">Req No 1</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[200px] w-[200px]">Ailment Name</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[100px] w-[100px]">Emoji</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[100px] w-[100px]">Slug</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[300px] w-[300px]">Description</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Status</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {requests.filter(r => r.type === 'ailment').map((request, index) => (
                          <tr key={request.id} className="border-1 border-b-2 border-[#F5F3ED] hover:bg-gray-50">
                            <td className="border-r border-r-[#D3D6D1] px-4 py-4 sm:text-base text-sm text-[#2B2E28] font-medium w-[120px]">Req #{index + 1}</td>
                            <td className="border-r border-r-[#D3D6D1] px-4 py-4 sm:text-base text-sm text-center text-[#0B0C0A] w-[200px]">{request.name}</td>
                            <td className="border-r border-r-[#D3D6D1] px-4 py-4 text-center text-lg w-[100px]">{request.icon}</td>
                            <td className="border-r border-r-[#D3D6D1] px-4 py-4 text-center sm:text-base text-sm text-[#2B2E28] font-medium w-[100px]">N/A</td>
                            <td className="border-r border-r-[#D3D6D1] px-4 py-4 sm:text-base text-sm text-[#2B2E28] font-medium w-[300px]">Lorem ipsum...</td>
                            <td className="border-r border-r-[#D3D6D1] px-4 py-4 text-center w-[115px]">
                              <span className={`sm:text-sm text-xs font-medium px-2 py-1 rounded-full ${request.status === 'approved' ? 'text-[#175F3D] bg-[#E9F5F0]' :
                                request.status === 'declined' ? 'sm:text-sm text-xs font-medium px-2 py-1 rounded-full text-[#B62E31] bg-[#FCEBEC]' :
                                  'text-orange-600'
                                }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center w-[115px]">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleEditClick(request)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${request.status === 'approved'
                                    ? 'cursor-not-allowed fill-[#83857D]'
                                    : 'hover:fill-gray-700 fill-[#203581]'
                                    }`}
                                  title={
                                    request.status === 'approved'
                                      ? 'Cannot edit approved requests'
                                      : 'Edit'
                                  }
                                >
                                  <svg
                                    className="sm:w-4.5 sm:h-4.5 w-3 h-3"
                                    viewBox="0 0 19 19"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M13.757 0.9L11.757 2.9H2V16.9H16V7.143L18 5.143V17.9C18 18.1652 17.8946 18.4196 17.7071 18.6071C17.5196 18.7946 17.2652 18.9 17 18.9H1C0.734784 18.9 0.48043 18.7946 0.292893 18.6071C0.105357 18.4196 0 18.1652 0 17.9V1.9C0 1.63478 0.105357 1.38043 0.292893 1.19289C0.48043 1.00536 0.734784 0.9 1 0.9H13.757ZM17.485 0L18.9 1.416L9.708 10.608L8.296 10.611L8.294 9.194L17.485 0Z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRequest(request.id, request.type)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${request.status === 'approved'
                                    ? 'cursor-not-allowed fill-[#83857D]'
                                    : 'hover:fill-red-700 fill-[#B62E31]'
                                    }`}
                                  title={
                                    request.status === 'approved'
                                      ? 'Cannot delete approved requests'
                                      : 'Delete'
                                  }
                                >
                                  <svg
                                    className="sm:w-4.5 sm:h-4.5 w-3 h-3"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M15 4H20V6H18V19C18 19.2652 17.8946 19.5196 17.7071 19.7071C17.5196 19.8946 17.2652 20 17 20H3C2.73478 20 2.48043 19.8946 2.29289 19.7071C2.10536 19.5196 2 19.2652 2 19V6H0V4H5V1C5 0.734784 5.10536 0.48043 5.29289 0.292893C5.48043 0.105357 5.73478 0 6 0H14C14.2652 0 14.5196 0.105357 14.7071 0.292893C14.8946 0.48043 15 0.734784 15 1V4ZM16 6H4V18H16V6ZM7 9H9V15H7V9ZM11 9H13V15H11V9ZM7 2V4H13V2H7Z"
                                    />
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
                    <button className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {[1, 2, 3, 4].map((page) => (
                      <button
                        key={page}
                        className={`w-[40px] h-[40px] rounded-full text-xs font-medium transition-colors flex items-center justify-center ${page === 1
                          ? 'bg-[#6C7463] text-white'
                          : 'bg-[#F5F3ED] text-[#41463B] hover:bg-[#6C7463] hover:text-white'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
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
                  <h2 className="sm:text-[40px] text-3xl font-normal sm:leading-[40px] leading-8 text-[#0B0C0A] mb-6">Remedy</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-8 border-b-[#F5F3ED] bg-white">
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[120px] w-[120px]">Req No 1</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[200px] w-[200px]">Remedy Name</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[100px] w-[100px]">Emoji</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[100px] w-[100px]">Slug</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[300px] w-[300px]">Description</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Status</th>
                          <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {requests.filter(r => r.type === 'remedy').map((request, index) => (
                          <tr key={request.id} className="border-1 border-b-2 border-[#F5F3ED] hover:bg-gray-50">
                            <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 sm:text-base text-sm text-[#2B2E28] min-w-[120px] w-[120px]">Req #{index + 1}</td>
                            <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 sm:text-base text-sm text-[#2B2E28] text-center min-w-[200px] w-[200px]">{request.name}</td>
                            <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center text-lg min-w-[100px] w-[100px]">{request.icon}</td>
                            <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 sm:text-base text-sm text-[#2B2E28] text-center min-w-[100px] w-[100px]">N/A</td>
                            <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 sm:text-base text-sm text-[#2B2E28] min-w-[300px] w-[300px]">Lorem ipsum...</td>
                            <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm text-[#2B2E28] min-w-[115px] w-[115px]">
                              <span className={`sm:text-sm text-xs font-medium px-2 py-1 rounded-full ${request.status === 'approved' ? 'text-[#175F3D] bg-[#E9F5F0]' :
                                request.status === 'declined' ? 'text-red-600' :
                                  'text-orange-600'
                                }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-right w-[115px]">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleEditClick(request)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${request.status === 'approved'
                                    ? 'cursor-not-allowed fill-[#83857D]'
                                    : 'hover:fill-gray-700 fill-[#203581]'
                                    }`}
                                  title={
                                    request.status === 'approved'
                                      ? 'Cannot edit approved requests'
                                      : 'Edit'
                                  }
                                >
                                  <svg
                                    className="sm:w-4.5 sm:h-4.5 w-3 h-3"
                                    viewBox="0 0 19 19"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M13.757 0.9L11.757 2.9H2V16.9H16V7.143L18 5.143V17.9C18 18.1652 17.8946 18.4196 17.7071 18.6071C17.5196 18.7946 17.2652 18.9 17 18.9H1C0.734784 18.9 0.48043 18.7946 0.292893 18.6071C0.105357 18.4196 0 18.1652 0 17.9V1.9C0 1.63478 0.105357 1.38043 0.292893 1.19289C0.48043 1.00536 0.734784 0.9 1 0.9H13.757ZM17.485 0L18.9 1.416L9.708 10.608L8.296 10.611L8.294 9.194L17.485 0Z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRequest(request.id, request.type)}
                                  disabled={request.status === 'approved'}
                                  className={`p-1 transition-colors ${request.status === 'approved'
                                    ? 'cursor-not-allowed fill-[#83857D]'
                                    : 'hover:fill-red-700 fill-[#B62E31]'
                                    }`}
                                  title={
                                    request.status === 'approved'
                                      ? 'Cannot delete approved requests'
                                      : 'Delete'
                                  }
                                >
                                  <svg
                                    className="sm:w-4.5 sm:h-4.5 w-3 h-3"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M15 4H20V6H18V19C18 19.2652 17.8946 19.5196 17.7071 19.7071C17.5196 19.8946 17.2652 20 17 20H3C2.73478 20 2.48043 19.8946 2.29289 19.7071C2.10536 19.5196 2 19.2652 2 19V6H0V4H5V1C5 0.734784 5.10536 0.48043 5.29289 0.292893C5.48043 0.105357 5.73478 0 6 0H14C14.2652 0 14.5196 0.105357 14.7071 0.292893C14.8946 0.48043 15 0.734784 15 1V4ZM16 6H4V18H16V6ZM7 9H9V15H7V9ZM11 9H13V15H11V9ZM7 2V4H13V2H7Z"
                                    />
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
                    <button className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {[1, 2, 3, 4].map((page) => (
                      <button
                        key={page}
                        className={`w-[40px] h-[40px] rounded-full text-xs font-medium transition-colors flex items-center justify-center ${page === 1
                          ? 'bg-[#6C7463] text-white'
                          : 'bg-[#F5F3ED] text-[#41463B] hover:bg-[#6C7463] hover:text-white'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
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
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
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
                                      setEditFormData({ ...editFormData, emoji });
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
                            onChange={(e) => setEditFormData({ ...editFormData, key_symptoms: e.target.value })}
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
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
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
              className="px-3 py-3 text-sm font-semibold bg-[#6B7B5E] text-white hover:bg-[#5D7B6F] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
