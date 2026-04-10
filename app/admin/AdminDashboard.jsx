"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const AdminDashboard = () => {
    const [greeting, setGreeting] = useState("Welcome back");

    // Give a nice time-based greeting
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    // 🎨 Color-coded sections for a premium look
    const sections = [
        { 
            label: "Jobs", desc: "Post and manage sarkari job listings.", 
            route: "/admin/add-job", manage: "/admin/manage-jobs", 
            icon: "💼", theme: "blue"
        },
        { 
            label: "Results", desc: "Publish exam results and cutoffs.", 
            route: "/admin/add-result", manage: "/admin/manage-results", 
            icon: "🏆", theme: "indigo" 
        },
        { 
            label: "Admissions", desc: "Update college and university admissions.", 
            route: "/admin/add-admission", manage: "/admin/manage-admissions", 
            icon: "🎓", theme: "teal" 
        },
        { 
            label: "Admit Cards", desc: "Release exam admit cards and hall tickets.", 
            route: "/admin/add-admit-card", manage: "/admin/manage-admit-cards", 
            icon: "🎟️", theme: "orange" 
        },
        { 
            label: "Answer Keys", desc: "Upload official exam answer keys.", 
            route: "/admin/add-answer-key", manage: "/admin/manage-answer-keys", 
            icon: "🔑", theme: "purple" 
        },
        { 
            label: "Study News", desc: "Post the latest educational news.", 
            route: "/admin/add-study-news", manage: "/admin/manage-study-news", 
            icon: "📰", theme: "pink" 
        },
        { 
            label: "Documents", desc: "Manage syllabus and important PDFs.", 
            route: "/admin/add-document", manage: "/admin/manage-documents", 
            icon: "📄", theme: "slate" 
        },
    ];

    // Helper to apply dynamic Tailwind colors based on the theme
    const getThemeClasses = (theme) => {
        const themes = {
            blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-600 hover:text-white",
            indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-600 hover:text-white",
            teal: "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-600 hover:text-white",
            orange: "bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-600 hover:text-white",
            purple: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-600 hover:text-white",
            pink: "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-600 hover:text-white",
            slate: "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-700 hover:text-white",
        };
        return themes[theme];
    };

    const getGradient = (theme) => {
        const gradients = {
            blue: "from-blue-600 to-blue-400",
            indigo: "from-indigo-600 to-indigo-400",
            teal: "from-teal-600 to-teal-400",
            orange: "from-orange-600 to-orange-400",
            purple: "from-purple-600 to-purple-400",
            pink: "from-pink-600 to-pink-400",
            slate: "from-slate-700 to-slate-500",
        };
        return gradients[theme];
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                    <div className="z-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Admin 👋</span>
                        </h1>
                        <p className="text-gray-500 font-medium">What would you like to manage today?</p>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sections.map((section, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden group"
                        >
                            {/* Card Header */}
                            <div className={`p-6 bg-gradient-to-br ${getGradient(section.theme)} text-white relative overflow-hidden`}>
                                <div className="relative z-10 flex justify-between items-center">
                                    <h2 className="text-xl font-bold tracking-wide">{section.label}</h2>
                                    <span className="text-3xl filter drop-shadow-md">{section.icon}</span>
                                </div>
                                {/* Subtle card background pattern */}
                                <div className="absolute -right-4 -bottom-4 opacity-10 text-7xl transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0 duration-300">
                                    {section.icon}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-grow flex flex-col justify-between bg-white">
                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    {section.desc}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    <Link 
                                        href={section.route}
                                        className={`w-full text-center py-2.5 rounded-xl font-bold transition-all duration-200 border shadow-sm ${getThemeClasses(section.theme)}`}
                                    >
                                        + Add New
                                    </Link>
                                    <Link 
                                        href={section.manage}
                                        className="w-full text-center py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                                    >
                                        Manage Existing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;