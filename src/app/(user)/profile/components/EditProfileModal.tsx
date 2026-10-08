"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/lib/hooks";
import { updateBuyerProfile } from "@/lib/features/buyerSlice/buyerSlice";

interface Props {
  show: boolean;
  onClose: () => void;
  buyerId: number;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
}

/**
 * Edit name and email. The mobile number is the login (verified by the
 * WhatsApp code), so it is shown but not editable -- the API ignores it too.
 */
export default function EditProfileModal({ show, onClose, buyerId, name, email, mobile }: Props) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setForm({ name: name || "", email: email || "" });
      setError(null);
    }
  }, [show, name, email]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        updateBuyerProfile({ id: buyerId, payload: { name: form.name.trim(), email: form.email.trim() } })
      ).unwrap();
      // the slice shows "Profile updated successfully"
      onClose();
    } catch (err) {
      setError(typeof err === "string" ? err : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <form onSubmit={save} className="acct-modal" noValidate>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>Edit profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label small text-secondary" htmlFor="ep-name">Full name</label>
            <input
              id="ep-name"
              className="form-control"
              value={form.name}
              maxLength={200}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label small text-secondary" htmlFor="ep-email">Email address</label>
            <input
              id="ep-email"
              type="email"
              className="form-control"
              value={form.email}
              maxLength={80}
              placeholder="you@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="mb-1">
            <label className="form-label small text-secondary">Mobile number</label>
            <div className="form-control bg-light d-flex justify-content-between">
              <span>+91 {mobile}</span>
              <span className="text-success small"><i className="bi bi-patch-check-fill" /> Verified</span>
            </div>
            <div className="form-text">Your mobile number is your login and can&apos;t be changed here.</div>
          </div>
          {error && <div className="alert alert-danger py-2 mt-3 mb-0 small">{error}</div>}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: "#264b8c", borderColor: "#264b8c" }}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
