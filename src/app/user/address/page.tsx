"use client";

import React, { useState } from "react";
import SiteHeader from "@/app/user/components/header/header";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/site-style.css";
import AddAddressModal from "@/app/components/address/AddAddressModal";
import CurrentLocationMapModal from "@/app/components/address/CurrentLocationMapModal";
import ConfirmLocationModal from "@/app/components/address/ConfirmLocationModal";
import toast from "react-hot-toast";
import ManualLocationModal from "@/app/components/address/ManualLocationModal"; // ✅ new
import { Address, LocationDetails } from "@/types/address";

export default function AddressList() {
  const [step, setStep] = useState<
    "none" | "add" | "map" | "confirm" | "manual"
  >("none");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDetails | null>(null);
  const [billingAddress, setBillingAddress] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(0);
  const [billingAddresses, setBillingAddresses] = useState<Address[]>([
    {
      title: "Home",
      address:
        "1/18/58, Sahadat Ali Kha Ki Chhawani, Ram Nagar, Faizabad, Uttar Pradesh (224001)",
      name: "Pulkit Srivastava",
      mobile: "7007319975",
    },
    {
      title: "Office",
      address:
        "A-12, Sector 62, Noida, Gautam Buddha Nagar, Uttar Pradesh (201301)",
      name: "Pulkit Srivastava",
      mobile: "7007319975",
    },
    {
      title: "Other",
      address:
        "Flat No. 303, Tower B, Gaur City 1, Greater Noida West, Uttar Pradesh (201318)",
      name: "Pulkit Srivastava",
      mobile: "7007319975",
    },
  ]);

  const [shippingAddresses, setShippingAddresses] = useState([
    {
      title: "Home",
      address:
        "Gali No-1A, D-30, 2nd Floor, Flat no-9, Ganesh Nagar, Delhi (110092)",
      name: "Pulkit Srivastava",
      mobile: "7007319975",
    },
    {
      title: "Work",
      address:
        "A-202, Flat No-5, Near Gali No-25, New Ashok Nagar, Delhi (110096)",
      name: "Pulkit Srivastava",
      mobile: "7007319975",
    },
    {
      title: "Parents",
      address:
        "C-45, Rajendra Nagar, Sector 5, Sahibabad, Ghaziabad, Uttar Pradesh (201005)",
      name: "Pulkit Srivastava",
      mobile: "7007319975",
    },
  ]);

  // ===== Logic for Add Address Buttons =====
  const handleAddBillingAddress = () => {
    // if (billingAddresses.length >= 3) {
    //   toast.error("You cannot add more than 3 billing addresses!");
    //   return;
    // }

    // ✅ If less than 3 addresses, open first modal
    setStep("add");
  };

  const handleAddShippingAddress = () => {
    // if (shippingAddresses.length >= 3) {
    //   toast.error("You cannot add more than 3 shipping addresses!");
    //   return;
    // }
    // else -> open your form/modal here (if needed)
    setStep("add");
  };

  const handleSaveAddress = (data: Address) => {
    setBillingAddresses((prev) => [...prev, data]);
    alert("Address saved successfully!");
    setStep("none");
  };

  return (
    <>
      <SiteHeader />

      <div className="container my-4">
        {/* ===== BILLING ADDRESS SECTION ===== */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold">Buyer Address</h4>
          <button className="btn btn-primary" onClick={handleAddBillingAddress}>
            + Add new address
          </button>
          {/* STEP 1 - Choose Option */}
          <AddAddressModal
            show={step === "add"}
            onClose={() => setStep("none")}
            onSelectOption={(option) => {
              if (option === "current") setStep("map");
              else setStep("manual"); // ✅ open manual modal
            }}
          />

          {/* STEP 2 - Map Location */}
          <CurrentLocationMapModal
            show={step === "map"}
            onClose={() => setStep("none")}
            onConfirm={(loc) => {
              setSelectedLocation(loc);
              setStep("confirm");
            }}
          />

          {/* STEP 3 - Manual Search Modal */}
          <ManualLocationModal
            show={step === "manual"}
            onClose={() => setStep("none")}
            onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              setStep("confirm");
            }}
          />

          {/* STEP 4 - Address Form */}
          <ConfirmLocationModal
            show={step === "confirm"}
            onClose={() => setStep("none")}
            locationDetails={selectedLocation || {}}
            onSubmit={handleSaveAddress}
          />
        </div>

        <div className="row">
          {billingAddresses.map((addr, index) => (
            <div className="col-md-4 mb-3" key={index}>
              <div
                className={`card border-2 ${
                  billingAddress === index
                    ? "border-primary"
                    : "border-light-subtle"
                }`}
                onClick={() => setBillingAddress(index)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="billingAddress"
                      checked={billingAddress === index}
                      readOnly
                    />
                    <label className="form-check-label fw-bold ms-2">
                      {addr.title}
                    </label>
                  </div>
                  <p className="mt-2 mb-1 small">{addr.address}</p>
                  <p className="fw-semibold mb-0">{addr.name}</p>
                  <p className="text-muted small">{addr.mobile}</p>
                  <div className="d-flex gap-3 mt-2">
                    {/* <button className="btn btn-link text-danger p-0">
                      Edit
                    </button> */}
                    <button className="btn btn-link text-danger p-0">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
