/**
 * Open Razorpay's payment window for an order we already created (TNC-19).
 *
 * Resolves with:
 *   "paid"       the checkout callback came back and the server verified it
 *   "unverified" Razorpay says paid, but our verify call failed (network or
 *                signature) — the webhook will still settle it, so do NOT
 *                cancel the order
 *   "dismissed"  the buyer closed the window without paying
 *   "error"      the script could not load or the payment couldn't start
 */
import {
  RazorpayOrderData,
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
} from "@/lib/api/payment";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type PaymentOutcome = "paid" | "unverified" | "dismissed" | "error";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<boolean> | null = null;

function loadScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve(true);
      s.onerror = () => {
        scriptPromise = null; // allow a retry later
        resolve(false);
      };
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
}

export async function payWithRazorpay(
  orderId: number,
  onAttemptFailed?: (message: string) => void
): Promise<PaymentOutcome> {
  if (!(await loadScript()) || !window.Razorpay) return "error";

  let data: RazorpayOrderData;
  try {
    data = await createRazorpayOrderApi(orderId);
  } catch {
    return "error";
  }

  return new Promise<PaymentOutcome>((resolve) => {
    let settled = false;
    const done = (outcome: PaymentOutcome) => {
      if (!settled) {
        settled = true;
        resolve(outcome);
      }
    };

    const rzp = new window.Razorpay!({
      key: data.key_id,
      order_id: data.razorpay_order_id,
      amount: data.amount,
      currency: data.currency,
      name: data.name,
      description: data.order_number ? `Order ${data.order_number}` : "Order",
      prefill: data.prefill,
      theme: { color: "#264b8c" }, // brand navy (Figma brand/primary)
      handler: async (resp: RazorpayResponse) => {
        try {
          await verifyRazorpayPaymentApi(resp);
          done("paid");
        } catch {
          done("unverified");
        }
      },
      modal: {
        // Closing the window is the buyer's "I'm not paying" — unless a
        // payment already went through, in which case handler ran first.
        ondismiss: () => done("dismissed"),
        confirm_close: true,
      },
    });

    // A failed attempt (card declined, UPI timeout) keeps the window open so
    // the buyer can try another method; just tell them what happened.
    rzp.on("payment.failed", (resp) => {
      onAttemptFailed?.(resp?.error?.description || "Payment failed. Please try again.");
    });

    rzp.open();
  });
}
