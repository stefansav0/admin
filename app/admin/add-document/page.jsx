"use client";

import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Divider,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    CheckCircleOutline,
    DescriptionOutlined,
    Link as LinkIcon
} from "@mui/icons-material";
import axios from "axios";
import { useRouter } from "next/navigation";

const initialState = {
    title: "",
    category: "",
    serviceType: "",
    description: "",
    link: "",
};

const AdminAddDocument = () => {
    const [formData, setFormData] = useState(initialState);
    const [submitting, setSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!formData.title || !formData.link) {
            setStatusMessage({ message: "Title and Service Link are required.", severity: "error" });
            return;
        }

        setSubmitting(true);

        try {
            await axios.post("https://www.finderight.com/api/documents", formData);
            
            setStatusMessage({ message: "Document added successfully! Redirecting...", severity: "success" });
            setFormData(initialState);
            
            setTimeout(() => {
                router.push("/admin/manage-documents");
            }, 1000);
        } catch (err) {
            console.error("❌ Failed to add document:", err);
            const errorMessage = err.response?.data?.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to add document: ${errorMessage}`, severity: "error" });
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #475569' }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 1.5 }}>
                    <DescriptionOutlined sx={{ fontSize: 36, color: '#334155' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Add Government Document
                    </Typography>
                </Box>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={3}>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold', color: '#475569' }}>📋 Basic Details</Divider>
                        </Grid>

                        {/* Title */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth required
                                label="Document Title (SEO Optimized)"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Aadhaar Card Download & Update Services"
                                size="small"
                            />
                        </Grid>

                        {/* Category & Service Type */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g., Aadhaar, PAN, Voter ID"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Service Type"
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleChange}
                                placeholder="e.g., Download, Apply Online, Check Status"
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#475569' }}>📝 Description & Link</Divider>
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Short Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Write a brief, helpful description about this service..."
                            />
                        </Grid>

                        {/* Service Link */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                <LinkIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                                <TextField
                                    fullWidth required
                                    label="Direct Service URL"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    variant="standard"
                                />
                            </Box>
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={submitting}
                                sx={{ 
                                    py: 1.5, 
                                    px: 6, 
                                    fontSize: '1.1rem', 
                                    borderRadius: 8, 
                                    backgroundColor: '#475569', 
                                    '&:hover': { backgroundColor: '#334155' } 
                                }}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />}
                            >
                                {submitting ? "Publishing..." : "Publish Document Link"}
                            </Button>
                        </Grid>
                        
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminAddDocument;