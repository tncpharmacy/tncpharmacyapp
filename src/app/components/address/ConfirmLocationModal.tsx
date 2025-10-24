import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Address } from "@/types/address";
import "../../user/css/user-style.css";

interface ConfirmLocationModalProps {
  show: boolean;
  onClose: () => void;
  locationDetails: Partial<Address>;
  onSubmit: (data: Address) => void;
}

export default function ConfirmLocationModal({
  show,
  onClose,
  locationDetails,
  onSubmit,
}: ConfirmLocationModalProps) {
  const [formData, setFormData] = useState<Partial<Address>>({
    id: 0,
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    type: "Home",
  });

  useEffect(() => {
    if (locationDetails) {
      setFormData((prev) => ({
        ...prev,
        city: locationDetails.city || "",
        state: locationDetails.state || "",
        country: locationDetails.country || "",
        pincode: locationDetails.pincode || "",
      }));
    }
  }, [locationDetails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Address);
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="custom-modal-backdrop"
      contentClassName="custom-modal-content"
    >
      <div className="p-4">
        {/* Close Button */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold mb-0">Add Address Details</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        {/* Location Info */}
        <div className="mb-3 text-secondary small">
          📍 <strong>{formData.city || "Your City"}</strong>,{" "}
          {formData.state || "India"}
        </div>

        <form onSubmit={handleSubmit}>
          <p className="text-muted small mb-2">
            * Fields marked with an asterisk are required.
          </p>

          <div className="col-md-12">
            <div className="txt_col">
              <span className="lbl1">*Pincode</span>
              <input
                type="text"
                name="pincode"
                className="form-control"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="txt_col">
              <span className="lbl1">
                *House Number, Floor, Building Name, Locality
              </span>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="txt_col">
              <span className="lbl1">*Recipient’s Name</span>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="txt_col">
              <span className="lbl1">*Mobile</span>
              <input
                type="text"
                name="mobile"
                className="form-control"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Save Button */}
          <button className="btn btn-primary w-100" type="submit">
            Save Address
          </button>
        </form>
      </div>
    </Modal>
  );
}
