import React from "react";
import {
  Bold,
  Italic,
  Underline,
  ImageIcon,
  Link as LinkIcon,
  List,
  Heading2
} from "lucide-react";

export default function TipTapToolbar({ editor }) {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-gray-100 shadow-sm border border-gray-200 mb-4">
      <EditorButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        icon={<Bold size={16} />}
        label="Bold"
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        icon={<Italic size={16} />}
        label="Italic"
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        icon={<Underline size={16} />}
        label="Underline"
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        icon={<List size={16} />}
        label="Bullet List"
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        icon={<Heading2 size={16} />}
        label="Heading 2"
      />
      <EditorButton
        onClick={addLink}
        active={false}
        icon={<LinkIcon size={16} />}
        label="Insert Link"
      />
      <EditorButton
        onClick={addImage}
        active={false}
        icon={<ImageIcon size={16} />}
        label="Insert Image"
      />
    </div>
  );
}

function EditorButton({ onClick, active, icon, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
        ${active ? "bg-blue-600 text-white" : "bg-white text-gray-700 border hover:bg-gray-200"}
      `}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
