"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./Providers";
import { Modal } from "./ui";

export default function DeleteAccountSection() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    const res = await fetch("/api/me", { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      setError("Something went wrong deleting your account. Please try again.");
      return;
    }
    setUser(null);
    setOpen(false);
    router.push("/");
  }

  return (
    <>
      <div className="card card-pad mt-32" style={{ borderColor: "var(--clay)" }}>
        <div className="eyebrow" style={{ color: "var(--clay)", marginBottom: "10px" }}>Danger zone</div>
        <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Delete my account</h3>
        <p className="text-soft text-sm" style={{ marginBottom: "16px" }}>
          This permanently removes your account, profile, and everything tied to it (tasks, applications, contracts, messages). This can&apos;t be undone.
        </p>
        <button className="btn btn-clay btn-sm" onClick={() => setOpen(true)}>Delete my account</button>
      </div>

      {open && (
        <Modal title="Delete your account?" onClose={() => setOpen(false)}>
          <p className="text-soft" style={{ marginBottom: "16px" }}>
            This is permanent and can&apos;t be undone. To confirm, type <strong>DELETE</strong> below.
          </p>
          <input
            className="input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
          />
          {error && <div className="field-error mt-8">{error}</div>}
          <button
            className="btn btn-clay btn-block mt-16"
            disabled={confirmText !== "DELETE" || deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Permanently delete my account"}
          </button>
        </Modal>
      )}
    </>
  );
}
