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
    Box,
    Card,
    CardContent
} from "@mui/material";
import {
    AddCircleOutline,
    RemoveCircleOutline,
    SaveOutlined,
    ArrowBack,
    Language,
    Search,
    DateRange,
    Code,
    Visibility,
    IntegrationInstructions
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

                // 🚨 SAFEGUARD: Handle both OLD (Array) and NEW (Object) database schemas for links
                let parsedLinks = { downloadResult: [], officialWebsite: "" };
                if (data.importantLinks) {
                    if (Array.isArray(data.importantLinks)) {
                        parsedLinks.downloadResult = data.importantLinks;
                    } else {
                        parsedLinks.downloadResult = data.importantLinks.downloadResult || [];
                        parsedLinks.officialWebsite = data.importantLinks.officialWebsite || "";
                    }
                }

                setForm({
                    ...data,
                    // Ensure new fields exist even if editing an old post
                    seoKeywords: data.seoKeywords || "",
                    metaDescription: data.metaDescription || "",
                    // Migrate old shortInfo to detailedHtml if necessary
                    detailedHtml: data.detailedHtml || data.shortInfo || "", 
                    howToCheck: data.howToCheck || "",
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress color="warning" />
            </Box>
        );
    }

    if (!form) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", mt: 10 }}>
                <Alert severity="error">{statusMessage?.message || "Data could not be loaded."}</Alert>
                <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/manage-results")} variant="outlined">Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => router.push("/admin/manage-results")}
                sx={{ mb: 3, color: '#555', fontWeight: 'bold' }}
            >
                Back to Results
            </Button>

            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, borderTop: "8px solid #ff9800" }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 800, color: "#e65100", mb: 5, letterSpacing: '-0.5px' }}>
                    Edit Result
                </Typography>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4, borderRadius: 2 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={4}>

                        {/* --- General Information --- */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 3, fontWeight: 700 }}>
                                        <Language sx={{ mr: 1.5, color: '#ff9800' }} /> Core Information
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth required label="Result Title"
                                                name="title" value={form.title} onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth required label="URL Slug"
                                                name="slug" value={form.slug} onChange={handleChange}
                                                helperText="Caution: Changing this will break existing links to this post."
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth required label="Conducted By (Authority)"
                                                name="conductedBy" value={form.conductedBy} onChange={handleChange}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- SEO Settings --- */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 3, fontWeight: 700 }}>
                                        <Search sx={{ mr: 1.5, color: '#4caf50' }} /> SEO Optimization
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth label="SEO Keywords (Comma Separated)"
                                                name="seoKeywords" value={form.seoKeywords} onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth multiline rows={2} label="Meta Description"
                                                name="metaDescription" value={form.metaDescription} onChange={handleChange}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- Timeline Dates --- */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 3, fontWeight: 700 }}>
                                        <DateRange sx={{ mr: 1.5, color: '#9c27b0' }} /> Timeline Dates
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth required label="Exam Date (Free Text)"
                                                name="examDate" value={form.examDate} onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth required label="Result Declaration Date" type="date"
                                                name="resultDate" value={form.resultDate} onChange={handleChange}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth required label="Post Published Date" type="date"
                                                name="postDate" value={form.postDate} onChange={handleChange}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- HTML Detailed Information & Live Preview --- */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.06)', border: '1px solid #e0e0e0' }}>
                                <CardContent sx={{ p: 0 }}>
                                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                                            <Code sx={{ mr: 1.5, color: '#00c853' }} /> Notice Details (Tailwind HTML)
                                        </Typography>
                                    </Box>

                                    <Grid container>
                                        <Grid item xs={12} lg={6} sx={{ borderRight: { lg: '1px solid #e0e0e0' } }}>
                                            <Box sx={{ p: 3, height: '100%', bgcolor: '#1e1e1e' }}>
                                                <Typography variant="overline" sx={{ color: '#858585', mb: 1, display: 'block', fontWeight: 'bold' }}>
                                                    notice.html
                                                </Typography>
                                                <TextField
                                                    fullWidth required multiline minRows={14}
                                                    name="detailedHtml" value={form.detailedHtml} onChange={handleChange}
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            backgroundColor: 'transparent', color: '#d4d4d4', 
                                                            fontFamily: '"Fira Code", "Courier New", monospace', fontSize: '0.9rem', lineHeight: 1.5, padding: 0,
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} lg={6} sx={{ p: 3, bgcolor: '#f4f6f8' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Visibility sx={{ fontSize: 18, mr: 1, color: '#555' }} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555' }}>Live Render</Typography>
                                            </Box>
                                            <Box sx={{ bgcolor: '#fff', borderRadius: 2, overflow: 'hidden', border: '1px solid #d1d5db', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ bgcolor: '#e5e7eb', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d5db' }}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto", bgcolor: '#fff' }} dangerouslySetInnerHTML={{ __html: form.detailedHtml }} />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- HTML How to Check Guide & Live Preview --- */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.06)', border: '1px solid #e0e0e0' }}>
                                <CardContent sx={{ p: 0 }}>
                                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                                            <IntegrationInstructions sx={{ mr: 1.5, color: '#f50057' }} /> How to Check Guide (Tailwind HTML)
                                        </Typography>
                                    </Box>

                                    <Grid container>
                                        <Grid item xs={12} lg={6} sx={{ borderRight: { lg: '1px solid #e0e0e0' } }}>
                                            <Box sx={{ p: 3, height: '100%', bgcolor: '#1e1e1e' }}>
                                                <Typography variant="overline" sx={{ color: '#858585', mb: 1, display: 'block', fontWeight: 'bold' }}>
                                                    guide.html
                                                </Typography>
                                                <TextField
                                                    fullWidth multiline minRows={14}
                                                    name="howToCheck" value={form.howToCheck} onChange={handleChange}
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            backgroundColor: 'transparent', color: '#d4d4d4', 
                                                            fontFamily: '"Fira Code", "Courier New", monospace', fontSize: '0.9rem', lineHeight: 1.5, padding: 0,
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} lg={6} sx={{ p: 3, bgcolor: '#f4f6f8' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Visibility sx={{ fontSize: 18, mr: 1, color: '#555' }} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555' }}>Live Render</Typography>
                                            </Box>
                                            <Box sx={{ bgcolor: '#fff', borderRadius: 2, overflow: 'hidden', border: '1px solid #d1d5db', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ bgcolor: '#e5e7eb', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d5db' }}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto", bgcolor: '#fff' }} dangerouslySetInnerHTML={{ __html: form.howToCheck }} />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- Important Links --- */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 700, color: '#1976d2' }}>
                                        🔗 Download & Official Links
                                    </Typography>
                                    
                                    <Box sx={{ mt: 3 }}>
                                        {form.importantLinks.downloadResult.map((link, index) => (
                                            <Box key={index} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                                                <TextField
                                                    fullWidth label="SEO Link Label"
                                                    value={link.label} onChange={(e) => handleDynamicLinkChange(index, "label", e.target.value)}
                                                />
                                                <TextField
                                                    fullWidth label="Direct Download URL"
                                                    value={link.url} onChange={(e) => handleDynamicLinkChange(index, "url", e.target.value)}
                                                />
                                                <IconButton
                                                    color="error" onClick={() => removeDynamicLink(index)} disabled={form.importantLinks.downloadResult.length === 1}
                                                    sx={{ mt: 1, border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}
                                                >
                                                    <RemoveCircleOutline />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>

                                    <Button startIcon={<AddCircleOutline />} onClick={addDynamicLink} variant="outlined" color="primary" sx={{ mb: 4, borderRadius: 2 }}>
                                        Add Another Download Server
                                    </Button>

                                    <Divider sx={{ mb: 4 }} />

                                    <TextField
                                        fullWidth label="Official Authority Website URL"
                                        value={form.importantLinks.officialWebsite}
                                        onChange={(e) => setForm({...form, importantLinks: {...form.importantLinks, officialWebsite: e.target.value}})}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- Submit Button --- */}
                        <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={saving}
                                sx={{ 
                                    py: 2, px: 8, 
                                    fontSize: "1.1rem", 
                                    fontWeight: 'bold',
                                    borderRadius: 8, 
                                    boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)',
                                    bgcolor: '#ff9800',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#f57c00' }
                                }}
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