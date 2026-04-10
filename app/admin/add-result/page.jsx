"use client";

import React, { useState } from "react";
import {
    TextField,
    Button,
    Grid,
    Typography,
    Paper,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    Box
} from "@mui/material";
import {
    AddCircleOutline,
    RemoveCircleOutline,
    CheckCircleOutline
} from "@mui/icons-material";
import axios from "axios";

const initialState = {
    title: "",
    conductedBy: "",
    examDate: "",
    resultDate: "",
    postDate: "",
    shortInfo: "",
    howToCheck: "",
    importantLinks: {
        // Dynamic array for multiple SEO-friendly download links
        downloadResult: [{ label: "Download Result", url: "" }],
        officialWebsite: "",
    },
};

const AdminAddResult = () => {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Standard text fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Handlers for dynamic multiple links
    const handleDynamicLinkChange = (index, field, value) => {
        const updatedLinks = [...form.importantLinks.downloadResult];
        updatedLinks[index][field] = value;
        setForm({
            ...form,
            importantLinks: { ...form.importantLinks, downloadResult: updatedLinks }
        });
    };

    const addDynamicLink = () => {
        setForm({
            ...form,
            importantLinks: {
                ...form.importantLinks,
                downloadResult: [...form.importantLinks.downloadResult, { label: "Download Result Server 2", url: "" }]
            }
        });
    };

    const removeDynamicLink = (index) => {
        const updatedLinks = form.importantLinks.downloadResult.filter((_, i) => i !== index);
        setForm({
            ...form,
            importantLinks: { ...form.importantLinks, downloadResult: updatedLinks }
        });
    };

    // Official website handler
    const handleOfficialWebsiteChange = (e) => {
        setForm({
            ...form,
            importantLinks: { ...form.importantLinks, officialWebsite: e.target.value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        // Basic Validation
        if (
            !form.title || !form.conductedBy || !form.examDate ||
            !form.resultDate || !form.postDate || !form.shortInfo || !form.howToCheck
        ) {
            setStatusMessage({ message: "Please fill in all required fields.", severity: "error" });
            return;
        }

        setLoading(true);

        try {
            // Send exactly to your specified backend API
            await axios.post("https://www.finderight.com/api/results", form);
            
            setStatusMessage({ message: "Result published successfully!", severity: "success" });
            setForm(initialState); // Reset form on success
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to add result: ${errorMessage}`, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #4caf50' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#2e7d32', mb: 4 }}>
                    Publish New Result
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
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Result Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Result Title (SEO Optimized)"
                                name="title" value={form.title} onChange={handleChange}
                                placeholder="e.g., UPSC Civil Services Final Result 2026"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By (Authority)"
                                name="conductedBy" value={form.conductedBy} onChange={handleChange}
                                placeholder="e.g., Union Public Service Commission"
                                size="small"
                            />
                        </Grid>

                        {/* --- Timeline Dates --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Timeline Dates</Divider>
                        </Grid>
                        
                        {/* ✅ CHANGED: Removed type="date" to make it textable */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth required 
                                label="Exam Date (Free Text)" 
                                placeholder="e.g., 14 May 2026 or TBA"
                                name="examDate" value={form.examDate} onChange={handleChange}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth required label="Result Declaration Date" type="date"
                                name="resultDate" value={form.resultDate} onChange={handleChange}
                                InputLabelProps={{ shrink: true }} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth required label="Post Published Date" type="date"
                                name="postDate" value={form.postDate} onChange={handleChange}
                                InputLabelProps={{ shrink: true }} size="small"
                            />
                        </Grid>

                        {/* --- Details --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📄 Detailed Information</Divider>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth required multiline rows={3}
                                label="Short Notice / Info (Supports HTML)"
                                name="shortInfo" value={form.shortInfo} onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth required multiline rows={3}
                                label="How to Check Result (Step-by-step Guide)"
                                name="howToCheck" value={form.howToCheck} onChange={handleChange}
                            />
                        </Grid>

                        {/* --- SEO Optimized Download Links --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                                🔗 Multiple Download Links (SEO Optimized)
                            </Divider>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                Use descriptive labels (e.g., "Download Final Merit List PDF") to improve Google search rankings.
                            </Typography>
                        </Grid>

                        {form.importantLinks.downloadResult.map((link, index) => (
                            <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2, px: 3 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small"
                                        label="Custom SEO Link Label"
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
                                        disabled={form.importantLinks.downloadResult.length === 1}
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
                                value={form.importantLinks.officialWebsite}
                                onChange={handleOfficialWebsiteChange}
                            />
                        </Grid>

                        {/* --- Submit Button --- */}
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="success" 
                                disabled={loading}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />}
                            >
                                {loading ? "Publishing Result..." : "Publish Result"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminAddResult;