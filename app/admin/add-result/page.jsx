"use client"; // Optional in App Router, required in Server Components if using client hooks like useState

import React, { useState } from "react";
import {
    TextField,
    Button,
    Grid,
    Typography,
    Paper,
} from "@mui/material";
import axios from "axios";

const AdminAddResult = () => {
    const [form, setForm] = useState({
        title: "",
        conductedBy: "",
        examDate: "",
        resultDate: "",
        postDate: "",
        shortInfo: "",
        howToCheck: "",
        importantLinks: [
            { label: "Download Result", url: "" },
            { label: "Official Website", url: "" },
        ],
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLinkChange = (index, field, value) => {
        const updatedLinks = [...form.importantLinks];
        updatedLinks[index][field] = value;
        setForm({ ...form, importantLinks: updatedLinks });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.title ||
            !form.conductedBy ||
            !form.examDate ||
            !form.resultDate ||
            !form.postDate ||
            !form.shortInfo ||
            !form.howToCheck
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            await axios.post("https://www.finderight.com/api/results", form);
            alert("Result added successfully!");
            setForm({
                title: "",
                conductedBy: "",
                examDate: "",
                resultDate: "",
                postDate: "",
                shortInfo: "",
                howToCheck: "",
                importantLinks: [
                    { label: "Download Result", url: "" },
                    { label: "Official Website", url: "" },
                ],
            });
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to add result.");
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Add New Result
            </Typography>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            label="Title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            label="Conducted By"
                            name="conductedBy"
                            value={form.conductedBy}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            required
                            label="Exam Date (YYYY-MM-DD)"
                            name="examDate"
                            value={form.examDate}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            required
                            label="Result Date (YYYY-MM-DD)"
                            name="resultDate"
                            value={form.resultDate}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            required
                            label="Published On (YYYY-MM-DD)"
                            name="postDate"
                            value={form.postDate}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            multiline
                            rows={3}
                            label="Notice / Short Info"
                            name="shortInfo"
                            value={form.shortInfo}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            multiline
                            rows={4}
                            label="How to Check Result"
                            name="howToCheck"
                            value={form.howToCheck}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </Grid>

                    {form.importantLinks.map((link, idx) => (
                        <Grid item xs={12} key={idx}>
                            <TextField
                                fullWidth
                                label={link.label}
                                value={link.url}
                                onChange={(e) =>
                                    handleLinkChange(idx, "url", e.target.value)
                                }
                                autoComplete="off"
                            />
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">
                            Submit Result
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default AdminAddResult;
