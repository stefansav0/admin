"use client";

import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Grid,
    Box,
    Paper,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
} from "@mui/material";
import {
    AddCircleOutline,
    RemoveCircleOutline,
    CheckCircleOutline,
} from "@mui/icons-material";
import axios from "axios";
import { useRouter } from "next/navigation";
import TipTapEditor from "../../../components/TipTapEditor";

const initialState = {
    title: "",
    conductedBy: "",
    eligibility: "",
    ageLimit: "",
    course: "",
    applicationFee: "",
    fullCourseDetails: "",
    examDate: "",
    publishDate: "",
    applicationBegin: "",
    lastDateApply: "",
    admissionDate: "",
    importantLinks: {
        // ✅ Converted to dynamic arrays for multiple links
        applyOnline: [{ label: "Apply Online", url: "" }],
        downloadNotice: [{ label: "Download Notice", url: "" }],
        officialWebsite: "",
    },
};

const AdminAddAdmission = () => {
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Dynamic Link Handlers ---
    const handleDynamicLinkChange = (type, index, field, value) => {
        const updatedLinks = [...formData.importantLinks[type]];
        updatedLinks[index][field] = value;
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, [type]: updatedLinks }
        });
    };

    const addDynamicLink = (type, defaultLabel) => {
        setFormData({
            ...formData,
            importantLinks: {
                ...formData.importantLinks,
                [type]: [...formData.importantLinks[type], { label: defaultLabel, url: "" }]
            }
        });
    };

    const removeDynamicLink = (type, index) => {
        const updatedLinks = formData.importantLinks[type].filter((_, i) => i !== index);
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, [type]: updatedLinks }
        });
    };

    const handleOfficialWebsiteChange = (e) => {
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, officialWebsite: e.target.value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!formData.title || !formData.conductedBy) {
            setStatusMessage({ message: "Title and Conducted By are required fields.", severity: "error" });
            return;
        }

        setLoading(true);

        try {
            await axios.post("https://www.finderight.com/api/admissions", formData, {
                headers: { "Content-Type": "application/json" },
            });

            setStatusMessage({ message: "Admission notice published successfully! Redirecting...", severity: "success" });
            setFormData(initialState);
            
            setTimeout(() => {
                router.push("/admin/manage-admissions"); // Adjust to your actual manage route
            }, 1000);
        } catch (err) {
            console.error("❌ Failed to add admission:", err);
            const errorMessage = err.response?.data?.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to add admission: ${errorMessage}`, severity: "error" });
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #00796b' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#004d40', mb: 4 }}>
                    Publish New Admission
                </Typography>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={3}>
                        
                        {/* --- General Fields --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Basic Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Title (SEO Optimized)"
                                name="title" value={formData.title} onChange={handleChange} size="small"
                                placeholder="e.g., Delhi University UG Admission 2026"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By (Authority)"
                                name="conductedBy" value={formData.conductedBy} onChange={handleChange} size="small"
                                placeholder="e.g., NTA or Delhi University"
                            />
                        </Grid>

                        {[
                            { label: "Eligibility", name: "eligibility", placeholder: "e.g., 10+2 Passed" },
                            { label: "Age Limit", name: "ageLimit", placeholder: "e.g., Minimum 17 Years" },
                            { label: "Course (e.g. MA, MSc)", name: "course", placeholder: "e.g., BA, BSc, BCom" },
                        ].map(({ label, name, placeholder }) => (
                            <Grid item xs={12} sm={4} key={name}>
                                <TextField
                                    fullWidth label={label} name={name}
                                    value={formData[name] || ""} onChange={handleChange}
                                    placeholder={placeholder} size="small"
                                />
                            </Grid>
                        ))}

                        {/* --- Timeline Dates --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Key Dates (Free Text)</Divider>
                        </Grid>

                        {[
                            { label: "Application Begin", name: "applicationBegin" },
                            { label: "Last Date to Apply", name: "lastDateApply" },
                            { label: "Exam Date", name: "examDate" },
                            { label: "Admission Date", name: "admissionDate" },
                            { label: "Publish Date", name: "publishDate" },
                        ].map(({ label, name }) => (
                            <Grid item xs={12} sm={6} md={4} key={name}>
                                <TextField
                                    fullWidth label={label} name={name}
                                    value={formData[name] || ""} onChange={handleChange} size="small"
                                    placeholder="e.g., 15 May 2026"
                                />
                            </Grid>
                        ))}

                        {/* --- Rich Text Details --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📝 Detailed Information</Divider>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Application Fee Structure
                            </Typography>
                            <TipTapEditor
                                content={formData.applicationFee}
                                onChange={(value) => setFormData((prev) => ({ ...prev, applicationFee: value }))}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                                Full Course Details / Vacancy
                            </Typography>
                            <TipTapEditor
                                content={formData.fullCourseDetails}
                                onChange={(value) => setFormData((prev) => ({ ...prev, fullCourseDetails: value }))}
                            />
                        </Grid>

                        {/* --- Important Links --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 3, mb: 1, fontWeight: 'bold', color: '#00796b' }}>
                                🔗 Important Links (SEO Optimized)
                            </Divider>
                        </Grid>

                        {/* Apply Online Dynamic Links */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Apply Online Links</Typography>
                            {formData.importantLinks.applyOnline.map((link, index) => (
                                <Grid container spacing={2} alignItems="center" key={`apply-${index}`} sx={{ mb: 2, px: 2 }}>
                                    <Grid item xs={12} sm={5}>
                                        <TextField fullWidth size="small" label="Label" value={link.label} onChange={(e) => handleDynamicLinkChange("applyOnline", index, "label", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="URL" value={link.url} onChange={(e) => handleDynamicLinkChange("applyOnline", index, "url", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton color="error" onClick={() => removeDynamicLink("applyOnline", index)} disabled={formData.importantLinks.applyOnline.length === 1}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddCircleOutline />} onClick={() => addDynamicLink("applyOnline", "Apply Online Server 2")} variant="text" sx={{ ml: 2 }}>Add Another Apply Link</Button>
                        </Grid>

                        {/* Download Notice Dynamic Links */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Download Notice Links</Typography>
                            {formData.importantLinks.downloadNotice.map((link, index) => (
                                <Grid container spacing={2} alignItems="center" key={`notice-${index}`} sx={{ mb: 2, px: 2 }}>
                                    <Grid item xs={12} sm={5}>
                                        <TextField fullWidth size="small" label="Label" value={link.label} onChange={(e) => handleDynamicLinkChange("downloadNotice", index, "label", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="URL" value={link.url} onChange={(e) => handleDynamicLinkChange("downloadNotice", index, "url", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton color="error" onClick={() => removeDynamicLink("downloadNotice", index)} disabled={formData.importantLinks.downloadNotice.length === 1}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddCircleOutline />} onClick={() => addDynamicLink("downloadNotice", "Download Notice (Mirror)")} variant="text" sx={{ ml: 2 }}>Add Another Notice Link</Button>
                        </Grid>

                        {/* Official Website */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth size="small" label="Official Website URL"
                                value={formData.importantLinks.officialWebsite} onChange={handleOfficialWebsiteChange}
                            />
                        </Grid>

                        {/* --- Submit Button --- */}
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button 
                                type="submit" variant="contained" disabled={loading}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8, backgroundColor: '#00796b', '&:hover': { backgroundColor: '#004d40' } }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />}
                            >
                                {loading ? "Publishing..." : "Publish Admission"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminAddAdmission;