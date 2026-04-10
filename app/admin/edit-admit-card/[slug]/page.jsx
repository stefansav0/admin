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
    ArrowBack
} from "@mui/icons-material";
import axios from "axios";

const AdminEditAdmitCard = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        const fetchAdmitCardData = async () => {
            try {
                const res = await axios.get(`https://www.finderight.com/api/admit-cards/${slug}`);
                // Safely extract the data depending on how your API wraps the response
                const data = res.data.admitCard || res.data; 

                // 🚨 SAFEGUARD: Handle both OLD (String) and NEW (Array) database schemas
                let parsedLinks = { downloadAdmitCard: [{ label: "Download Admit Card", url: "" }], officialWebsite: "" };

                if (data.importantLinks) {
                    if (Array.isArray(data.importantLinks.downloadAdmitCard)) {
                        parsedLinks.downloadAdmitCard = data.importantLinks.downloadAdmitCard;
                    } else if (typeof data.importantLinks.downloadAdmitCard === 'string' && data.importantLinks.downloadAdmitCard) {
                        parsedLinks.downloadAdmitCard = [{ label: "Download Admit Card", url: data.importantLinks.downloadAdmitCard }];
                    }
                    parsedLinks.officialWebsite = data.importantLinks.officialWebsite || "";
                }

                setFormData({
                    ...data,
                    importantLinks: parsedLinks
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
            await axios.put(`https://www.finderight.com/api/admit-cards/${slug}`, formData);
            setStatusMessage({ message: "Admit Card updated successfully! Redirecting...", severity: "success" });
            
            setTimeout(() => {
                router.push("/admin/admit-cards"); // Or wherever your manage page is located
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
                <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/admit-cards")}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => router.push("/admin/admit-cards")} 
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
                        
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Admit Card Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Title (SEO Optimized)"
                                name="title" value={formData.title} onChange={handleChange} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By (Authority)"
                                name="conductedby" value={formData.conductedby} onChange={handleChange} size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Key Dates (Free Text or Format)</Divider>
                        </Grid>

                        {[
                            { label: "Application Begin", name: "applicationBegin" },
                            { label: "Last Date to Apply", name: "lastDateApply" },
                            { label: "Exam Date", name: "examDate" },
                            { label: "Admit Card Release", name: "admitCard" },
                            { label: "Publish Date", name: "publishDate" },
                        ].map(({ label, name }) => (
                            <Grid item xs={12} sm={6} md={4} key={name}>
                                <TextField
                                    fullWidth label={label} name={name}
                                    value={formData[name] || ""} onChange={handleChange} size="small"
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📄 Detailed Information</Divider>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth multiline rows={3}
                                label="Description / Short Notice"
                                name="description" value={formData.description || ""} onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth multiline rows={3}
                                label="How to Download Admit Card"
                                name="howToDownload" value={formData.howToDownload || ""} onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                                🔗 Download Links
                            </Divider>
                        </Grid>

                        {formData.importantLinks.downloadAdmitCard.map((link, index) => (
                            <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2, px: 3 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Label"
                                        value={link.label} onChange={(e) => handleDynamicLinkChange(index, "label", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="URL"
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

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🌐 Official Website</Divider>
                            <TextField
                                fullWidth size="small" label="Official Website URL"
                                value={formData.importantLinks.officialWebsite || ""} onChange={handleOfficialWebsiteChange}
                            />
                        </Grid>

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
        </Box>
    );
};

export default AdminEditAdmitCard;