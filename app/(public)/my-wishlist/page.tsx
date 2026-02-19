/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Breadcrumb from "../../../components/Breadcrumb";
import { savePageUtils, SavedPage } from "@/lib/savePageUtils";
import { useRouter } from "next/navigation";

export default function MyWishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedPage[]>([]);
  const itemsPerPage = 5;
  const [ailmentPage, setAilmentPage] = useState(1);
  const [remedyPage, setRemedyPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSaved = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const authUser = data?.user ?? null;

        if (authUser) {
          const { data: rows, error } = await supabase
            .from("saved_pages")
            .select("page_id, title, url, description, saved_at")
            .eq("user_id", authUser.id)
            .order("saved_at", { ascending: false });

          if (error) throw error;

          const mapped: SavedPage[] = (rows || []).map((r: any) => ({
            id: r.page_id,
            title: r.title,
            url: r.url,
            description: r.description,
            savedAt: r.saved_at,
          }));

          if (mounted) setItems(mapped);
        } else {
          // fallback to localStorage
          const saved = savePageUtils.getSavedPages();
          if (mounted) setItems(saved);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        if (mounted) setToast({ type: "error", text: "Failed to load wishlist" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSaved();

    return () => {
      mounted = false;
    };
  }, []);

  const openUrl = (url: string) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`p-3 rounded shadow ${toast.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="px-3 sm:px-5">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Settings", href: "/profile" }, { label: "My Wishlist", isActive: true }]}
        />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="my-requests-card">

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7B5E] mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading wishlist...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No saved bookmarks yet</p>
              <p className="text-gray-400 text-sm mt-1">Use the save/bookmark button to add pages here</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Build lists by guessing type from URL: '/remedies/' => remedy, else => ailment */}
              {(() => {
                const ailments = items.filter((i) => !(i.url || "").includes("/remedies/"));
                const remedies = items.filter((i) => (i.url || "").includes("/remedies/"));

                const ailmentTotalPages = Math.max(1, Math.ceil(ailments.length / itemsPerPage));
                const remedyTotalPages = Math.max(1, Math.ceil(remedies.length / itemsPerPage));

                return (
                  <>
                    {/* Ailments Section */}
                    {ailments.length > 0 && (
                      <div>
                        <h2 className="sm:text-[40px] text-3xl font-normal sm:leading-[40px] leading-8 text-[#0B0C0A] mb-6">Ailment</h2>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-8 border-b-[#F5F3ED] bg-white">
                                <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[60px] w-[60px]">Index No</th>
                                <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[520px] w-[520px]">Ailment Name</th>
                                <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Saved At</th>
                                <th className="px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Action</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {ailments.slice((ailmentPage - 1) * itemsPerPage, ailmentPage * itemsPerPage).map((it, idx) => (
                                <tr key={it.id + idx} className="border-1 border-b-2 border-[#F5F3ED] hover:bg-gray-50">
                                  <td className="border-r border-r-[#D3D6D1] px-4 py-4 sm:text-base text-sm text-[#2B2E28] font-medium w-[60px]">{(ailmentPage - 1) * itemsPerPage + idx + 1}</td>
                                  <td className="border-r border-r-[#D3D6D1] px-4 py-4 sm:text-base text-sm text-[#0B0C0A] w-[520px]">{it.title || 'Untitled'}</td>
                                  <td className="border-r border-r-[#D3D6D1] px-4 py-4 sm:text-base text-sm text-center text-[#2B2E28] w-[115px]">
                                    {it.savedAt ? (
                                      <div className="h-full flex flex-col justify-between items-center">
                                        <span className="whitespace-nowrap text-[#2B2E28] font-medium">{new Date(it.savedAt).toLocaleDateString()}</span>
                                        <span className="whitespace-nowrap text-[#2B2E28] font-medium">{new Date(it.savedAt).toLocaleTimeString()}</span>
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-center">
                                    <button onClick={() => openUrl(it.url)} className="px-3 py-2 bg-[#6C7463] text-white rounded-lg">View</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-6 flex justify-center items-center gap-3">
                          <button onClick={() => setAilmentPage((p) => Math.max(1, p - 1))} className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          {Array.from({ length: ailmentTotalPages }, (_, i) => i + 1).map((page) => (
                            <button key={page} onClick={() => setAilmentPage(page)} className={`w-[40px] h-[40px] rounded-full text-xs font-medium transition-colors flex items-center justify-center ${page === ailmentPage ? 'bg-[#6C7463] text-white' : 'bg-[#F5F3ED] text-[#41463B] hover:bg-[#6C7463] hover:text-white'}`}>
                              {page}
                            </button>
                          ))}
                          <button onClick={() => setAilmentPage((p) => Math.min(ailmentTotalPages, p + 1))} className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Remedies Section */}
                    {remedies.length > 0 && (
                      <div>
                        <h2 className="sm:text-[40px] text-3xl font-normal sm:leading-[40px] leading-8 text-[#0B0C0A] mb-6">Remedy</h2>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-8 border-b-[#F5F3ED] bg-white">
                                <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[60px] w-[60px]">Index No</th>
                                <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-left sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[520px] w-[520px]">Remedy Name</th>
                                <th className="border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Saved At</th>
                                <th className="px-4 py-4 text-center sm:text-base text-sm font-semibold text-[#0B0C0A] min-w-[115px] w-[115px]">Action</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {remedies.slice((remedyPage - 1) * itemsPerPage, remedyPage * itemsPerPage).map((it, idx) => (
                                <tr key={it.id + idx} className="border-1 border-b-2 border-[#F5F3ED] hover:bg-gray-50">
                                  <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 sm:text-base text-sm text-[#2B2E28] min-w-[60px] w-[60px]">{(remedyPage - 1) * itemsPerPage + idx + 1}</td>
                                  <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 sm:text-base text-sm text-[#2B2E28] min-w-[520px] w-[520px]">{it.title || 'Untitled'}</td>
                                  <td className="font-medium border-r border-r-[#D3D6D1] last:border-r-0 px-4 py-4 sm:text-base text-sm text-center text-[#2B2E28] min-w-[115px] w-[115px]">
                                    {it.savedAt ? (
                                      <div className="h-full flex flex-col justify-between items-center">
                                        <span className="whitespace-nowrap">{new Date(it.savedAt).toLocaleDateString()}</span>
                                        <span className="whitespace-nowrap">{new Date(it.savedAt).toLocaleTimeString()}</span>
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-center">
                                    <button onClick={() => openUrl(it.url)} className="px-3 py-2 bg-[#6C7463] text-white rounded-lg">View</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-6 flex justify-center items-center gap-3">
                          <button onClick={() => setRemedyPage((p) => Math.max(1, p - 1))} className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          {Array.from({ length: remedyTotalPages }, (_, i) => i + 1).map((page) => (
                            <button key={page} onClick={() => setRemedyPage(page)} className={`w-[40px] h-[40px] rounded-full text-xs font-medium transition-colors flex items-center justify-center ${page === remedyPage ? 'bg-[#6C7463] text-white' : 'bg-[#F5F3ED] text-[#41463B] hover:bg-[#6C7463] hover:text-white'}`}>
                              {page}
                            </button>
                          ))}
                          <button onClick={() => setRemedyPage((p) => Math.min(remedyTotalPages, p + 1))} className="p-1 text-[#0B0C0A] hover:text-[#6C7463]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

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
