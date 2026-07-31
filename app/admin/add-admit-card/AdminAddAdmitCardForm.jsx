"use client";

import React, { useState, useEffect } from "react";
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
    CheckCircleOutline,
    ArrowBack,
    Visibility,
} from "@mui/icons-material";
import axios from "axios";
import { useRouter } from "next/navigation";

const initialState = {
    title: "",
    slug: "", // <-- Added manual slug field
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

const AdminAddAdmitCardForm = ({ isEdit, slug: initialSlug }) => {
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [statusMessage, setStatusMessage] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isEdit) return;

        const fetchAdmitCardData = async () => {
            try {
                const res = await axios.get(`https://www.finderight.com/api/admit-cards/${initialSlug}`);
                const data = res.data.result || res.data; 

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
                        parsedKeyDates = [...initialState.keyDates];
                    }
                }

                setFormData({
                    ...data,
                    // Populate slug field from data if it exists, otherwise use the slug from URL param
                    slug: data.slug || initialSlug, 
                    importantLinks: parsedLinks,
                    keyDates: parsedKeyDates
                });
            } catch (err) {
                console.error(err);
                setStatusMessage({ message: "Failed to fetch admit card data.", severity: "error" });
            } finally {
                setFetching(false);
            }
        };

        fetchAdmitCardData();
    }, [initialSlug, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Basic formatting for slug: lowercase and replace spaces with hyphens if user types spaces
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
                downloadAdmitCard: [...formData.importantLinks.downloadAdmitCard, { label: "Download Server 2", url: "" }]
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

        setLoading(true);

        try {
            if (isEdit) {
                // Ensure we PUT to the original slug endpoint, passing any newly updated slug in formData
                await axios.put(`https://www.finderight.com/api/admit-cards/${initialSlug}`, formData);
                setStatusMessage({ message: "Admit Card updated successfully! Redirecting...", severity: "success" });
            } else {
                await axios.post("https://www.finderight.com/api/admit-cards", formData);
                setStatusMessage({ message: "Admit Card created successfully! Redirecting...", severity: "success" });
            }
            
            setTimeout(() => {
                router.push("/admin/admit-cards"); 
            }, 1000);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to save: ${errorMessage}`, severity: "error" });
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            {isEdit && (
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={() => router.push("/admin/admit-cards")} 
                    sx={{ mb: 2 }}
                >
                    Back to Admit Cards
                </Button>
            )}

            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #1976d2' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1565c0', mb: 4 }}>
                    {isEdit ? "Edit Admit Card" : "Publish New Admit Card"}
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
                                name="title" value={formData.title} onChange={handleChange}
                                placeholder="e.g., SSC CGL Tier 1 Admit Card 2026"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By (Authority)"
                                name="conductedby" value={formData.conductedby} onChange={handleChange}
                                placeholder="e.g., Staff Selection Commission"
                                size="small"
                            />
                        </Grid>

                        {/* --- Manual Slug --- */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="URL Slug (Manual)"
                                name="slug" value={formData.slug || ""} onChange={handleChange}
                                placeholder="e.g., ssc-cgl-tier-1-admit-card-2026"
                                size="small"
                                helperText="Leave blank to auto-generate from the title. Use lowercase letters, numbers, and hyphens only."
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
                                placeholder="e.g., SSC admit card, CGL tier 1 download, Staff Selection Commission hall ticket"
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
                                placeholder="<h2>Notice</h2><p>Your details here...</p>"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth multiline rows={4}
                                label="How to Download Admit Card (Step-by-step)"
                                name="howToDownload" value={formData.howToDownload || ""} onChange={handleChange}
                                placeholder="<ol><li>Step 1</li><li>Step 2</li></ol>"
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
                                        fullWidth size="small"
                                        label="Link Label (e.g., Download Server 1)"
                                        value={link.label}
                                        onChange={(e) => handleDynamicLinkChange(index, "label", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small"
                                        label="Direct URL"
                                        value={link.url}
                                        onChange={(e) => handleDynamicLinkChange(index, "url", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => removeDynamicLink(index)} 
                                        disabled={formData.importantLinks.downloadAdmitCard.length === 1}
                                    >
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}

                        <Grid item xs={12} sx={{ pl: 3 }}>
                            <Button startIcon={<AddCircleOutline />} onClick={addDynamicLink} variant="text" color="primary">
                                Add Another Download Server / Link
                            </Button>
                        </Grid>

                        {/* --- Official Website --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🌐 Official Website</Divider>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth size="small"
                                label="Official Website URL"
                                value={formData.importantLinks.officialWebsite}
                                onChange={handleOfficialWebsiteChange}
                            />
                        </Grid>

                        {/* --- Submit Button --- */}
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color={isEdit ? "warning" : "primary"}
                                disabled={loading}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (isEdit ? <SaveOutlined /> : <CheckCircleOutline />)}
                            >
                                {loading ? "Saving..." : (isEdit ? "Update Admit Card" : "Publish Admit Card")}
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

export default AdminAddAdmitCardForm;