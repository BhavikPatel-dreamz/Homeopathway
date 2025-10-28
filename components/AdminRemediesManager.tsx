"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Remedy {
  id: string;
  name: string;
  scientific_name: string;
  average_rating: number;
  review_count: number;
}

export default function AdminRemediesManager() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchRemedies();
  }, []);

  const fetchRemedies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('remedies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRemedies(data || []);
    } catch (error: any) {
      console.error('Error fetching remedies:', error);
      setMessage({ type: 'error', text: 'Failed to load remedies' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this remedy?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('remedies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRemedies(remedies.filter(r => r.id !== id));
      setMessage({ type: 'success', text: 'Remedy deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error deleting remedy:', error);
      setMessage({ type: 'error', text: 'Failed to delete remedy.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Remedies</h2>
          <p className="text-gray-600 mt-1">Add, edit, or remove homeopathic remedies</p>
        </div>
        <Link
          href="/admin/dashboard/remedies/add"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Remedy
        </Link>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Remedies List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remedy Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scientific Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {remedies.map((remedy) => (
                <tr key={remedy.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{remedy.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 italic">{remedy.scientific_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-sm font-medium">{remedy.average_rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{remedy.review_count} reviews</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/dashboard/remedies/edit/${remedy.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(remedy.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {remedies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">💊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No remedies yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first remedy</p>
            <Link
              href="/admin/dashboard/remedies/add"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Remedy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
