// components/AddressList.tsx
"use client";
import React from "react";
import { BuyerAddress } from "@/types/order";
import toast from "react-hot-toast";

interface Props {
  addresses: BuyerAddress[];
  onRemove: (id: number) => void;
}

export default function AddressList({ addresses, onRemove }: Props) {
  return (
    <>
      {addresses.map((addr, idx) => (
        <div key={idx} className="border rounded p-3 mb-3">
          <label className="fw-semibold mb-0" style={{ fontSize: "15px" }}>
            {addr.address_type_id === 1
              ? "Home"
              : addr.address_type_id === 2
              ? "Office"
              : "Other"}
          </label>
          <p className="text-muted mb-0">{addr.name}</p>
          <p className="text-muted mb-0">{addr.address}</p>
          <p className="text-muted mb-0">
            {addr.location} - {addr.pincode}
          </p>
          <p className="text-muted mb-2">{addr.mobile}</p>
          <button
            className="btn btn-link p-0 fw-semibold text-danger"
            style={{ fontSize: "13px" }}
            onClick={() => addr.id && onRemove(addr.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </>
  );
}
