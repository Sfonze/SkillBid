"use client";
import { useRef, useState } from "react";
import { initials } from "@/lib/format";

export default function AvatarUpload({ name, currentSrc, onChange, shape = "circle", label = "Profile photo", hint = "Click or drag a photo here. JPG or PNG, max 3 MB." }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function processFile(file) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 3 * 1024 * 1024) { setError("Image must be under 3 MB. Try compressing it first."); return; }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result); // base64 data URL
    reader.readAsDataURL(file);
  }

  function onFileInput(e) { processFile(e.target.files[0]); }
  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }
  function onDragOver(e) { e.preventDefault(); setDragging(true); }
  function onDragLeave() { setDragging(false); }

  return (
    <div className="avatar-upload-wrap">
      <div
        className={"avatar-upload-zone" + (dragging ? " avatar-upload-dragging" : "") + (shape === "square" ? " avatar-upload-square" : "")}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {currentSrc ? (
          <img src={currentSrc} alt={name} className="avatar-upload-preview" />
        ) : (
          <div className="avatar-upload-placeholder">
            <div className="avatar avatar-upload-initials">{initials(name || "?")}</div>
          </div>
        )}
        <div className="avatar-upload-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Upload</span>
        </div>
      </div>
      <div className="avatar-upload-info">
        <div className="field-label" style={{ marginBottom: "4px" }}>{label}</div>
        <div className="field-hint">{hint}</div>
        {currentSrc && (
          <button type="button" className="btn-text text-sm" style={{ color: "var(--clay)", marginTop: "6px" }} onClick={() => onChange("")}>
            Remove photo
          </button>
        )}
        {error && <div className="field-error mt-8">{error}</div>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput} />
    </div>
  );
}
