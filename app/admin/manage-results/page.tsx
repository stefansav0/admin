"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Define the structure of a Result object
type Result = {
    _id: string;
    title: string;
    examName: string;
    publishedOn: string;
};

const AdminResults = () => {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchResults = async () => {
        try {
            const res = await fetch("https://www.finderight.com/api/results");
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

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this result?")) return;

        try {
            const res = await fetch(`https://www.finderight.com/api/results/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("✅ Result deleted successfully");
                setResults((prev) => prev.filter((item) => item._id !== id));
            } else {
                alert("❌ Failed to delete result");
            }
        } catch {
            alert("❌ Error deleting result");
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Results</h1>
                <Link
                    href="/admin/add-result"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
                >
                    ➕ Add New Result
                </Link>
            </div>

            {loading ? (
                <p>Loading results...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <div className="grid gap-4">
                    {results.map((result) => (
                        <div
                            key={result._id}
                            className="border rounded p-4 shadow-md bg-white flex justify-between items-start"
                        >
                            <div>
                                <h2 className="font-bold text-lg text-blue-600">{result.title}</h2>
                                <p className="text-gray-600">{result.examName}</p>
                                <p className="text-sm text-gray-400">Published: {result.publishedOn}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/edit-result/${result._id}`}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(result._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
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
