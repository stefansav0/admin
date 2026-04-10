"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
    SaveOutlined,
    ArrowBack
} from "@mui/icons-material";
import axios from "axios";

// Helper to safely format dates for HTML <input type="date">
const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
        return new Date(dateString).toISOString().split("T")[0];
    } catch {
        return dateString;
    }
};

const AdminEditResult = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        const fetchResultData = async () => {
            try {
                const res = await axios.get(`https://www.finderight.com/api/results/${slug}`);
                const data = res.data.result;

                // 🚨 SAFEGUARD: Handle both OLD (Array) and NEW (Object) database schemas
                let parsedLinks = { downloadResult: [], officialWebsite: "" };

                if (data.importantLinks) {
                    if (Array.isArray(data.importantLinks)) {
                        // Old data found: Convert the flat array to the new 'downloadResult' format
                        parsedLinks.downloadResult = data.importantLinks;
                    } else {
                        // New data found: Use it normally
                        parsedLinks.downloadResult = data.importantLinks.downloadResult || [];
                        parsedLinks.officialWebsite = data.importantLinks.officialWebsite || "";
                    }
                }

                setForm({
                    ...data,
                    // ✅ BYPASS formatDate for examDate since it is now free-text (e.g., "TBA")
                    examDate: data.examDate || "", 
                    resultDate: formatDate(data.resultDate),
                    postDate: formatDate(data.postDate),
                    importantLinks: parsedLinks
                });
            } catch (err) {
                console.error(err);
                setStatusMessage({ message: "Failed to load result data. It may have been deleted.", severity: "error" });
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchResultData();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

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
                downloadResult: [...form.importantLinks.downloadResult, { label: "New Download Link", url: "" }]
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);
        setSaving(true);

        try {
            await axios.put(`https://www.finderight.com/api/results/${slug}`, form);
            
            setStatusMessage({ message: "Result updated successfully! Redirecting...", severity: "success" });
            
            // ✅ Consistent redirect path
            setTimeout(() => {
                router.push("/admin/manage-results");
            }, 1500);

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to update: ${errorMessage}`, severity: "error" });
        } finally {
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

    // Safety fallback if the form is completely missing
    if (!form) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", mt: 10 }}>
                <Alert severity="error">{statusMessage?.message || "Data could not be loaded."}</Alert>
                <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/manage-results")}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => router.push("/admin/manage-results")}
                sx={{ mb: 2 }}
            >
                Back to Results
            </Button>

            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #ff9800' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#e65100', mb: 4 }}>
                    Edit Result
                </Typography>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={3}>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Result Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Result Title"
                                name="title" value={form.title} onChange={handleChange} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By"
                                name="conductedBy" value={form.conductedBy} onChange={handleChange} size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Timeline Dates</Divider>
                        </Grid>
                        
                        {/* ✅ CHANGED: Free text Exam Date to match the "Add Result" logic */}
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
                                fullWidth required label="Result Date" type="date"
                                name="resultDate" value={form.resultDate} onChange={handleChange}
                                InputLabelProps={{ shrink: true }} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth required label="Post Date" type="date"
                                name="postDate" value={form.postDate} onChange={handleChange}
                                InputLabelProps={{ shrink: true }} size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📄 Detailed Information</Divider>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth required multiline rows={3}
                                label="Short Notice" name="shortInfo" value={form.shortInfo} onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth required multiline rows={3}
                                label="How to Check" name="howToCheck" value={form.howToCheck} onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                                🔗 Download Links
                            </Divider>
                        </Grid>

                        {form.importantLinks.downloadResult.map((link, index) => (
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
                                    <IconButton color="error" onClick={() => removeDynamicLink(index)} disabled={form.importantLinks.downloadResult.length === 0}>
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}

                        <Grid item xs={12} sx={{ pl: 3 }}>
                            <Button startIcon={<AddCircleOutline />} onClick={addDynamicLink} variant="text">
                                Add Another Link
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🌐 Official Website</Divider>
                            <TextField
                                fullWidth size="small" label="Official Website URL"
                                value={form.importantLinks.officialWebsite || ""}
                                onChange={(e) => setForm({...form, importantLinks: {...form.importantLinks, officialWebsite: e.target.value}})}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button 
                                type="submit" variant="contained" color="warning" disabled={saving}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                            >
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminEditResult;