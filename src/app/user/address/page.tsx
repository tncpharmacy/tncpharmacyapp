"use client";

import React, { useEffect, useState } from "react";
import SiteHeader from "@/app/user/components/header/header";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/site-style.css";
import AddAddressModal from "@/app/components/address/AddAddressModal";
import CurrentLocationMapModal from "@/app/components/address/CurrentLocationMapModal";
import ConfirmLocationModal from "@/app/components/address/ConfirmLocationModal";
import ManualLocationModal from "@/app/components/address/ManualLocationModal";
import toast from "react-hot-toast";
import { Address, LocationDetails } from "@/types/address";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import {
  getAddress,
  getAddressById,
  removeAddress,
} from "@/lib/features/addressSlice/addressSlice";

type StepType = "none" | "add" | "map" | "confirm" | "manual";

export default function AddressList() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const userId: number | null = buyer?.id || null;

  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [isClient, setIsClient] = useState(false); // ✅ ensure client render only
  const [step, setStep] = useState<StepType>("none");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDetails | null>(null);
  const [billingAddress, setBillingAddress] = useState(0);

  const activeAddresses = useAppSelector((state) => state.address.addresses);
  // ✅ Filter only active addresses
  const billingAddresses = activeAddresses?.filter(
    (addr) => addr.status === "Active"
  );

  useEffect(() => {
    // Run only on client
    setIsClient(true);

    const token = localStorage.getItem("buyerAccessToken");
    if (!token || !userId) {
      toast.error("Please login first!");
      router.push("/");
    }
  }, [userId, router]);

  useEffect(() => {
    if (userId) {
      dispatch(getAddress(userId));
    }
  }, [dispatch, userId]);

  // ✅ Prevent hydration mismatch
  if (!isClient) return null;

  // ✅ Remove handler
  const handleRemove = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this address?"))
      return;

    try {
      console.log("Deleting address:", id);
      const res = await dispatch(removeAddress(id)).unwrap();
      toast.success("Address removed successfully!");
      if (userId !== null) {
        dispatch(getAddress(userId));
      }
    } catch (err) {
      toast.error("Failed to remove address!");
      console.error("Delete error:", err);
    }
  };

  const handleRefreshList = () => {
    if (userId) {
      dispatch(getAddress(userId));
    }
  };

  const handleEdit = (addressId: number) => {
    if (userId) {
      dispatch(getAddressById({ buyerId: userId, addressId }));
      setShowModal(true);
    }
  };

  return (
    <>
      <SiteHeader />

      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold">Patient Address</h4>

          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            disabled={billingAddresses.length >= 6}
          >
            + Add New Address
          </button>
          {userId !== null && (
            <ConfirmLocationModal
              show={showModal}
              onClose={() => setShowModal(false)}
              locationDetails={selectedLocation || {}}
              onSubmit={handleRefreshList}
              userId={userId}
              //isEditMode={true}
            />
          )}
        </div>
        <hr style={{ border: "2px solid #000" }} />
        <div className="row">
          {billingAddresses.map((addr, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div
                className={`card ${
                  billingAddress === index ? "border-danger" : "border-light"
                } shadow-sm`}
                onClick={() => setBillingAddress(index)}
                style={{
                  cursor: "pointer",
                  borderWidth: "2px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease-in-out",
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-center mb-2">
                    <input
                      type="radio"
                      name="billingAddress"
                      checked={billingAddress === index}
                      readOnly
                      className="form-check-input me-2"
                      style={{
                        accentColor: "#e53935",
                        transform: "scale(1.1)",
                      }}
                    />
                    <label
                      className="fw-semibold mb-0"
                      style={{ fontSize: "15px", color: "#212121" }}
                    >
                      {addr.address_type_id === 1
                        ? "Home"
                        : addr.address_type_id === 2
                        ? "Office"
                        : "Other"}
                    </label>
                  </div>

                  <div className="ps-4">
                    <p
                      className="mb-1"
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        lineHeight: "1",
                      }}
                    >
                      {addr.address}
                    </p>
                    <p
                      className="mb-3"
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        lineHeight: "1",
                      }}
                    >
                      {addr.location} ({addr.pincode})
                    </p>
                    <p
                      className="mb-0 fw-semibold"
                      style={{ fontSize: "13.5px", color: "#212121" }}
                    >
                      {addr.name}
                    </p>
                    <p
                      className="mb-2"
                      style={{ fontSize: "13px", color: "#757575" }}
                    >
                      {addr.mobile}
                    </p>

                    <div className="d-flex gap-3 ps-1">
                      {/* <button
                        className="btn btn-link p-0 fw-semibold"
                        style={{
                          fontSize: "13px",
                          color: "#e53935",
                          textDecoration: "none",
                        }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!addr.id) {
                            toast.error("Invalid address ID");
                            return;
                          }
                          handleEdit(addr.id);
                        }}
                      >
                        Edit
                      </button> */}
                      <button
                        className="btn btn-link p-0 fw-semibold"
                        style={{
                          fontSize: "13px",
                          color: "#e53935",
                          textDecoration: "none",
                        }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!addr.id) {
                            toast.error("Invalid address ID");
                            return;
                          }
                          handleRemove(addr.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
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
