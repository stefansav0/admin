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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import {
    AddCircleOutline,
    RemoveCircleOutline,
    SaveOutlined,
    ArrowBack,
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered,
    Visibility
} from "@mui/icons-material";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// --- TipTap Editor Component ---
const TipTapEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[150px] p-4',
            },
        },
    });

    // Update editor content if it changes externally (e.g., when data loads)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

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
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        const fetchAnswerKeyData = async () => {
            try {
                const res = await axios.get(`https://www.finderight.com/api/answer-keys/${slug}`);
                const data = res.data.answerKey || res.data; 

                // 🚨 SAFEGUARD: Handle both OLD (String) and NEW (Array) download links schemas
                let parsedLinks = { downloadAnswerKey: [{ label: "Download Answer Key", url: "" }], officialWebsite: "" };

                if (data.importantLinks) {
                    if (Array.isArray(data.importantLinks.downloadAnswerKey)) {
                        parsedLinks.downloadAnswerKey = data.importantLinks.downloadAnswerKey;
                    } else if (typeof data.importantLinks.downloadAnswerKey === 'string' && data.importantLinks.downloadAnswerKey) {
                        parsedLinks.downloadAnswerKey = [{ label: "Download Answer Key", url: data.importantLinks.downloadAnswerKey }];
                    }
                    parsedLinks.officialWebsite = data.importantLinks.officialWebsite || "";
                }

                // 🚨 SAFEGUARD: Migrate old hardcoded dates to the new dynamic keyDates array if needed
                let parsedKeyDates = data.keyDates || [];
                if (parsedKeyDates.length === 0) {
                    if (data.applicationBegin || data.examDate || data.answerKeyRelease) {
                        if (data.applicationBegin) parsedKeyDates.push({ label: "Application Begin", value: data.applicationBegin });
                        if (data.lastDateApply) parsedKeyDates.push({ label: "Last Date to Apply", value: data.lastDateApply });
                        if (data.examDate) parsedKeyDates.push({ label: "Exam Date", value: data.examDate });
                        if (data.admitcard) parsedKeyDates.push({ label: "Admit Card Release", value: data.admitcard });
                        if (data.answerKeyRelease) parsedKeyDates.push({ label: "Answer Key Release", value: data.answerKeyRelease });
                    } else {
                        parsedKeyDates = [
                            { label: "Application Begin", value: "" },
                            { label: "Last Date to Apply", value: "" },
                            { label: "Exam Date", value: "" },
                        ];
                    }
                }

                setFormData({
                    ...data,
                    slug: data.slug || "",
                    seoKeywords: data.seoKeywords || "",
                    metaDescription: data.metaDescription || "",
                    keyDates: parsedKeyDates,
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

    // --- Dynamic Key Dates Handlers ---
    const handleDynamicDateChange = (index, field, value) => {
        const updatedDates = [...formData.keyDates];
        updatedDates[index][field] = value;
        setFormData({ ...formData, keyDates: updatedDates });
    };

    const addDynamicDate = () => {
        setFormData({
            ...formData,
            keyDates: [...formData.keyDates, { label: "Custom Date Label", value: "" }]
        });
    };

    const removeDynamicDate = (index) => {
        const updatedDates = formData.keyDates.filter((_, i) => i !== index);
        setFormData({ ...formData, keyDates: updatedDates });
    };

    // --- Dynamic Links Handlers ---
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

        if (!formData.title || !formData.slug || !formData.conductedby) {
            setStatusMessage({ message: "Title, Slug, and Conducted By are required fields.", severity: "error" });
            return;
        }

        setSaving(true);

        try {
            await axios.put(`https://www.finderight.com/api/answer-keys/${slug}`, formData);
            setStatusMessage({ message: "Answer Key updated successfully! Redirecting...", severity: "success" });
            
            setTimeout(() => {
                router.push("/admin/manage-answer-keys");
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
                        
                        {/* --- Basic Info & SEO --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1, fontWeight: 'bold' }}>📋 Basic & SEO Information</Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Title (SEO Optimized)"
                                name="title" value={formData.title} onChange={handleChange} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Manual Slug"
                                name="slug" value={formData.slug} onChange={handleChange} size="small"
                                helperText="Changing this will alter the live URL."
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required label="Conducted By (Authority)"
                                name="conductedby" value={formData.conductedby} onChange={handleChange} size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth label="SEO Keywords (Comma Separated)"
                                name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth multiline rows={2} label="Meta Description"
                                name="metaDescription" value={formData.metaDescription} onChange={handleChange} size="small"
                            />
                        </Grid>

                        {/* --- Dynamic Timeline Dates --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📅 Key Dates (Customizable Labels)</Divider>
                        </Grid>

                        {formData.keyDates.map((dateItem, index) => (
                            <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2, px: 3 }}>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Date Label"
                                        value={dateItem.label} onChange={(e) => handleDynamicDateChange(index, "label", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="Date / Value"
                                        value={dateItem.value} onChange={(e) => handleDynamicDateChange(index, "value", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <IconButton 
                                        color="error" onClick={() => removeDynamicDate(index)} 
                                        disabled={formData.keyDates.length === 1}
                                    >
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={12} sx={{ pl: 3 }}>
                            <Button startIcon={<AddCircleOutline />} onClick={addDynamicDate} variant="text" color="secondary">
                                Add Another Key Date
                            </Button>
                        </Grid>

                        {/* --- Rich Text Details --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>📖 How to Check / Details</Divider>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Use the editor below to format steps, lists, and bold text.
                                </Typography>
                                <Button 
                                    size="small" startIcon={<Visibility />} 
                                    onClick={() => setPreviewOpen(true)}
                                    variant="outlined" color="primary"
                                >
                                    Live Preview
                                </Button>
                            </Box>

                            <TipTapEditor 
                                content={formData.howToCheck} 
                                onChange={handleTipTapChange} 
                            />
                        </Grid>

                        {/* --- Download Links --- */}
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

                        {/* --- Official Website --- */}
                        <Grid item xs={12}>
                            <Divider sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>🌐 Official Website</Divider>
                            <TextField
                                fullWidth size="small" label="Official Website URL"
                                value={formData.importantLinks.officialWebsite || ""} onChange={handleOfficialWebsiteChange}
                            />
                        </Grid>

                        {/* --- Submit Button --- */}
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

            {/* --- Live Preview Dialog Modal --- */}
            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
                    Live Preview: How to Check / Details
                </DialogTitle>
                <DialogContent dividers sx={{ minHeight: '300px', backgroundColor: '#fafafa' }}>
                    {formData.howToCheck ? (
                        <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: formData.howToCheck }} 
                        />
                    ) : (
                        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                            No content to preview yet.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)} variant="contained" color="primary">
                        Close Preview
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default AdminEditAnswerKey;