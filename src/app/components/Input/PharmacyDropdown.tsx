// src/components/common/PharmacyDropdown.tsx

"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchPharmacyList } from "@/lib/features/pharmacyListSlice/pharmacyListSlice";

interface Props {
  value?: number | null;
  onChange: (id: number) => void;
  label?: string;
}

const PharmacyDropdown: React.FC<Props> = ({ value, onChange, label }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector(
    (state: RootState) => state.pharmacyList
  );

  useEffect(() => {
    dispatch(fetchPharmacyList());
  }, [dispatch]);

  return (
    <div className="mb-3">
      {label && <label className="form-label fw-bold">{label}</label>}
      <select
        className="form-select"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={loading}
      >
        <option value="">-- Select Pharmacy --</option>
        {list
          .filter((p) => p.pharmacy_name) // null ko hata diya
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.pharmacy_name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default PharmacyDropdown;
