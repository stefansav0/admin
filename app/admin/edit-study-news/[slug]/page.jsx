"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import {
    TextField,
    Button,
    Typography,
    Grid,
    Box,
    Paper,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { Visibility } from "@mui/icons-material";

// ✅ Dynamically import ReactQuill to prevent SSR errors
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const initialState = {
    title: "",
    description: "",
    coverImage: "",        
    slug: "",              
    metaDescription: "",   
    keywords: "",          
};

// ✅ HELPER: Decodes escaped HTML entities back to raw HTML tags for rendering
const decodeHtml = (html) => {
    if (!html) return "";
    return html
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

// ✅ Custom Toolbar Setup
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ align: [] }],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" }
        ],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
        ["clean"]
    ],
};

const quillFormats = [
    "header",
    "bold", "italic", "underline", "strike", "blockquote",
    "align", "list", "indent",
    "color", "background",
    "link", "image", "video"
];

export default function AdminEditStudyNews() {
    const { slug: originalSlug } = useParams();
    const router = useRouter();

    const [news, setNews] = useState(initialState);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    
    // ✅ Hydration Mismatch Fix
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch existing data on mount
    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                const response = await axios.get(`https://www.finderight.com/api/study-news/${originalSlug}`);
                const data = response.data.result || response.data.studyNews || response.data;
                setNews(data); 
            } catch (error) {
                console.error("Error fetching news data:", error);
                alert("❌ Failed to load news data. It might have been deleted.");
                router.push("/admin/edit-study-news"); 
            } finally {
                setIsLoading(false);
            }
        };

        if (originalSlug && isMounted) {
            fetchNewsData();
        }
    }, [originalSlug, router, isMounted]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "slug") {
            const formattedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            setNews((prev) => ({ ...prev, [name]: formattedSlug }));
        } else {
            setNews((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setNews((prev) => ({ ...prev, coverImage: reader.result }));
        };
        reader.onerror = (error) => {
            console.error("Error converting image:", error);
            alert("Failed to process image");
        };
    };

    const handleRemoveImage = () => {
        setNews((prev) => ({ ...prev, coverImage: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!news.title || !news.description || !news.slug) {
            alert("Please fill in all required fields (Title, Description, and Slug).");
            return;
        }
        
        setIsUpdating(true);
        try {
            await axios.put(`https://www.finderight.com/api/study-news/${originalSlug}`, news);
            alert("✅ Study news updated successfully!");
            
            if (news.slug !== originalSlug) {
                 router.replace(`/admin/edit-study-news/${news.slug}`);
            }
        } catch (error) {
            console.error("Error updating study news:", error);
            alert("❌ Failed to update news");
        } finally {
            setIsUpdating(false);
        }
    };

    // ✅ Wait for mount to avoid hydration mismatch, and show loader while fetching
    if (!isMounted || isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: "#2563EB", fontWeight: 600, mb: 4 }}>
                    Edit Study News
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        
                        {/* ✅ Updated to MUI v6 Grid size API */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Title <span style={{ color: "#DC2626" }}>*</span>
                            </Typography>
                            <TextField
                                fullWidth
                                name="title"
                                placeholder="Enter news title"
                                value={news.title}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ mt: 2, mb: 1 }}>
                                <Typography variant="h6" sx={{ color: "#374151", fontWeight: 600 }}>
                                    SEO & URL Settings
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                URL Slug <span style={{ color: "#DC2626" }}>*</span>
                            </Typography>
                            <TextField
                                fullWidth
                                name="slug"
                                placeholder="e.g. latest-study-updates-2024"
                                value={news.slug}
                                onChange={handleChange}
                                required
                                helperText="Must be unique. Spaces will be converted to hyphens."
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Keywords
                            </Typography>
                            <TextField
                                fullWidth
                                name="keywords"
                                placeholder="study, abroad, scholarships (comma separated)"
                                value={news.keywords}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Meta Description
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="metaDescription"
                                placeholder="Write a brief summary for search engines (150-160 characters)"
                                value={news.metaDescription}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                Cover Image
                            </Typography>
                            
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { xs: "stretch", sm: "flex-start" } }}>
                                <TextField
                                    fullWidth
                                    name="coverImage"
                                    placeholder="Paste image URL here..."
                                    value={news.coverImage}
                                    onChange={handleChange}
                                    sx={{ flexGrow: 1 }}
                                />

                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
                                        OR
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{ textTransform: "none", height: "56px", whiteSpace: "nowrap" }}
                                    >
                                        Upload File
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </Button>
                                </Box>
                            </Box>

                            {news.coverImage && (
                                <Box sx={{ position: "relative", mt: 3, display: "inline-block" }}>
                                    <Box
                                        component="img"
                                        src={news.coverImage}
                                        alt="Cover Preview"
                                        sx={{
                                            maxHeight: 250,
                                            maxWidth: "100%",
                                            borderRadius: 2,
                                            border: "1px solid #E5E7EB",
                                            objectFit: "cover",
                                            display: "block"
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        color="error" 
                                        size="small"
                                        onClick={handleRemoveImage}
                                        sx={{ position: "absolute", top: 8, right: 8, minWidth: "auto", px: 1.5 }}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            )}
                        </Grid>

                        {/* ✅ React Quill Editor */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1">
                                    Description <span style={{ color: "#DC2626" }}>*</span>
                                </Typography>
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={<Visibility />}
                                    onClick={() => setPreviewOpen(true)}
                                >
                                    Preview Article
                                </Button>
                            </Box>
                            
                            <Box sx={{ 
                                '.ql-container': { minHeight: '300px', fontSize: '16px' },
                                '.ql-editor': { minHeight: '300px' } 
                            }}>
                                <ReactQuill
                                    theme="snow"
                                    value={news.description}
                                    onChange={(value) => setNews((prev) => ({ ...prev, description: value }))}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Write an amazing article here..."
                                />
                            </Box>
                            
                            <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 1, fontSize: 12, color: "#4B5563" }}
                            >
                                Use the toolbar to add headings, links, images, and formatting.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isUpdating}
                                sx={{ px: 4, py: 1.5, mt: 2 }}
                            >
                                {isUpdating ? "Updating..." : "Update News"}
                            </Button>
                        </Grid>
                        
                    </Grid>
                </form>
            </Paper>

            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #e0e0e0' }}>
                    Article Preview
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#f9f9f9', minHeight: '400px', p: 4 }}>
                    <Paper elevation={1} sx={{ p: 3, minHeight: '350px' }}>
                        {news.description ? (
                            <Box 
                                className="prose max-w-none ql-editor" // ✅ Added ql-editor class for exact styling match
                                dangerouslySetInnerHTML={{ __html: decodeHtml(news.description) }} 
                                sx={{
                                    '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                                    '& a': { color: '#1976d2', textDecoration: 'underline' }
                                }}
                            />
                        ) : (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 10 }}>
                                No content to preview yet. Start typing in the editor!
                            </Typography>
                        )}
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button onClick={() => setPreviewOpen(false)} color="primary" variant="contained">
                        Close Preview
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}