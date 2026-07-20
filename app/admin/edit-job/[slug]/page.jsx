"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
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
    ArrowBack
} from "@mui/icons-material";

const initialState = {
    title: "",
    slug: "",
    department: "",
    category: "",
    lastDate: "",
    seoKeywords: "",
    metaDescription: "",
    description: "",
    ageLimit: "",
    eligibility: "",
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
        applyOnline: [{ label: "Apply Online", url: "" }],
        downloadNotification: [{ label: "Download Notification", url: "", file: null, fileName: "" }],
        officialWebsite: "",
    },
};

export default function EditJobDynamic() {
    const params = useParams();
    const router = useRouter();
    
    // Automatically extracts the slug from the URL (e.g., 'army-jag-online-form-2026')
    const currentSlug = params?.slug; 

    const [jobData, setJobData] = useState(initialState);
    const [auth, setAuth] = useState(false);
    const [secret, setSecret] = useState("");
    
    const [isFetching, setIsFetching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    // Auto-fetch data once authenticated
    useEffect(() => {
        if (auth && currentSlug) {
            fetchJobData(currentSlug);
        }
    }, [auth, currentSlug]);

    const handleAuth = () => {
        if (secret === "mychudail") {
            setAuth(true);
            setAuthError(null);
        } else {
            setAuthError("Incorrect secret key. Access denied.");
        }
    };

    const fetchJobData = async (slugToFetch) => {
        setIsFetching(true);
        setStatusMessage(null);
        
        try {
            const res = await axios.get(`https://www.finderight.com/api/jobs/${slugToFetch}`);
            const data = res.data;

            const safeParseJSON = (val, fallback) => {
                if (!val) return fallback;
                if (typeof val === "string") {
                    try { return JSON.parse(val); } catch (e) { return fallback; }
                }
                return val;
            };

            setJobData({
                title: data.title || "",
                slug: data.slug || "",
                department: data.department || "",
                category: data.category || "",
                lastDate: data.lastDate || "",
                seoKeywords: data.seoKeywords || "",
                metaDescription: data.metaDescription || "",
                description: data.description || "",
                ageLimit: data.ageLimit || "",
                eligibility: data.eligibility || "",
                applicationFee: data.applicationFee || "",
                vacancy: data.vacancy || "",
                importantDates: safeParseJSON(data.importantDates, initialState.importantDates),
                importantLinks: {
                    applyOnline: safeParseJSON(data.importantLinks?.applyOnline, initialState.importantLinks.applyOnline),
                    downloadNotification: safeParseJSON(data.importantLinks?.downloadNotification, initialState.importantLinks.downloadNotification).map(item => ({
                        ...item,
                        file: null,
                        fileName: ""
                    })),
                    officialWebsite: data.importantLinks?.officialWebsite || "",
                }
            });
        } catch (err) {
            console.error(err);
            setStatusMessage({ 
                message: "Job not found in the database. Please check the URL.", 
                severity: "error" 
            });
        } finally {
            setIsFetching(false);
        }
    };

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
            updatedArray[index].url = ""; 
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        try {
            const formData = new FormData();

            const textFields = [
                "title", "slug", "department", "category", "lastDate", 
                "seoKeywords", "metaDescription", "description", 
                "ageLimit", "eligibility", "applicationFee", "vacancy"
            ];
            textFields.forEach((field) => {
                formData.append(field, jobData[field].trim());
            });

            formData.append("importantDates", JSON.stringify(jobData.importantDates));
            formData.append("officialWebsite", jobData.importantLinks.officialWebsite.trim());
            formData.append("applyOnline", JSON.stringify(jobData.importantLinks.applyOnline));

            const notificationData = [];
            jobData.importantLinks.downloadNotification.forEach((item, index) => {
                if (item.file) {
                    const fileKey = `notification_file_${index}`;
                    formData.append(fileKey, item.file);
                    notificationData.push({ label: item.label, fileKey: fileKey, isUploadedFile: true });
                } else {
                    notificationData.push({ label: item.label, url: item.url, isUploadedFile: false });
                }
            });
            formData.append("downloadNotification", JSON.stringify(notificationData));

            // Use the original slug from the URL to perform the update
            const res = await axios.put(
                `/api/jobs/${currentSlug}`,
                formData
            );

            setStatusMessage({ message: "Job updated successfully!", severity: "success" });
            
            // If the user changed the slug manually in the form, redirect them to the new URL
            if (jobData.slug !== currentSlug) {
                setTimeout(() => {
                    router.push(`/admin/edit-job/${jobData.slug}`);
                }, 1500);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("❌ Error:", err);
            if (err.response?.status === 413) {
                setStatusMessage({ 
                    message: "Upload Failed: Your PDF is too large. Vercel limits uploads to 4.5MB.", 
                    severity: "error" 
                });
            } else {
                const errorMessage = err.response?.data?.message || err.message || "Unknown error";
                setStatusMessage({ message: `Failed to update job: ${errorMessage}`, severity: "error" });
            }
        } finally {
            setLoading(false);
        }
    };

    const htmlFields = [
        { name: "description", label: "Comprehensive Job Description", color: "#9c27b0" },
        { name: "ageLimit", label: "Age Limit Details", color: "#e91e63" },
        { name: "eligibility", label: "Eligibility Criteria", color: "#1976d2" },
        { name: "applicationFee", label: "Application Fee Details", color: "#388e3c" },
        { name: "vacancy", label: "Vacancy Details", color: "#ff9800" },
    ];

    if (!auth) {
        return (
            <Box sx={{ p: 4, maxWidth: 450, mx: "auto", mt: 10 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, borderLeft: '5px solid #1976d2' }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <Lock sx={{ mr: 1, color: '#1976d2' }} />
                        Admin Access Required
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Enter the secret key to edit <strong>{currentSlug}</strong>
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

    if (isFetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column' }}>
                <CircularProgress size={60} color="warning" />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Fetching Job Details...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #ff9800' }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mb: 4 }}>
                    <IconButton 
                        onClick={() => router.push('/admin/dashboard')} // Fallback route
                        sx={{ position: 'absolute', left: 0 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" align="center" sx={{ width: '100%', fontWeight: 700, color: '#f57c00' }}>
                        Edit Job Post
                    </Typography>
                </Box>

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
                            ["slug", "URL Slug (e.g., ssc-cgl-2024)"], 
                            ["department", "Issuing Department/Body"],
                            ["category", "Category (e.g., Govt, Bank, Rail)"],
                        ].map(([name, label]) => (
                            <Grid item key={name} xs={12} sm={6} md={3}>
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
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>🔍 SEO Details</Divider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                name="metaDescription"
                                label="Meta Description"
                                value={jobData.metaDescription}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                name="seoKeywords"
                                label="SEO Keywords (comma separated)"
                                value={jobData.seoKeywords}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>⏳ Deadlines</Divider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="text" 
                                name="lastDate"
                                label="Application Last Date (e.g., 25th Jan 2024)"
                                value={jobData.lastDate}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 4, mb: 1, fontWeight: 'bold' }}>✍️ Rich Text & HTML Content</Divider>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                You can use standard text or HTML tags like <code>&lt;b&gt;</code>, <code>&lt;br&gt;</code>, <code>&lt;ul&gt;</code>. A live preview is generated on the right.
                            </Typography>
                        </Grid>

                        {htmlFields.map((field) => (
                            <React.Fragment key={field.name}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: field.color, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        {field.label}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        name={field.name}
                                        label={`${field.label} (HTML Supported)`}
                                        multiline
                                        rows={6}
                                        value={jobData[field.name]}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2, 
                                            height: '100%', 
                                            minHeight: '165px', 
                                            maxHeight: '165px', 
                                            overflowY: 'auto', 
                                            bgcolor: '#f8f9fa',
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                                            Live Preview
                                        </Typography>
                                        <Box 
                                            sx={{ 
                                                fontSize: '0.9rem', 
                                                fontFamily: 'inherit',
                                                '& ul': { paddingLeft: '20px', margin: '8px 0' },
                                                '& p': { margin: '0 0 8px 0' },
                                                '& table': { width: '100%', borderCollapse: 'collapse' },
                                                '& td, & th': { border: '1px solid #ddd', padding: '4px' }
                                            }}
                                            dangerouslySetInnerHTML={{ 
                                                __html: jobData[field.name] || "<span style='color: #aaa; font-style: italic;'>Preview will appear here...</span>" 
                                            }} 
                                        />
                                    </Paper>
                                </Grid>
                            </React.Fragment>
                        ))}

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>📅 Key Timeline Dates</Divider>
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
                                            {item.fileName || "Upload New PDF File"}
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
                                color="warning" 
                                disabled={loading}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {loading ? "Updating..." : "Update Job Post"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}