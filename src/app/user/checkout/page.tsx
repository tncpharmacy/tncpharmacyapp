"use client";

import React, { useEffect, useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Image, Modal } from "react-bootstrap";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { safeLocalStorage } from "@/lib/utils/safeLocalStorage";
import { createBuyerOrder } from "@/lib/features/buyerSlice/buyerSlice";
import type { OrderPayload } from "@/types/order";
import { useHealthBag } from "@/lib/hooks/useHealthBag";

export default function Checkout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<OrderPayload | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { buyer, loading, token } = useAppSelector((state) => state.buyer);
  const { removeItem, items: healthBagItems } = useHealthBag({
    userId: buyer?.id || null,
  });
  // ✅ Load checkout data from LocalStorage
  useEffect(() => {
    const data = safeLocalStorage.getItem("checkoutData");
    if (data) {
      setCheckoutData(JSON.parse(data) as OrderPayload);
    } else {
      toast.error("No checkout data found!");
      router.push("/health-bag");
    }
  }, [router]);

  // 🔙 Back button
  const handleBack = () => {
    safeLocalStorage.removeItem("checkoutData");
    router.push("/health-bag"); // or /healthBag
  };

  // ✅ Continue (Create Order)
  const handleContinue = async () => {
    if (!buyer || !token) {
      toast.error("Please login to continue!");
      return;
    }

    if (!checkoutData) return;

    const orderPayload: OrderPayload = {
      ...checkoutData,
      payment_mode: checkoutData.payment_mode || 1,
    };

    try {
      const res = await dispatch(
        createBuyerOrder({
          buyerId: buyer.id,
          payload: orderPayload,
        })
      ).unwrap();

      if (res?.status === true || res?.success) {
        // ✅ Step 1: Remove checkout data
        safeLocalStorage.removeItem("checkoutData");

        // ✅ Step 2: Clear user's HealthBag items
        if (healthBagItems?.length > 0) {
          for (const item of healthBagItems) {
            // removeItem() already handles API or LS removal
            await removeItem(item.productid || item.product_id);
          }
        }

        // ✅ Step 3: Show success modal
        setShowSuccess(true);
      } else {
        toast.error(res?.message || "Failed to create order");
      }
    } catch (err: unknown) {
      toast.error(
        typeof err === "string"
          ? err
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err as any)?.message || "Order creation failed"
      );
    }
  };

  // ✅ Handle click outside modal
  const handleModalHide = () => {
    setShowSuccess(false);
    router.push("/"); // redirect to home
  };
  return (
    <div className="page-wrapper bg-light min-vh-100 d-flex flex-column">
      <SiteHeader />

      <div className="container py-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        <h4 className="fw-bold mb-4 text-center text-primary">
          Complete Your Payment
        </h4>

        {/* ✅ QR Section */}
        <div
          className="border rounded-4 p-4 shadow-sm text-center mb-4"
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#fff",
          }}
        >
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=9876543210@upi&pn=HealthBag%20Store&am=${
              checkoutData?.amount || 0
            }&cu=INR`}
            alt="QR Code"
            style={{
              border: "2px solid #e0e0e0",
              borderRadius: "12px",
              padding: "12px",
              width: "100%",
              maxWidth: "280px",
              height: "auto",
              objectFit: "contain",
            }}
          />

          <p className="text-muted mt-3 mb-1">Scan & Pay via UPI</p>
          <h6 className="fw-semibold text-success">
            Amount: ₹{checkoutData?.amount || 0}
          </h6>
        </div>

        {/* ✅ Buttons */}
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ width: "100%", maxWidth: "420px" }}
        >
          <button
            className="btn btn-outline-secondary px-4"
            onClick={handleBack}
            disabled={loading}
          >
            ← Back
          </button>

          <button
            className="btn btn-success px-5"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </div>
      </div>

      {/* ✅ Success Modal */}
      <Modal
        show={showSuccess}
        centered
        onHide={handleModalHide}
        backdrop="static"
        keyboard={false}
      >
        <div className="text-center p-5">
          <i
            className="bi bi-check-circle-fill mb-3"
            style={{ fontSize: "70px", color: "#28a745" }}
          ></i>
          <h5 className="fw-bold text-success mb-2">
            Order Placed Successfully!
          </h5>
          <p className="text-muted mb-4">
            Thank you for your purchase. We’ll notify you once it’s confirmed.
          </p>

          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => router.push("/")}
            >
              Go To Home
            </button>

            <button
              className="btn btn-primary"
              onClick={() => router.push("/profile")}
            >
              Go To My Orders
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
