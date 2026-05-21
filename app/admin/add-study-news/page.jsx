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
    MenuItem,
    Divider,
} from "@mui/material";

import TipTapEditor from "../../../components/TipTapEditor";

const initialState = {
    title: "",
    slug: "",
    author: "",
    visibility: "draft",

    description: "",

    coverImage: "",
    imageUrl: "",

    metaDescription: "",
    keywords: "",

    seoTitle: "",
};

export default function AdminAddStudyNews() {
    const [news, setNews] = useState(initialState);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Auto generate slug from title
        if (name === "title") {
            const generatedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");

            setNews((prev) => ({
                ...prev,
                title: value,
                slug: generatedSlug,
            }));
        } else {
            setNews((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Image Upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image.");
            return;
        }

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
            setNews((prev) => ({
                ...prev,
                coverImage: reader.result,
            }));
        };

        reader.onerror = () => {
            alert("Failed to upload image");
        };
    };

    const handleRemoveImage = () => {
        setNews((prev) => ({
            ...prev,
            coverImage: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!news.title || !news.description) {
            alert("Please fill required fields");
            return;
        }

        setIsUploading(true);

        try {
            await axios.post(
                "https://www.finderight.com/api/study-news",
                news
            );

            alert("✅ Study news published successfully!");

            setNews(initialState);
        } catch (error) {
            console.error(error);
            alert("❌ Failed to publish news");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography
                    variant="h5"
                    sx={{
                        color: "#2563EB",
                        fontWeight: 700,
                        mb: 4,
                    }}
                >
                    Add Study News
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>

                        {/* TITLE */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Title *
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

                        {/* SLUG */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">
                                Slug
                            </Typography>

                            <TextField
                                fullWidth
                                name="slug"
                                placeholder="seo-friendly-url"
                                value={news.slug}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* AUTHOR */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">
                                Author Name *
                            </Typography>

                            <TextField
                                fullWidth
                                name="author"
                                placeholder="Your Name"
                                value={news.author}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* VISIBILITY */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">
                                Visibility Status
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                name="visibility"
                                value={news.visibility}
                                onChange={handleChange}
                            >
                                <MenuItem value="draft">
                                    Draft (Hidden from Public)
                                </MenuItem>

                                <MenuItem value="published">
                                    Published
                                </MenuItem>
                            </TextField>
                        </Grid>

                        {/* SEO TITLE */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">
                                SEO Title
                            </Typography>

                            <TextField
                                fullWidth
                                name="seoTitle"
                                placeholder="SEO optimized title"
                                value={news.seoTitle}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                SEO & Discovery
                            </Divider>
                        </Grid>

                        {/* META DESCRIPTION */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Meta Description
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="metaDescription"
                                placeholder="Write SEO meta description for Google search"
                                value={news.metaDescription}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* KEYWORDS */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Keywords for Organic SEO
                            </Typography>

                            <TextField
                                fullWidth
                                name="keywords"
                                placeholder="study news, exam update, government jobs, result 2026"
                                value={news.keywords}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                Cover Image
                            </Divider>
                        </Grid>

                        {/* IMAGE URL */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Image URL
                            </Typography>

                            <TextField
                                fullWidth
                                name="imageUrl"
                                placeholder="https://example.com/image.jpg"
                                value={news.imageUrl}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* IMAGE UPLOAD */}
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                            >
                                Upload Image

                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </Button>

                            {(news.coverImage || news.imageUrl) && (
                                <Box sx={{ mt: 2 }}>
                                    <img
                                        src={
                                            news.coverImage ||
                                            news.imageUrl
                                        }
                                        alt="Preview"
                                        style={{
                                            width: "100%",
                                            maxHeight: "300px",
                                            objectFit: "cover",
                                            borderRadius: "10px",
                                        }}
                                    />

                                    {news.coverImage && (
                                        <Button
                                            color="error"
                                            sx={{ mt: 1 }}
                                            onClick={handleRemoveImage}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Grid>

                        {/* DESCRIPTION */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Description *
                            </Typography>

                            <TipTapEditor
                                content={news.description}
                                onChange={(value) =>
                                    setNews((prev) => ({
                                        ...prev,
                                        description: value,
                                    }))
                                }
                            />
                        </Grid>

                        {/* SUBMIT */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isUploading}
                                sx={{
                                    px: 5,
                                    py: 1.5,
                                    fontWeight: 600,
                                }}
                            >
                                {isUploading
                                    ? "Publishing..."
                                    : "Publish News"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}