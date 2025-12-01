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
} from "@mui/material";
import axios from "axios";

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post("https://www.finderight.com/api/documents", formData);
            alert("✅ Document added successfully!");
            setFormData(initialState);
            console.log(res.data);
        } catch (err) {
            console.error("❌ Failed to add document:", err);
            alert("❌ Failed to add document");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Add New Government Document
                </Typography>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={2}>
                        {/* Title */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Document Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Aadhaar Card Services"
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
                                placeholder="e.g., Aadhaar, PAN, EPFO"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Service Type"
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleChange}
                                placeholder="e.g., Download, Apply, Check Status"
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Short description about the service"
                            />
                        </Grid>

                        {/* Service Link */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Service Link"
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={submitting}
                            >
                                {submitting ? "Submitting..." : "Submit Document"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminAddDocument;
