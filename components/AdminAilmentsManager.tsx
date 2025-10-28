"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Ailment {
  id: string;
  name: string;
  icon: string;
  description: string;
  remedies_count: number;
}

export default function AdminAilmentsManager() {
  const [ailments, setAilments] = useState<Ailment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAilment, setEditingAilment] = useState<Ailment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    remedies_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchAilments();
  }, []);

  const fetchAilments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ailments').select('*').order('name', { ascending: true });
    if (error) {
      setMessage({ type: 'error', text: 'Failed to fetch ailments.' });
    } else if (data) {
      setAilments(data);
    }
    setLoading(false);
  };

  const openModal = (ailment?: Ailment) => {
    if (ailment) {
      setEditingAilment(ailment);
      setFormData({
        name: ailment.name,
        icon: ailment.icon,
        description: ailment.description,
        remedies_count: ailment.remedies_count,
      });
    } else {
      setEditingAilment(null);
      setFormData({
        name: '',
        icon: '',
        description: '',
        remedies_count: 0,
      });
    }
    setIsModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAilment(null);
    setFormData({
      name: '',
      icon: '',
      description: '',
      remedies_count: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editingAilment) {
        // Update existing ailment
        const { error } = await supabase
          .from('ailments')
          .update(formData)
          .eq('id', editingAilment.id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Ailment updated successfully!' });
      } else {
        // Create new ailment
        const { error } = await supabase
          .from('ailments')
          .insert([formData]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Ailment created successfully!' });
      }

      // Refetch data and close modal
      await fetchAilments();
      setTimeout(() => {
        closeModal();
      }, 1500);

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save ailment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ailment?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ailments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAilments();
      setMessage({ type: 'success', text: 'Ailment deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete ailment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-gray-900">Manage Ailments</h2>
          <p className="text-gray-600 mt-1">Add, edit, or remove ailments from your database</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add New Ailment
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Ailments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Icon</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Remedies</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ailments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No ailments found. Click "Add New Ailment" to create one.
                </td>
              </tr>
            ) : (
              ailments.map((ailment) => (
                <tr key={ailment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-3xl">{ailment.icon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{ailment.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 line-clamp-2">{ailment.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ailment.remedies_count} remedies
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(ailment)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ailment.id)}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-serif">
                {editingAilment ? 'Edit Ailment' : 'Add New Ailment'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ailment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Headache"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
                  required
                />
              </div>

              {/* Icon Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon (Emoji) *
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., 😣"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
                  required
                  maxLength={4}
                />
                <p className="text-xs text-gray-500 mt-1">Use a single emoji to represent this ailment</p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Headaches are one of the most common ailments affecting people worldwide. In homeopathy, we understand that headaches can have various underlying causes..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Remedies Count Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Remedies
                </label>
                <input
                  type="number"
                  value={formData.remedies_count}
                  onChange={(e) => setFormData({ ...formData, remedies_count: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 112"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingAilment ? 'Update Ailment' : 'Create Ailment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
