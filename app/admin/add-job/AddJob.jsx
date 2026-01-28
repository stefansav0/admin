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
    Alert,
    CircularProgress,
} from "@mui/material";

import {
    Lock,
    LockOpen,
} from "@mui/icons-material";

const initialState = {
    title: "",
    department: "",
    eligibility: "", // Now used for HTML/Markdown content
    category: "",
    description: "",
    applyLink: "",
    lastDate: "",
    ageLimit: "",
    applicationFee: "", 
    vacancy: "", 
    importantDates: {
        applicationBegin: "",
        lastDateApply: "",
        lastDateFee: "",
        examDate: "",
        admitCard: "",
    },
    importantLinks: {
        applyOnline: "",
        downloadNotification: "",
        officialWebsite: "",
    },
};

export default function AddJob() {
    const [jobData, setJobData] = useState(initialState);
    const [auth, setAuth] = useState(false);
    const [secret, setSecret] = useState("");
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [group, key] = name.split(".");
            setJobData((prev) => ({
                ...prev,
                [group]: { ...prev[group], [key]: value },
            }));
        } else {
            setJobData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAuth = () => {
        if (secret === "mychudail") {
            setAuth(true);
            setAuthError(null);
        } else {
            setAuthError("Incorrect secret key. Access denied.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        const cleanedJobData = {
            ...jobData,
            applyLink: jobData.applyLink.trim(),
            lastDate: jobData.lastDate.trim(),
            title: jobData.title.trim(),
            department: jobData.department.trim(),
            category: jobData.category.trim(),
            eligibility: jobData.eligibility.trim(),
            ageLimit: jobData.ageLimit.trim(),
            description: jobData.description.trim(),
            applicationFee: jobData.applicationFee.trim(),
            vacancy: jobData.vacancy.trim(),
        };

        try {
            const res = await axios.post(
                "https://www.finderight.com/api/jobs",
                cleanedJobData
            );
            setStatusMessage({ message: "Job added successfully!", severity: "success" });
            setJobData(initialState);
        } catch (err) {
            console.error("❌ Error:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error";
            setStatusMessage({ message: `Failed to add job: ${errorMessage}`, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (!auth) {
        return (
            <Box sx={{ p: 4, maxWidth: 450, mx: "auto", mt: 10 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, borderLeft: '5px solid #1976d2' }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <Lock sx={{ mr: 1, color: '#1976d2' }} />
                        Admin Access Required
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Please enter the secret administrative key to unlock the job submission form.
                    </Typography>

                    {authError && (
                        <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>
                    )}

                    <TextField
                        fullWidth
                        type="password"
                        label="Secret Key"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAuth(); }}
                        margin="normal"
                        required
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAuth}
                        fullWidth
                        sx={{ mt: 2, py: 1.5 }}
                        startIcon={<LockOpen />}
                    >
                        Unlock Form
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #00acc1' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#00acc1', mb: 4 }}>
                    Job Post Administration
                </Typography>
                <Typography variant="subtitle1" gutterBottom align="center" sx={{ color: 'text.secondary', mb: 4 }}>
                    Use this form to add new job recruitment details, important dates, and links.
                </Typography>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 3 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 2, fontWeight: 'bold' }}>📋 Job Identification</Divider>
                        </Grid>
                        {[
                            ["title", "Job Title (e.g., SSC CGL 2024)"],
                            ["department", "Issuing Department/Body"],
                            ["category", "Category (e.g., Govt, Bank, Rail)"],
                        ].map(([name, label]) => (
                            <Grid item key={name} xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    required
                                    name={name}
                                    label={label}
                                    value={jobData[name]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>⏳ Deadlines & Links</Divider>
                        </Grid>
                        {[
                            ["lastDate", "Application Last Date (YYYY-MM-DD)", { type: 'date', required: true }],
                            ["ageLimit", "Age Limit (e.g., 18-30)", { required: false }],
                            ["applyLink", "Direct Apply Link (URL)", { required: true }],
                        ].map(([name, label, options]) => (
                            <Grid item key={name} xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    required={options.required}
                                    type={options.type || 'text'}
                                    name={name}
                                    label={label}
                                    value={jobData[name]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    InputLabelProps={{ shrink: (options.type === 'date') || !!jobData[name] }}
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>📄 Detailed Description</Divider>
                            <TextField
                                fullWidth
                                required
                                name="description"
                                label="Comprehensive Job Description / Notification Summary"
                                multiline
                                rows={4}
                                value={jobData.description}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        {/* --- Eligibility, Fee & Vacancy (HTML Support) --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>🎓 Eligibility Criteria</Divider>
                            <TextField
                                fullWidth
                                required
                                name="eligibility"
                                label="Eligibility Criteria (Use HTML or Markdown for lists/tables)"
                                multiline
                                rows={4}
                                value={jobData.eligibility}
                                onChange={handleChange}
                                variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>Enter detailed educational requirements. Supports HTML lists and tables.</Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Divider sx={{ mb: 2, fontWeight: 'bold', color: '#388e3c' }}>💸 Application Fee Details</Divider>
                            <TextField
                                fullWidth
                                name="applicationFee"
                                label="Application Fee Details (Use HTML or Markdown)"
                                multiline
                                rows={6}
                                value={jobData.applicationFee}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Divider sx={{ mb: 2, fontWeight: 'bold', color: '#ff9800' }}>📌 Vacancy Details</Divider>
                            <TextField
                                fullWidth
                                name="vacancy"
                                label="Vacancy Details (Use HTML or Markdown)"
                                multiline
                                rows={6}
                                value={jobData.vacancy}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>📅 Key Timeline Dates</Divider>
                        </Grid>
                        {Object.keys(jobData.importantDates).map((field) => (
                            <Grid item key={`importantDates.${field}`} xs={12} sm={6} md={4} lg={2.4}>
                                <TextField
                                    fullWidth
                                    label={field.replace(/([A-Z])/g, " $1").toUpperCase()}
                                    name={`importantDates.${field}`}
                                    value={jobData.importantDates[field]}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>🔗 Official Resources (URLs)</Divider>
                        </Grid>
                        {Object.entries(jobData.importantLinks).map(([key, val]) => (
                            <Grid item key={`importantLinks.${key}`} xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label={key.replace(/([A-Z])/g, " $1").toUpperCase()}
                                    name={`importantLinks.${key}`}
                                    value={val}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12} sx={{ textAlign: 'center', pt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {loading ? "Submitting..." : "Publish New Job Post"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}