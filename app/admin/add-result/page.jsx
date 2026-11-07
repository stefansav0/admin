"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  LinearProgress,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  AddCircleOutline,
  RemoveCircleOutline,
  CheckCircleOutline,
  Language,
  Search,
  DateRange,
  Code,
  Visibility,
  IntegrationInstructions,
  ExpandMore,
  RestartAlt,
  Fullscreen,
  ContentCopy,
  Lock,
  LockOpen,
  Close,
  Publish,
  Drafts,
  Info,
  Splitscreen,
  Link as LinkIcon,
} from "@mui/icons-material";
import axios from "axios";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const API_URL = "https://www.finderight.com/api/results";
const DRAFT_KEY = "finderight:add-result:draft:v2";

const initialState = {
  title: "",
  slug: "",
  seoKeywords: "",
  metaDescription: "",
  conductedBy: "",
  examDate: "",
  resultDate: "",
  postDate: "",
  detailedHtml: "",
  howToCheck: "",
  importantLinks: {
    downloadResult: [{ label: "Download Result", url: "" }],
    officialWebsite: "",
  },
};

const TEMPLATES = {
  notice: `<div class="p-6 bg-blue-50 text-blue-900 rounded-xl shadow-sm border border-blue-100">
  <h2 class="text-2xl font-extrabold mb-3">📢 Result Declared</h2>
  <p class="text-blue-800 mb-2">
    The much awaited result has been declared by the authority.
  </p>
  <ul class="list-disc pl-5 space-y-1">
    <li>Candidates can check their result using the link below.</li>
    <li>Keep your roll number handy.</li>
  </ul>
</div>`,
  guide: `<ol class="list-decimal pl-5 space-y-2 text-gray-700">
  <li>Visit the official website.</li>
  <li>Click on the "Results" section.</li>
  <li>Enter your roll number and date of birth.</li>
  <li>Submit and download the PDF.</li>
  <li>Take a printout for future reference.</li>
</ol>`,
};

const EMPTY_PREVIEW =
  "<div style='color:#9ca3af;text-align:center;margin-top:3rem;font-family:system-ui,sans-serif'>Preview will appear here as you type…</div>";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ------------------------------------------------------------------ */
/*  Small reusable UI pieces                                           */
/* ------------------------------------------------------------------ */

/** Fake browser window used by every live preview */
const BrowserFrame = ({ url, children, minHeight = 320 }) => (
  <Box
    sx={{
      bgcolor: "#fff",
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      border: "1px solid #d1d5db",
      display: "flex",
      flexDirection: "column",
      minHeight,
    }}
  >
    <Box
      sx={{
        bgcolor: "#e5e7eb",
        px: 2,
        py: 1.25,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #d1d5db",
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ff5f56" }} />
        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ffbd2e" }} />
        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#27c93f" }} />
      </Box>
      <Box
        sx={{
          mx: "auto",
          bgcolor: "#fff",
          px: 3,
          py: 0.5,
          borderRadius: 1,
          fontSize: "0.75rem",
          color: "#9ca3af",
          width: "60%",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {url}
      </Box>
    </Box>
    <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto", bgcolor: "#fff" }}>{children}</Box>
  </Box>
);

/** Collapsible, bordered section wrapper */
const Section = ({ icon, accent = "#1976d2", title, subtitle, defaultExpanded = true, children }) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={{
      border: "1px solid #e5e7eb",
      borderRadius: "16px !important",
      mb: 3,
      bgcolor: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      "&:before": { display: "none" },
      "&.Mui-expanded": { margin: "0 0 24px 0" },
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMore />}
      sx={{ px: { xs: 2, md: 3 }, minHeight: 64, "&.Mui-expanded": { minHeight: 64 } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ display: "flex", color: accent }}>{icon}</Box>
        <Box>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0 }}>{children}</AccordionDetails>
  </Accordion>
);

/** Code editor + live preview with Code / Split / Preview toggle */
const HtmlEditor = ({ name, value, onChange, placeholder, template, previewUrl }) => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const [view, setView] = useState(isCompact ? "code" : "split");
  const [copied, setCopied] = useState(false);
  const [openFull, setOpenFull] = useState(false);

  const showCode = view !== "preview";
  const showPreview = view !== "code";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const editorBox = (
    <Box
      sx={{
        p: 2.5,
        bgcolor: "#1e1e1e",
        height: "100%",
        minHeight: 380,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "#858585", fontWeight: "bold", lineHeight: 1, letterSpacing: 1 }}
        >
          {name}.html
        </Typography>
        <Button
          size="small"
          onClick={() => onChange(template)}
          sx={{ color: "#4ec9b0", textTransform: "none", fontSize: 12, minWidth: 0 }}
        >
          Insert template
        </Button>
      </Box>
      <TextField
        fullWidth
        multiline
        minRows={13}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputProps={{ spellCheck: false }}
        sx={{
          flexGrow: 1,
          "& .MuiInputBase-root": {
            backgroundColor: "transparent",
            color: "#d4d4d4",
            fontFamily: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: "0.85rem",
            lineHeight: 1.6,
            padding: 0,
            alignItems: "flex-start",
          },
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& textarea": { padding: 0 },
        }}
      />
    </Box>
  );

  const previewBox = (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        bgcolor: "#f4f6f8",
        height: "100%",
        minHeight: 380,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Visibility sx={{ fontSize: 18, mr: 1, color: "#555" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#555" }}>
            Live Render
          </Typography>
        </Box>
        <Chip size="small" label={`${(value || "").length} chars`} />
      </Box>
      <BrowserFrame url={previewUrl}>
        <Box dangerouslySetInnerHTML={{ __html: value || EMPTY_PREVIEW }} />
      </BrowserFrame>
    </Box>
  );

  return (
    <Box>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, v) => v && setView(v)}
          sx={{ bgcolor: "#fff" }}
        >
          <ToggleButton value="code" sx={{ px: 1.5, textTransform: "none" }}>
            <Code sx={{ fontSize: 16, mr: 0.5 }} /> Code
          </ToggleButton>
          <ToggleButton value="split" sx={{ px: 1.5, textTransform: "none" }}>
            <Splitscreen sx={{ fontSize: 16, mr: 0.5 }} /> Split
          </ToggleButton>
          <ToggleButton value="preview" sx={{ px: 1.5, textTransform: "none" }}>
            <Visibility sx={{ fontSize: 16, mr: 0.5 }} /> Preview
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1}>
          <Tooltip title={copied ? "Copied!" : "Copy HTML"}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? (
                <CheckCircleOutline fontSize="small" color="success" />
              ) : (
                <ContentCopy fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Full screen preview">
            <IconButton size="small" onClick={() => setOpenFull(true)}>
              <Fullscreen fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Panes */}
      <Box
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {showCode && (
          <Box
            sx={{
              width: { xs: "100%", lg: showPreview ? "50%" : "100%" },
              borderRight: { lg: showPreview ? "1px solid #e0e0e0" : "none" },
              borderBottom: { xs: showPreview ? "1px solid #e0e0e0" : "none", lg: "none" },
            }}
          >
            {editorBox}
          </Box>
        )}
        {showPreview && (
          <Box sx={{ width: { xs: "100%", lg: showCode ? "50%" : "100%" } }}>{previewBox}</Box>
        )}
      </Box>

      {/* Full-screen preview */}
      <Dialog open={openFull} onClose={() => setOpenFull(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Visibility sx={{ mr: 1 }} /> Preview — {name}.html
          </Box>
          <IconButton onClick={() => setOpenFull(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <BrowserFrame url={previewUrl} minHeight="55vh">
            <Box dangerouslySetInnerHTML={{ __html: value || EMPTY_PREVIEW }} />
          </BrowserFrame>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const AdminAddResult = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [snack, setSnack] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  /* ---------- helpers ---------- */
  const update = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    update(name, value);
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugLocked ? f.slug : slugify(title) }));
  };

  const handleDynamicLinkChange = (index, field, value) => {
    setForm((f) => ({
      ...f,
      importantLinks: {
        ...f.importantLinks,
        downloadResult: f.importantLinks.downloadResult.map((l, i) =>
          i === index ? { ...l, [field]: value } : l
        ),
      },
    }));
  };

  const addDynamicLink = () =>
    setForm((f) => ({
      ...f,
      importantLinks: {
        ...f.importantLinks,
        downloadResult: [
          ...f.importantLinks.downloadResult,
          { label: "Download Result Server", url: "" },
        ],
      },
    }));

  const removeDynamicLink = (index) =>
    setForm((f) => ({
      ...f,
      importantLinks: {
        ...f.importantLinks,
        downloadResult: f.importantLinks.downloadResult.filter((_, i) => i !== index),
      },
    }));

  const handleOfficialWebsiteChange = (e) =>
    setForm((f) => ({
      ...f,
      importantLinks: { ...f.importantLinks, officialWebsite: e.target.value },
    }));

  /* ---------- draft autosave & restore ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form && JSON.stringify(parsed.form) !== JSON.stringify(initialState)) {
        setPendingDraft(parsed);
      }
    } catch {
      /* corrupt draft – ignore */
    }
  }, []);

  useEffect(() => {
    if (JSON.stringify(form) === JSON.stringify(initialState)) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, savedAt: Date.now() }));
        setLastSavedAt(Date.now());
      } catch {
        /* storage full / disabled */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [form]);

  useEffect(() => {
    const handler = (e) => {
      if (loading) return;
      if (JSON.stringify(form) !== JSON.stringify(initialState)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form, loading]);

  const restoreDraft = () => {
    if (pendingDraft?.form) {
      setForm({
        ...initialState,
        ...pendingDraft.form,
        importantLinks: {
          ...initialState.importantLinks,
          ...(pendingDraft.form.importantLinks || {}),
        },
      });
      setLastSavedAt(pendingDraft.savedAt || Date.now());
    }
    setPendingDraft(null);
    setSnack("Draft restored");
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setPendingDraft(null);
    setSnack("Draft discarded");
  };

  /* ---------- progress ---------- */
  const progress = useMemo(() => {
    const checks = [
      !!form.title.trim(),
      !!form.slug.trim(),
      !!form.conductedBy.trim(),
      !!form.metaDescription.trim(),
      !!form.examDate.trim(),
      !!form.resultDate,
      !!form.postDate,
      !!form.detailedHtml.trim(),
      !!form.howToCheck.trim(),
      form.importantLinks.downloadResult.some((l) => l.url.trim()),
      !!form.importantLinks.officialWebsite.trim(),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  /* ---------- validation ---------- */
  const validate = () => {
    const required = [
      ["title", "Result Title"],
      ["slug", "URL Slug"],
      ["conductedBy", "Conducted By"],
      ["examDate", "Exam Date"],
      ["resultDate", "Result Declaration Date"],
      ["postDate", "Post Published Date"],
      ["detailedHtml", "Notice Details HTML"],
    ];
    return required.filter(([k]) => !String(form[k] ?? "").trim()).map(([, label]) => label);
  };

  /* ---------- publish ---------- */
  const doPublish = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      await axios.post(API_URL, form);
      setStatusMessage({ message: "Result published successfully!", severity: "success" });
      setForm(initialState);
      setSlugLocked(false);
      setLastSavedAt(null);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Unknown error occurred.";
      setStatusMessage({
        message: `Failed to add result: ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const missing = validate();
    if (missing.length) {
      setStatusMessage({
        severity: "error",
        message: `Please complete the following fields: ${missing.join(", ")}.`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setConfirm({
      title: "Publish this result?",
      confirmLabel: "Yes, publish",
      color: "success",
      content: (
        <Stack spacing={1} sx={{ pt: 1 }}>
          <Typography variant="body2">
            <strong>Title:</strong> {form.title}
          </Typography>
          <Typography variant="body2">
            <strong>Slug:</strong> /{form.slug}
          </Typography>
          <Typography variant="body2">
            <strong>Authority:</strong> {form.conductedBy}
          </Typography>
          <Typography variant="body2">
            <strong>Download links:</strong>{" "}
            {form.importantLinks.downloadResult.filter((l) => l.url).length}
          </Typography>
        </Stack>
      ),
      onConfirm: doPublish,
    });
  };

  const handleResetClick = () =>
    setConfirm({
      title: "Clear the entire form?",
      content: "All unsaved content will be lost. This cannot be undone.",
      confirmLabel: "Clear form",
      color: "error",
      onConfirm: () => {
        setForm(initialState);
        setSlugLocked(false);
        setStatusMessage(null);
        setLastSavedAt(null);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
      },
    });

  /* ---------- render ---------- */
  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", pb: 16 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 } }}>
        {/* ---------- Header ---------- */}
        <Paper
          elevation={0}
          sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, borderTop: "8px solid #000", mb: 3 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
                Publish New Result
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Fill in the details below — your work is auto-saved as a draft.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {lastSavedAt && (
                <Chip
                  size="small"
                  icon={<Drafts fontSize="small" />}
                  label={`Draft saved ${new Date(lastSavedAt).toLocaleTimeString()}`}
                />
              )}
              <Chip
                size="small"
                label={`${progress}% complete`}
                color={progress === 100 ? "success" : "default"}
                variant={progress === 100 ? "filled" : "outlined"}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* ---------- Notices ---------- */}
        {pendingDraft && (
          <Alert
            severity="info"
            icon={<Info />}
            onClose={discardDraft}
            sx={{ mb: 3, borderRadius: 3, alignItems: "center" }}
            action={
              <Stack direction="row" spacing={1}>
                <Button color="inherit" size="small" onClick={restoreDraft}>
                  Restore
                </Button>
                <Button color="inherit" size="small" onClick={discardDraft}>
                  Discard
                </Button>
              </Stack>
            }
          >
            An unsaved draft from {new Date(pendingDraft.savedAt).toLocaleString()} was found.
          </Alert>
        )}

        {statusMessage && (
          <Alert
            severity={statusMessage.severity}
            onClose={() => setStatusMessage(null)}
            sx={{ mb: 3, borderRadius: 3 }}
          >
            {statusMessage.message}
          </Alert>
        )}

        {/* ---------- Form ---------- */}
        <Box component="form" id="result-form" onSubmit={handleSubmit} autoComplete="off">
          {/* Core Information */}
          <Section
            icon={<Language />}
            accent="#1976d2"
            title="Core Information"
            subtitle="Title, slug and conducting authority"
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Result Title"
                  name="title"
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., UPSC Civil Services Final Result 2026"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="URL Slug"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="e.g., upsc-civil-services-final-result-2026"
                  helperText={
                    slugLocked
                      ? "Locked — you can now edit it manually"
                      : "Auto-generated from the title"
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={slugLocked ? "Unlock (auto-generate)" : "Lock (edit manually)"}
                        >
                          <IconButton size="small" onClick={() => setSlugLocked((v) => !v)}>
                            {slugLocked ? (
                              <Lock fontSize="small" color="primary" />
                            ) : (
                              <LockOpen fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Conducted By (Authority)"
                  name="conductedBy"
                  value={form.conductedBy}
                  onChange={handleChange}
                  placeholder="e.g., Union Public Service Commission"
                />
              </Grid>
            </Grid>
          </Section>

          {/* SEO */}
          <Section
            icon={<Search />}
            accent="#ff9800"
            title="SEO Optimization"
            subtitle="Keywords & meta description"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SEO Keywords (comma separated)"
                  name="seoKeywords"
                  value={form.seoKeywords}
                  onChange={handleChange}
                  placeholder="e.g., upsc result 2026, civil services final list, upsc cutoff"
                />
                {form.seoKeywords.trim() && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1.5 }}>
                    {form.seoKeywords
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean)
                      .map((k, i) => (
                        <Chip key={`${k}-${i}`} size="small" label={k} />
                      ))}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Meta Description"
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                  placeholder="Write a brief, catchy summary for Google search results."
                  helperText={`${form.metaDescription.length}/160 characters`}
                  FormHelperTextProps={{
                    sx: {
                      mx: 0,
                      textAlign: "right",
                      color: form.metaDescription.length > 160 ? "error.main" : "text.secondary",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Section>

          {/* Timeline */}
          <Section
            icon={<DateRange />}
            accent="#9c27b0"
            title="Timeline Dates"
            subtitle="Exam, result and publish dates"
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Exam Date (free text)"
                  placeholder="e.g., 14 May 2026 or TBA"
                  name="examDate"
                  value={form.examDate}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Result Declaration Date"
                  type="date"
                  name="resultDate"
                  value={form.resultDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label="Post Published Date"
                  type="date"
                  name="postDate"
                  value={form.postDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Section>

          {/* Notice details */}
          <Section
            icon={<Code />}
            accent="#00c853"
            title="Notice Details"
            subtitle="Tailwind HTML with live preview"
          >
            <HtmlEditor
              name="detailedHtml"
              value={form.detailedHtml}
              onChange={(v) => update("detailedHtml", v)}
              template={TEMPLATES.notice}
              previewUrl="finderight.com/result/preview"
              placeholder={`\n<div class="p-6 bg-blue-50 text-blue-900 rounded-xl shadow-sm border border-blue-100">\n  <h2 class="text-2xl font-extrabold mb-3">Notice</h2>\n  <p class="text-blue-800">The result has been declared...</p>\n</div>`}
            />
          </Section>

          {/* How to check */}
          <Section
            icon={<IntegrationInstructions />}
            accent="#f50057"
            title="How to Check Guide"
            subtitle="Step-by-step HTML with live preview"
          >
            <HtmlEditor
              name="howToCheck"
              value={form.howToCheck}
              onChange={(v) => update("howToCheck", v)}
              template={TEMPLATES.guide}
              previewUrl="finderight.com/guide/preview"
              placeholder={`\n<ul class="list-decimal pl-5 space-y-2 text-gray-700">\n  <li>Visit the official website.</li>\n  <li>Click on the Results section.</li>\n  <li>Download the PDF file.</li>\n</ul>`}
            />
          </Section>

          {/* Links */}
          <Section
            icon={<LinkIcon />}
            accent="#1976d2"
            title="Download & Official Links"
            subtitle="Use descriptive SEO labels to rank better"
          >
            <Stack spacing={2}>
              {form.importantLinks.downloadResult.map((link, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, bgcolor: "#fafafa" }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`SEO Link Label #${index + 1}`}
                        value={link.label}
                        onChange={(e) => handleDynamicLinkChange(index, "label", e.target.value)}
                        placeholder="Download Final Merit List PDF"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Direct Download URL"
                        value={link.url}
                        onChange={(e) => handleDynamicLinkChange(index, "url", e.target.value)}
                        placeholder="https://..."
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Tooltip title="Remove this link">
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => removeDynamicLink(index)}
                            disabled={form.importantLinks.downloadResult.length === 1}
                          >
                            <RemoveCircleOutline />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>

            <Button
              startIcon={<AddCircleOutline />}
              onClick={addDynamicLink}
              variant="outlined"
              sx={{ mt: 2, borderRadius: 2, textTransform: "none" }}
            >
              Add another download server
            </Button>

            <Divider sx={{ my: 3 }} />

            <TextField
              fullWidth
              size="small"
              label="Official Authority Website URL"
              value={form.importantLinks.officialWebsite}
              onChange={handleOfficialWebsiteChange}
              placeholder="https://upsc.gov.in"
            />
          </Section>
        </Box>
      </Box>

      {/* ---------- Sticky action bar ---------- */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          py: 1.5,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2, md: 4 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 180, order: { xs: 2, sm: 1 } }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                Completion
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: progress === 100 ? "success.main" : "text.secondary" }}
              >
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={progress === 100 ? "success" : "primary"}
              sx={{ height: 6, borderRadius: 3, bgcolor: "#e5e7eb" }}
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ order: { xs: 1, sm: 2 } }}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<RestartAlt />}
              onClick={handleResetClick}
              disabled={loading}
              sx={{ textTransform: "none", borderRadius: 3 }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form="result-form"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={18} color="inherit" /> : <Publish />
              }
              sx={{
                bgcolor: "#000",
                color: "#fff",
                px: 4,
                py: 1.2,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "#222" },
              }}
            >
              {loading ? "Publishing..." : "Publish Result"}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ---------- Generic confirm dialog ---------- */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="sm" fullWidth>
        {confirm && (
          <>
            <DialogTitle>{confirm.title}</DialogTitle>
            <DialogContent dividers>
              {typeof confirm.content === "string" ? (
                <Typography variant="body2">{confirm.content}</Typography>
              ) : (
                confirm.content
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setConfirm(null)} color="inherit" sx={{ textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color={confirm.color || "primary"}
                onClick={() => {
                  const fn = confirm.onConfirm;
                  setConfirm(null);
                  fn && fn();
                }}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                {confirm.confirmLabel || "Confirm"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ---------- Toast ---------- */}
      <Snackbar
        open={!!snack}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 10 }}
      />
    </Box>
  );
};

export default AdminAddResult;