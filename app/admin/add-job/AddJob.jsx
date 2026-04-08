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
    IconButton,
} from "@mui/material";

import {
    Lock,
    LockOpen,
    AddCircleOutline,
    RemoveCircleOutline,
    CloudUpload,
} from "@mui/icons-material";

const initialState = {
    title: "",
    department: "",
    eligibility: "",
    category: "",
    description: "",
    applyLink: "", // Keeping this if you still need a primary direct link
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
        // Updated to handle multiple dynamic links
        applyOnline: [{ label: "Apply Online", url: "" }],
        downloadNotification: [{ label: "Download Notification", url: "", file: null, fileName: "" }],
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

    // Standard text field changes
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

    // Handlers for dynamic array fields (Apply Online & Notifications)
    const handleDynamicLinkChange = (category, index, field, value) => {
        const updatedArray = [...jobData.importantLinks[category]];
        updatedArray[index][field] = value;
        setJobData((prev) => ({
            ...prev,
            importantLinks: { ...prev.importantLinks, [category]: updatedArray },
        }));
    };

    const handleFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const updatedArray = [...jobData.importantLinks.downloadNotification];
            updatedArray[index].file = file;
            updatedArray[index].fileName = file.name;
            updatedArray[index].url = ""; // Clear URL if file is uploaded
            setJobData((prev) => ({
                ...prev,
                importantLinks: { ...prev.importantLinks, downloadNotification: updatedArray },
            }));
        }
    };

    const addDynamicLink = (category, template) => {
        setJobData((prev) => ({
            ...prev,
            importantLinks: {
                ...prev.importantLinks,
                [category]: [...prev.importantLinks[category], template],
            },
        }));
    };

    const removeDynamicLink = (category, index) => {
        const updatedArray = jobData.importantLinks[category].filter((_, i) => i !== index);
        setJobData((prev) => ({
            ...prev,
            importantLinks: { ...prev.importantLinks, [category]: updatedArray },
        }));
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

        try {
            // Because we are uploading files, we MUST use FormData instead of a standard JSON object
            const formData = new FormData();

            // 1. Append standard flat fields
            const textFields = ["title", "department", "eligibility", "category", "description", "applyLink", "lastDate", "ageLimit", "applicationFee", "vacancy"];
            textFields.forEach((field) => {
                formData.append(field, jobData[field].trim());
            });

            // 2. Append Important Dates (as JSON string)
            formData.append("importantDates", JSON.stringify(jobData.importantDates));

            // 3. Append Official Website
            formData.append("officialWebsite", jobData.importantLinks.officialWebsite.trim());

            // 4. Append Dynamic Apply Links (as JSON string)
            formData.append("applyOnline", JSON.stringify(jobData.importantLinks.applyOnline));

            // 5. Append Notification Links & Files
            const notificationData = [];
            jobData.importantLinks.downloadNotification.forEach((item, index) => {
                if (item.file) {
                    // Append the actual file to FormData
                    const fileKey = `notification_file_${index}`;
                    formData.append(fileKey, item.file);
                    
                    // Keep a record of it for the database payload
                    notificationData.push({ label: item.label, fileKey: fileKey, isUploadedFile: true });
                } else {
                    notificationData.push({ label: item.label, url: item.url, isUploadedFile: false });
                }
            });
            formData.append("downloadNotification", JSON.stringify(notificationData));

            const res = await axios.post(
                "https://www.finderight.com/api/jobs",
                formData
                
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
                            ["applyLink", "Direct Apply Link (Main URL)", { required: false }], // Kept as optional legacy support
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

                        {/* --- NEW DYNAMIC LINKS SECTION --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>🔗 Multiple Apply Online Links</Divider>
                            {jobData.importantLinks.applyOnline.map((item, index) => (
                                <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Link Label (e.g., Registration / Login)"
                                            value={item.label}
                                            onChange={(e) => handleDynamicLinkChange("applyOnline", index, "label", e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={7}>
                                        <TextField
                                            fullWidth
                                            label="URL"
                                            value={item.url}
                                            onChange={(e) => handleDynamicLinkChange("applyOnline", index, "url", e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton color="error" onClick={() => removeDynamicLink("applyOnline", index)} disabled={jobData.importantLinks.applyOnline.length === 1}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddCircleOutline />} onClick={() => addDynamicLink("applyOnline", { label: "Apply Online Server 2", url: "" })} variant="text">
                                Add Another Apply Link
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>📄 Notification Downloads (Links or File Upload)</Divider>
                            {jobData.importantLinks.downloadNotification.map((item, index) => (
                                <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Label (e.g., Download English PDF)"
                                            value={item.label}
                                            onChange={(e) => handleDynamicLinkChange("downloadNotification", index, "label", e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="URL (Leave blank if uploading file)"
                                            value={item.url}
                                            disabled={!!item.file}
                                            onChange={(e) => handleDynamicLinkChange("downloadNotification", index, "url", e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Button
                                            variant={item.file ? "contained" : "outlined"}
                                            component="label"
                                            fullWidth
                                            startIcon={<CloudUpload />}
                                            color={item.file ? "success" : "primary"}
                                            sx={{ height: '40px' }}
                                        >
                                            {item.fileName || "Upload PDF File"}
                                            <input
                                                type="file"
                                                hidden
                                                accept="application/pdf"
                                                onChange={(e) => handleFileChange(index, e)}
                                            />
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton color="error" onClick={() => removeDynamicLink("downloadNotification", index)} disabled={jobData.importantLinks.downloadNotification.length === 1}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button startIcon={<AddCircleOutline />} onClick={() => addDynamicLink("downloadNotification", { label: "Download Hindi PDF", url: "", file: null, fileName: "" })} variant="text">
                                Add Another Notification Option
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>🌐 Official Website</Divider>
                            <TextField
                                fullWidth
                                label="OFFICIAL WEBSITE URL"
                                name="importantLinks.officialWebsite"
                                value={jobData.importantLinks.officialWebsite}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>

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