"use client";

import React, { useState } from "react";
import axios from "axios";
import {
    TextField,
    Button,
    Typography,
    Grid,
    Box,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { Visibility } from "@mui/icons-material"; 
import TipTapEditor from "../../../components/TipTapEditor"; // adjust path as needed

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

export default function AdminAddStudyNews() {
    const [news, setNews] = useState(initialState);
    const [isUploading, setIsUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Auto-format slug to lowercase and replace spaces with hyphens
        if (name === "slug") {
            const formattedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            setNews((prev) => ({ ...prev, [name]: formattedSlug }));
        } else {
            setNews((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle Image Upload (Converts file to Base64 String)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        // Convert image to base64 to store in DB as a string
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

    // Remove the uploaded or pasted image
    const handleRemoveImage = () => {
        setNews((prev) => ({ ...prev, coverImage: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!news.title || !news.description || !news.slug) {
            alert("Please fill in all required fields (Title, Description, and Slug).");
            return;
        }
        
        setIsUploading(true);
        try {
            await axios.post("https://www.finderight.com/api/study-news", news);
            alert("✅ Study news posted successfully!");
            setNews(initialState);
        } catch (error) {
            console.error("Error submitting study news:", error);
            alert("❌ Failed to submit news");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: "#2563EB", fontWeight: 600, mb: 4 }}>
                    Add Study News
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        
                        {/* Title Field (Single Title for both Form and SEO) */}
                        <Grid item xs={12}>
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

                        {/* --- SEO SETTINGS SECTION --- */}
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, mb: 1 }}>
                                <Typography variant="h6" sx={{ color: "#374151", fontWeight: 600 }}>
                                    SEO & URL Settings
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Box>
                        </Grid>

                        {/* Slug Field */}
                        <Grid item xs={12} md={6}>
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

                        {/* Keywords Field */}
                        <Grid item xs={12} md={6}>
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

                        {/* Meta Description Field */}
                        <Grid item xs={12}>
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
                        {/* ----------------------------- */}

                        {/* Cover Image Field (URL + Upload) */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                Cover Image
                            </Typography>
                            
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { xs: "stretch", sm: "flex-start" } }}>
                                {/* URL Input */}
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

                                    {/* Upload Button */}
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

                            {/* Image Preview */}
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
                                            // Fallback if the pasted URL is broken
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

                        {/* Rich Description Field with Preview Button */}
                        <Grid item xs={12}>
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
                                    Preview Editor
                                </Button>
                            </Box>
                            <TipTapEditor
                                content={news.description}
                                onChange={(value) =>
                                    setNews((prev) => ({ ...prev, description: value }))
                                }
                            />
                            <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 1, fontSize: 12, color: "#4B5563" }}
                            >
                                You can paste images or use HTML-friendly formatting.
                            </Typography>
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isUploading}
                                sx={{ px: 4, py: 1.5, mt: 2 }}
                            >
                                {isUploading ? "Publishing..." : "Publish News"}
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
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '1px solid #e0e0e0' }}>
                    Study News Editor Preview
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#f9f9f9', minHeight: '400px', p: 4 }}>
                    <Paper elevation={1} sx={{ p: 3, minHeight: '350px' }}>
                        {news.description ? (
                            <Box 
                                className="prose max-w-none" 
                                // ✅ We run decodeHtml() before rendering it
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