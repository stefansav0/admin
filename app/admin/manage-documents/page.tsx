"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// ✅ Explicitly defined TypeScript structure
type Document = {
    _id: string;
    slug: string;
    title: string;
    category?: string;
    serviceType?: string;
    description?: string;
};

const API_BASE = "https://www.finderight.com/api";

const AdminDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchDocuments = async () => {
        try {
            // ✅ Force fresh data fetch for the admin panel
            const res = await fetch(`${API_BASE}/documents`, {
                cache: "no-store"
            });
            const data = await res.json();

            if (res.ok) {
                setDocuments(data.documents || []);
            } else {
                throw new Error(data.message || "Failed to load documents");
            }
        } catch (err: unknown) { // ✅ Strict TS error handling
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong while fetching.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm("🚨 Are you sure you want to completely delete this document link? This action cannot be undone.")) return;

        try {
            const res = await fetch(`${API_BASE}/documents/${slug}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                // Remove the deleted item from the UI instantly
                setDocuments((prev) => prev.filter((doc) => doc.slug !== slug));
            } else {
                const data = await res.json();
                alert(`❌ Failed to delete: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("❌ Error deleting document:", err);
            alert("❌ Error deleting document. Please check your connection.");
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Manage Documents
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">View, edit, and delete government document services.</p>
                </div>
                <Link
                    href="/admin/add-document"
                    className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    <span className="mr-2 text-lg leading-none">+</span> Add Document
                </Link>
            </div>

            {/* Content States */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-slate-700"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg text-red-700 shadow-sm">
                    <p className="font-bold">Error Loading Data</p>
                    <p>{error}</p>
                </div>
            ) : documents.length === 0 ? (
                <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center shadow-sm">
                    <div className="text-5xl mb-4">📄</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Documents Found</h2>
                    <p className="text-gray-500 mb-6">You haven't published any document links yet.</p>
                    <Link
                        href="/admin/add-document"
                        className="text-slate-600 font-semibold hover:underline"
                    >
                        Publish your first one →
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc._id || doc.slug}
                            className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-shadow duration-200 group"
                        >
                            {/* Card Details */}
                            <div className="mb-4 md:mb-0 max-w-2xl">
                                <h2 className="font-bold text-lg md:text-xl text-gray-900 group-hover:text-slate-700 transition-colors">
                                    {doc.title}
                                </h2>
                                
                                <div className="flex flex-wrap items-center gap-3 mt-2 mb-2 text-sm text-gray-600">
                                    {doc.category && (
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                                            📁 {doc.category}
                                        </span>
                                    )}
                                    {doc.serviceType && (
                                        <span className="bg-white text-slate-600 border border-slate-200 px-3 py-1 rounded-full font-medium">
                                            ⚙️ {doc.serviceType}
                                        </span>
                                    )}
                                </div>
                                
                                {doc.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                        {doc.description}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                

                                <button
                                    onClick={() => handleDelete(doc.slug)}
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

export default AdminDocuments;