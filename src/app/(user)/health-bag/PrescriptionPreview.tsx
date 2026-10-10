"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { fetchBagPrescriptionFile } from "@/lib/api/healthBag";
import type { BagPrescriptionMeta } from "@/types/healthBag";

/**
 * "See what you uploaded" for the bag's prescription (Figma B2c / M2c).
 *
 * Where the picture comes from:
 * - right after an upload: the File the buyer just picked, shown through a
 *   local object URL (instant, nothing is downloaded);
 * - after a reload: the API's cart/buyer/prescription/file/, fetched with the
 *   buyer's token as a Blob. There is no public link to a prescription.
 *
 * Object URLs keep the file in memory until revoked, so every URL this hook
 * makes is revoked when it is replaced or when the page unmounts.
 */
export type RxPreview = {
  /** Prescription id this preview belongs to. */
  forId: number;
  url: string;
  kind: "image" | "pdf";
  name: string;
  size?: number;
  uploadedOn?: string | null;
  source: "device" | "server";
};

export type RxPreviewStatus = "idle" | "loading" | "ready" | "error";

const kindOf = (mime: string, fallback?: "image" | "pdf"): "image" | "pdf" =>
  mime === "application/pdf" ? "pdf" : mime.startsWith("image/") ? "image" : fallback || "image";

export function useBagPrescriptionPreview(
  prescriptionId: number | null,
  meta: BagPrescriptionMeta | null,
  enabled: boolean
) {
  const [preview, setPreview] = useState<RxPreview | null>(null);
  const [status, setStatus] = useState<RxPreviewStatus>("idle");
  // The file being uploaded right now. When the upload succeeds and the bag
  // learns the new prescription id, this file is shown instead of downloading.
  const pendingFile = useRef<File | null>(null);
  const urlRef = useRef<string | null>(null);

  const swapUrl = (next: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
  };

  const load = useCallback(async () => {
    if (!prescriptionId) return;
    setStatus("loading");
    try {
      const blob = await fetchBagPrescriptionFile();
      const url = URL.createObjectURL(blob);
      swapUrl(url);
      const kind = kindOf(blob.type, meta?.file_type);
      const ext = (meta?.extension || (kind === "pdf" ? "pdf" : "jpg")).toUpperCase();
      setPreview({
        forId: prescriptionId,
        url,
        kind,
        name: `Prescription (${ext})`,
        size: blob.size,
        uploadedOn: meta?.uploaded_on ?? null,
        source: "server",
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [prescriptionId, meta?.file_type, meta?.extension, meta?.uploaded_on]);

  useEffect(() => {
    if (!enabled || !prescriptionId) return;
    if (preview?.forId === prescriptionId) return;
    const file = pendingFile.current;
    if (file) {
      pendingFile.current = null;
      const url = URL.createObjectURL(file);
      swapUrl(url);
      setPreview({
        forId: prescriptionId,
        url,
        kind: kindOf(file.type),
        name: file.name,
        size: file.size,
        uploadedOn: new Date().toISOString(),
        source: "device",
      });
      setStatus("ready");
      return;
    }
    load();
    // Only a new prescription (or logging in) should trigger a load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, prescriptionId]);

  // Free the last object URL when the bag page goes away.
  useEffect(() => () => swapUrl(null), []);

  return {
    preview: preview && preview.forId === prescriptionId ? preview : null,
    status,
    retry: load,
    /** Call before uploading a file; call with null if the upload fails. */
    expectFile: (file: File | null) => {
      pendingFile.current = file;
    },
  };
}

/** 1234567 -> "1.2 MB", 640000 -> "625 KB". */
export function fileSize(bytes?: number): string {
  if (!bytes) return "";
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** ISO time -> "uploaded 08 Oct, 4:40 pm". */
export function uploadedLabel(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `uploaded ${d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

/** "1.2 MB · uploaded 08 Oct, 4:40 pm" */
export function rxDetails(p: RxPreview | null): string {
  if (!p) return "";
  return [fileSize(p.size), uploadedLabel(p.uploadedOn)].filter(Boolean).join(" · ");
}

/* ---------------- Preview modal (desktop dialog, full screen on phones) --- */
export function PrescriptionPreviewModal({
  show,
  onClose,
  preview,
  status,
  onRetry,
  onUpload,
  uploading,
}: {
  show: boolean;
  onClose: () => void;
  preview: RxPreview | null;
  status: RxPreviewStatus;
  onRetry: () => void;
  /** Replace: the same upload the bag card uses. */
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  // Fit to the window by default; tap the image (or Zoom) for actual size.
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    if (!show) setZoomed(false);
  }, [show]);

  const openFull = () => {
    if (preview) window.open(preview.url, "_blank", "noopener");
  };

  const loading = uploading || status === "loading" || (status === "idle" && !preview);
  const failed = !uploading && status === "error" && !preview;
  const title = preview?.name || "Prescription";
  const details = rxDetails(preview);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      fullscreen="sm-down"
      dialogClassName="bf-rxv-dialog"
      contentClassName="bf-rxv"
      aria-labelledby="bf-rxv-title"
    >
      <div className="bf-rxv-head">
        <div className="bf-rxv-title">
          <h2 id="bf-rxv-title">Your prescription</h2>
          <p className="text-truncate">{[title, details].filter(Boolean).join(" · ")}</p>
        </div>
        {preview && (
          <button type="button" className="bf-rxv-icon d-sm-none" onClick={openFull} aria-label="Open full size">
            <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
          </button>
        )}
        <button type="button" className="bf-rxv-icon" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      </div>

      <div className="bf-rxv-body">
        <div className={`bf-rxv-viewer ${zoomed ? "is-zoomed" : ""}`} aria-busy={loading}>
          {loading && (
            <div className="bf-rxv-state">
              <div className="bf-rxv-skeleton" aria-hidden="true" />
              <span>{uploading ? "Uploading the new file…" : "Loading your prescription…"}</span>
            </div>
          )}

          {failed && (
            <div className="bf-rxv-state" role="alert">
              <i className="bi bi-exclamation-triangle-fill bf-rxv-warn" aria-hidden="true" />
              <strong>We couldn&apos;t load the preview</strong>
              <span>Your prescription is still attached to this order. Check your connection and try again.</span>
            </div>
          )}

          {!loading && preview?.kind === "image" && (
            <>
              <div className="bf-rxv-tools d-none d-sm-flex">
                <button type="button" onClick={() => setZoomed((z) => !z)} aria-pressed={zoomed}>
                  <i className={`bi ${zoomed ? "bi-zoom-out" : "bi-zoom-in"}`} aria-hidden="true" />
                  {zoomed ? "Fit" : "Zoom"}
                </button>
                <button type="button" onClick={openFull}>
                  <i className="bi bi-box-arrow-up-right" aria-hidden="true" /> Open full size
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element -- a local blob: URL, not an optimisable asset */}
              <img
                src={preview.url}
                alt="Your uploaded prescription"
                className="bf-rxv-img"
                onClick={() => setZoomed((z) => !z)}
              />
            </>
          )}

          {!loading && preview?.kind === "pdf" && (
            <div className="bf-rxv-state">
              <div className="bf-rxv-pdf">
                <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                <strong className="text-truncate">{preview.name}</strong>
                <span>PDFs open in a new tab</span>
                <button type="button" className="bf-btn bf-btn--outline" onClick={openFull}>
                  <i className="bi bi-box-arrow-up-right" aria-hidden="true" /> Open PDF
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bf-rxv-check">
          <strong>Make sure the photo is clear and shows:</strong>
          <ul>
            <li><i className="bi bi-check2-circle" aria-hidden="true" /> Doctor&apos;s name, reg. no. and signature</li>
            <li><i className="bi bi-check2-circle" aria-hidden="true" /> Patient name</li>
            <li><i className="bi bi-check2-circle" aria-hidden="true" /> Date</li>
            <li><i className="bi bi-check2-circle" aria-hidden="true" /> Medicines in your bag</li>
          </ul>
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="d-none"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />

      <div className="bf-rxv-foot">
        <span className="bf-muted small d-none d-sm-inline">Our pharmacist also checks it before packing.</span>
        {failed ? (
          <>
            <button type="button" className="bf-btn bf-btn--outline" onClick={onRetry}>Try again</button>
            <button type="button" className="bf-btn" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <button type="button" className="bf-btn bf-btn--outline" onClick={() => input.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Replace"}
            </button>
            <button type="button" className="bf-btn" onClick={onClose} disabled={uploading}>Looks good</button>
          </>
        )}
      </div>
    </Modal>
  );
}
