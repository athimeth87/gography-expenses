"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { tripCoverUrl } from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  value: string | null;
  onChange: (path: string | null) => void;
  className?: string;
};

export function CoverImagePicker({ value, onChange, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(tripCoverUrl(value));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError("รองรับ JPG · PNG · WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("ไฟล์ใหญ่เกิน 10MB");
      return;
    }
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    let processed: File = file;
    try {
      processed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85,
      });
    } catch {
      // fallback if compression fails
    }
    const supabase = createClient();
    const contentType = processed.type || "image/webp";
    const ext = contentType === "image/webp" ? "webp" : contentType.split("/")[1] ?? "jpg";
    const uuid = crypto.randomUUID();
    const path = `${uuid}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("trip-covers")
      .upload(path, processed, {
        contentType,
        upsert: false,
      });
    setUploading(false);
    if (upErr) {
      setError(`อัปโหลดไม่สำเร็จ: ${upErr.message}`);
      setPreviewUrl(tripCoverUrl(value));
      return;
    }
    URL.revokeObjectURL(localUrl);
    onChange(path);
    setPreviewUrl(tripCoverUrl(path));
  }

  function clear() {
    onChange(null);
    setPreviewUrl(null);
    setError(null);
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {previewUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Trip cover" className="size-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-2 shadow-card"
            >
              เปลี่ยน
            </button>
            <button
              type="button"
              onClick={clear}
              className="flex size-7 items-center justify-center rounded-lg bg-white/95 text-status-rejected-fg shadow-card"
              aria-label="ลบรูป"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-surface text-ink-3 transition-colors hover:border-navy-100 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImageIcon className="size-6" />
          )}
          <span className="text-xs font-semibold">
            {uploading ? "กำลังอัปโหลด…" : "เพิ่มรูปหน้าปก"}
          </span>
          <span className="text-[10px] text-ink-4">JPG · PNG · WEBP สูงสุด 10MB</span>
        </button>
      )}

      {error && <div className="mt-2 text-xs text-status-rejected-fg">{error}</div>}
    </div>
  );
}
