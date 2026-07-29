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
    slug: "",
    seoKeywords: "",
    metaDescription: "",
    conductedBy: "",
    eligibility: "",
    ageLimit: "",
    course: "",
    applicationFee: "",
    fullCourseDetails: "",
    keyDates: [
        { label: "Application Begin", date: "" },
        { label: "Last Date to Apply", date: "" },
    ],
    importantLinks: {
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

    // Handle Rich Text Editor Changes
    const handleEditorChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Dynamic Key Dates Handlers ---
    const handleKeyDateChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedDates = [...(prev.keyDates || [])];
            updatedDates[index][field] = value;
            return { ...prev, keyDates: updatedDates };
        });
    };

    const addKeyDate = () => {
        setFormData((prev) => ({
            ...prev,
            keyDates: [...(prev.keyDates || []), { label: "", date: "" }]
        }));
    };

    const removeKeyDate = (index) => {
        setFormData((prev) => {
            const updatedDates = (prev.keyDates || []).filter((_, i) => i !== index);
            return { ...prev, keyDates: updatedDates };
        });
    };

    // --- Dynamic Link Handlers ---
    const handleDynamicLinkChange = (type, index, field, value) => {
        setFormData((prev) => {
            const updatedLinks = [...(prev.importantLinks[type] || [])];
            updatedLinks[index][field] = value;
            return {
                ...prev,
                importantLinks: { ...prev.importantLinks, [type]: updatedLinks }
            };
        });
    };

    const addDynamicLink = (type, defaultLabel) => {
        setFormData((prev) => ({
            ...prev,
            importantLinks: {
                ...prev.importantLinks,
                [type]: [...(prev.importantLinks[type] || []), { label: defaultLabel, url: "" }]
            }
        }));
    };

    const removeDynamicLink = (type, index) => {
        setFormData((prev) => {
            const updatedLinks = (prev.importantLinks[type] || []).filter((_, i) => i !== index);
            return {
                ...prev,
                importantLinks: { ...prev.importantLinks, [type]: updatedLinks }
            };
        });
    };

    const handleOfficialWebsiteChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            importantLinks: { ...prev.importantLinks, officialWebsite: value }
        }));
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
                router.push("/admin/manage-admissions"); 
            }, 1000);
        } catch (err) {
            console.error("❌ Failed to add admission:", err);
            const errorMessage = err.response?.data?.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to add admission: ${errorMessage}`, severity: "error" });
            setLoading(false);
        }
    };

    // ✅ HELPER: Decodes escaped HTML from TipTap so it renders properly in the Live Preview
    const renderPreview = (htmlString) => {
        if (!htmlString || htmlString === "<p></p>") {
            return '<span style="color: #9e9e9e;">Start typing to preview...</span>';
        }
        
        return htmlString
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&");
    };

    // Safe fallback arrays for rendering
    const safeKeyDates = formData.keyDates || [];
    const safeApplyLinks = formData.importantLinks?.applyOnline || [];
    const safeNoticeLinks = formData.importantLinks?.downloadNotice || [];

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
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
                                fullWidth required label="Title"
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

                        {/* --- SEO & Meta Information --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🔍 SEO & Meta Settings</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth label="Manual Slug"
                                name="slug" value={formData.slug} onChange={handleChange} size="small"
                                placeholder="e.g., delhi-university-ug-admission-2026"
                                helperText="Leave blank to auto-generate from title"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth label="SEO Keywords"
                                name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} size="small"
                                placeholder="e.g., DU admission, Delhi university form, UG admission 2026"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="Meta Description"
                                name="metaDescription" value={formData.metaDescription} onChange={handleChange}
                                multiline rows={2} size="small"
                                placeholder="Write a brief description for search engines..."
                            />
                        </Grid>

                        {/* --- Dynamic Key Dates --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Key Dates (Customizable)</Divider>
                        </Grid>

                        <Grid item xs={12}>
                            {safeKeyDates.map((item, index) => (
                                <Grid container spacing={2} alignItems="center" key={`date-${index}`} sx={{ mb: 2, px: 2 }}>
                                    <Grid item xs={12} sm={5}>
                                        <TextField 
                                            fullWidth size="small" label="Event Label" 
                                            value={item.label} 
                                            onChange={(e) => handleKeyDateChange(index, "label", e.target.value)} 
                                            placeholder="e.g., Exam Date, Admit Card Available"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            fullWidth size="small" label="Date (Free Text)" 
                                            value={item.date} 
                                            onChange={(e) => handleKeyDateChange(index, "date", e.target.value)} 
                                            placeholder="e.g., 15 May 2026 or To Be Notified"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton color="error" onClick={() => removeKeyDate(index)} disabled={safeKeyDates.length === 1}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddCircleOutline />} onClick={addKeyDate} variant="text" sx={{ ml: 2 }}>
                                Add Another Date
                            </Button>
                        </Grid>

                        {/* --- Rich Text Details (With Live Preview) --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>📝 Detailed HTML Supported Information</Divider>
                        </Grid>

                        {[
                            { label: "Eligibility Criteria", name: "eligibility" },
                            { label: "Age Limit Details", name: "ageLimit" },
                            { label: "Course Information (e.g. MA, MSc)", name: "course" },
                        ].map(({ label, name }) => (
                            <React.Fragment key={name}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                                        {label}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TipTapEditor
                                        content={formData[name]}
                                        onChange={(value) => handleEditorChange(name, value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ 
                                        p: 2, 
                                        height: '100%', 
                                        minHeight: '150px', 
                                        border: '1px dashed #b0bec5', 
                                        borderRadius: 2, 
                                        backgroundColor: '#f9fbe7',
                                        overflowY: 'auto'
                                    }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#757575', mb: 1, display: 'block' }}>
                                            Live Preview:
                                        </Typography>
                                        {/* ✅ Comment is now outside the component props */}
                                        <Box 
                                            className="preview-content"
                                            dangerouslySetInnerHTML={{ __html: renderPreview(formData[name]) }} 
                                        />
                                    </Box>
                                </Grid>
                            </React.Fragment>
                        ))}

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                                Application Fee Structure
                            </Typography>
                            <TipTapEditor
                                content={formData.applicationFee}
                                onChange={(value) => handleEditorChange("applicationFee", value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                                Full Course Details / Vacancy
                            </Typography>
                            <TipTapEditor
                                content={formData.fullCourseDetails}
                                onChange={(value) => handleEditorChange("fullCourseDetails", value)}
                            />
                        </Grid>

                        {/* --- Important Links --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 3, mb: 1, fontWeight: 'bold', color: '#00796b' }}>
                                🔗 Important Links
                            </Divider>
                        </Grid>

                        {/* Apply Online Dynamic Links */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Apply Online Links</Typography>
                            {safeApplyLinks.map((link, index) => (
                                <Grid container spacing={2} alignItems="center" key={`apply-${index}`} sx={{ mb: 2, px: 2 }}>
                                    <Grid item xs={12} sm={5}>
                                        <TextField fullWidth size="small" label="Label" value={link.label} onChange={(e) => handleDynamicLinkChange("applyOnline", index, "label", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="URL" value={link.url} onChange={(e) => handleDynamicLinkChange("applyOnline", index, "url", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton color="error" onClick={() => removeDynamicLink("applyOnline", index)} disabled={safeApplyLinks.length === 1}>
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
                            {safeNoticeLinks.map((link, index) => (
                                <Grid container spacing={2} alignItems="center" key={`notice-${index}`} sx={{ mb: 2, px: 2 }}>
                                    <Grid item xs={12} sm={5}>
                                        <TextField fullWidth size="small" label="Label" value={link.label} onChange={(e) => handleDynamicLinkChange("downloadNotice", index, "label", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="URL" value={link.url} onChange={(e) => handleDynamicLinkChange("downloadNotice", index, "url", e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton color="error" onClick={() => removeDynamicLink("downloadNotice", index)} disabled={safeNoticeLinks.length === 1}>
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
                                value={formData.importantLinks?.officialWebsite || ""} onChange={handleOfficialWebsiteChange}
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