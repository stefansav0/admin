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
    Box,
    Card,
    CardContent
} from "@mui/material";
import {
    AddCircleOutline,
    RemoveCircleOutline,
    CheckCircleOutline,
    Language,
    Search,
    DateRange,
    Code,
    Visibility,
    IntegrationInstructions
} from "@mui/icons-material";
import axios from "axios";

const initialState = {
    title: "",
    slug: "",
    seoKeywords: "",
    metaDescription: "",
    conductedBy: "",
    examDate: "",
    resultDate: "",
    postDate: "",
    detailedHtml: "", 
    howToCheck: "",
    importantLinks: {
        downloadResult: [{ label: "Download Result", url: "" }],
        officialWebsite: "",
    },
};

const AdminAddResult = () => {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        setForm({ ...form, title, slug });
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
                downloadResult: [
                    ...form.importantLinks.downloadResult,
                    { label: "Download Result Server", url: "" }
                ]
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

    const handleOfficialWebsiteChange = (e) => {
        setForm({
            ...form,
            importantLinks: { ...form.importantLinks, officialWebsite: e.target.value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!form.title || !form.slug || !form.conductedBy || !form.detailedHtml) {
            setStatusMessage({ message: "Please fill in all required core fields.", severity: "error" });
            return;
        }

        setLoading(true);

        try {
            await axios.post("https://www.finderight.com/api/results", form);
            setStatusMessage({ message: "Result published successfully!", severity: "success" });
            setForm(initialState);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to add result: ${errorMessage}`, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, borderTop: "8px solid #000" }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 800, color: "#111", mb: 5, letterSpacing: '-0.5px' }}>
                    Publish New Result
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
                                        <Language sx={{ mr: 1.5, color: '#1976d2' }} /> Core Information
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth required label="Result Title"
                                                name="title" value={form.title} onChange={handleTitleChange}
                                                placeholder="e.g., UPSC Civil Services Final Result 2026"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth required label="URL Slug"
                                                name="slug" value={form.slug} onChange={handleChange}
                                                placeholder="e.g., upsc-civil-services-final-result-2026"
                                                helperText="Auto-generated but manually editable"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth required label="Conducted By (Authority)"
                                                name="conductedBy" value={form.conductedBy} onChange={handleChange}
                                                placeholder="e.g., Union Public Service Commission"
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
                                        <Search sx={{ mr: 1.5, color: '#ff9800' }} /> SEO Optimization
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth label="SEO Keywords (Comma Separated)"
                                                name="seoKeywords" value={form.seoKeywords} onChange={handleChange}
                                                placeholder="e.g., upsc result 2026, civil services final list, upsc cutoff"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth multiline rows={2} label="Meta Description"
                                                name="metaDescription" value={form.metaDescription} onChange={handleChange}
                                                placeholder="Write a brief, catchy summary for Google search results (150-160 characters max)."
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
                                                placeholder="e.g., 14 May 2026 or TBA"
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
                                    
                                    {/* Header Banner */}
                                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                                            <Code sx={{ mr: 1.5, color: '#00c853' }} /> Notice Details (Tailwind HTML)
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                                            IDE Mode Active
                                        </Typography>
                                    </Box>

                                    <Grid container>
                                        {/* CODE EDITOR (Left Side) */}
                                        <Grid item xs={12} lg={6} sx={{ borderRight: { lg: '1px solid #e0e0e0' } }}>
                                            <Box sx={{ p: 3, height: '100%', bgcolor: '#1e1e1e' }}>
                                                <Typography variant="overline" sx={{ color: '#858585', mb: 1, display: 'block', fontWeight: 'bold' }}>
                                                    notice.html
                                                </Typography>
                                                <TextField
                                                    fullWidth required multiline minRows={14}
                                                    name="detailedHtml" value={form.detailedHtml} onChange={handleChange}
                                                    placeholder={`\n<div class="p-6 bg-blue-50 text-blue-900 rounded-xl shadow-sm border border-blue-100">\n  <h2 class="text-2xl font-extrabold mb-3">Notice</h2>\n  <p class="text-blue-800">The result has been declared...</p>\n</div>`}
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            backgroundColor: 'transparent',
                                                            color: '#d4d4d4', // VS Code text color
                                                            fontFamily: '"Fira Code", "Courier New", monospace',
                                                            fontSize: '0.9rem',
                                                            lineHeight: 1.5,
                                                            padding: 0,
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>

                                        {/* BROWSER LIVE PREVIEW (Right Side) */}
                                        <Grid item xs={12} lg={6} sx={{ p: 3, bgcolor: '#f4f6f8' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Visibility sx={{ fontSize: 18, mr: 1, color: '#555' }} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555' }}>
                                                    Live Render
                                                </Typography>
                                            </Box>
                                            
                                            {/* Browser Window Mockup */}
                                            <Box sx={{
                                                bgcolor: '#fff',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                                border: '1px solid #d1d5db',
                                                height: 'calc(100% - 36px)',
                                                minHeight: '350px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <Box sx={{ bgcolor: '#e5e7eb', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d5db' }}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                                                    </Box>
                                                    <Box sx={{ mx: 'auto', bgcolor: '#fff', px: 3, py: 0.5, borderRadius: 1, fontSize: '0.75rem', color: '#9ca3af', width: '60%', textAlign: 'center' }}>
                                                        localhost:3000/notice-preview
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{ p: 3, flexGrow: 1, overflowY: "auto", bgcolor: '#fff' }}
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: form.detailedHtml || "<div style='color:#9ca3af; text-align:center; margin-top:2rem; font-family: sans-serif;'>Notice preview will appear here...</div>" 
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- NEW: HTML How to Check Guide & Live Preview --- */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.06)', border: '1px solid #e0e0e0' }}>
                                <CardContent sx={{ p: 0 }}>
                                    
                                    {/* Header Banner */}
                                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                                            <IntegrationInstructions sx={{ mr: 1.5, color: '#f50057' }} /> How to Check Guide (Tailwind HTML)
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                                            IDE Mode Active
                                        </Typography>
                                    </Box>

                                    <Grid container>
                                        {/* CODE EDITOR (Left Side) */}
                                        <Grid item xs={12} lg={6} sx={{ borderRight: { lg: '1px solid #e0e0e0' } }}>
                                            <Box sx={{ p: 3, height: '100%', bgcolor: '#1e1e1e' }}>
                                                <Typography variant="overline" sx={{ color: '#858585', mb: 1, display: 'block', fontWeight: 'bold' }}>
                                                    guide.html
                                                </Typography>
                                                <TextField
                                                    fullWidth multiline minRows={14}
                                                    name="howToCheck" value={form.howToCheck} onChange={handleChange}
                                                    placeholder={`\n<ul class="list-decimal pl-5 space-y-2 text-gray-700">\n  <li>Visit the official website.</li>\n  <li>Click on the Results section.</li>\n  <li>Download the PDF file.</li>\n</ul>`}
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            backgroundColor: 'transparent',
                                                            color: '#d4d4d4', 
                                                            fontFamily: '"Fira Code", "Courier New", monospace',
                                                            fontSize: '0.9rem',
                                                            lineHeight: 1.5,
                                                            padding: 0,
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>

                                        {/* BROWSER LIVE PREVIEW (Right Side) */}
                                        <Grid item xs={12} lg={6} sx={{ p: 3, bgcolor: '#f4f6f8' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Visibility sx={{ fontSize: 18, mr: 1, color: '#555' }} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555' }}>
                                                    Live Render
                                                </Typography>
                                            </Box>
                                            
                                            {/* Browser Window Mockup */}
                                            <Box sx={{
                                                bgcolor: '#fff',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                                border: '1px solid #d1d5db',
                                                height: 'calc(100% - 36px)',
                                                minHeight: '350px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <Box sx={{ bgcolor: '#e5e7eb', px: 2, py: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid #d1d5db' }}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                                                    </Box>
                                                    <Box sx={{ mx: 'auto', bgcolor: '#fff', px: 3, py: 0.5, borderRadius: 1, fontSize: '0.75rem', color: '#9ca3af', width: '60%', textAlign: 'center' }}>
                                                        localhost:3000/guide-preview
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{ p: 3, flexGrow: 1, overflowY: "auto", bgcolor: '#fff' }}
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: form.howToCheck || "<div style='color:#9ca3af; text-align:center; margin-top:2rem; font-family: sans-serif;'>Step-by-step guide preview will appear here...</div>" 
                                                    }}
                                                />
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
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                        Use descriptive SEO labels (e.g., "Download Final Merit List PDF") to rank better on Google.
                                    </Typography>

                                    {form.importantLinks.downloadResult.map((link, index) => (
                                        <Box key={index} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                                            <TextField
                                                fullWidth label="SEO Link Label"
                                                value={link.label}
                                                onChange={(e) => handleDynamicLinkChange(index, "label", e.target.value)}
                                            />
                                            <TextField
                                                fullWidth label="Direct Download URL"
                                                value={link.url}
                                                onChange={(e) => handleDynamicLinkChange(index, "url", e.target.value)}
                                            />
                                            <IconButton
                                                color="error"
                                                onClick={() => removeDynamicLink(index)}
                                                disabled={form.importantLinks.downloadResult.length === 1}
                                                sx={{ mt: 1, border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}
                                            >
                                                <RemoveCircleOutline />
                                            </IconButton>
                                        </Box>
                                    ))}

                                    <Button startIcon={<AddCircleOutline />} onClick={addDynamicLink} variant="outlined" color="primary" sx={{ mb: 4, borderRadius: 2 }}>
                                        Add Another Download Server
                                    </Button>

                                    <Divider sx={{ mb: 4 }} />

                                    <TextField
                                        fullWidth label="Official Authority Website URL"
                                        value={form.importantLinks.officialWebsite}
                                        onChange={handleOfficialWebsiteChange}
                                        placeholder="https://upsc.gov.in"
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* --- Submit Button --- */}
                        <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ 
                                    py: 2, px: 8, 
                                    fontSize: "1.1rem", 
                                    fontWeight: 'bold',
                                    borderRadius: 8, 
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                    bgcolor: '#000',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#333' }
                                }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />}
                            >
                                {loading ? "Publishing to Database..." : "Publish Final Result"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminAddResult;