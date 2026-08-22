"use client";

import { useEffect, useMemo, useState } from "react";
import { OcrExtractedMedicine } from "@/types/ocr";
import { formatPrice } from "@/lib/utils/formatPrice";

export interface SelectedMedicine {
  medicine_id: number;
  medicine_name: string;
  quantity: number;
}

interface Props {
  medicines: OcrExtractedMedicine[];
  loading: boolean;
  error: string | null;
  adding: boolean;
  onAddSelected: (items: SelectedMedicine[]) => void;
  onSkip: () => void;
}

/**
 * Buyer-facing step shown after a prescription upload:
 * lists the medicines the OCR matched, lets the buyer pick quantities
 * and add them to their Health Bag.
 *
 * Low-confidence matches (needs_review) are flagged and left unchecked so
 * the buyer opts in deliberately.
 */
export default function PrescriptionMedicinesStep({
  medicines,
  loading,
  error,
  adding,
  onAddSelected,
  onSkip,
}: Props) {
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Pre-select confident matches whenever a new result set arrives
  useEffect(() => {
    const nextSelected: Record<number, boolean> = {};
    const nextQuantities: Record<number, number> = {};

    medicines.forEach((med) => {
      nextSelected[med.medicine_id] = !med.needs_review;
      nextQuantities[med.medicine_id] = 1;
    });

    setSelected(nextSelected);
    setQuantities(nextQuantities);
  }, [medicines]);

  const toggle = (id: number) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const changeQty = (id: number, delta: number) =>
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));

  const selectedItems: SelectedMedicine[] = useMemo(
    () =>
      medicines
        .filter((med) => selected[med.medicine_id])
        .map((med) => ({
          medicine_id: med.medicine_id,
          medicine_name: med.medicine_name,
          quantity: quantities[med.medicine_id] || 1,
        })),
    [medicines, selected, quantities]
  );

  const estimatedTotal = useMemo(
    () =>
      medicines
        .filter((med) => selected[med.medicine_id])
        .reduce(
          (sum, med) =>
            sum +
            Number(med.mrp || med.master_mrp || 0) *
              (quantities[med.medicine_id] || 1),
          0
        ),
    [medicines, selected, quantities]
  );

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="fw-semibold mb-1">Reading your prescription...</p>
        <p className="text-muted small mb-0">
          This can take a few moments. Please don&apos;t close this window.
        </p>
      </div>
    );
  }

  // ---------------- ERROR / EMPTY ----------------
  if (error || medicines.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-info-circle fs-1 text-secondary d-block mb-2" />
        <p className="fw-semibold mb-1">
          {error
            ? "We couldn't read the medicines automatically"
            : "No medicines could be matched"}
        </p>
        <p className="text-muted small">
          Don&apos;t worry — your prescription has been uploaded and our
          pharmacist will review it and get in touch.
        </p>
        <button className="btn btn-primary px-4" onClick={onSkip}>
          Done
        </button>
      </div>
    );
  }

  // ---------------- RESULTS ----------------
  return (
    <div className="text-start">
      <p className="mb-1 fw-semibold">
        We found {medicines.length} medicine
        {medicines.length > 1 ? "s" : ""} in your prescription
      </p>
      <p className="text-muted small">
        Select what you&apos;d like to add to your Health Bag. Your prescription
        has already been sent to our pharmacist.
      </p>

      <div
        className="border rounded-3"
        style={{ maxHeight: 320, overflowY: "auto" }}
      >
        {medicines.map((med) => {
          const id = med.medicine_id;
          const isChecked = !!selected[id];
          const qty = quantities[id] || 1;
          const price = Number(med.mrp || med.master_mrp || 0);

          return (
            <div
              key={`${id}-${med.extracted_name}`}
              className={`d-flex align-items-start gap-2 p-3 border-bottom ${
                med.needs_review ? "bg-warning-subtle" : ""
              }`}
            >
              <input
                type="checkbox"
                className="form-check-input mt-1 flex-shrink-0"
                checked={isChecked}
                onChange={() => toggle(id)}
                aria-label={`Select ${med.medicine_name}`}
              />

              <div className="flex-grow-1">
                <div className="fw-semibold small">{med.medicine_name}</div>

                {med.needs_review && (
                  <div className="small text-muted">
                    <span className="badge bg-warning text-dark me-1">
                      Please verify
                    </span>
                    We read this as &ldquo;{med.extracted_name}&rdquo;
                  </div>
                )}
              </div>

              <div className="text-end flex-shrink-0">
                <div className="fw-semibold small mb-1">
                  ₹{formatPrice(price)}
                </div>

                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => changeQty(id, -1)}
                    disabled={!isChecked || qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    className="btn btn-outline-secondary disabled px-2"
                    style={{ minWidth: 34 }}
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => changeQty(id, 1)}
                    disabled={!isChecked}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="small text-muted">
          {selectedItems.length} selected
        </span>
        {selectedItems.length > 0 && (
          <span className="small fw-semibold">
            Approx. ₹{formatPrice(estimatedTotal)}
          </span>
        )}
      </div>

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-outline-secondary flex-fill"
          onClick={onSkip}
          disabled={adding}
        >
          Skip for now
        </button>
        <button
          className="btn btn-primary flex-fill"
          disabled={selectedItems.length === 0 || adding}
          onClick={() => onAddSelected(selectedItems)}
        >
          {adding ? "Adding..." : "Add selected to Health Bag"}
        </button>
      </div>
    </div>
  );
}
