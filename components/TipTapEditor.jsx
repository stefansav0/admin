"use client"; // Ensures this runs only on the client

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import { Button, Stack, Box, Typography, Divider } from "@mui/material";

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: true }),
      TextStyle,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus: false,
    editable: true,
    injectCSS: true,
    immediatelyRender: false, // ✅ Prevent SSR hydration error
  });

  // Prevent rendering until client mounts
  if (!editor) return null;

  // Toolbar actions
  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <Box>
      <Typography variant="h6" mb={2} fontWeight="bold" color="primary">
        Study News Editor
      </Typography>

      {/* Toolbar */}
      <Box
        sx={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent="flex-start"
        >
          {/* Text Formatting */}
          <EditorButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} />
          <EditorButton label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} />
          <EditorButton label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} />

          {/* Alignment */}
          <EditorButton label="Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} />
          <EditorButton label="Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} />
          <EditorButton label="Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} />
          <EditorButton label="Clear Align" onClick={() => editor.chain().focus().unsetTextAlign().run()} />

          {/* Media & Links */}
          <EditorButton label="Add Image" onClick={addImage} />
          <EditorButton label="Add Link" onClick={setLink} />

          <Divider orientation="vertical" flexItem />

          {/* Table Tools */}
          <EditorButton
            label="Insert Table"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          />
          <EditorButton label="Add Column" onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <EditorButton label="Add Row" onClick={() => editor.chain().focus().addRowAfter().run()} />
          <EditorButton label="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} />
        </Stack>
      </Box>

      {/* Rich Text Editor */}
      <EditorContent
        editor={editor}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          minHeight: "220px",
          padding: "16px",
          backgroundColor: "#fff",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.05)",
        }}
      />
    </Box>
  );
}

// Editor button wrapper
function EditorButton({ label, onClick }) {
  return (
    <Button
      onClick={onClick}
      size="small"
      variant="outlined"
      sx={{
        textTransform: "none",
        fontSize: "0.85rem",
        borderRadius: 2,
        py: 0.5,
        px: 1.5,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Button>
  );
}
