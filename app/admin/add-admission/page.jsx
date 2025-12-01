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
import TipTapEditor from "../../../components/TipTapEditor";

const initialState = {
  title: "",
  conductedBy: "",
  eligibility: "",
  ageLimit: "",
  course: "",
  applicationFee: "",
  fullCourseDetails: "",
  examDate: "",
  publishDate: "",
  applicationBegin: "",
  lastDateApply: "",
  admissionDate: "",
  importantLinks: {
    applyOnline: "",
    downloadNotice: "",
    officialWebsite: "",
  },
};

const AdminAddAdmission = () => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields like importantLinks.applyOnline
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
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
      console.log("🧾 Sending form data:", formData);

      const res = await axios.post("https://www.finderight.com/api/admissions", formData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Admission added successfully!");
      setFormData(initialState);
      console.log("✅ Response:", res.data);
    } catch (err) {
      console.error("❌ Failed to add admission:", err.response?.data || err);
      alert(err.response?.data?.message || "❌ Failed to add admission");
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Admission Notice
        </Typography>

        <form onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={2}>
            {/* General Fields */}
            {[
              { label: "Title", name: "title" },
              { label: "Conducted By", name: "conductedBy" },
              { label: "Eligibility", name: "eligibility" },
              { label: "Age Limit", name: "ageLimit" },
              { label: "Course (e.g. MA, MSc)", name: "course" },
              {
                label: "Exam Date",
                name: "examDate",
                placeholder: "e.g., February 17–25, 2025",
              },
              {
                label: "Publish Date",
                name: "publishDate",
                placeholder: "e.g., 20/5/2025",
              },
              {
                label: "Application Begin",
                name: "applicationBegin",
                placeholder: "e.g., 1/4/2025",
              },
              {
                label: "Last Date to Apply",
                name: "lastDateApply",
                placeholder: "e.g., 30/4/2025",
              },
              {
                label: "Admission Date",
                name: "admissionDate",
                placeholder: "e.g., 10/6/2025",
              },
            ].map(({ label, name, placeholder }) => (
              <Grid item xs={12} sm={6} key={name}>
                <TextField
                  fullWidth
                  required={name === "title" || name === "conductedBy"}
                  autoComplete="off"
                  label={label}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder || ""}
                />
              </Grid>
            ))}

            {/* Application Fee */}
            <Grid item xs={12}>
              <Typography gutterBottom>Application Fee (Formatted)</Typography>
              <TipTapEditor
                content={formData.applicationFee}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    applicationFee: value,
                  }))
                }
              />
            </Grid>

            {/* Full Course Details */}
            <Grid item xs={12}>
              <Typography gutterBottom>Full Course Details (Formatted)</Typography>
              <TipTapEditor
                content={formData.fullCourseDetails}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    fullCourseDetails: value,
                  }))
                }
              />
            </Grid>

            {/* Important Links */}
            <Divider flexItem sx={{ my: 3, width: "100%" }}>
              Important Links
            </Divider>

            {[
              { label: "Apply Online", name: "applyOnline" },
              { label: "Download Notice", name: "downloadNotice" },
              { label: "Official Website", name: "officialWebsite" },
            ].map(({ label, name }) => (
              <Grid item xs={12} sm={6} key={name}>
                <TextField
                  fullWidth
                  autoComplete="off"
                  label={label}
                  name={`importantLinks.${name}`}
                  value={formData.importantLinks[name]}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </Grid>
            ))}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit Admission
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminAddAdmission;
