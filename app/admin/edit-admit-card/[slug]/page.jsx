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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    AddCircleOutline,
    RemoveCircleOutline,
    SaveOutlined,
    ArrowBack,
    Visibility,
} from "@mui/icons-material";
import axios from "axios";

// Fallback initial state in case data is missing
const fallbackState = {
    title: "",
    slug: "",
    conductedby: "",
    seoKeywords: "",
    metaDescription: "",
    keyDates: [
        { label: "Application Begin", value: "" },
        { label: "Last Date to Apply", value: "" },
        { label: "Exam Date", value: "" },
    ],
    description: "",
    howToDownload: "",
    importantLinks: {
        downloadAdmitCard: [{ label: "Download Admit Card", url: "" }],
        officialWebsite: "",
    },
};

const AdminEditAdmitCard = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        const fetchAdmitCardData = async () => {
            try {
                const res = await axios.get(`https://www.finderight.com/api/admit-cards/${slug}`);
                // Safely extract the data depending on how your API wraps the response
                const data = res.data.result || res.data.admitCard || res.data; 

                // 🚨 SAFEGUARD: Handle Important Links
                let parsedLinks = { downloadAdmitCard: [{ label: "Download Admit Card", url: "" }], officialWebsite: "" };

                if (data.importantLinks) {
                    if (Array.isArray(data.importantLinks.downloadAdmitCard)) {
                        parsedLinks.downloadAdmitCard = data.importantLinks.downloadAdmitCard;
                    } else if (typeof data.importantLinks.downloadAdmitCard === 'string' && data.importantLinks.downloadAdmitCard) {
                        parsedLinks.downloadAdmitCard = [{ label: "Download Admit Card", url: data.importantLinks.downloadAdmitCard }];
                    }
                    parsedLinks.officialWebsite = data.importantLinks.officialWebsite || "";
                }

                // 🚨 SAFEGUARD: Handle Dynamic Key Dates Migration
                let parsedKeyDates = data.keyDates && Array.isArray(data.keyDates) ? data.keyDates : [];
                
                if (parsedKeyDates.length === 0) {
                    if (data.applicationBegin) parsedKeyDates.push({ label: "Application Begin", value: data.applicationBegin });
                    if (data.lastDateApply) parsedKeyDates.push({ label: "Last Date to Apply", value: data.lastDateApply });
                    if (data.examDate) parsedKeyDates.push({ label: "Exam Date", value: data.examDate });
                    if (data.admitCard) parsedKeyDates.push({ label: "Admit Card Release", value: data.admitCard });
                    if (data.publishDate) parsedKeyDates.push({ label: "Publish Date", value: data.publishDate });
                    
                    if (parsedKeyDates.length === 0) {
                        parsedKeyDates = [...fallbackState.keyDates];
                    }
                }

                setFormData({
                    ...fallbackState, // Ensure all fields exist
                    ...data,
                    slug: data.slug || slug, // Populate existing slug
                    importantLinks: parsedLinks,
                    keyDates: parsedKeyDates
                });
            } catch (err) {
                console.error(err);
                setStatusMessage({ message: "Failed to load admit card data. It may have been deleted.", severity: "error" });
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchAdmitCardData();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Basic formatting for slug: lowercase and replace spaces with hyphens
        if (name === "slug") {
            const formattedSlug = value.toLowerCase().replace(/\s+/g, '-');
            setFormData((prev) => ({ ...prev, [name]: formattedSlug }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // --- Dynamic Handlers for Key Dates ---
    const handleKeyDateChange = (index, field, value) => {
        const updatedDates = [...formData.keyDates];
        updatedDates[index][field] = value;
        setFormData({ ...formData, keyDates: updatedDates });
    };

    const addKeyDate = () => {
        setFormData({
            ...formData,
            keyDates: [...formData.keyDates, { label: "New Event", value: "" }]
        });
    };

    const removeKeyDate = (index) => {
        const updatedDates = formData.keyDates.filter((_, i) => i !== index);
        setFormData({ ...formData, keyDates: updatedDates });
    };

    // --- Dynamic Handlers for Links ---
    const handleDynamicLinkChange = (index, field, value) => {
        const updatedLinks = [...formData.importantLinks.downloadAdmitCard];
        updatedLinks[index][field] = value;
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, downloadAdmitCard: updatedLinks }
        });
    };

    const addDynamicLink = () => {
        setFormData({
            ...formData,
            importantLinks: {
                ...formData.importantLinks,
                downloadAdmitCard: [...formData.importantLinks.downloadAdmitCard, { label: "New Download Link", url: "" }]
            }
        });
    };

    const removeDynamicLink = (index) => {
        const updatedLinks = formData.importantLinks.downloadAdmitCard.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, downloadAdmitCard: updatedLinks }
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

        if (!formData.title || !formData.conductedby) {
            setStatusMessage({ message: "Title and Conducted By are required fields.", severity: "error" });
            return;
        }

        setSaving(true);

        try {
            // Note: We use the original `slug` from the URL to find the document in the DB
            await axios.put(`https://www.finderight.com/api/admit-cards/${slug}`, formData);
            setStatusMessage({ message: "Admit Card updated successfully! Redirecting...", severity: "success" });
            
            setTimeout(() => {
                router.push("/admin/manage-admit-cards");
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
                <CircularProgress />
            </Box>
        );
    }

    if (!formData) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", mt: 10 }}>
                <Alert severity="error">{statusMessage?.message || "Data could not be loaded."}</Alert>
                <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/manage-admit-cards")}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => router.push("/admin/manage-admit-cards")} 
                sx={{ mb: 2 }}
            >
                Back to Admit Cards
            </Button>

            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #1976d2' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1565c0', mb: 4 }}>
                    Edit Admit Card
                </Typography>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={3}>
                        
                        {/* --- Basic Info --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Admit Card Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Title"
                                name="title" value={formData.title} onChange={handleChange} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By (Authority)"
                                name="conductedby" value={formData.conductedby} onChange={handleChange} size="small"
                            />
                        </Grid>

                        {/* --- Manual Slug --- */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="URL Slug (Manual)"
                                name="slug" value={formData.slug || ""} onChange={handleChange}
                                placeholder="e.g., ssc-cgl-tier-1-admit-card-2026"
                                size="small"
                                helperText="Modify with caution. Changing the slug will change the URL of this post."
                            />
                        </Grid>

                        {/* --- SEO Details --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🔍 SEO Settings</Divider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="SEO Keywords (Comma Separated)"
                                name="seoKeywords" value={formData.seoKeywords || ""} onChange={handleChange}
                                placeholder="e.g., SSC admit card, CGL tier 1 download, hall ticket"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth multiline rows={2}
                                label="Meta Description"
                                name="metaDescription" value={formData.metaDescription || ""} onChange={handleChange}
                                placeholder="Write a short, engaging description for search engines..."
                            />
                        </Grid>

                        {/* --- Dynamic Timeline Dates --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Key Dates</Divider>
                        </Grid>

                        {formData.keyDates.map((dateItem, index) => (
                            <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2, px: 3 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small"
                                        label="Label (e.g., Application Begin)"
                                        value={dateItem.label}
                                        onChange={(e) => handleKeyDateChange(index, "label", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small"
                                        label="Date / Value (e.g., 15 May 2026)"
                                        value={dateItem.value}
                                        onChange={(e) => handleKeyDateChange(index, "value", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => removeKeyDate(index)} 
                                    >
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}

                        <Grid item xs={12} sx={{ pl: 3 }}>
                            <Button startIcon={<AddCircleOutline />} onClick={addKeyDate} variant="text" color="primary">
                                Add Another Date
                            </Button>
                        </Grid>

                        {/* --- Details --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📄 Detailed Information (HTML Supported)</Divider>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={<Visibility />}
                                    onClick={() => setPreviewOpen(true)}
                                >
                                    Preview HTML
                                </Button>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth multiline rows={5}
                                label="Description / Short Notice"
                                name="description" value={formData.description || ""} onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth multiline rows={4}
                                label="How to Download Admit Card"
                                name="howToDownload" value={formData.howToDownload || ""} onChange={handleChange}
                            />
                        </Grid>

                        {/* --- SEO Optimized Download Links --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                                🔗 Multiple Download Links
                            </Divider>
                        </Grid>

                        {formData.importantLinks.downloadAdmitCard.map((link, index) => (
                            <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2, px: 3 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Link Label"
                                        value={link.label} onChange={(e) => handleDynamicLinkChange(index, "label", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="Direct URL"
                                        value={link.url} onChange={(e) => handleDynamicLinkChange(index, "url", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <IconButton color="error" onClick={() => removeDynamicLink(index)} disabled={formData.importantLinks.downloadAdmitCard.length === 1}>
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}

                        <Grid item xs={12} sx={{ pl: 3 }}>
                            <Button startIcon={<AddCircleOutline />} onClick={addDynamicLink} variant="text" color="primary">
                                Add Another Link
                            </Button>
                        </Grid>

                        {/* --- Official Website --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🌐 Official Website</Divider>
                            <TextField
                                fullWidth size="small" label="Official Website URL"
                                value={formData.importantLinks.officialWebsite || ""} onChange={handleOfficialWebsiteChange}
                            />
                        </Grid>

                        {/* --- Submit Button --- */}
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button 
                                type="submit" variant="contained" color="warning" disabled={saving}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                            >
                                {saving ? "Saving Changes..." : "Update Admit Card"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>

            {/* --- HTML Preview Dialog --- */}
            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Live HTML Preview
                </DialogTitle>
                <DialogContent dividers sx={{ backgroundColor: '#f9f9f9' }}>
                    <Typography variant="h6" gutterBottom>Description:</Typography>
                    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                        {formData.description ? (
                            <Box dangerouslySetInnerHTML={{ __html: formData.description }} />
                        ) : (
                            <Typography variant="body2" color="text.secondary">No description provided yet.</Typography>
                        )}
                    </Paper>

                    <Typography variant="h6" gutterBottom>How to Download:</Typography>
                    <Paper elevation={1} sx={{ p: 2 }}>
                        {formData.howToDownload ? (
                            <Box dangerouslySetInnerHTML={{ __html: formData.howToDownload }} />
                        ) : (
                            <Typography variant="body2" color="text.secondary">No instructions provided yet.</Typography>
                        )}
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)} color="primary" variant="contained">
                        Close Preview
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminEditAdmitCard;