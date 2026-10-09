"use client";

/**
 * Order details (Figma: "A4 · Order details").
 *
 * Reads one order from GET /api/order/buyer/detail/<id>/ (scoped to the
 * signed-in buyer on the server, so another customer's id just shows
 * "not found"). The timeline uses the timestamps the backend records when the
 * pharmacist changes the status (orderDate, dispatched_on, delivered_on,
 * cancelled_on); the bill comes pre-computed from the server (`bill`).
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/site-style.css";
import "../../account.css";
import Footer from "@/app/(user)/components/footer/footer";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import PrescriptionUploadModal from "@/app/(user)/components/PrescriptionUploadModal/PrescriptionUploadModal";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getBuyerOrdersList } from "@/lib/features/buyerSlice/buyerSlice";
import { getAddress } from "@/lib/features/addressSlice/addressSlice";
import { buyerGetOrderDetailsApi } from "@/lib/api/buyer";
import { encodeId } from "@/lib/utils/encodeDecode";
import type { OrderDetail } from "@/types/buyer";
import AccountSidebar, { AccountTab } from "../../components/AccountSidebar";
import { OrderStepper } from "../../components/OrderCard";
import StatusChip from "../../components/StatusChip";
import { useAccountActions } from "../../useAccountActions";
import {
  formatOrderDateTime,
  orderStage,
  productImageUrl,
  stageLabel,
  stageNote,
  stageStep,
} from "../../orderView";
import { getBuyerTrackingApi } from "@/lib/api/delivery";
import type { BuyerTracking } from "@/types/delivery";

/** ISO date-time from the delivery API -> "08 Oct 2026, 4:40 PM". */
const isoWhen = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const rupees = (v?: string | number | null) =>
  Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Line = OrderDetail["products"][number];

/**
 * The bill the server sends (`order.bill`, tncpharmacyapi e83cb07). An API
 * without it -- not yet deployed -- would make every figure ₹0.00, so the same
 * arithmetic is done here from the order lines as a fallback:
 *   MRP total = sum(mrp x qty), items total = sum(rate x qty),
 *   delivery fee = amount - items total (the fee is not stored separately).
 */
function billOf(order: OrderDetail): NonNullable<OrderDetail["bill"]> {
  if (order.bill && Number(order.bill.mrp_total) > 0) return order.bill;
  let mrp = 0;
  let items = 0;
  for (const p of order.products || []) {
    const qty = Number(p.quantity) || 0;
    mrp += (Number(p.mrp) || 0) * qty;
    items += (Number(p.rate) || 0) * qty;
  }
  const amount = Number(order.amount) || 0;
  let fee = amount - items;
  let extra = 0;
  if (fee < 0) {
    extra = -fee;
    fee = 0;
  }
  const f = (n: number) => n.toFixed(2);
  return { mrp_total: f(mrp), discount: f(mrp - items + extra), items_total: f(items), delivery_fee: f(fee), amount: f(amount) };
}

export default function OrderDetailsView() {
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params?.orderId);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const buyer = useAppSelector((s) => s.buyer.buyer) as { id: number; name?: string; number?: string } | null;
  const orderCount = useAppSelector((s) => (s.buyer.list as unknown[] | undefined)?.length || 0);
  const addressCount = useAppSelector(
    (s) => (s.address.addresses || []).filter((a: { status?: string }) => a.status === "Active").length
  );
  const { logout, reorder, cancelOrder, cancellingId } = useAccountActions();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  // Stages + delivery rider from /api/delivery/buyer/orders/<id>/. Optional:
  // if it fails the page still works from the order alone.
  const [tracking, setTracking] = useState<BuyerTracking | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [showRx, setShowRx] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // Not signed in: same behaviour as /profile?tab=order -- go home, open the
  // login, come back here afterwards.
  useEffect(() => {
    if (!ready || buyer) return;
    if (localStorage.getItem("justLoggedOut") === "true") return;
    localStorage.setItem("redirectAfterLogin", pathname || "/profile?tab=order");
    localStorage.setItem("shouldOpenLogin", "true");
    router.replace("/");
  }, [ready, buyer, pathname, router]);

  const load = useCallback(async (background = false) => {
    if (!buyer || !Number.isFinite(orderId)) return;
    try {
      const res = await buyerGetOrderDetailsApi(orderId);
      const d = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;
      if (!d) {
        setState("missing");
        return;
      }
      setOrder(d as OrderDetail);
      setState("ready");
      getBuyerTrackingApi(orderId)
        .then(setTracking)
        .catch(() => setTracking(null));
    } catch {
      // A failed background refresh keeps the page as it is; only the first
      // load shows the error view.
      if (!background) setState("error");
    }
  }, [buyer, orderId]);

  useEffect(() => {
    load();
  }, [load]);

  // Counts for the side menu (the list may not be loaded when this page is
  // opened directly).
  useEffect(() => {
    if (!buyer) return;
    if (!orderCount) dispatch(getBuyerOrdersList(buyer.id));
    if (!addressCount) dispatch(getAddress(buyer.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer?.id]);

  // The pharmacist may move the order on while this page is open.
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && load(true);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [load]);

  const stage = order ? orderStage(order) : "process";

  // While the order is on its way, re-read every 30 seconds so the rider's
  // progress shows without a refresh.
  useEffect(() => {
    if (state !== "ready" || stage === "delivered" || stage === "cancelled") return;
    const t = window.setInterval(() => load(true), 30000);
    return () => window.clearInterval(t);
  }, [state, stage, load]);

  const rider = tracking?.shipment && tracking.shipment.is_active ? tracking.shipment : null;
  // Payment mode names differ between environments ("Cash on Delivery" on
  // one, "COD" on another), so match both.
  const isCod = /cash|\bcod\b/i.test(order?.paymentMode || "");
  const paid = order?.paymentStatus === "Success";
  const bill = useMemo(() => (order ? billOf(order) : undefined), [order]);
  const number = order ? `#${order.order_number || order.orderId}` : "";

  const timeline = useMemo(() => {
    if (!order) return [];
    type Row = { label: string; when: string; done: boolean; tone?: "danger" };
    const rows: Row[] = [
      { label: "Order placed", when: formatOrderDateTime(order.orderDate), done: true },
    ];
    if (stage !== "cancelled" && tracking?.timeline?.length) {
      // Full journey from the delivery API: placed, confirmed, packed, rider
      // assigned, out for delivery, delivered.
      return tracking.timeline.map((t): Row => ({
        label: t.label,
        when: t.done ? isoWhen(t.at) : "Pending",
        done: t.done,
      }));
    }
    if (stage === "cancelled") {
      rows.push({
        label: order.cancel_reason ? `Cancelled · ${order.cancel_reason}` : "Cancelled",
        when: formatOrderDateTime(order.cancelled_on || ""),
        done: true,
        tone: "danger",
      });
      return rows;
    }
    rows.push({
      label: "Packed & dispatched",
      when: order.dispatched_on ? formatOrderDateTime(order.dispatched_on) : stage === "process" ? "Pending" : "",
      done: stage !== "process",
    });
    rows.push({
      label: "Delivered",
      when: order.delivered_on ? formatOrderDateTime(order.delivered_on) : stage === "delivered" ? "" : "Pending",
      done: stage === "delivered",
    });
    return rows;
  }, [order, stage, tracking]);

  const banner = (() => {
    if (!order) return null;
    const amount = `₹${rupees(order.amount)}`;
    switch (stage) {
      case "process": {
        const note = stageNote(order, stage);
        return { tone: note.tone, icon: order.deliveryStatusName === "Rider Assigned" ? "bi-bicycle" : "bi-hourglass-split", text: `${note.text}${isCod && !paid ? ` · Pay ${amount} on delivery` : ""}` };
      }
      case "dispatched":
        return { tone: "ok", icon: "bi-truck", text: `Out for delivery${isCod && !paid ? ` · Keep ${amount} ready (Cash on Delivery)` : ""}` };
      case "delivered":
        return { tone: "ok", icon: "bi-check-circle", text: `Delivered${order.delivered_on ? ` on ${formatOrderDateTime(order.delivered_on)}` : ""}` };
      default:
        return { tone: "muted", icon: "bi-x-circle", text: `This order was cancelled${order.cancel_reason ? ` · ${order.cancel_reason}` : ""}` };
    }
  })();

  const productHref = (p: Line) =>
    p.category_id === 1 ? `/medicines-details/${encodeId(p.product_id)}` : `/product-details/${encodeId(p.product_id)}`;

  const onCancel = async () => {
    if (order && (await cancelOrder(order.orderId))) {
      await load();
      if (buyer) dispatch(getBuyerOrdersList(buyer.id));
    }
  };

  // A delivered COD order still shows payment "Pending" (nothing records the
  // cash yet), so after delivery the bill just says "Order total".
  const payLabel =
    paid ? "Amount paid" : stage === "cancelled" || stage === "delivered" ? "Order total" : isCod ? "To pay on delivery" : "Amount to pay";
  const help = encodeURIComponent(`Hi TnC Pharmacy, I need help with my order ${number}.`);

  if (!ready || !buyer) return null;

  return (
    <>
      <div className="page-wrapper">
        <div className="acct">
          <div className="acct-wrap">
            <div className="acct-crumb">
              <Link href="/">Home</Link> &nbsp;›&nbsp; <Link href="/profile?tab=order">My Orders</Link>
              {number && <> &nbsp;›&nbsp; {number}</>}
            </div>

            <div className="row g-4">
              <div className="col-lg-3 acct-noprint d-none d-lg-block">{/* phones: go straight to the order */}
                <AccountSidebar
                  name={buyer.name}
                  mobile={buyer.number}
                  activeTab="order"
                  orderCount={orderCount}
                  addressCount={addressCount}
                  onTab={(t: AccountTab) => router.push(`/profile?tab=${t}`)}
                  onUploadPrescription={() => setShowRx(true)}
                  onHelp={() => router.push("/contact-us")}
                  onLogout={logout}
                />
              </div>

              <div className="col-lg-9 d-flex flex-column gap-4">
                <Link href="/profile?tab=order" className="acct-link acct-noprint">
                  ‹ Back to My Orders
                </Link>

                {state === "loading" && (
                  <div className="d-flex justify-content-center py-5"><TncLoader /></div>
                )}
                {(state === "missing" || state === "error") && (
                  <div className="acct-card acct-empty">
                    <i className="bi bi-receipt" />
                    <p className="mb-3">
                      {state === "missing" ? "We couldn't find this order in your account." : "Couldn't load this order. Please try again."}
                    </p>
                    <Link href="/profile?tab=order" className="acct-btn primary text-decoration-none">My Orders</Link>
                  </div>
                )}

                {state === "ready" && order && (
                  <div className="row g-4">
                    {/* ---------------- left column ---------------- */}
                    <div className="col-xl-8 d-flex flex-column gap-4">
                      <section className="acct-card p-4 d-flex flex-column gap-3" aria-label="Order status">
                        <div className="d-flex align-items-start gap-3">
                          <div className="flex-grow-1">
                            <h1 className="acct-title" style={{ fontSize: 20 }}>Order {number}</h1>
                            <div className="acct-sub" style={{ fontSize: 12 }}>Placed on {formatOrderDateTime(order.orderDate)}</div>
                          </div>
                          <StatusChip stage={stage} size="lg" label={stageLabel(order)} />
                        </div>
                        {banner && (
                          <div className={`acct-banner ${banner.tone}`}>
                            <i className={`bi ${banner.icon}`} /> {banner.text}
                          </div>
                        )}
                        {rider && (
                          <div className="acct-rider">
                            <i className="bi bi-bicycle" aria-hidden />
                            <div className="flex-grow-1">
                              <div className="who">
                                {rider.courier_name ? `${rider.courier_name} · ` : ""}
                                {rider.partner}
                              </div>
                              <div className="what">{rider.status_label}</div>
                            </div>
                            {rider.courier_phone && (
                              <a className="acct-btn" href={`tel:${rider.courier_phone}`}>
                                <i className="bi bi-telephone" /> Call rider
                              </a>
                            )}
                            {rider.tracking_url && (
                              <a className="acct-btn primary" href={rider.tracking_url} target="_blank" rel="noreferrer">
                                <i className="bi bi-geo-alt" /> Track live
                              </a>
                            )}
                          </div>
                        )}
                        {stage !== "cancelled" && (
                          <div className="acct-steps-wrap"><OrderStepper step={stageStep(order)} /></div>
                        )}
                        <ul className="acct-timeline">
                          {timeline.map((t) => (
                            <li key={t.label} className={`${t.done ? "done" : ""} ${t.tone || ""}`}>
                              <i className={`bi ${t.tone === "danger" ? "bi-x-circle-fill" : t.done ? "bi-check-circle-fill" : "bi-clock"}`} />
                              <span className="label">{t.label}</span>
                              <span className="when">{t.when}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className="acct-card p-4" aria-label="Items">
                        <h3 className="acct-h3 mb-3">Items ({order.products?.length || 0})</h3>
                        <div className="d-flex flex-column gap-3">
                          {(order.products || []).map((p) => {
                            const src = productImageUrl(p.image);
                            const qty = Number(p.quantity) || 1;
                            const line = Number(p.rate || 0) * qty;
                            const mrpLine = Number(p.mrp || 0) * qty;
                            return (
                              <div className="acct-line-item" key={p.id}>
                                <div className="acct-thumb">
                                  {src ? <img src={src} alt={p.medicine_name} /> : <i className="bi bi-box-seam" />}
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                  <Link href={productHref(p)} className="name">{p.medicine_name}</Link>
                                  <div className="meta">
                                    {[p.pack_size, p.manufacturer].filter(Boolean).join("  ·  ")}
                                    {"  ·  "}Qty {qty}
                                  </div>
                                </div>
                                <div className="price">
                                  <b>₹{rupees(line)}</b>
                                  {mrpLine > line && <s>₹{rupees(mrpLine)}</s>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <div className="d-flex gap-3 flex-wrap acct-noprint">
                        <button type="button" className="acct-btn primary" onClick={() => reorder(order.orderId)}>
                          <i className="bi bi-arrow-repeat" /> Reorder all items
                        </button>
                        <button type="button" className="acct-btn" onClick={() => window.print()} title="Opens the print dialog — choose 'Save as PDF'">
                          <i className="bi bi-download" /> Download receipt
                        </button>
                        {order.buyer_can_cancel && (
                          <button type="button" className="acct-btn-danger" onClick={onCancel} disabled={cancellingId === order.orderId}>
                            {cancellingId === order.orderId ? "Cancelling…" : "Cancel order"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ---------------- right column ---------------- */}
                    <div className="col-xl-4 d-flex flex-column gap-4">
                      <section className="acct-card p-4" aria-label="Bill summary">
                        <h3 className="acct-h3 mb-3">Bill summary</h3>
                        <dl className="acct-bill">
                          <div><dt>Item total (MRP)</dt><dd>₹{rupees(bill?.mrp_total)}</dd></div>
                          {Number(bill?.discount) > 0 && (
                            <div className="save"><dt>Discount</dt><dd>– ₹{rupees(bill?.discount)}</dd></div>
                          )}
                          <div>
                            <dt>Delivery fee</dt>
                            <dd className={Number(bill?.delivery_fee) > 0 ? "" : "free"}>
                              {Number(bill?.delivery_fee) > 0 ? `₹${rupees(bill?.delivery_fee)}` : "FREE"}
                            </dd>
                          </div>
                          <div className="total"><dt>{payLabel}</dt><dd>₹{rupees(order.amount)}</dd></div>
                        </dl>
                        <div className="acct-sub mt-2" style={{ fontSize: 12 }}>
                          {order.paymentMode}{order.paymentStatus ? ` · Payment ${order.paymentStatus.toLowerCase()}` : ""}
                        </div>
                        {Number(bill?.discount) > 0 && (
                          <div className="acct-banner ok mt-3" style={{ fontSize: 12 }}>
                            <i className="bi bi-cash-coin" /> You saved ₹{rupees(bill?.discount)} on this order
                          </div>
                        )}
                      </section>

                      {(order.address || order.recipient_name) && (
                        <section className="acct-card p-4" aria-label="Delivery address">
                          <h3 className="acct-h3 mb-2">Delivery address</h3>
                          <div className="fw-medium" style={{ fontSize: 14 }}>
                            {order.recipient_name}{order.recipient_mobile ? `  ·  ${order.recipient_mobile}` : ""}
                          </div>
                          <div className="acct-sub">
                            {[order.address, order.location].filter(Boolean).join(", ")}
                            {order.pincode ? ` – ${order.pincode}` : ""}
                          </div>
                        </section>
                      )}

                      {order.prescription_url && (
                        <section className="acct-card p-4" aria-label="Prescription">
                          <h3 className="acct-h3 mb-2">Prescription</h3>
                          <a className="acct-file" href={order.prescription_url} target="_blank" rel="noreferrer">
                            <i className="bi bi-file-earmark-medical" />
                            <span className="flex-grow-1">Prescription attached to this order</span>
                            <span className="acct-link">View</span>
                          </a>
                        </section>
                      )}

                      <section className="acct-card p-4 acct-noprint" aria-label="Help">
                        <div className="d-flex gap-2 align-items-center">
                          <i className="bi bi-headset" style={{ fontSize: 20, color: "var(--text-link)" }} />
                          <div>
                            <div className="fw-medium" style={{ fontSize: 14 }}>Need help with this order?</div>
                            <div className="acct-sub" style={{ fontSize: 12 }}>
                              <a href={`https://wa.me/917042079595?text=${help}`} target="_blank" rel="noreferrer">WhatsApp</a>
                              {" or call "}
                              <a href="tel:+917042079595">+91 7042079595</a>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- printable receipt (only visible when printing) ---------- */}
        {order && (
          <div className="acct-receipt" aria-hidden>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <img src="/images/logo.png" alt="TnC Pharmacy" height={48} />
                <div className="small mt-2">
                  <b>{order.pharmacy?.name || "TnC Pharmacy"}</b><br />
                  {[order.pharmacy?.address, order.pharmacy?.district, order.pharmacy?.state, order.pharmacy?.pincode].filter(Boolean).join(", ")}
                  {order.pharmacy?.license_number && <><br />Drug licence: {order.pharmacy.license_number}</>}
                  {order.pharmacy?.gst_number && <><br />GSTIN: {order.pharmacy.gst_number}</>}
                </div>
              </div>
              <div className="text-end small">
                <h2 style={{ fontSize: 20, margin: 0 }}>Order receipt</h2>
                Order {number}<br />
                {formatOrderDateTime(order.orderDate)}<br />
                Status: {stageLabel(order)}
              </div>
            </div>
            <div className="small mb-3">
              <b>Billed to:</b> {order.recipient_name || buyer.name}{order.recipient_mobile ? `, ${order.recipient_mobile}` : ""}<br />
              {[order.address, order.location].filter(Boolean).join(", ")}{order.pincode ? ` – ${order.pincode}` : ""}
            </div>
            <table className="table table-sm">
              <thead>
                <tr><th>#</th><th>Item</th><th className="text-end">Qty</th><th className="text-end">MRP</th><th className="text-end">Rate</th><th className="text-end">Amount</th></tr>
              </thead>
              <tbody>
                {(order.products || []).map((p, i) => {
                  const qty = Number(p.quantity) || 1;
                  return (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td>{p.medicine_name}{p.pack_size ? ` (${p.pack_size})` : ""}</td>
                      <td className="text-end">{qty}</td>
                      <td className="text-end">₹{rupees(p.mrp)}</td>
                      <td className="text-end">₹{rupees(p.rate)}</td>
                      <td className="text-end">₹{rupees(Number(p.rate || 0) * qty)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr><td colSpan={5} className="text-end">Item total (MRP)</td><td className="text-end">₹{rupees(bill?.mrp_total)}</td></tr>
                <tr><td colSpan={5} className="text-end">Discount</td><td className="text-end">– ₹{rupees(bill?.discount)}</td></tr>
                <tr><td colSpan={5} className="text-end">Delivery fee</td><td className="text-end">₹{rupees(bill?.delivery_fee)}</td></tr>
                <tr><th colSpan={5} className="text-end">{payLabel}</th><th className="text-end">₹{rupees(order.amount)}</th></tr>
              </tfoot>
            </table>
            <div className="small text-muted">
              Payment: {order.paymentMode} ({order.paymentStatus}). This is a computer-generated receipt and needs no signature.
            </div>
          </div>
        )}
      </div>

      <PrescriptionUploadModal show={showRx} handleClose={() => setShowRx(false)} />
      <div className="acct-noprint"><Footer /></div>
    </>
  );
}
