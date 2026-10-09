"use client";

import React, { useEffect, useRef, useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import SiteHeader from "@/app/(user)/components/header/header";
import Footer from "@/app/(user)/components/footer/footer";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { safeLocalStorage } from "@/lib/utils/safeLocalStorage";
import { createBuyerOrder } from "@/lib/features/buyerSlice/buyerSlice";
import type { OrderPayload } from "@/types/order";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { formatAmount } from "@/lib/utils/formatAmount";
import { formatPrice } from "@/lib/utils/formatPrice";
import { newIdempotencyKey } from "@/lib/utils/idempotencyKey";
import { payWithRazorpay } from "@/lib/utils/razorpayCheckout";
import {
  abandonRazorpayPaymentApi,
  getPaymentConfigApi,
} from "@/lib/api/payment";

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

  // Payment selection. Cash on Delivery is the default. "Pay Online"
  // (Razorpay) is always listed so customers can see it is coming, but it
  // can only be chosen once the server has Razorpay keys (TNC-19). The old
  // static QR image is gone: it took money with no way to confirm it.
  const [paymentType, setPaymentType] = useState<"online" | "cod">("cod");
  const [onlineEnabled, setOnlineEnabled] = useState(false);

  // TNC-22: one key per checkout attempt. A retry of the same attempt
  // (double tap, network error) reuses it, so the server returns the order
  // it already created instead of making a second one.
  const attemptKey = useRef<string | null>(null);
  const [placing, setPlacing] = useState(false);

  // COD Captcha states
  const [captchaQ, setCaptchaQ] = useState({ a: 0, b: 0 });
  const [captchaAns, setCaptchaAns] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // TNC-19: is online payment switched on for this environment?
  useEffect(() => {
    getPaymentConfigApi()
      .then((cfg) => {
        if (cfg?.razorpay_enabled) {
          setOnlineEnabled(true);
        }
      })
      .catch(() => setOnlineEnabled(false));
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

  // Order placed (and, for online, paid): clear the bag and show success.
  const finishOrder = async () => {
    safeLocalStorage.removeItem("checkoutData");
    attemptKey.current = null;
    if (healthBagItems?.length > 0) {
      for (const item of healthBagItems) {
        await removeItem(item.productid || item.product_id);
      }
    }
    setShowSuccess(true);
  };

  // Continue → Order creation logic
  const handleContinue = async () => {
    if (placing) return; // TNC-22: ignore taps while a request is in flight
    if (!buyer || !token) {
      toast.error("Login required!");
      return;
    }
    // TNC-18: the server refuses the whole order if any line is out of
    // stock; say which one here so the buyer can fix the bag instead.
    const unavailable = (healthBagItems || []).filter(
      (i) => i.in_stock === false
    );
    if (unavailable.length) {
      toast.error(
        `Out of stock, please remove from your bag: ${unavailable
          .map((i) => i.productname)
          .join(", ")}`
      );
      return;
    }

    if (!checkoutData) return;

    // Belt and braces: the button is disabled without keys, and the server
    // answers 503 anyway, but say it plainly if we ever get here.
    if (paymentType === "online" && !onlineEnabled) {
      toast.error(
        "Online payment is not available in this environment. Please use Cash on Delivery."
      );
      return;
    }

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
      payment_mode: paymentType === "cod" ? 2 : 1, // 1 → online/QR, 2 → COD
    };

    if (!attemptKey.current) attemptKey.current = newIdempotencyKey();
    setPlacing(true);

    try {
      const res = await dispatch(
        createBuyerOrder({
          buyerId: buyer.id,
          payload: orderPayload,
          idempotencyKey: attemptKey.current,
        })
      ).unwrap();

      if (!(res?.status === true || res?.success)) {
        toast.error(res?.message || "Order failed");
        return;
      }

      if (paymentType !== "online") {
        await finishOrder();
        return;
      }

      // TNC-19: the order exists and holds its stock; now take payment.
      const orderId = Number(res?.data?.order_id);
      const outcome = await payWithRazorpay(orderId, (msg) => toast.error(msg));

      if (outcome === "paid") {
        await finishOrder();
      } else if (outcome === "unverified") {
        // Razorpay took the money but our confirmation call failed; the
        // webhook settles it. Never cancel here.
        toast("Payment received — we are confirming it. Your order will update shortly.");
        await finishOrder();
      } else {
        // Closed the window or it never opened: release the order and its
        // stock so nothing is held for a payment that isn't coming.
        await abandonRazorpayPaymentApi(orderId).catch(() => undefined);
        attemptKey.current = null; // next try is a new order
        toast.error(
          outcome === "dismissed"
            ? "Payment not completed. Your order was cancelled and nothing was charged."
            : "Could not open the payment window. Please try again or choose Cash on Delivery."
        );
      }
    } catch (err) {
      // `unwrap()` rejects with the thunk's rejectValue -- the server's own
      // reason (e.g. "Dolo 650 is out of stock."), so show that. The key is
      // kept: if the first request did get through, the retry returns it.
      toast.error(typeof err === "string" && err ? err : "Order creation failed");
    } finally {
      setPlacing(false);
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
      {/* <SiteHeader /> */}

      <div className="container py-5">
        <h4 className="fw-bold text-center mb-4 text-primary">
          Select Payment Method
        </h4>

        {/* Payment Type Selector */}
        <div className="d-flex justify-content-center gap-4 mb-4">
          <button
            className={`btn ${
              paymentType === "online" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => onlineEnabled && setPaymentType("online")}
            disabled={!onlineEnabled}
            title={onlineEnabled ? undefined : "Online payment is coming soon"}
          >
            Pay Online
            {!onlineEnabled && (
              <span className="badge bg-secondary ms-2">Coming soon</span>
            )}
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
        {!onlineEnabled && (
          <p className="text-center text-muted small mb-4">
            Online payment is not available in this environment. Please use
            Cash on Delivery.
          </p>
        )}

        {/* Payment Content */}
        <div className="d-flex justify-content-center">
          <div
            className="border rounded-4 p-4 shadow-sm"
            style={{ width: "100%", maxWidth: "420px", background: "#fff" }}
          >
            {/* =============== ONLINE (RAZORPAY) UI =============== */}
            {paymentType === "online" && (
              <div className="text-center">
                <i
                  className="bi bi-shield-check text-success"
                  style={{ fontSize: 48 }}
                ></i>
                <p className="text-muted mt-2 mb-1">
                  UPI, cards, net banking and wallets via Razorpay
                </p>
                <h6 className="fw-semibold text-success">
                  Amount: ₹{formatPrice(checkoutData?.amount || 0)}
                </h6>
                <p className="small text-muted mb-0">
                  The final amount is confirmed by our server before payment.
                </p>
              </div>
            )}

            {/* =============== COD PAYMENT UI =============== */}
            {paymentType === "cod" && (
              <div className="text-center">
                <h6 className="fw-semibold text-success">
                  Pay on delivery: ₹{formatPrice(checkoutData?.amount || 0)}
                </h6>
                <p className="small text-muted mb-3">
                  {Number(checkoutData?.delivery_fee) > 0
                    ? `Includes delivery ₹${formatPrice(
                        checkoutData?.delivery_fee || 0
                      )}. Please pay the delivery partner's rider.`
                    : "Free delivery. Please pay the delivery partner's rider."}
                </p>
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

          <button
            className="btn btn-success px-5"
            onClick={handleContinue}
            disabled={placing || loading}
          >
            {placing || loading
              ? "Processing..."
              : paymentType === "online"
              ? "Place Order & Pay"
              : "Place Order"}
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
