import React, { useState } from "react";
import { Modal } from "react-bootstrap";

interface ManualLocationModalProps {
  show: boolean;
  onClose: () => void;
  onSelectLocation: (loc: {
    city: string;
    state: string;
    country: string;
  }) => void;
}

const sampleLocations = [
  { city: "Delhi", state: "Delhi", country: "India", pincode: "110001" },
  { city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001" },
  {
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    pincode: "700001",
  },
  {
    city: "Lucknow",
    state: "Uttar Pradesh",
    country: "India",
    pincode: "226001",
  },
  { city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001" },
  { city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600001" },
];

export default function ManualLocationModal({
  show,
  onClose,
  onSelectLocation,
}: ManualLocationModalProps) {
  const [query, setQuery] = useState("");

  const filteredLocations = sampleLocations.filter(
    (loc) =>
      loc.city.toLowerCase().includes(query.toLowerCase()) ||
      loc.state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal show={show} onHide={onClose} centered>
      <div className="p-4">
        <h5 className="text-center mb-3">Enter Location Manually</h5>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search your city or state..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div
          style={{
            maxHeight: "250px",
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: "5px",
          }}
        >
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc, i) => (
              <div
                key={i}
                className="p-2 location-item"
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #f5f5f5",
                }}
                onClick={() => onSelectLocation(loc)}
              >
                <strong>{loc.city}</strong> — {loc.state}, {loc.country}
              </div>
            ))
          ) : (
            <div className="text-muted text-center py-3">No results found.</div>
          )}
        </div>

        <button
          className="btn btn-outline-primary mt-3 w-100"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
