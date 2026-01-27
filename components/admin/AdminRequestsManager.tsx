/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface RequestRecord {
  id: string;
  requested_by_user_id: string;
  type: 'ailment' | 'remedy';
  name: string;
  icon: string;
  slug: string;
  description: string | null;
  key_symptoms: string[] | null;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  user_email?: string;
}

interface EditingRequest extends RequestRecord {
  editName: string;
  editIcon: string;
  editDescription: string;
  editKeySymptoms: string;
}

export default function AdminRequestsManager() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'ailment' | 'remedy'>('pending');
  const [editingRequest, setEditingRequest] = useState<EditingRequest | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
  };

  // Fetch all requests from ailments and remedies tables
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        // Fetch from ailments table
        const { data: ailmentRequests, error: ailmentsError } = await supabase
          .from('ailments')
          .select('id, requested_by_user_id, name, icon, slug, description, status, created_at, is_user_submission')
          .eq('is_user_submission', true)
          .order('created_at', { ascending: false });

        if (ailmentsError) throw ailmentsError;

        // Fetch from remedies table
        const { data: remedyRequests, error: remediesError } = await supabase
          .from('remedies')
          .select('id, requested_by_user_id, name, icon, slug, description, status, created_at, is_user_submission, key_symptoms')
          .eq('is_user_submission', true)
          .order('created_at', { ascending: false });

        if (remediesError) throw remediesError;

        // Combine requests
        const allRequests: RequestRecord[] = [
          ...(ailmentRequests || []).map((a) => ({
            ...a,
            type: 'ailment' as const,
            key_symptoms: null,
          })),
          ...(remedyRequests || []).map((r) => ({
            ...r,
            type: 'remedy' as const,
          })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Fetch user emails for each request
        const requestsWithEmails = await Promise.all(
          allRequests.map(async (req) => {
            let userEmail = 'Unknown';
            
            if (req.requested_by_user_id) {
              try {
                // Try to get email from profiles table
                const { data: userData, error: profileError } = await supabase
                  .from('profiles')
                  .select('email')
                  .eq('id', req.requested_by_user_id)
                  .single();
                
                if (userData?.email) {
                  userEmail = userData.email;
                } else if (!profileError) {
                  // Profile exists but no email, try auth
                  const { data: authData } = await supabase.auth.admin.getUserById(req.requested_by_user_id);
                  userEmail = authData?.user?.email || 'Unknown';
                }
              } catch (error) {
                console.error('Error fetching user email:', error);
              }
            }
            
            return { ...req, user_email: userEmail };
          })
        );

        setRequests(requestsWithEmails);
      } catch (error) {
        console.error('Error fetching requests:', error);
        showToast('error', 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

  const checkDuplicate = async (name: string, type: string, excludeId?: string) => {
    try {
      const tableName = type === 'ailment' ? 'ailments' : 'remedies';
      let query = supabase
        .from(tableName)
        .select('id, name')
        .ilike('name', `%${name}%`)
        .limit(5);

      // Exclude current item if editing
      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data } = await query;

      return data && data.length > 0 ? data : null;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return null;
    }
  };

  const handleApprove = async (request: RequestRecord) => {
    try {
      setActionLoading(request.id);

      // Check for duplicates in target table (excluding current item)
      const duplicates = await checkDuplicate(request.name, request.type, request.id);

      if (duplicates && duplicates.length > 0) {
        showToast('info', `⚠️ Duplicate detected! "${request.name}" already exists in ${request.type}s. Request not approved.`);
        setActionLoading(null);
        return;
      }

      // Update status to approved in the same table
      const tableName = request.type === 'ailment' ? 'ailments' : 'remedies';
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Update local state
      setRequests(requests.map((r) =>
        r.id === request.id ? { ...r, status: 'approved' } : r
      ));

      showToast('success', `${request.type.charAt(0).toUpperCase() + request.type.slice(1)} request approved!`);
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('error', 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: string, type: 'ailment' | 'remedy') => {
    try {
      setActionLoading(requestId);

      const tableName = type === 'ailment' ? 'ailments' : 'remedies';
      const { error } = await supabase
        .from(tableName)
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map((r) =>
        r.id === requestId ? { ...r, status: 'declined' } : r
      ));

      showToast('success', 'Request declined');
    } catch (error) {
      console.error('Error declining request:', error);
      showToast('error', 'Failed to decline request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (request: RequestRecord) => {
    setEditingRequest({
      ...request,
      editName: request.name,
      editIcon: request.icon,
      editDescription: request.description || '',
      editKeySymptoms: request.key_symptoms?.join(', ') || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRequest) return;

    try {
      setActionLoading(editingRequest.id);

      // Check for duplicates with new name (excluding current item)
      if (editingRequest.editName !== editingRequest.name) {
        const duplicates = await checkDuplicate(editingRequest.editName, editingRequest.type, editingRequest.id);
        if (duplicates && duplicates.length > 0) {
          showToast('info', `⚠️ Duplicate detected! "${editingRequest.editName}" already exists.`);
          setActionLoading(null);
          return;
        }
      }

      // Update request with edited data
      const tableName = editingRequest.type === 'ailment' ? 'ailments' : 'remedies';
      const updateData: any = {
        name: editingRequest.editName,
        icon: editingRequest.editIcon,
        description: editingRequest.editDescription || null,
      };

      if (editingRequest.type === 'remedy') {
        updateData.key_symptoms = editingRequest.editKeySymptoms
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingRequest.id);

      if (error) throw error;

      // Update local state
      setRequests(requests.map((r) =>
        r.id === editingRequest.id
          ? {
              ...r,
              name: editingRequest.editName,
              icon: editingRequest.editIcon,
              description: editingRequest.editDescription || null,
              key_symptoms: editingRequest.type === 'remedy'
                ? editingRequest.editKeySymptoms.split(',').map((s) => s.trim()).filter((s) => s)
                : null,
            }
          : r
      ));

      showToast('success', 'Request updated successfully!');
      setEditingRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      showToast('error', 'Failed to update request');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.type === filter);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div
            className={`min-w-[300px] max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : toast.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm font-medium">{toast.text}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', /* 'pending', */ 'ailment', 'remedy'] as const).map((status) => {
          const labels: Record<string, string> = {
            'all': 'All Requests',
            /* 'pending': 'Pending', */
            'ailment': 'Ailments',
            'remedy': 'Remedies'
          };
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                filter === status
                  ? 'text-[#6B7B5E] border-b-2 border-[#6B7B5E]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {labels[status]}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7B5E] mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">No {filter === 'all' ? 'requests' : filter === 'ailment' ? 'ailment requests' : filter === 'remedy' ? 'remedy requests' : `${filter} requests`}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{request.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0B0C0A]">{request.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          request.type === 'ailment' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-700' :
                          request.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{request.description || 'No description'}</p>
                  {request.key_symptoms && request.key_symptoms.length > 0 && (
                    <p className="text-gray-500 text-xs mb-2">
                      <strong>Symptoms:</strong> {request.key_symptoms.join(', ')}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs">
                    <strong>User:</strong> {request.user_email} | {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {(request.status === 'pending' || request.status === 'approved') && (
                    <>
                      {/* <button
                        onClick={() => handleApprove(request)}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                      >
                        {actionLoading === request.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDecline(request.id, request.type)}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button> */}
                      <button
                        onClick={() => handleEdit(request)}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#0B0C0A]">Edit Request</h2>
              <button
                onClick={() => setEditingRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingRequest.editName}
                  onChange={(e) => setEditingRequest({ ...editingRequest, editName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E]"
                  disabled={actionLoading === editingRequest.id}
                />
              </div>

              {/* Icon Field */}
              <div>
                <label className="block text-sm font-medium text-[#0B0C0A] mb-2">Icon</label>
                <input
                  type="text"
                  value={editingRequest.editIcon}
                  onChange={(e) => setEditingRequest({ ...editingRequest, editIcon: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E]"
                  disabled={actionLoading === editingRequest.id}
                  maxLength={2}
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-[#0B0C0A] mb-2">Description</label>
                <textarea
                  value={editingRequest.editDescription}
                  onChange={(e) => setEditingRequest({ ...editingRequest, editDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E] resize-none"
                  rows={3}
                  disabled={actionLoading === editingRequest.id}
                />
              </div>

              {/* Remedy-specific: Key Symptoms */}
              {editingRequest.type === 'remedy' && (
                <div>
                  <label className="block text-sm font-medium text-[#0B0C0A] mb-2">
                    Key Symptoms (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingRequest.editKeySymptoms}
                    onChange={(e) => setEditingRequest({ ...editingRequest, editKeySymptoms: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E3E]"
                    disabled={actionLoading === editingRequest.id}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading === editingRequest.id}
                  className="flex-1 px-4 py-2.5 bg-[#5D7B6F] hover:bg-[#4a5f56] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {actionLoading === editingRequest.id ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingRequest(null)}
                  disabled={actionLoading === editingRequest.id}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
