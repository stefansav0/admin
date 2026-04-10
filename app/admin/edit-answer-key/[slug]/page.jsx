"use client";

import React, { useState, useEffect } from "react";
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
    AddCircleOutline,
    RemoveCircleOutline,
    SaveOutlined,
    ArrowBack,
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered
} from "@mui/icons-material";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// --- TipTap Editor Component ---
const TipTapEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        immediatelyRender: false, // Prevents SSR hydration mismatch
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[150px] p-4',
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-50 border-b border-gray-300 p-1 flex gap-1">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? "secondary" : "default"}>
                    <FormatBold fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? "secondary" : "default"}>
                    <FormatItalic fontSize="small" />
                </IconButton>
                <Divider orientation="vertical" flexItem className="mx-1" />
                <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? "secondary" : "default"}>
                    <FormatListBulleted fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? "secondary" : "default"}>
                    <FormatListNumbered fontSize="small" />
                </IconButton>
            </div>
            <div className="cursor-text">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

// --- Main Edit Component ---
const AdminEditAnswerKey = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug;

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        const fetchAnswerKeyData = async () => {
            try {
                const res = await axios.get(`https://www.finderight.com/api/answer-keys/${slug}`);
                const data = res.data.answerKey || res.data; 

                // 🚨 SAFEGUARD: Handle both OLD (String) and NEW (Array) database schemas
                let parsedLinks = { downloadAnswerKey: [{ label: "Download Answer Key", url: "" }], officialWebsite: "" };

                if (data.importantLinks) {
                    if (Array.isArray(data.importantLinks.downloadAnswerKey)) {
                        parsedLinks.downloadAnswerKey = data.importantLinks.downloadAnswerKey;
                    } else if (typeof data.importantLinks.downloadAnswerKey === 'string' && data.importantLinks.downloadAnswerKey) {
                        parsedLinks.downloadAnswerKey = [{ label: "Download Answer Key", url: data.importantLinks.downloadAnswerKey }];
                    }
                    parsedLinks.officialWebsite = data.importantLinks.officialWebsite || "";
                }

                setFormData({
                    ...data,
                    importantLinks: parsedLinks
                });
            } catch (err) {
                console.error(err);
                setStatusMessage({ message: "Failed to load answer key data. It may have been deleted.", severity: "error" });
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchAnswerKeyData();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTipTapChange = (htmlContent) => {
        setFormData((prev) => ({ ...prev, howToCheck: htmlContent }));
    };

    const handleDynamicLinkChange = (index, field, value) => {
        const updatedLinks = [...formData.importantLinks.downloadAnswerKey];
        updatedLinks[index][field] = value;
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, downloadAnswerKey: updatedLinks }
        });
    };

    const addDynamicLink = () => {
        setFormData({
            ...formData,
            importantLinks: {
                ...formData.importantLinks,
                downloadAnswerKey: [...formData.importantLinks.downloadAnswerKey, { label: "New Download Link", url: "" }]
            }
        });
    };

    const removeDynamicLink = (index) => {
        const updatedLinks = formData.importantLinks.downloadAnswerKey.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, downloadAnswerKey: updatedLinks }
        });
    };

    const handleOfficialWebsiteChange = (e) => {
        setFormData({
            ...formData,
            importantLinks: { ...formData.importantLinks, officialWebsite: e.target.value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!formData.title || !formData.conductedby) {
            setStatusMessage({ message: "Title and Conducted By are required fields.", severity: "error" });
            return;
        }

        setSaving(true);

        try {
            await axios.put(`https://www.finderight.com/api/answer-keys/${slug}`, formData);
            setStatusMessage({ message: "Answer Key updated successfully! Redirecting...", severity: "success" });
            
            setTimeout(() => {
                router.push("/admin/manage-answer-keys"); // Adjust based on your routing
            }, 1000);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred.";
            setStatusMessage({ message: `Failed to update: ${errorMessage}`, severity: "error" });
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (!formData) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", mt: 10 }}>
                <Alert severity="error">{statusMessage?.message || "Data could not be loaded."}</Alert>
                <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/manage-answer-keys")}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => router.push("/admin/manage-answer-keys")} 
                sx={{ mb: 2 }}
                color="secondary"
            >
                Back to Answer Keys
            </Button>

            <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, borderTop: '8px solid #9c27b0' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 4 }}>
                    Edit Answer Key
                </Typography>

                {statusMessage && (
                    <Alert severity={statusMessage.severity} onClose={() => setStatusMessage(null)} sx={{ mb: 4 }}>
                        {statusMessage.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={3}>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Basic Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Title (SEO Optimized)"
                                name="title" value={formData.title} onChange={handleChange} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By (Authority)"
                                name="conductedby" value={formData.conductedby} onChange={handleChange} size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Key Dates (Free Text)</Divider>
                        </Grid>

                        {[
                            { label: "Application Begin", name: "applicationBegin" },
                            { label: "Last Date to Apply", name: "lastDateApply" },
                            { label: "Exam Date", name: "examDate" },
                            { label: "Admit Card Release", name: "admitcard" },
                            { label: "Answer Key Release", name: "answerKeyRelease" },
                            { label: "Publish Date", name: "publishDate" },
                        ].map(({ label, name }) => (
                            <Grid item xs={12} sm={6} md={4} key={name}>
                                <TextField
                                    fullWidth label={label} name={name}
                                    value={formData[name] || ""} onChange={handleChange} size="small"
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📖 How to Check / Details</Divider>
                            <TipTapEditor 
                                content={formData.howToCheck} 
                                onChange={handleTipTapChange} 
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#9c27b0' }}>
                                🔗 Download Links
                            </Divider>
                        </Grid>

                        {formData.importantLinks.downloadAnswerKey.map((link, index) => (
                            <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2, px: 3 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Label"
                                        value={link.label} onChange={(e) => handleDynamicLinkChange(index, "label", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="URL"
                                        value={link.url} onChange={(e) => handleDynamicLinkChange(index, "url", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <IconButton color="error" onClick={() => removeDynamicLink(index)} disabled={formData.importantLinks.downloadAnswerKey.length === 1}>
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}

                        <Grid item xs={12} sx={{ pl: 3 }}>
                            <Button startIcon={<AddCircleOutline />} onClick={addDynamicLink} variant="text" color="secondary">
                                Add Another Link
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🌐 Official Website</Divider>
                            <TextField
                                fullWidth size="small" label="Official Website URL"
                                value={formData.importantLinks.officialWebsite || ""} onChange={handleOfficialWebsiteChange}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                            <Button 
                                type="submit" variant="contained" color="secondary" disabled={saving}
                                sx={{ py: 1.5, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                            >
                                {saving ? "Saving Changes..." : "Update Answer Key"}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminEditAnswerKey;