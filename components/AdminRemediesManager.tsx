"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import Pagination from './Pagination';
import { Remedy } from "@/types";

// interface Remedy {
//   id: string;
//   name: string;
//   slug?: string;
//   scientific_name: string;
//   average_rating: number;
//   review_count: number;
//   icon?: string;
//   image_url?: string;
// }

export default function AdminRemediesManager() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadDuration, setLoadDuration] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalRemedies, setTotalRemedies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sortBy, setSortBy] = useState<
    'created_at' | 'name' | 'average_rating' | 'review_count'
  >('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');



  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/admin/remedies/export?format=csv');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'remedies.csv';
      document.body.appendChild(a);
      // schedule click to ensure element is in DOM and browser starts download
      setTimeout(() => {
        a.click();
        a.remove();
        // revoke after a short delay to avoid cancelling the download in some browsers
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


  const SortArrows = ({
    active,
    order,
  }: {
    active: boolean;
    order: 'asc' | 'desc';
  }) => {
    return (
      <span className="ml-2 inline-flex flex-col items-center justify-center leading-none flex-shrink-0">
        <span
          className={`text-[9px] ${active && order === 'asc'
            ? 'text-gray-900'
            : 'text-gray-500'
            }`}
        >
          ▲
        </span>
        <span
          className={`text-[9px] -mt-[1px] ${active && order === 'desc'
            ? 'text-gray-900'
            : 'text-gray-500'
            }`}
        >
          ▼
        </span>
      </span>
    );
  };


  const handleSort = (column: 'name' | 'average_rating' | 'review_count') => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'name' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // small client-generated import id so server can report processing progress
    const importId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    formData.append('importId', importId)

    setImportProgress(0)
    setImporting(true)

    // Include the current user's access token so the server can authenticate
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || null;

    try {
      // Upload with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/admin/remedies/import', true)

        if (accessToken) xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setImportProgress(Math.min(pct, 95)) // hold below 100 until server finishes
          } else {
            setImportProgress((p) => Math.min(95, p + 10))
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
            const res = await fetch(`/api/admin/remedies/import/progress?importId=${encodeURIComponent(importId)}`)
            if (res.ok) {
              const json = await res.json()
              const pct = Number(json?.progress || 0)
              setImportProgress(pct)
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

      // Show success immediately once server reports 100% progress,
      // then refresh the remedies list in background to avoid UI delay.
      setMessage({ type: 'success', text: 'Import completed successfully' })
      setTimeout(() => setMessage(null), 4000)

      // refresh remedies list after import (do not await to keep UI responsive)
      fetchRemedies().catch((e) => {
        console.error('Failed to refresh remedies after import:', e)
      })
    } catch (err) {
      console.error('Import error', err)
      setMessage({ type: 'error', text: 'Import failed' })
      setTimeout(() => setMessage(null), 4000)
    } finally {
      setImporting(false)
      setTimeout(() => setImportProgress(0), 800)
    }
  };


  const fetchRemedies = useCallback(async () => {
    const tStart = performance.now();
    setLoading(true);
    try {
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage;

      // Build query
      let query = supabase
        .from('remedies')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + itemsPerPage - 1);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%`);
      }

      const qStart = performance.now();
      const { data, error, count } = await query;
      const qEnd = performance.now();
      console.log(`adminRemedies:query: ${qEnd - qStart} ms`);

      if (error) throw error;

      setRemedies(data || []);
      setTotalRemedies(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      const tEnd = performance.now();
      const duration = Math.round(tEnd - tStart);
      setLoadDuration(duration);
      console.log(`adminRemedies:total: ${tEnd - tStart} ms`);
    } catch (error: unknown) {
      console.error('Error fetching remedies:', error);
      setMessage({ type: 'error', text: 'Failed to load remedies' });
      const tEnd = performance.now();
      setLoadDuration(Math.round(tEnd - tStart));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, itemsPerPage, sortBy, sortOrder]);

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
          <h2 className="text-3xl font-normal text-gray-900">Manage Remedies</h2>
          <p className="text-gray-600 mt-1">
            Add, edit, or remove homeopathic remedies
          </p>
        </div>

        <div className="flex gap-3 items-center">
          {/* EXPORT */}
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

          {/* IMPORT */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className={`h-[52px] px-5 rounded-lg border border-[#0f75ae] text-white font-medium bg-[#0f75ae] shadow-sm hover:bg-[#04659b] hover:border-[#0f75ae] active:scale-[0.98] transition-all flex items-center gap-2 ${importing ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}>

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

            Import XLSX / CSV
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

          {/* ADD REMEDY */}
          <Link
            href="/admin/remedies/add"
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="text-xl">+</span>
            Add Remedy
          </Link>
        </div>
      </div>


      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}


      {importing && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Importing XML...</span>
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
              placeholder="Search remedies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-500"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total: </span>
              <span className="font-semibold text-gray-900">{totalRemedies}</span>
            </div>
            {loadDuration !== null && (
              <div className="text-xs text-gray-500 flex items-center">
                <span>Loaded in </span>
                <span className="font-mono ml-1">{loadDuration}ms</span>
              </div>
            )}
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Icon
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="inline-flex items-center">
                    Remedy Name
                    <SortArrows
                      active={sortBy === 'name'}
                      order={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('average_rating')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="inline-flex items-center">
                    Rating
                    <SortArrows
                      active={sortBy === 'average_rating'}
                      order={sortOrder}
                    />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('review_count')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="inline-flex items-center">
                    Review Count
                    <SortArrows
                      active={sortBy === 'review_count'}
                      order={sortOrder}
                    />
                  </div>
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading remedies...</td>
                </tr>
              ) : (
                remedies.map((remedy) => (
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
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 block w-[50px] text-center">{remedy.average_rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 block w-[50px] text-center">{remedy.review_count}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/remedies/edit/${remedy.id}`}
                        className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(remedy.id!)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
