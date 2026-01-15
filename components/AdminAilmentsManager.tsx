"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import Pagination from './Pagination';
import { Ailment } from "@/types";

// interface Ailment {
//   id: string;
//   name: string;
//   icon: string;
//   description: string;
//   remedies_count: number;
// }

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalAilments, setTotalAilments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importProgressRef = useRef<number>(0)
  const progressAnimRef = useRef<number | null>(null)

  // Keep ref synced with state
  useEffect(() => {
    importProgressRef.current = importProgress
  }, [importProgress])

  // Smoothly animate progress to target (handles up and down)
  const animateTo = useCallback((target: number) => {
    // clamp
    target = Math.max(0, Math.min(100, Math.round(target)))

    // clear existing timer
    if (progressAnimRef.current) {
      window.clearInterval(progressAnimRef.current)
      progressAnimRef.current = null
    }

    // immediate set if same
    if (importProgressRef.current === target) {
      setImportProgress(target)
      return
    }

    const stepMs = 25
    progressAnimRef.current = window.setInterval(() => {
      const cur = importProgressRef.current || 0
      if (cur === target) {
        if (progressAnimRef.current) {
          window.clearInterval(progressAnimRef.current)
          progressAnimRef.current = null
        }
        return
      }

      let delta = target - cur
      let inc = 1
      if (Math.abs(delta) > 20) inc = Math.ceil(Math.abs(delta) * 0.06)
      else if (Math.abs(delta) > 8) inc = Math.ceil(Math.abs(delta) * 0.12)

      const next = delta > 0 ? Math.min(target, cur + inc) : Math.max(target, cur - inc)
      importProgressRef.current = next
      setImportProgress(next)

      if (next === target) {
        if (progressAnimRef.current) {
          window.clearInterval(progressAnimRef.current)
          progressAnimRef.current = null
        }
      }
    }, stepMs)
  }, [setImportProgress])

  // cleanup
  useEffect(() => {
    return () => {
      if (progressAnimRef.current) {
        window.clearInterval(progressAnimRef.current)
        progressAnimRef.current = null
      }
    }
  }, [])
  const [sortBy, setSortBy] = useState<'name' | 'remedies_count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');


  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/admin/ailments/export?format=csv');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'ailments.csv';
      document.body.appendChild(a);
      // ensure the anchor is attached before clicking and delay revoke
      setTimeout(() => {
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, 50);
    } catch (err) {
      console.error('Export error', err);
      setMessage({ type: 'error', text: 'Export failed' });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setExporting(false);
    }
  };



  const handleSort = (column: 'name' | 'remedies_count') => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const SortArrows = ({
    active,
    order,
  }: {
    active: boolean;
    order: 'asc' | 'desc';
  }) => {
    return (
      <span className="ml-2 inline-flex flex-col leading-none">
        <span
          className={`text-[10px] transition-colors ${active && order === 'asc'
            ? 'text-gray-900'
            : 'text-gray-500'
            }`}
        >
          ▲
        </span>
        <span
          className={`text-[10px] transition-colors ${active && order === 'desc'
            ? 'text-gray-900'
            : 'text-gray-500'
            }`}
        >
          ▼
        </span>
      </span>
    );
  };


  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // small client-generated import id so server can report processing progress
    const importId = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
    formData.append('importId', importId)

    setImportProgress(0)
    setImporting(true)
    // kick off a small visible start so animation begins from 1
    animateTo(1)

    // Include the current user's access token so the server can authenticate
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || null;

    try {
      // Upload with progress using XHR so we can track bytes uploaded
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/admin/ailments/import', true)

        if (accessToken) xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            animateTo(Math.min(pct, 95)) // hold below 100 until server finishes
          } else {
            animateTo(Math.min(95, (importProgressRef.current || 0) + 10))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else {
            try {
              const json = JSON.parse(xhr.responseText || '{}')
              reject(new Error(json?.error || 'Import failed'))
            } catch (e) {
              reject(new Error('Import failed'))
            }
          }
        }

        xhr.onerror = () => reject(new Error('Import failed'))
        xhr.onabort = () => reject(new Error('Import aborted'))

        xhr.send(formData)
      })

      // After upload finishes, poll server for processing progress
      const poll = async () => {
        const start = Date.now()
        while (true) {
          try {
            const res = await fetch(`/api/admin/ailments/import/progress?importId=${encodeURIComponent(importId)}`)
            if (res.ok) {
              const json = await res.json()
              const pct = Number(json?.progress || 0)
              animateTo(pct)
              if (pct >= 100) break
            }
          } catch (e) {
            // ignore transient
          }

          // safety timeout: stop polling after 2 minutes
          if (Date.now() - start > 120_000) break
          await new Promise(r => setTimeout(r, 500))
        }
      }

      await poll()

      // ensure progress reaches 100 visually, wait briefly, then refresh
      animateTo(100)
      await new Promise(r => setTimeout(r, 700))

      // refresh ailments list after import
      await fetchAilments()
      setMessage({ type: 'success', text: 'Import completed successfully' })
      setTimeout(() => setMessage(null), 4000)
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Import failed. Please check the CSV or XLSX file.'});
    } finally {
      setImporting(false)
      // keep 100 visible briefly then animate back to 0
      setTimeout(() => animateTo(0), 1200)
    }
  };



  const fetchAilments = useCallback(async () => {
    setLoading(true);
    try {
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // Build query
      let query = supabase
        .from('ailments')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + itemsPerPage - 1);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setAilments(data || []);
      setTotalAilments(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: unknown) {
      console.error('Error fetching ailments:', error);
      setMessage({ type: 'error', text: 'Failed to fetch ailments.' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage, sortBy, sortOrder]);


  useEffect(() => {
    fetchAilments();
  }, [fetchAilments]);

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

    } catch (error: unknown) {
      console.error('Error saving ailment:', error);
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
    } catch (error: unknown) {
      console.error('Error deleting ailment:', error);
      setMessage({ type: 'error', text: 'Failed to delete ailment.' });
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
    const tableSection = document.querySelector('.bg-white.rounded-xl.shadow-sm');
    tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* LEFT: Title */}
        <div>
          <h2 className="text-3xl font-serif text-gray-900">Manage Ailments</h2>
          <p className="text-gray-600 mt-1">
            Add, edit, or remove ailments from your database
          </p>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex gap-3 items-center">
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`h-[52px] px-5 rounded-lg bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center gap-2 ${exporting ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}>
            {exporting ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                {/* Download Icon */}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>

                Export CSV
              </>
            )}
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className=" h-[52px] px-5 rounded-lg border border-[#0f75ae] text-white font-medium bg-[#0f75ae] shadow-sm hover:bg-[#04659b] hover:border-[#0f75ae] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer">
            {/* Upload Icon */}
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V6m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>

            Import XLSX/CSV
          </button>


          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImport(e.target.files[0]);
              }
            }}
          />


          {/* Add Ailment */}
          <Link
            href="/admin/ailments/add"
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="text-xl">+</span>
            Add Ailment
          </Link>
        </div>
      </div>



      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {importing && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Importing file...</span>
            <span>{importProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      )}


      {/* Search and Stats */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search ailments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-500"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total: </span>
              <span className="font-semibold text-gray-900">{totalAilments}</span>
            </div>
            {ailments.length > 0 && (
              <div>
                <span className="text-gray-600">Showing: </span>
                <span className="font-semibold text-gray-900">
                  {((currentPage - 1) * itemsPerPage) + 1}-{((currentPage - 1) * itemsPerPage) + ailments.length} of {totalAilments}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ailments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Icon</th>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none flex items-center"
              >
                Name
                <SortArrows
                  active={sortBy === 'name'}
                  order={sortOrder}
                />
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
              <th
                onClick={() => handleSort('remedies_count')}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none flex items-center"
              >
                Remedy Count
                <SortArrows
                  active={sortBy === 'remedies_count'}
                  order={sortOrder}
                />
              </th>


              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ailments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'No ailments match your search.' : 'No ailments found. Click "Add Ailment" to create one.'}
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
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ailment.remedies_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/ailments/edit/${ailment.id}`}
                        className="px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showTotal={true}
              totalItems={totalAilments}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
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
