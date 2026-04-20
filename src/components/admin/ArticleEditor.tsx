"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { resizeImageClient } from "@/lib/resize-image-client";

function parseContent(json: string): string | Record<string, unknown> {
  if (!json || json.trim() === "") {
    return { type: "doc", content: [] };
  }
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* kein JSON */
  }
  if (json.includes("<") && json.includes(">")) {
    return json;
  }
  return { type: "doc", content: [] };
}

interface ArticleEditorProps {
  content: string;
  onChange: (json: string) => void;
  className?: string;
}

export function ArticleEditor({ content, onChange, className }: ArticleEditorProps) {
  const lastEmitted = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#E31E24] underline underline-offset-2",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Placeholder.configure({
        placeholder: "Artikel hier verfassen...",
      }),
    ],
    content: parseContent(content),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] px-4 py-3 focus:outline-none text-[#111111] [&_p.is-editor-empty:first-child::before]:text-[#999999]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = JSON.stringify(ed.getJSON());
      lastEmitted.current = json;
      onChange(json);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (content === lastEmitted.current) return;
    const doc = parseContent(content);
    if (typeof doc === "string") {
      editor.commands.setContent(doc, { emitUpdate: false });
      lastEmitted.current = content;
      return;
    }
    const next = JSON.stringify(doc);
    const current = JSON.stringify(editor.getJSON());
    if (next !== current) {
      editor.commands.setContent(doc, { emitUpdate: false });
      lastEmitted.current = content;
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL verknüpfen", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;
      const file = e.target.files?.[0];
      if (!file) return;
      if (imageInputRef.current) imageInputRef.current.value = "";

      setImageUploading(true);
      try {
        const resized = await resizeImageClient(file);
        const formData = new FormData();
        formData.append("file", resized);

        const res = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = (await res.json()) as { url?: string; error?: string };

        if (!res.ok || !data.url) {
          alert(data.error || "Bild-Upload fehlgeschlagen");
          return;
        }

        editor.chain().focus().setImage({ src: data.url }).run();
      } catch {
        alert("Bild-Upload fehlgeschlagen. Bitte erneut versuchen.");
      } finally {
        setImageUploading(false);
      }
    },
    [editor],
  );

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-[360px] rounded-lg border border-[#E5E5E5] bg-white animate-pulse",
          className
        )}
        aria-hidden
      />
    );
  }

  const ToolBtn = ({
    active,
    onClick,
    label,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    label: string;
    children: ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-2 transition-colors",
        active
          ? "bg-[#E31E24] text-white"
          : "text-[#111111] hover:bg-black/[0.06]"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("rounded-lg border border-[#E5E5E5] overflow-hidden bg-white", className)}>
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-[#E5E5E5] bg-[#F9F9F9] px-2 py-1.5"
        role="toolbar"
        aria-label="Formatierung"
      >
        <ToolBtn
          label="Fett"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          label="Kursiv"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          label="Unterstrichen"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-6 w-px bg-[#E5E5E5]" aria-hidden />
        <ToolBtn
          label="Überschrift 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          label="Überschrift 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-6 w-px bg-[#E5E5E5]" aria-hidden />
        <ToolBtn
          label="Aufzählungsliste"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          label="Nummerierte Liste"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          label="Zitat"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-6 w-px bg-[#E5E5E5]" aria-hidden />
        <ToolBtn
          label="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Bild hochladen" active={false} onClick={addImage}>
          {imageUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
