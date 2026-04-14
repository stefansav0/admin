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
    IconButton,
} from "@mui/material";
// Using a generic close icon for removing the image (optional but good for UX)
import TipTapEditor from "../../../components/TipTapEditor"; // adjust path as needed

const initialState = {
    title: "",
    description: "",
    coverImage: "", // ✅ Added cover image field
};

export default function AdminAddStudyNews() {
    const [news, setNews] = useState(initialState);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNews((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Handle Image Upload (Converts file to Base64 String)
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

    // ✅ Remove the uploaded image
    const handleRemoveImage = () => {
        setNews((prev) => ({ ...prev, coverImage: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!news.title || !news.description) {
            alert("Please fill in all required fields.");
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
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: "#2563EB", fontWeight: 600, mb: 4 }}>
                    Add Study News
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        
                        {/* Title Field */}
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

                        {/* Cover Image Field */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Cover Image
                            </Typography>
                            
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{ textTransform: "none" }}
                                >
                                    Upload Image
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </Button>

                                {/* Image Preview */}
                                {news.coverImage && (
                                    <Box sx={{ position: "relative", mt: 1 }}>
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
                            </Box>
                        </Grid>

                        {/* Rich Description Field */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Description <span style={{ color: "#DC2626" }}>*</span>
                            </Typography>
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
                                sx={{ px: 4, py: 1.5 }}
                            >
                                {isUploading ? "Publishing..." : "Publish News"}
                            </Button>
                        </Grid>
                        
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}