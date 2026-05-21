"use client";

import React, {
    useEffect,
    useState,
} from "react";

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
    CircularProgress,
} from "@mui/material";

import {
    useParams,
    useRouter,
} from "next/navigation";

import TipTapEditor from "../../../../components/TipTapEditor";

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

export default function AdminEditStudyNews() {
    const params = useParams();

    const router = useRouter();

    const slug = params?.slug;

    const [news, setNews] =
        useState(initialState);

    const [loading, setLoading] =
        useState(true);

    const [isUpdating, setIsUpdating] =
        useState(false);

    /* =========================================
       FETCH EXISTING ARTICLE
    ========================================= */
    useEffect(() => {
        if (!slug) return;

        fetchNews();
    }, [slug]);

    const fetchNews = async () => {
        try {
            const res = await axios.get(
                `https://www.finderight.com/api/study-news/${slug}`
            );

            const data =
                res.data.news || res.data;

            setNews({
                title: data.title || "",

                slug: data.slug || "",

                author: data.author || "",

                visibility:
                    data.visibility ||
                    "draft",

                description:
                    data.description ||
                    "",

                coverImage:
                    data.coverImage ||
                    "",

                imageUrl:
                    data.imageUrl || "",

                metaDescription:
                    data.metaDescription ||
                    "",

                keywords:
                    Array.isArray(
                        data.keywords
                    )
                        ? data.keywords.join(
                              ", "
                          )
                        : "",

                seoTitle:
                    data.seoTitle || "",
            });
        } catch (error) {
            console.error(error);

            alert(
                "❌ Failed to load article"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       HANDLE INPUT CHANGE
    ========================================= */
    const handleChange = (e) => {
        const { name, value } =
            e.target;

        // Auto slug generate
        if (name === "title") {
            const generatedSlug =
                value
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9\s-]/g,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        "-"
                    );

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

    /* =========================================
       IMAGE UPLOAD
    ========================================= */
    const handleImageUpload = (
        e
    ) => {
        const file =
            e.target.files[0];

        if (!file) return;

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            alert(
                "Please upload a valid image"
            );

            return;
        }

        const reader =
            new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
            setNews((prev) => ({
                ...prev,

                coverImage:
                    reader.result,
            }));
        };

        reader.onerror = () => {
            alert(
                "Failed to upload image"
            );
        };
    };

    /* =========================================
       REMOVE IMAGE
    ========================================= */
    const handleRemoveImage = () => {
        setNews((prev) => ({
            ...prev,

            coverImage: "",
        }));
    };

    /* =========================================
       UPDATE ARTICLE
    ========================================= */
    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        if (
            !news.title ||
            !news.description
        ) {
            alert(
                "Please fill all required fields"
            );

            return;
        }

        setIsUpdating(true);

        try {
            await axios.patch(
                `https://www.finderight.com/api/study-news/${slug}`,
                news
            );

            alert(
                "✅ Study news updated successfully"
            );

            router.push(
                "/admin/study-news"
            );
        } catch (error) {
            console.error(error);

            alert(
                "❌ Failed to update study news"
            );
        } finally {
            setIsUpdating(false);
        }
    };

    /* =========================================
       LOADING UI
    ========================================= */
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                maxWidth: 1000,

                mx: "auto",

                mt: 4,
            }}
        >
            <Paper sx={{ p: 4 }}>

                {/* HEADER */}
                <Typography
                    variant="h5"
                    sx={{
                        color: "#2563EB",

                        fontWeight: 700,

                        mb: 4,
                    }}
                >
                    Edit Study News
                </Typography>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <Grid
                        container
                        spacing={3}
                    >

                        {/* TITLE */}
                        <Grid
                            item
                            xs={12}
                        >
                            <Typography variant="subtitle1">
                                Title *
                            </Typography>

                            <TextField
                                fullWidth
                                required
                                name="title"
                                value={
                                    news.title
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter title"
                            />
                        </Grid>

                        {/* SLUG */}
                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <Typography variant="subtitle1">
                                Slug
                            </Typography>

                            <TextField
                                fullWidth
                                name="slug"
                                value={
                                    news.slug
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </Grid>

                        {/* AUTHOR */}
                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <Typography variant="subtitle1">
                                Author
                            </Typography>

                            <TextField
                                fullWidth
                                name="author"
                                value={
                                    news.author
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </Grid>

                        {/* VISIBILITY */}
                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <Typography variant="subtitle1">
                                Visibility
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                name="visibility"
                                value={
                                    news.visibility
                                }
                                onChange={
                                    handleChange
                                }
                            >
                                <MenuItem value="draft">
                                    Draft
                                </MenuItem>

                                <MenuItem value="published">
                                    Published
                                </MenuItem>
                            </TextField>
                        </Grid>

                        {/* SEO TITLE */}
                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <Typography variant="subtitle1">
                                SEO Title
                            </Typography>

                            <TextField
                                fullWidth
                                name="seoTitle"
                                value={
                                    news.seoTitle
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="SEO title"
                            />
                        </Grid>

                        {/* SEO */}
                        <Grid item xs={12}>
                            <Divider>
                                SEO & Discovery
                            </Divider>
                        </Grid>

                        {/* META DESCRIPTION */}
                        <Grid
                            item
                            xs={12}
                        >
                            <Typography variant="subtitle1">
                                Meta Description
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="metaDescription"
                                value={
                                    news.metaDescription
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </Grid>

                        {/* KEYWORDS */}
                        <Grid
                            item
                            xs={12}
                        >
                            <Typography variant="subtitle1">
                                Keywords
                            </Typography>

                            <TextField
                                fullWidth
                                name="keywords"
                                value={
                                    news.keywords
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="seo, keywords, separated, by, comma"
                            />
                        </Grid>

                        {/* IMAGE */}
                        <Grid item xs={12}>
                            <Divider>
                                Cover Image
                            </Divider>
                        </Grid>

                        {/* IMAGE URL */}
                        <Grid
                            item
                            xs={12}
                        >
                            <Typography variant="subtitle1">
                                Image URL
                            </Typography>

                            <TextField
                                fullWidth
                                name="imageUrl"
                                value={
                                    news.imageUrl
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="https://example.com/image.jpg"
                            />
                        </Grid>

                        {/* IMAGE UPLOAD */}
                        <Grid
                            item
                            xs={12}
                        >
                            <Button
                                variant="outlined"
                                component="label"
                            >
                                Upload Image

                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleImageUpload
                                    }
                                />
                            </Button>

                            {(news.coverImage ||
                                news.imageUrl) && (
                                <Box
                                    sx={{
                                        mt: 2,
                                    }}
                                >
                                    <img
                                        src={
                                            news.coverImage ||
                                            news.imageUrl
                                        }
                                        alt="Preview"
                                        style={{
                                            width: "100%",

                                            maxHeight:
                                                "320px",

                                            objectFit:
                                                "cover",

                                            borderRadius:
                                                "12px",
                                        }}
                                    />

                                    {news.coverImage && (
                                        <Button
                                            color="error"
                                            sx={{
                                                mt: 1,
                                            }}
                                            onClick={
                                                handleRemoveImage
                                            }
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Grid>

                        {/* DESCRIPTION */}
                        <Grid
                            item
                            xs={12}
                        >
                            <Typography variant="subtitle1">
                                Description *
                            </Typography>

                            <TipTapEditor
                                content={
                                    news.description
                                }
                                onChange={(
                                    value
                                ) =>
                                    setNews(
                                        (
                                            prev
                                        ) => ({
                                            ...prev,

                                            description:
                                                value,
                                        })
                                    )
                                }
                            />
                        </Grid>

                        {/* BUTTONS */}
                        <Grid
                            item
                            xs={12}
                        >
                            <Box
                                display="flex"
                                gap={2}
                                flexWrap="wrap"
                            >

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={
                                        isUpdating
                                    }
                                    sx={{
                                        px: 5,

                                        py: 1.5,

                                        fontWeight: 700,
                                    }}
                                >
                                    {isUpdating
                                        ? "Updating..."
                                        : "Update News"}
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() =>
                                        router.back()
                                    }
                                >
                                    Cancel
                                </Button>

                            </Box>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}