import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type ArticleBodyProps = {
  content: string;
};

type JSONMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type JSONNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
  marks?: JSONMark[];
};

function applyMarks(text: string, marks?: JSONMark[]): ReactNode {
  let el: ReactNode = text;
  if (!marks?.length) return el;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        el = <strong>{el}</strong>;
        break;
      case "italic":
        el = <em>{el}</em>;
        break;
      case "underline":
        el = <u>{el}</u>;
        break;
      case "link": {
        const href = String(mark.attrs?.href ?? "#");
        const isInternal = href.startsWith("/");
        if (isInternal) {
          el = (
            <Link href={href} className="underline">
              {el}
            </Link>
          );
        } else {
          el = (
            <a href={href} className="underline" rel="noopener noreferrer" target="_blank">
              {el}
            </a>
          );
        }
        break;
      }
      default:
        break;
    }
  }
  return el;
}

function renderTextNode(node: JSONNode, key: string): ReactNode {
  if (node.type !== "text") return null;
  return <span key={key}>{applyMarks(node.text ?? "", node.marks)}</span>;
}

function headingTag(level: number): "h2" | "h3" {
  return level >= 3 ? "h3" : "h2";
}

function renderNode(node: JSONNode, index: number): ReactNode {
  const key = `${node.type}-${index}`;

  switch (node.type) {
    case "doc":
      return (
        <div key={key} className="prose max-w-none">
          {node.content?.map((child, i) => renderNode(child, i))}
        </div>
      );

    case "paragraph":
      return (
        <p key={key}>
          {node.content?.map((child, i) =>
            child.type === "text"
              ? renderTextNode(child, `${key}-t-${i}`)
              : renderNode(child, i),
          )}
        </p>
      );

    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Tag = headingTag(level);
      return (
        <Tag key={key}>
          {node.content?.map((child, i) =>
            child.type === "text"
              ? renderTextNode(child, `${key}-t-${i}`)
              : renderNode(child, i),
          )}
        </Tag>
      );
    }

    case "bulletList":
      return (
        <ul key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );

    case "listItem":
      return (
        <li key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );

    case "hardBreak":
      return <br key={key} />;

    case "horizontalRule":
      return <hr key={key} className="my-8 border-[#E5E5E5]" />;

    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      if (!src) return null;
      return (
        <span key={key} className="relative my-6 block w-full overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={675}
            className="h-auto w-full object-cover"
            unoptimized
          />
        </span>
      );
    }

    case "text":
      return renderTextNode(node, key);

    default:
      if (node.content?.length) {
        return <div key={key}>{node.content.map((child, i) => renderNode(child, i))}</div>;
      }
      return null;
  }
}

function parseContent(raw: string): JSONNode | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as JSONNode;
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function ArticleBody({ content }: ArticleBodyProps) {
  const doc = parseContent(content);

  if (!doc) {
    return (
      <div className="prose max-w-none text-[#666666]">
        <p>Inhalt konnte nicht geladen werden.</p>
      </div>
    );
  }

  return <div className="text-[#111111]">{renderNode(doc, 0)}</div>;
}
