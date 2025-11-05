"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import Pagination from './Pagination';

interface Remedy {
  id: string;
  name: string;
  slug?: string;
  scientific_name: string;
  average_rating: number;
  review_count: number;
  icon?: string;
  image_url?: string;
}

export default function AdminRemediesManager() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalRemedies, setTotalRemedies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRemedies = useCallback(async () => {
    setLoading(true);
    try {
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // Build query
      let query = supabase
        .from('remedies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,scientific_name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setRemedies(data || []);
      setTotalRemedies(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: unknown) {
      console.error('Error fetching remedies:', error);
      setMessage({ type: 'error', text: 'Failed to load remedies' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchRemedies();
  }, [fetchRemedies]);

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
    } catch (error: unknown) {
      console.error('Error deleting remedy:', error);
      setMessage({ type: 'error', text: 'Failed to delete remedy.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search changes and debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    const tableSection = document.querySelector('.bg-white.rounded-lg.shadow-md');
    tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          href="/admin/remedies/add"
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
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

      {/* Search and Stats */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search remedies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total: </span>
              <span className="font-semibold text-gray-900">{totalRemedies}</span>
            </div>
            {remedies.length > 0 && (
              <div>
                <span className="text-gray-600">Showing: </span>
                <span className="font-semibold text-gray-900">
                  {((currentPage - 1) * itemsPerPage) + 1}-{((currentPage - 1) * itemsPerPage) + remedies.length} of {totalRemedies}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remedies List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
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
                    <div className="w-10 h-10 flex items-center justify-center">
                      {remedy.image_url ? (
                        <Image 
                          src={remedy.image_url} 
                          alt={remedy.name} 
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : remedy.icon ? (
                        <span className="text-2xl">{remedy.icon}</span>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No</span>
                        </div>
                      )}
                    </div>
                  </td>
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
                      href={`/admin/remedies/edit/${remedy.id}`}
                      className="text-teal-600 hover:text-teal-800 font-medium text-sm"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No remedies found' : 'No remedies yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'Get started by adding your first remedy'}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/remedies/add"
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                + Add Remedy
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showTotal={true}
              totalItems={totalRemedies}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
