"use client";

import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Grid,
    Box,
    Paper,
    Divider,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

const initialState = {
    title: "",
    conductedby: "",
    applicationBegin: "",
    lastDateApply: "",
    examDate: "",
    admitcard: "",
    answerKeyRelease: "",
    howToCheck: "",
    publishDate: "",
    importantLinks: {
        downloadAnswerKey: "",
        officialWebsite: "",
    },
};

const AdminAddAnswerKey = () => {
    const [formData, setFormData] = useState(initialState);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("importantLinks.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                importantLinks: {
                    ...prev.importantLinks,
                    [key]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // If your API is in Next.js API routes, use relative URL:
            const res = await axios.post("https://www.finderight.com/api/answer-keys", formData);

            alert("✅ Answer Key added successfully!");
            setFormData(initialState);
            router.push("/");  // Navigate after success
        } catch (err) {
            console.error("❌ Failed to add answer key:", err);
            alert("❌ Failed to add answer key");
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Add New Answer Key
                </Typography>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <Grid container spacing={2}>
                        {[
                            { label: "Title", name: "title" },
                            { label: "Conducted By", name: "conductedby" },
                            { label: "Application Begin", name: "applicationBegin" },
                            { label: "Last Date to Apply", name: "lastDateApply" },
                            { label: "Exam Date", name: "examDate" },
                            { label: "Admit Card", name: "admitcard" },
                            { label: "Answer Key Release", name: "answerKeyRelease" },
                            { label: "How to Check", name: "howToCheck" },
                            { label: "Publish Date", name: "publishDate" },
                        ].map(({ label, name }) => (
                            <Grid item xs={12} sm={6} key={name}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                            </Grid>
                        ))}

                        <Divider flexItem sx={{ my: 3, width: "100%" }}>
                            Important Links
                        </Divider>

                        {[
                            { label: "Download Answer Key", name: "downloadAnswerKey" },
                            { label: "Official Website", name: "officialWebsite" },
                        ].map(({ label, name }) => (
                            <Grid item xs={12} sm={6} key={name}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    name={`importantLinks.${name}`}
                                    value={formData.importantLinks[name]}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">
                                Submit Answer Key
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminAddAnswerKey;
