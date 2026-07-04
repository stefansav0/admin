"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Skeleton,
    InputAdornment,
    IconButton,
    Tooltip
} from "@mui/material";
import { 
    Search as SearchIcon,
    Code as CodeIcon,
    Visibility as VisibilityIcon,
    ArrowBack,
    AutoFixHigh as AutoFixHighIcon,
    Image as ImageIcon,
    Notes as NotesIcon
} from "@mui/icons-material";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

// Standard input styling
const inputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fcfcfc',
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
            borderColor: '#e2e8f0',
        },
        '&:hover fieldset': {
            borderColor: '#cbd5e1',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#3b82f6',
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        padding: '12px 16px',
        color: '#334155',
    }
};

// Code Editor specific styling
const codeInputStyle = {
    ...inputStyle,
    '& .MuiInputBase-input': {
        padding: '16px',
        color: '#e2e8f0', 
        fontFamily: '"Fira Code", "Courier New", monospace',
        fontSize: '14px',
        lineHeight: 1.6,
    },
    '& .MuiOutlinedInput-root': {
        ...inputStyle['& .MuiOutlinedInput-root'],
        backgroundColor: '#0f172a', 
    }
};

const CustomLabel = ({ children, required }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, ml: 0.5 }}>
        {children} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </Typography>
);

const AdminEditDocument = () => {
    const router = useRouter();
    const params = useParams(); 
    const { slug } = params; 

    const API_BASE_URL = "https://www.finderight.com/api/documents"; // Update to your production URL when deploying

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "",
        serviceType: "",
        coverImageUrl: "",
        description: "",
        fullDescription: "",
        contentFormat: "html", // 'html' | 'text'
        link: "",
        metaDescription: "",
        seoKeywords: "",
    });

    const [initialLoading, setInitialLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview'

    // Fetch Existing Document Data on Mount
    useEffect(() => {
        const fetchDocument = async () => {
            if (!slug) return;
            
            try {
                const response = await axios.get(`${API_BASE_URL}/${slug}`);
                const doc = response.data;
                
                setFormData({
                    title: doc.title || "",
                    slug: doc.slug || "",
                    category: doc.category || "",
                    serviceType: doc.serviceType || "",
                    coverImageUrl: doc.coverImageUrl || "",
                    description: doc.description || "",
                    fullDescription: doc.fullDescription || "",
                    contentFormat: doc.contentFormat || "html",
                    link: doc.link || "",
                    metaDescription: doc.metaDescription || "",
                    seoKeywords: doc.seoKeywords || "",
                });
                setInitialLoading(false);
            } catch (err) {
                console.error("❌ Failed to fetch document:", err);
                setStatusMessage({ 
                    message: "Failed to load document details. It may have been deleted.", 
                    severity: "error" 
                });
                setInitialLoading(false);
            }
        };

        fetchDocument();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleViewChange = (event, newView) => {
        if (newView !== null) setViewMode(newView);
    };

    const handleFormatChange = (event, newFormat) => {
        if (newFormat !== null) {
            setFormData(prev => ({ ...prev, contentFormat: newFormat }));
        }
    };

    const generateSlug = () => {
        if (!formData.title) return;
        const newSlug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, slug: newSlug }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!formData.title || !formData.slug || !formData.category || !formData.link) {
            setStatusMessage({ 
                message: "Please fill out all required fields (*).", 
                severity: "error" 
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSubmitting(true);

        try {
            await axios.put(`${API_BASE_URL}/${slug}`, formData);
            
            setStatusMessage({ 
                message: "✅ Document updated successfully! Redirecting...", 
                severity: "success" 
            });
            
            setTimeout(() => {
                router.push("/admin/manage-documents");
            }, 1200);
            
        } catch (err) {
            console.error("❌ Failed to update document:", err);
            const errorMessage = err.response?.data?.message || "Unknown error occurred.";
            setStatusMessage({ 
                message: `Failed to update document: ${errorMessage}`, 
                severity: "error" 
            });
            setSubmitting(false); 
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => router.back()}
                sx={{ mb: 2, color: '#475569', textTransform: 'none', fontWeight: 600 }}
            >
                Back to Documents
            </Button>

            {statusMessage && (
                <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4, borderRadius: 2 }}>
                    {statusMessage.message}
                </Alert>
            )}

            {initialLoading ? (
                <Box sx={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                    <Skeleton variant="rectangular" height={300} sx={{ mb: 4, borderRadius: 4 }} />
                    <Skeleton variant="rectangular" height={200} sx={{ mb: 4, borderRadius: 4 }} />
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
                </Box>
            ) : (
                <form onSubmit={handleSubmit} autoComplete="off">
                    
                    {/* ================= SECTION 1: CORE INFORMATION ================= */}
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 4, fontFamily: 'serif' }}>
                            Edit Core Information
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6}>
                                <CustomLabel required>Document Title</CustomLabel>
                                <TextField
                                    fullWidth name="title" value={formData.title} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <CustomLabel required>URL Slug</CustomLabel>
                                <TextField
                                    fullWidth name="slug" value={formData.slug} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title="Auto-generate from Title">
                                                    <IconButton onClick={generateSlug} edge="end" sx={{ color: '#3b82f6' }}>
                                                        <AutoFixHighIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <CustomLabel required>Category</CustomLabel>
                                <TextField
                                    fullWidth name="category" value={formData.category} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <CustomLabel>Service Type</CustomLabel>
                                <TextField
                                    fullWidth name="serviceType" value={formData.serviceType} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <CustomLabel required>Direct Service URL</CustomLabel>
                                <TextField
                                    fullWidth name="link" value={formData.link} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ================= SECTION 2: MEDIA ================= */}
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <ImageIcon sx={{ color: '#8b5cf6', mr: 1.5 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'serif' }}>
                                Media
                            </Typography>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={formData.coverImageUrl ? 7 : 12}>
                                <CustomLabel>Cover Image URL</CustomLabel>
                                <TextField
                                    fullWidth name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange}
                                    placeholder="https://example.com/image.png"
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>
                            
                            {formData.coverImageUrl && (
                                <Grid item xs={12} md={5}>
                                    <CustomLabel>Image Preview</CustomLabel>
                                    <Box 
                                        sx={{ 
                                            width: '100%', 
                                            height: '140px', 
                                            borderRadius: '12px',
                                            backgroundImage: `url(${formData.coverImageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#f1f5f9'
                                        }} 
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    {/* ================= SECTION 3: SEO & DISCOVERY ================= */}
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, backgroundColor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <SearchIcon sx={{ color: '#2563eb', mr: 1.5 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a', fontFamily: 'serif' }}>
                                SEO & Discovery
                            </Typography>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <CustomLabel>Focus Keywords (Comma Separated)</CustomLabel>
                                <TextField
                                    fullWidth name="seoKeywords" value={formData.seoKeywords} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <CustomLabel>Meta Description</CustomLabel>
                                    <Typography variant="caption" sx={{ color: formData.metaDescription?.length > 160 ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>
                                        {formData.metaDescription?.length || 0} / 160 chars
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth multiline rows={3} name="metaDescription" value={formData.metaDescription} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ================= SECTION 4: DOCUMENT CONTENT ================= */}
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 4, fontFamily: 'serif' }}>
                            Document Content
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <CustomLabel>Short Description (Card View)</CustomLabel>
                                <TextField
                                    fullWidth multiline rows={2} name="description" value={formData.description} onChange={handleChange}
                                    sx={inputStyle} disabled={submitting}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                                    <Box>
                                        <CustomLabel>Full Document Guide</CustomLabel>
                                        <ToggleButtonGroup
                                            value={formData.contentFormat} exclusive onChange={handleFormatChange} size="small"
                                            sx={{ height: 32, mt: 0.5 }}
                                        >
                                            <ToggleButton value="html" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>
                                                <CodeIcon sx={{ fontSize: 18, mr: 0.5 }} /> HTML / Tailwind
                                            </ToggleButton>
                                            <ToggleButton value="text" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>
                                                <NotesIcon sx={{ fontSize: 18, mr: 0.5 }} /> Plain Text
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>
                                    
                                    <ToggleButtonGroup
                                        value={viewMode} exclusive onChange={handleViewChange} size="small"
                                        sx={{ height: 32 }}
                                    >
                                        <ToggleButton value="editor" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>
                                            Editor
                                        </ToggleButton>
                                        <ToggleButton value="preview" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>
                                            <VisibilityIcon sx={{ fontSize: 18, mr: 0.5 }} /> Live Preview
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                {viewMode === 'editor' ? (
                                    <TextField
                                        fullWidth multiline rows={10} name="fullDescription" value={formData.fullDescription} onChange={handleChange}
                                        sx={formData.contentFormat === 'html' ? codeInputStyle : inputStyle}
                                        disabled={submitting}
                                    />
                                ) : (
                                    <Box 
                                        sx={{ 
                                            minHeight: '265px', p: 3, 
                                            border: '1px solid #e2e8f0', borderRadius: '12px', 
                                            backgroundColor: '#ffffff' 
                                        }}
                                    >
                                        {!formData.fullDescription ? (
                                            <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                                Nothing to preview yet. Switch to "Editor" to start typing.
                                            </Typography>
                                        ) : formData.contentFormat === 'html' ? (
    <Box 
        dangerouslySetInnerHTML={{ __html: formData.fullDescription }} 
        sx={{
            // Add default margins to headings
            '& h1, & h2, & h3, & h4, & h5, & h6': { 
                mt: 3, 
                mb: 2, 
                fontWeight: 'bold',
                color: '#1e293b'
            },
            '& h1': { fontSize: '2rem' },
            '& h2': { fontSize: '1.5rem' },
            '& h3': { fontSize: '1.25rem' },
            // Add spacing to paragraphs
            '& p': { 
                mb: 2, 
                lineHeight: 1.7,
                color: '#334155'
            },
            // Add spacing to lists
            '& ul, & ol': { 
                pl: 4, 
                mb: 2 
            },
            '& li': { 
                mb: 1 
            },
            // Handle links
            '& a': {
                color: '#2563eb',
                textDecoration: 'underline'
            }
        }}
    />
) : (
                                            <Typography sx={{ whiteSpace: 'pre-wrap', color: '#334155' }}>
                                                {formData.fullDescription}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Submit Button */}
                    <Button
                        type="submit" variant="contained" disabled={submitting} fullWidth
                        sx={{ 
                            py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: 3, textTransform: 'none',
                            backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } 
                        }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                    </Button>
                </form>
            )}
        </Box>
    );
};

export default AdminEditDocument;