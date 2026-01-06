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

  const [isClient, setIsClient] = useState(false);

  // Payment Selection: "qr" or "cod"
  const [paymentType, setPaymentType] = useState<"qr" | "cod">("qr");

  // COD Captcha states
  const [captchaQ, setCaptchaQ] = useState({ a: 0, b: 0 });
  const [captchaAns, setCaptchaAns] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem("buyerAccessToken");
    if (!token || !buyer?.id) {
      router.replace("/");
    }
  }, [isClient, buyer, router]);

  // Load checkout data
  useEffect(() => {
    const data = safeLocalStorage.getItem("checkoutData");
    if (data) {
      setCheckoutData(JSON.parse(data) as OrderPayload);
    } else {
      toast.error("No checkout data found!");
      router.push("/health-bag");
    }
  }, [router]);

  // Generate Captcha on load + when payment changes
  useEffect(() => {
    setCaptchaQ({
      a: Math.floor(Math.random() * 9) + 1,
      b: Math.floor(Math.random() * 9) + 1,
    });
  }, [paymentType]);

  if (!isClient || !buyer?.id) return null;

  // Back button
  const handleBack = () => {
    safeLocalStorage.removeItem("checkoutData");
    router.push("/health-bag");
  };

  // Continue → Order creation logic
  const handleContinue = async () => {
    if (!buyer || !token) {
      toast.error("Login required!");
      return;
    }

    if (!checkoutData) return;

    // If COD → verify captcha
    if (paymentType === "cod") {
      const correct = captchaQ.a + captchaQ.b;
      if (Number(captchaAns) !== correct) {
        toast.error("Captcha incorrect!");
        return;
      }
    }

    const orderPayload: OrderPayload = {
      ...checkoutData,
      //payment_mode: checkoutData.payment_mode || 1,
      payment_mode: paymentType === "qr" ? 1 : 2, // 1 → QR, 2 → COD
    };

    try {
      const res = await dispatch(
        createBuyerOrder({
          buyerId: buyer.id,
          payload: orderPayload,
        })
      ).unwrap();

      if (res?.status === true || res?.success) {
        safeLocalStorage.removeItem("checkoutData");

        if (healthBagItems?.length > 0) {
          for (const item of healthBagItems) {
            await removeItem(item.productid || item.product_id);
          }
        }

        setShowSuccess(true);
      } else {
        toast.error(res?.message || "Order failed");
      }
    } catch (err) {
      toast.error("Order creation failed");
    }
  };

  const regenerateCaptcha = () => {
    setCaptchaQ({
      a: Math.floor(Math.random() * 9) + 1,
      b: Math.floor(Math.random() * 9) + 1,
    });
    setCaptchaAns(""); // clear input
  };

  const handleModalHide = () => {
    setShowSuccess(false);
    router.push("/");
  };

  return (
    <div className="page-wrapper bg-light min-vh-100 d-flex flex-column">
      <SiteHeader />

      <div className="container py-5">
        <h4 className="fw-bold text-center mb-4 text-primary">
          Select Payment Method
        </h4>

        {/* Payment Type Selector */}
        <div className="d-flex justify-content-center gap-4 mb-4">
          <button
            className={`btn ${
              paymentType === "qr" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setPaymentType("qr")}
          >
            QR Payment
          </button>

          <button
            className={`btn ${
              paymentType === "cod" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setPaymentType("cod")}
          >
            Cash on Delivery
          </button>
        </div>

        {/* Payment Content */}
        <div className="d-flex justify-content-center">
          <div
            className="border rounded-4 p-4 shadow-sm"
            style={{ width: "100%", maxWidth: "420px", background: "#fff" }}
          >
            {/* =============== QR PAYMENT UI =============== */}
            {paymentType === "qr" && (
              <>
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=9876543210@upi&pn=HealthBag&am=${checkoutData?.amount}&cu=INR`}
                  alt="QR"
                  className="img-fluid"
                />

                <p className="text-center text-muted mt-3 mb-1">
                  Scan the QR to Pay
                </p>
                <h6 className="text-center fw-semibold text-success">
                  Amount: ₹{checkoutData?.amount}
                </h6>
              </>
            )}

            {/* =============== COD PAYMENT UI =============== */}
            {paymentType === "cod" && (
              <div className="text-center">
                <h6 className="fw-bold mb-3 text-primary">Verify Captcha</h6>

                <div className="bg-light p-3 rounded mb-3 d-flex justify-content-center align-items-center gap-3">
                  <span
                    className="fw-bold text-success"
                    style={{ fontSize: "20px" }}
                  >
                    {captchaQ.a} + {captchaQ.b} = ?
                  </span>

                  {/* 🔥 Refresh Captcha Button */}
                  <button
                    className="btn btn-sm btn-outline-primary rounded-circle"
                    onClick={regenerateCaptcha}
                    title="Refresh Captcha"
                    style={{ width: "36px", height: "36px", padding: 0 }}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>

                <input
                  type="number"
                  className="form-control text-center"
                  placeholder="Enter answer"
                  value={captchaAns}
                  onChange={(e) => setCaptchaAns(e.target.value)}
                />

                <p className="text-muted mt-2">
                  Enter the correct answer to place the order.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div
          className="d-flex justify-content-between mt-4"
          style={{ maxWidth: "420px", margin: "0 auto" }}
        >
          <button
            className="btn btn-outline-secondary px-4"
            onClick={handleBack}
          >
            ← Back
          </button>

          <button className="btn btn-success px-5" onClick={handleContinue}>
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        show={showSuccess}
        centered
        onHide={handleModalHide}
        backdrop="static"
      >
        <div className="text-center p-5">
          <i
            className="bi bi-check-circle-fill text-success"
            style={{ fontSize: 70 }}
          ></i>
          <h5 className="fw-bold mt-3">Order Placed Successfully!</h5>
          <h5 className="fw-bold mt-3">Go To..</h5>
          <div className="d-flex justify-content-center mt-4 gap-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => router.push("/")}
            >
              Home
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/profile?tab=order")}
            >
              Orders
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
