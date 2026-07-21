"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Define the interface for type safety based on your Mongoose schema
interface IPaper {
  _id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [papers, setPapers] = useState<IPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      
      // Fallback added in case the environment variable is missing in production
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${baseUrl}/papers`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Robust check to handle if API returns an array directly OR an object like { papers: [...] }
      if (Array.isArray(data)) {
        setPapers(data);
      } else if (data && data.papers && Array.isArray(data.papers)) {
        setPapers(data.papers);
      } else {
        setPapers([]); 
      }
      
    } catch (error) {
      console.error("Failed to fetch papers:", error);
      setPapers([]); // Ensure it doesn't crash on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDelete = async (slug: string, title: string) => {
    // Better UX to show the actual title in the confirmation
    if (!confirm(`WARNING: Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${baseUrl}/papers/${slug}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        // Optimistically remove the paper from the UI without refetching
        setPapers((prev) => prev.filter((p) => p.slug !== slug));
      } else {
        alert("Failed to delete the document.");
      }
    } catch (error) {
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Document Manager
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage, edit, and organize your resource library
            </p>
          </div>
          <Link 
            href="/admin/manage-paper/create" 
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-blue-500/30 gap-2 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add New Document
          </Link>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Document Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date Added</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {/* Loading State */}
                {isLoading && (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse bg-white">
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-100 rounded w-1/2"></div></td>
                      <td className="px-6 py-5"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-5 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                )}

                {/* Data Rows */}
                {!isLoading && papers.length > 0 && papers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-blue-50/30 transition-colors group">
                    
                    {/* Title & Slug Column */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-bold text-gray-900 truncate" title={paper.title}>
                        {paper.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate mt-0.5 font-mono text-xs" title={paper.slug}>
                        /{paper.slug}
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md uppercase tracking-wide border border-gray-200">
                        {paper.category || "Uncategorized"}
                      </span>
                    </td>

                    {/* Date Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {paper.createdAt ? new Date(paper.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : "N/A"}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {/* 🔥 FIX: Removed hover opacity classes so buttons are always visible */}
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        
                        {/* Edit Button */}
                        <Link 
                          href={`/admin/manage-paper/edit/${paper.slug}`} 
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                          title="Edit Document"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(paper.slug, paper.title)} 
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {!isLoading && papers.length === 0 && (
              <div className="text-center py-20 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">No documents found</h3>
                <p className="mt-1 text-gray-500 mb-6">Get started by creating your first document.</p>
                <Link 
                  href="/admin/manage-paper/create" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Create Document
                </Link>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}