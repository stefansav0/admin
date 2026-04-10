"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// ✅ Updated to perfectly match your Mongoose Result Schema
type Result = {
    _id: string;
    slug: string; 
    title: string;
    conductedBy?: string; 
    postDate?: string;    
};

const AdminResults = () => {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchResults = async () => {
        try {
            // Added cache: 'no-store' to ensure the admin always sees fresh data
            const res = await fetch("https://www.finderight.com/api/results", {
                cache: "no-store"
            });
            const data = await res.json();
            
            if (res.ok) {
                setResults(data.results || []);
            } else {
                throw new Error(data.message || "Failed to load results");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error fetching results.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm("🚨 Are you sure you want to completely delete this result? This action cannot be undone.")) return;

        try {
            const res = await fetch(`https://www.finderight.com/api/results/${slug}`, {
                method: "DELETE",
            });
            
            if (res.ok) {
                // Remove the deleted item from the UI instantly
                setResults((prev) => prev.filter((item) => item.slug !== slug));
            } else {
                const data = await res.json();
                alert(`❌ Failed to delete: ${data.message}`);
            }
        } catch {
            alert("❌ Error deleting result. Please check your connection.");
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    // Safe date formatter
    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? dateString : d.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Manage Results
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">View, edit, and delete published exam results.</p>
                </div>
                <Link
                    href="/admin/add-result"
                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    <span className="mr-2 text-lg leading-none">+</span> Add New Result
                </Link>
            </div>

            {/* Content States */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg text-red-700 shadow-sm">
                    <p className="font-bold">Error Loading Data</p>
                    <p>{error}</p>
                </div>
            ) : results.length === 0 ? (
                <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center shadow-sm">
                    <div className="text-5xl mb-4">🏆</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h2>
                    <p className="text-gray-500 mb-6">You haven't published any results yet.</p>
                    <Link
                        href="/admin/add-result"
                        className="text-green-600 font-semibold hover:underline"
                    >
                        Publish your first one →
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {results.map((result) => (
                        <div
                            key={result._id}
                            className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-shadow duration-200 group"
                        >
                            {/* Card Details */}
                            <div className="mb-4 md:mb-0 max-w-2xl">
                                <h2 className="font-bold text-lg md:text-xl text-gray-900 group-hover:text-green-600 transition-colors">
                                    {result.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                    {result.conductedBy && (
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                                            🏢 {result.conductedBy}
                                        </span>
                                    )}
                                    <span className="flex items-center text-gray-500">
                                        📅 Published: <span className="ml-1 font-medium text-gray-700">{formatDate(result.postDate)}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                <Link
                                    href={`/admin/edit-result/${result.slug}`} 
                                    className="flex-1 md:flex-none inline-flex items-center justify-center bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200 hover:border-amber-500 font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(result.slug)}
                                    className="flex-1 md:flex-none inline-flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminResults;