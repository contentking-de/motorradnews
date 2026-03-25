"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Titelbild",
  className,
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const hasImage = value.trim().length > 0;

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok) {
        setError(data.error || "Upload fehlgeschlagen");
        return;
      }

      if (data.url) {
        onChange(data.url);
      }
    } catch {
      setError("Upload fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    }
  }

  async function handleRemove() {
    if (!hasImage) return;

    if (value.includes("vercel-storage.com") || value.includes("blob.vercel-storage")) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url: value }),
        });
      } catch {
        // Blob-Löschung fehlgeschlagen, Bild trotzdem aus dem Formular entfernen
      }
    }

    onChange("");
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <span className="block text-sm font-display font-semibold text-[#111111]">
        {label}
      </span>

      {hasImage ? (
        <div className="relative overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F9F9F9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Titelbild-Vorschau"
            className="mx-auto max-h-64 w-full object-contain p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).alt = "Bild konnte nicht geladen werden";
            }}
          />
          <div className="flex items-center justify-between border-t border-[#E5E5E5] bg-white px-3 py-2">
            <span className="truncate text-xs text-[#666666]">{value}</span>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                Ersetzen
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleRemove}
                disabled={uploading}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
            dragOver
              ? "border-[#E31E24] bg-red-50/50"
              : "border-[#E5E5E5] bg-[#F9F9F9] hover:border-[#E31E24] hover:bg-red-50/30",
            uploading && "cursor-wait opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="size-8 animate-spin text-[#E31E24]" />
          ) : (
            <ImagePlus className="size-8 text-[#999999]" />
          )}
          <div className="text-center">
            <p className="font-display text-sm font-semibold text-[#111111]">
              {uploading ? "Wird hochgeladen…" : "Bild hochladen"}
            </p>
            <p className="mt-1 text-xs text-[#666666]">
              Klicken oder Datei hierher ziehen — JPG, PNG, GIF, WebP bis 10 MB
            </p>
          </div>
        </button>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
