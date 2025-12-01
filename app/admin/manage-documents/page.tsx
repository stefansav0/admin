"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Document = {
    _id: string;
    title: string;
    category: string;
    serviceType: string;
    description: string;
    slug: string;
};

const API_BASE = "https://www.finderight.com/api";

const AdminDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`${API_BASE}/documents`);
            const data = await res.json();

            if (res.ok) {
                setDocuments(data.documents || []);
            } else {
                throw new Error(data.message || "Failed to load documents");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        const sure = window.confirm("Are you sure you want to delete this document?");
        if (!sure) return;

        try {
            const res = await fetch(`${API_BASE}/documents/${slug}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                alert("🗑️ Document deleted successfully!");
                setDocuments((prev) => prev.filter((doc) => doc.slug !== slug));
            } else {
                const data = await res.json();
                alert(`❌ Failed to delete: ${data.message}`);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("❌ Error occurred while deleting.");
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-700">Manage Documents</h1>
                <Link
                    href="/admin/add-document"
                    className="bg-green-600 text-white px-4 py-2 rounded shadow"
                >
                    ➕ Add Document
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : documents.length === 0 ? (
                <p>No documents found.</p>
            ) : (
                <div className="grid gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.slug}
                            className="p-4 border rounded shadow bg-white flex justify-between items-start"
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-blue-700">{doc.title}</h2>
                                <p className="text-sm text-gray-600">
                                    {doc.category} — {doc.serviceType}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/edit-document/${doc.slug}`}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    ✏️ Edit
                                </Link>

                                <button
                                    onClick={() => handleDelete(doc.slug)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
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
