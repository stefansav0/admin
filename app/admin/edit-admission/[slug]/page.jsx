"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
    SaveOutlined,
    ArrowBack,
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered
} from "@mui/icons-material";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// --- TipTap Editor Component (Inline to prevent path errors) ---
const TipTapEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        immediatelyRender: false, // Prevents SSR hydration mismatch
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[150px] p-4',
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-50 border-b border-gray-300 p-1 flex gap-1">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? "primary" : "default"}>
                    <FormatBold fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? "primary" : "default"}>
                    <FormatItalic fontSize="small" />
                </IconButton>
                <Divider orientation="vertical" flexItem className="mx-1" />
                <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? "primary" : "default"}>
                    <FormatListBulleted fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? "primary" : "default"}>
                    <FormatListNumbered fontSize="small" />
                </IconButton>
            </div>
            <div className="cursor-text">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

// --- Main Edit Component ---
const AdminEditAdmission = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        const fetchAdmissionData = async () => {
            try {
                const res = await axios.get(`https://www.finderight.com/api/admissions/${slug}`);
                const data = res.data.admission || res.data;

                // 🚨 SAFEGUARD: Handle both OLD (String) and NEW (Array) database schemas
                let parsedLinks = { 
                    applyOnline: [{ label: "Apply Online", url: "" }], 
                    downloadNotice: [{ label: "Download Notice", url: "" }], 
                    officialWebsite: "" 
                };

                if (data.importantLinks) {
                    if (Array.isArray(data.importantLinks.applyOnline) && data.importantLinks.applyOnline.length > 0) {
                        parsedLinks.applyOnline = data.importantLinks.applyOnline;
                    } else if (typeof data.importantLinks.applyOnline === 'string' && data.importantLinks.applyOnline) {
                        parsedLinks.applyOnline = [{ label: "Apply Online", url: data.importantLinks.applyOnline }];
                    }

                    if (Array.isArray(data.importantLinks.downloadNotice) && data.importantLinks.downloadNotice.length > 0) {
                        parsedLinks.downloadNotice = data.importantLinks.downloadNotice;
                    } else if (typeof data.importantLinks.downloadNotice === 'string' && data.importantLinks.downloadNotice) {
                        parsedLinks.downloadNotice = [{ label: "Download Notice", url: data.importantLinks.downloadNotice }];
                    }

                    parsedLinks.officialWebsite = data.importantLinks.officialWebsite || "";
                }

                setFormData({
                    ...data,
                    importantLinks: parsedLinks
                });
            } catch (err) {
                console.error(err);
                setStatusMessage({ message: "Failed to load admission data. It may have been deleted.", severity: "error" });
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchAdmissionData();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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

        setSaving(true);

        try {
            await axios.put(`https://www.finderight.com/api/admissions/${slug}`, formData);
            setStatusMessage({ message: "Admission updated successfully! Redirecting...", severity: "success" });
            
            setTimeout(() => {
                router.push("/admin/manage-admissions");
            }, 1000);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to update: ${errorMessage}`, severity: "error" });
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress sx={{ color: '#00796b' }} />
            </Box>
        );
    }

    if (!formData) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", mt: 10 }}>
                <Alert severity="error">{statusMessage?.message || "Data could not be loaded."}</Alert>
                <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/manage-admissions")}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => router.push("/admin/manage-admissions")} 
                sx={{ mb: 2, color: '#00796b' }}
            >
                Back to Admissions
            </Button>

            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #00796b' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#004d40', mb: 4 }}>
                    Edit Admission Notice
                </Typography>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={3}>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Basic Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField fullWidth required label="Title (SEO Optimized)" name="title" value={formData.title} onChange={handleChange} size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth required label="Conducted By (Authority)" name="conductedBy" value={formData.conductedBy} onChange={handleChange} size="small" />
                        </Grid>

                        {[
                            { label: "Eligibility", name: "eligibility" },
                            { label: "Age Limit", name: "ageLimit" },
                            { label: "Course (e.g. MA, MSc)", name: "course" },
                        ].map(({ label, name }) => (
                            <Grid item xs={12} sm={4} key={name}>
                                <TextField fullWidth label={label} name={name} value={formData[name] || ""} onChange={handleChange} size="small" />
                            </Grid>
                        ))}

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
                                <TextField fullWidth label={label} name={name} value={formData[name] || ""} onChange={handleChange} size="small" />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📝 Detailed Information</Divider>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Application Fee Structure</Typography>
                            <TipTapEditor content={formData.applicationFee} onChange={(value) => setFormData((prev) => ({ ...prev, applicationFee: value }))} />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>Full Course Details / Vacancy</Typography>
                            <TipTapEditor content={formData.fullCourseDetails} onChange={(value) => setFormData((prev) => ({ ...prev, fullCourseDetails: value }))} />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 3, mb: 1, fontWeight: 'bold', color: '#00796b' }}>🔗 Important Links</Divider>
                        </Grid>

                        {/* Apply Online Links */}
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
                            <Button startIcon={<AddCircleOutline />} onClick={() => addDynamicLink("applyOnline", "New Apply Link")} variant="text" sx={{ ml: 2, color: '#00796b' }}>Add Another Apply Link</Button>
                        </Grid>

                        {/* Download Notice Links */}
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
                            <Button startIcon={<AddCircleOutline />} onClick={() => addDynamicLink("downloadNotice", "New Notice Link")} variant="text" sx={{ ml: 2, color: '#00796b' }}>Add Another Notice Link</Button>
                        </Grid>

                        {/* Official Website */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <TextField fullWidth size="small" label="Official Website URL" value={formData.importantLinks.officialWebsite || ""} onChange={handleOfficialWebsiteChange} />
                        </Grid>

                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button 
                                type="submit" variant="contained" disabled={saving}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8, backgroundColor: '#f57c00', '&:hover': { backgroundColor: '#e65100' } }}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                            >
                                {saving ? "Saving Changes..." : "Update Admission"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminEditAdmission;