"use client";

import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Titelbild-URL",
  className,
}: ImageUploaderProps) {
  const trimmed = value.trim();
  const showPreview = trimmed.length > 0;

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Input
        id="cover-image-url"
        label={label}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Bild-URL eingeben oder hochladen"
        autoComplete="off"
      />
      {showPreview && (
        <div
          className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-2"
          aria-live="polite"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trimmed}
            alt="Vorschau Titelbild"
            className="mx-auto max-h-48 w-full max-w-md rounded-md object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
