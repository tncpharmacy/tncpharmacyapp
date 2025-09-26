"use client";
import React, { useRef, useState, useEffect } from "react";

interface ExistingFile {
  url: string;
  name: string;
  id: number;
}

interface InputFileProps {
  label: string;
  name: string;
  multiple?: boolean;
  accept?: string;
  onChange: (files: File[], removedExistingIds?: number[]) => void;
  existing?: ExistingFile[];
  onRemoveExisting?: (index: number) => void;
  error?: string;
}

const InputFile: React.FC<InputFileProps> = ({
  label,
  name,
  multiple = false,
  accept,
  onChange,
  existing = [],
  onRemoveExisting,
  error,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [removedExistingIds, setRemovedExistingIds] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const updateInputFiles = (fileList: File[]) => {
    try {
      const dt = new DataTransfer();
      fileList.forEach((f) => dt.items.add(f));
      if (inputRef.current) inputRef.current.files = dt.files;
    } catch {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const generatePreviews = (fileList: File[]) => {
    previews.forEach((u) => u && URL.revokeObjectURL(u));
    const urls = fileList.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    );
    setPreviews(urls);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const all = multiple ? [...files, ...selected] : selected;

    // dedupe
    const seen = new Map<string, boolean>();
    const deduped: File[] = [];
    for (const f of all) {
      const key = `${f.name}_${f.size}_${f.lastModified}`;
      if (!seen.has(key)) {
        seen.set(key, true);
        deduped.push(f);
      }
    }

    setFiles(deduped);
    generatePreviews(deduped);
    updateInputFiles(deduped);
    onChange(deduped, removedExistingIds);
  };

  const handleRemove = (index: number) => {
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);

    const updatedPreviews = updated.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    );

    previews.forEach((u) => u && URL.revokeObjectURL(u));
    setPreviews(updatedPreviews);
    updateInputFiles(updated);
    onChange(updated, removedExistingIds);

    if (updated.length === 0 && inputRef.current) inputRef.current.value = "";
  };

  const handleRemoveExistingFile = (index: number) => {
    const doc = existing[index];
    setRemovedExistingIds((prev) => [...prev, doc.id]);
    onRemoveExisting && onRemoveExisting(index);
    onChange(files, [...removedExistingIds, doc.id]);
  };

  useEffect(() => {
    return () => {
      previews.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, []);

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-semibold">
        {label}
      </label>
      <input
        type="file"
        id={name}
        name={name}
        ref={inputRef}
        multiple={multiple}
        accept={accept}
        className={`form-control ${error ? "is-invalid" : ""}`}
        onChange={handleChange}
      />
      {error && <div className="invalid-feedback">{error}</div>}

      <div className="mt-3 d-flex flex-wrap gap-3">
        {/* Existing files */}
        {existing.map((file, i) => {
          const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(file.url);
          return (
            <div
              key={`existing-${i}`}
              className="position-relative border rounded p-1"
              style={{
                width: 110,
                height: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isImage ? (
                <img
                  src={file.url}
                  alt={file.name}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ) : (
                <div style={{ padding: 8, textAlign: "center", maxWidth: 100 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {file.name.length > 15
                      ? file.name.slice(0, 12) + "..."
                      : file.name}
                  </div>
                </div>
              )}
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-1"
                onClick={() => handleRemoveExistingFile(i)}
              />
            </div>
          );
        })}

        {/* New files */}
        {files.map((file, i) => {
          const previewUrl = previews[i];
          const isImage = file.type.startsWith("image/");
          return (
            <div
              key={i}
              className="position-relative border rounded p-1"
              style={{
                width: 110,
                height: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isImage && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={file.name}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ) : (
                <div style={{ padding: 8, textAlign: "center", maxWidth: 100 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {file.name.length > 15
                      ? file.name.slice(0, 12) + "..."
                      : file.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {(file.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              )}

              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-1"
                onClick={() => handleRemove(i)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InputFile;
