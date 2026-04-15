import { generateJSON } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import type { Extensions, JSONContent } from "@tiptap/core";

const tiptapExtensions: Extensions = [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
];

const EMPTY_DOC: JSONContent = { type: "doc", content: [] };

/**
 * Converts an HTML string into a stringified TipTap JSON document.
 * If the input is already valid TipTap JSON, returns it unchanged.
 */
export function htmlToTiptapJson(html: string): string {
  if (!html || html.trim() === "") {
    return JSON.stringify(EMPTY_DOC);
  }

  try {
    const parsed = JSON.parse(html) as { type?: string };
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      return html;
    }
  } catch {
    // not JSON – treat as HTML below
  }

  try {
    const doc = generateJSON(html, tiptapExtensions);
    return JSON.stringify(doc);
  } catch {
    return JSON.stringify(EMPTY_DOC);
  }
}
