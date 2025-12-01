"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type StudyNews = {
    _id: string;
    title: string;
    source: string;
    publishedOn: string;
};

const AdminStudyNews = () => {
    const [newsList, setNewsList] = useState<StudyNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStudyNews = async () => {
        try {
            const res = await fetch("https://www.finderight.com/api/study-news");
            const data = await res.json();
            if (res.ok) {
                setNewsList(data.newsList || []);
            } else {
                throw new Error(data.message || "Failed to load study news");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error fetching study news");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this news item?")) return;
        try {
            const res = await fetch(`https://www.finderight.com/api/study-news/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("✅ News deleted");
                setNewsList((prev) => prev.filter((item) => item._id !== id));
            } else {
                alert("❌ Failed to delete");
            }
        } catch {
            alert("❌ Error deleting news");
        }
    };

    useEffect(() => {
        fetchStudyNews();
    }, []);

    // Optional: Format date helper
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Study News</h1>
                <Link
                    href="/admin/add-study-news"
                    className="bg-green-600 text-white px-4 py-2 rounded shadow"
                >
                    ➕ Add News
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : newsList.length === 0 ? (
                <p>No study news found.</p>
            ) : (
                <div className="grid gap-4">
                    {newsList.map((item) => (
                        <div
                            key={item._id}
                            className="p-4 border rounded shadow flex justify-between bg-white"
                        >
                            <div>
                                <h2 className="font-bold text-blue-600">{item.title}</h2>
                                <p>{item.source}</p>
                                <p className="text-sm text-gray-500">
                                    Published: {formatDate(item.publishedOn)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`https://www.finderight.com/admin/edit-studynews/${item._id}`}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(item._id)}
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

export default AdminStudyNews;
