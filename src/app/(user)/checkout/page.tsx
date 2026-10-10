"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";
import { CheckoutSteps, StickyPayBar } from "../health-bag/BagSections";
import {
  DeliveringToSummary,
  OrderPlacedView,
  OrderSummary,
  PaymentOptions,
  PrescriptionSummary,
  type PlacedOrder,
  type SummaryLine,
} from "./CheckoutSections";
import { getAddress } from "@/lib/features/addressSlice/addressSlice";
import { useDeliveryQuote } from "@/lib/hooks/useDeliveryQuote";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { safeLocalStorage } from "@/lib/utils/safeLocalStorage";
import { createBuyerOrder } from "@/lib/features/buyerSlice/buyerSlice";
import type { OrderPayload } from "@/types/order";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
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
  // Set once the order is placed: swaps the payment form for the
  // "Order placed" screen (Figma B4). It holds its own copy of the items and
  // address because the bag is emptied straight after.
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

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

  // ---- What the payment screen shows (read-only; the bag decided it) ----
  // The bag saved only ids, quantities and prices in `checkoutData`; names
  // and pack sizes come from the bag items, the address from the address
  // list, and the fee line from the same server quote the bag used.
  const addresses = useAppSelector((state) => state.address.addresses);
  // Fetch once if the store is empty (e.g. the page was reloaded). A ref,
  // not `addresses` in the deps, so an empty answer can't loop.
  const addressesRequested = useRef(false);
  useEffect(() => {
    if (addressesRequested.current || !buyer?.id || addresses?.length) return;
    addressesRequested.current = true;
    dispatch(getAddress(buyer.id));
  }, [buyer?.id, addresses?.length, dispatch]);
  const address =
    addresses?.find((a) => a.id === Number(checkoutData?.address_id)) ?? null;
  const { quote: deliveryQuote, loading: quoteLoading } = useDeliveryQuote(
    checkoutData?.address_id ?? null
  );
  const prescriptionId = useAppSelector((state) => state.healthBag.prescription_id);

  const summary = useMemo(() => {
    const byId = new Map(
      (healthBagItems || []).map((i) => [Number(i.productid || i.product_id), i])
    );
    let totalMrp = 0;
    let totalPay = 0;
    let needsRx = false;
    const lines: SummaryLine[] = (checkoutData?.products || []).map((p) => {
      const item = byId.get(Number(p.product_id));
      const qty = Number(p.quantity) || 1;
      const mrp = Number(p.mrp) || 0;
      const rate = Number(p.rate) || 0;
      totalMrp += mrp * qty;
      totalPay += rate * qty;
      if (item?.prescription_required === 1) needsRx = true;
      return {
        id: Number(p.product_id),
        name: item?.productname || "Medicine",
        qty,
        pack: item?.pack_size,
        lineTotal: rate * qty,
      };
    });
    return { lines, totalMrp, totalDiscount: totalMrp - totalPay, needsRx };
  }, [checkoutData, healthBagItems]);

  const amount = Number(checkoutData?.amount) || 0;
  const deliveryFee = Number(checkoutData?.delivery_fee) || 0;
  // Same gates as the bag, re-checked here in case something changed (the
  // address was edited, or the page was opened directly).
  const blockReason: string | null =
    deliveryQuote && !deliveryQuote.deliverable
      ? "Choose an address we can deliver to"
      : summary.needsRx && !prescriptionId
      ? "Upload the prescription in your bag"
      : null;

  if (!isClient || !buyer?.id) return null;

  // Back button
  const handleBack = () => {
    safeLocalStorage.removeItem("checkoutData");
    router.push("/health-bag");
  };

  // Order placed (and, for online, paid): remember what was ordered for the
  // "Order placed" screen, then clear the bag. The snapshot comes first
  // because clearing the bag empties `healthBagItems`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finishOrder = async (orderData: any) => {
    setPlacedOrder({
      orderId: Number(orderData?.order_id) || 0,
      orderNumber: orderData?.order_number ?? null,
      // The server's own total wins over the figure the bag worked out.
      amount: Number(orderData?.amount) || amount,
      saved: summary.totalDiscount,
      paymentType,
      lines: summary.lines,
      address,
      rxAttached: summary.needsRx && !!prescriptionId,
      buyerName: buyer?.name,
      buyerMobile: buyer?.number,
    });
    window.scrollTo({ top: 0 });
    safeLocalStorage.removeItem("checkoutData");
    attemptKey.current = null;
    if (healthBagItems?.length > 0) {
      for (const item of healthBagItems) {
        await removeItem(item.productid || item.product_id);
      }
    }
  };

  // Continue → Order creation logic
  const handleContinue = async () => {
    if (placing) return; // TNC-22: ignore taps while a request is in flight
    if (blockReason) {
      toast.error(blockReason);
      return;
    }
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
        await finishOrder(res?.data);
        return;
      }

      // TNC-19: the order exists and holds its stock; now take payment.
      const orderId = Number(res?.data?.order_id);
      const outcome = await payWithRazorpay(orderId, (msg) => toast.error(msg));

      if (outcome === "paid") {
        await finishOrder(res?.data);
      } else if (outcome === "unverified") {
        // Razorpay took the money but our confirmation call failed; the
        // webhook settles it. Never cancel here.
        toast("Payment received — we are confirming it. Your order will update shortly.");
        await finishOrder(res?.data);
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

  return (
    <div className="page-wrapper d-flex flex-column min-vh-100">
      <section className="bf-page flex-grow-1">
        <div className="container">
          {placedOrder ? (
            <>
              {/* Figma B4 / M4: order placed */}
              <CheckoutSteps active={2} />
              <OrderPlacedView
                order={placedOrder}
                onTrack={() =>
                  router.push(
                    placedOrder.orderId
                      ? `/profile/orders/${placedOrder.orderId}`
                      : "/profile?tab=order"
                  )
                }
                onShop={() => router.push("/")}
              />
            </>
          ) : (
            <>
              {/* Figma B3 / M3: payment */}
              <CheckoutSteps active={1} />
              <div className="row g-4">
                <div className="col-lg-8">
                  <button type="button" className="bf-link bf-back" onClick={handleBack}>
                    <i className="bi bi-arrow-left" aria-hidden="true" /> Back to bag
                  </button>
                  <div className="bf-title">
                    <h1>Payment</h1>
                  </div>

                  <PaymentOptions
                    paymentType={paymentType}
                    onSelect={setPaymentType}
                    onlineEnabled={onlineEnabled}
                    amount={amount}
                    captcha={captchaQ}
                    captchaAns={captchaAns}
                    onCaptchaChange={setCaptchaAns}
                    onCaptchaRefresh={regenerateCaptcha}
                  />
                  <DeliveringToSummary
                    address={address}
                    quote={deliveryQuote}
                    loading={quoteLoading}
                  />
                  {summary.needsRx && (
                    <PrescriptionSummary attached={!!prescriptionId} />
                  )}
                </div>

                <div className="col-lg-4">
                  <OrderSummary
                    lines={summary.lines}
                    totalMrp={summary.totalMrp}
                    totalDiscount={summary.totalDiscount}
                    deliveryFee={deliveryFee}
                    quote={deliveryQuote}
                    toPay={amount}
                    paymentType={paymentType}
                    placing={placing || loading}
                    blockReason={blockReason}
                    onPlace={handleContinue}
                  />
                </div>
              </div>
              <StickyPayBar
                amount={amount}
                sub={blockReason || (paymentType === "cod" ? "To pay on delivery" : "To pay now")}
                cta={placing || loading ? "Placing order…" : "Place order"}
                onClick={handleContinue}
                disabled={placing || loading || !!blockReason}
              />
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
