"use client";

import React, { useState } from "react";
import { Tabs, Tab, Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";  // <-- changed here

const AdminDashboard = () => {
    const [tab, setTab] = useState(0);
    const router = useRouter();

    const handleChange = (event, newValue) => {
        setTab(newValue);
    };

    const sections = [
        { label: "Jobs", route: "/admin/add-job", manage: "/admin/manage-jobs" },
        { label: "Results", route: "/admin/add-result", manage: "/admin/manage-results" },
        { label: "Admissions", route: "/admin/add-admission", manage: "/admin/manage-admissions" },
        { label: "Admit Cards", route: "/admin/add-admit-card", manage: "/admin/manage-admit-cards" },
        { label: "Answer Keys", route: "/admin/add-answer-key", manage: "/admin/manage-answer-keys" },
        { label: "Study News", route: "/admin/add-study-news", manage: "/admin/manage-study-news" },
        { label: "Documents", route: "/admin/add-document", manage: "/admin/manage-documents" },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

            <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
                {sections.map((section, idx) => (
                    <Tab key={idx} label={section.label} />
                ))}
            </Tabs>

            <Box sx={{ mt: 3 }}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">{sections[tab].label} Management</h3>
                    <Button
                        variant="contained"
                        onClick={() => router.push(sections[tab].route)}
                    >
                        + Add New {sections[tab].label}
                    </Button>
                </div>

                <p>All {sections[tab].label} will be listed here.</p>
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => router.push(sections[tab].manage)}
                >
                    Manage All
                </Button>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
