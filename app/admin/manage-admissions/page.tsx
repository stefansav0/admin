"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Define the structure of an admission object
type Admission = {
    _id: string;
    title: string;
    collegeName: string;
    publishedOn: string;
};

const AdminAdmissions = () => {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch all admissions
    const fetchAdmissions = async () => {
        try {
            const res = await fetch("https://www.finderight.com/api/admissions");
            const data = await res.json();

            if (res.ok) {
                setAdmissions(data.admissions || []);
            } else {
                throw new Error(data.message || "Failed to load admissions");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete an admission
    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this admission notice?")) return;

        try {
            const res = await fetch(`https://www.finderight.com/api/admissions/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Admission deleted");
                setAdmissions((prev) => prev.filter((item) => item._id !== id));
            } else {
                alert("Failed to delete");
            }
        } catch {
            alert("Error deleting admission");
        }
    };

    useEffect(() => {
        fetchAdmissions();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Admissions</h1>
                <Link
                    href="/admin/add-admission"
                    className="bg-green-600 text-white px-4 py-2 rounded shadow"
                >
                    ➕ Add Admission
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : admissions.length === 0 ? (
                <p>No admissions found.</p>
            ) : (
                <div className="grid gap-4">
                    {admissions.map((item) => (
                        <div
                            key={item._id}
                            className="p-4 border rounded shadow flex justify-between bg-white"
                        >
                            <div>
                                <h2 className="font-bold text-blue-600">{item.title}</h2>
                                <p>{item.collegeName}</p>
                                <p className="text-sm text-gray-500">
                                    Published: {item.publishedOn}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`https://www.finderight.com/admin/edit-admission/${item._id}`}
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

export default AdminAdmissions;
