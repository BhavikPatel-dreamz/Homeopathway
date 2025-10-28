"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ailment {
  id: string;
  name: string;
  icon: string;
  description: string;
  remedies_count: number;
}

export default function AdminAilmentsManager() {
  const [ailments, setAilments] = useState<Ailment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchAilments();
  }, []);

  const fetchAilments = async () => {
    // TODO: Replace with actual API call to Supabase
    // For now, using mock data
    const mockAilments: Ailment[] = [
      { id: '1', name: 'Headache', icon: '😣', description: 'Headaches are one of the most common ailments affecting people worldwide.', remedies_count: 112 },
      { id: '2', name: 'Anxiety', icon: '😰', description: 'Mental health condition characterized by excessive worry and fear.', remedies_count: 38 },
      { id: '3', name: 'Insomnia', icon: '😴', description: 'Sleep disorder making it hard to fall asleep or stay asleep.', remedies_count: 42 },
      { id: '4', name: 'Cold & Flu', icon: '🤧', description: 'Common viral infections affecting the respiratory system.', remedies_count: 52 },
      { id: '5', name: 'Allergies', icon: '🤧', description: 'Immune system reactions to foreign substances.', remedies_count: 47 },
    ];
    setAilments(mockAilments);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ailment?')) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call to Supabase
      setAilments(ailments.filter(a => a.id !== id));
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
        <Link
          href="/admin/dashboard/ailments/add"
          className="px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add New Ailment
        </Link>
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
                      <Link
                        href={`/admin/dashboard/ailments/edit/${ailment.id}`}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
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
    </div>
  );
}
