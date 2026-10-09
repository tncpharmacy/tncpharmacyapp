"use client";

/**
 * Delivery panel for one order (pharmacist / pharmacy staff).
 *
 *   New ── Confirm ──► Confirmed ── Mark packed ──► Packed ── Book rider ──►
 *   Rider assigned ──► Out for delivery ──► Delivered        (partner-driven)
 *
 * Everything comes from GET /api/delivery/orders/<id>/, including which
 * buttons are allowed ("actions"), so the screen never has to re-implement
 * the rules. Each button calls one endpoint, which answers with the updated
 * view; the panel simply re-renders from that.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  bookRiderApi,
  cancelRiderApi,
  confirmOrderApi,
  getOrderDeliveryApi,
  getRiderQuoteApi,
  packOrderApi,
  refreshRiderApi,
  setStageByHandApi,
  simulateRiderApi,
} from "@/lib/api/delivery";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { PharmacistDeliveryView, RiderQuote } from "@/types/delivery";

interface Props {
  orderId: number | null;
  show: boolean;
  onHide: () => void;
  /** Called after any change so the order list can re-read. */
  onChanged?: () => void;
}

const when = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || fallback;

export default function DeliveryPanel({ orderId, show, onHide, onChanged }: Props) {
  const [view, setView] = useState<PharmacistDeliveryView | null>(null);
  const [quote, setQuote] = useState<RiderQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [thermobox, setThermobox] = useState(false);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      setView(await getOrderDeliveryApi(orderId));
    } catch (err) {
      toast.error(serverMessage(err, "Could not load the delivery details."));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (show) {
      setView(null);
      setQuote(null);
      setQuoteError(null);
      setThermobox(false);
      setNote("");
      load();
    }
  }, [show, load]);

  // Once packed, show what the trip will cost before the pharmacist books it.
  // Cleared first, so a fare from an earlier booking is never shown again.
  useEffect(() => {
    setQuote(null);
    setQuoteError(null);
    if (!orderId || !view?.actions.book_rider) return;
    let alive = true;
    getRiderQuoteApi(orderId)
      .then((q) => alive && setQuote(q))
      .catch((err) => alive && setQuoteError(serverMessage(err, "Could not get a price from the delivery partner.")));
    return () => {
      alive = false;
    };
  }, [orderId, view?.actions.book_rider]);

  // While a rider is on the way, re-read every 30 s (the partner's webhook
  // updates the server; this just brings the screen up to date).
  useEffect(() => {
    if (!show || !view?.shipment?.is_active) return;
    const t = window.setInterval(load, 30000);
    return () => window.clearInterval(t);
  }, [show, view?.shipment?.is_active, load]);

  const run = async (key: string, fn: () => Promise<PharmacistDeliveryView>, done: string) => {
    setBusy(key);
    try {
      setView(await fn());
      toast.success(done);
      onChanged?.();
    } catch (err) {
      toast.error(serverMessage(err, "That didn't work. Please try again."));
      load();
    } finally {
      setBusy(null);
    }
  };

  const onCancelRider = () => {
    const reason = window.prompt("Cancel the rider booking?\n\nReason (required):", "");
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("A reason is required.");
      return;
    }
    run("cancel", () => cancelRiderApi(orderId!, reason.trim()), "Rider booking cancelled.");
  };

  const onManual = (stage: string, label: string) => {
    if (!window.confirm(`Mark this order "${label}" by hand? Use this only when no partner rider is handling it.`)) return;
    run("manual", () => setStageByHandApi(orderId!, stage), `Marked ${label}.`);
  };

  const s = view?.shipment;
  const a = view?.actions;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header
        closeButton
        className="text-white"
        style={{ background: "linear-gradient(90deg, #007bff, #0056d6)", borderBottom: "none" }}
      >
        <Modal.Title className="fw-semibold">
          <i className="bi bi-truck me-2" />
          Delivery {view ? `· Order #${view.order_number || view.order_id}` : ""}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="dlv" style={{ background: "#f4f6f9" }}>
        {loading && !view && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {view && (
          <>
            {/* -------- stages -------- */}
            <ol className="dlv-steps">
              {view.timeline.map((step) => (
                <li key={step.key} className={step.done ? "done" : ""}>
                  <span className="dot">{step.done ? <i className="bi bi-check-lg" /> : null}</span>
                  <span className="lbl">{step.label}</span>
                  <span className="at">{when(step.at)}</span>
                </li>
              ))}
            </ol>
            {view.stage === "cancelled" && (
              <div className="alert alert-secondary py-2 mb-3">This order is cancelled.</div>
            )}
            {view.stage === "failed" && (
              <div className="alert alert-danger py-2 mb-3">
                The rider could not deliver this order. Call the patient, then mark it packed again to book a new rider.
              </div>
            )}

            {/* -------- partner status -------- */}
            {!view.partner.configured && (
              <div className="alert alert-danger py-2">
                <i className="bi bi-exclamation-triangle me-1" />
                {view.partner.message || "No delivery partner is configured."}
              </div>
            )}
            {view.awaiting_payment && (
              <div className="alert alert-warning py-2">
                <i className="bi bi-hourglass-split me-1" />
                Waiting for online payment. The order can be confirmed once the payment is received.
              </div>
            )}
            {view.partner.is_test && (
              <div className="alert alert-warning py-2">
                <i className="bi bi-cone-striped me-1" />
                <b>Test partner:</b> no real rider will come. Use <i>Simulate next step</i> to walk the order through.
              </div>
            )}

            {/* -------- next action -------- */}
            <div className="dlv-card">
              {a?.confirm && (
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">New order</div>
                    <div className="small text-muted">
                      Check the medicines (and prescription for Rx items), then confirm.
                    </div>
                  </div>
                  <Button disabled={!!busy} onClick={() => run("confirm", () => confirmOrderApi(orderId!), "Order confirmed.")}>
                    {busy === "confirm" ? <Spinner size="sm" /> : <><i className="bi bi-check2-circle me-1" />Confirm order</>}
                  </Button>
                </div>
              )}

              {a?.pack && (
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">Pack the order</div>
                    <div className="small text-muted">
                      Seal the medicines in a tamper-evident bag with the bill inside, then mark it packed.
                    </div>
                  </div>
                  <Button variant="primary" disabled={!!busy} onClick={() => run("pack", () => packOrderApi(orderId!), "Marked packed.")}>
                    {busy === "pack" ? <Spinner size="sm" /> : <><i className="bi bi-box-seam me-1" />Mark packed</>}
                  </Button>
                </div>
              )}

              {a?.book_rider && (
                <div>
                  <div className="fw-semibold mb-2">Book a rider</div>
                  {!quote && !quoteError && (
                    <div className="small text-muted"><Spinner size="sm" className="me-2" />Getting a price from the partner…</div>
                  )}
                  {quoteError && <div className="alert alert-warning py-2 small">{quoteError}</div>}
                  {quote && (
                    <dl className="dlv-quote">
                      <div><dt>Partner</dt><dd>{quote.partner}</dd></div>
                      <div><dt>Trip fare (pharmacy pays)</dt><dd>₹{formatPrice(quote.fee)}</dd></div>
                      <div>
                        <dt>Rider collects (COD)</dt>
                        <dd>{Number(quote.cod_amount) > 0 ? `₹${formatPrice(quote.cod_amount)}` : "Nothing (prepaid)"}</dd>
                      </div>
                      {quote.distance_km && <div><dt>Distance</dt><dd>~{Number(quote.distance_km).toFixed(1)} km</dd></div>}
                      <div className="wide"><dt>Deliver to</dt><dd>{quote.drop} · {quote.drop_phone}</dd></div>
                    </dl>
                  )}
                  <Form.Check
                    id="dlv-thermobox"
                    className="mb-2"
                    label="Needs a cooling box (insulin, vaccines, other cold-chain items)"
                    checked={thermobox}
                    onChange={(e) => setThermobox(e.target.checked)}
                  />
                  <Form.Control
                    size="sm"
                    className="mb-3"
                    maxLength={300}
                    placeholder="Note for the rider (optional), e.g. 'Ask for Shop 4, ground floor'"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button
                    variant="success"
                    disabled={!!busy || (!quote && !quoteError)}
                    onClick={() => run("book", () => bookRiderApi(orderId!, { thermobox, note }), "Rider booked. The partner is assigning a rider.")}
                  >
                    {busy === "book" ? <Spinner size="sm" /> : <><i className="bi bi-bicycle me-1" />Book rider</>}
                  </Button>
                </div>
              )}

              {s && (
                <div className={a?.book_rider ? "mt-3 pt-3 border-top" : ""}>
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <span className={`dlv-badge s-${s.status}`}>{s.status_label}</span>
                    <span className="small text-muted">
                      {s.partner}
                      {s.provider_order_name || s.provider_order_id ? ` · #${s.provider_order_name || s.provider_order_id}` : ""}
                      {s.booked_on ? ` · booked ${when(s.booked_on)}` : ""}
                    </span>
                  </div>
                  {s.courier_name && (
                    <div className="mb-1">
                      <i className="bi bi-person-badge me-1" />
                      <b>{s.courier_name}</b>
                      {s.courier_phone && (
                        <a className="ms-2" href={`tel:${s.courier_phone}`}>
                          <i className="bi bi-telephone" /> {s.courier_phone}
                        </a>
                      )}
                    </div>
                  )}
                  {s.status === "searching" && (
                    <div className="small text-muted mb-1">The partner is finding a rider. This usually takes a few minutes.</div>
                  )}
                  <div className="small text-muted mb-2">
                    {s.quoted_fee ? `Fare ₹${formatPrice(s.quoted_fee)}` : ""}
                    {Number(s.cod_amount) > 0 ? ` · Collect ₹${formatPrice(s.cod_amount || 0)} cash` : ""}
                    {s.thermobox ? " · Cooling box" : ""}
                    {s.failure_reason && !s.is_active ? ` · ${s.failure_reason}` : ""}
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {s.tracking_url && (
                      <a className="btn btn-outline-primary btn-sm" href={s.tracking_url} target="_blank" rel="noreferrer">
                        <i className="bi bi-geo-alt me-1" />Live tracking
                      </a>
                    )}
                    {a?.refresh && (
                      <Button size="sm" variant="outline-secondary" disabled={!!busy}
                        onClick={() => run("refresh", () => refreshRiderApi(orderId!), "Status refreshed.")}>
                        <i className="bi bi-arrow-clockwise me-1" />Refresh
                      </Button>
                    )}
                    {a?.simulate && (
                      <Button size="sm" variant="warning" disabled={!!busy}
                        onClick={() => run("simulate", () => simulateRiderApi(orderId!), "Simulated the partner's next update.")}>
                        <i className="bi bi-skip-forward me-1" />Simulate next step
                      </Button>
                    )}
                    {a?.cancel_rider && (
                      <Button size="sm" variant="outline-danger" disabled={!!busy} onClick={onCancelRider}>
                        <i className="bi bi-x-circle me-1" />Cancel rider
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!a?.confirm && !a?.pack && !a?.book_rider && !s && !a?.manual?.length && (
                <div className="text-muted small">
                  {view.stage === "delivered" ? "Delivered." : "Nothing to do right now."}
                </div>
              )}
            </div>

            {/* -------- fallback: by hand -------- */}
            {a?.manual && a.manual.length > 0 && (
              <details className="mt-3" open={!view.partner.configured}>
                <summary className="small text-muted">
                  Update by hand (partner down, or sent with another courier)
                </summary>
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {a.manual.map((m) => (
                    <Button
                      key={m.stage}
                      size="sm"
                      variant={m.stage === "7" ? "outline-danger" : "outline-secondary"}
                      disabled={!!busy}
                      onClick={() => onManual(m.stage, m.label)}
                    >
                      Mark {m.label}
                    </Button>
                  ))}
                </div>
              </details>
            )}

            {/* -------- diary -------- */}
            {s?.events && s.events.length > 0 && (
              <details className="mt-3">
                <summary className="small text-muted">Activity ({s.events.length})</summary>
                <ul className="dlv-log">
                  {s.events.map((e, i) => (
                    <li key={i}>
                      <span className="at">{when(e.at)}</span>
                      <span>{e.message || e.status}</span>
                      <span className="src">{e.source}{e.provider_status ? ` · ${e.provider_status}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer style={{ borderTop: "none" }}>
        <Button variant="light" onClick={load} disabled={loading}>
          <i className="bi bi-arrow-repeat me-1" />Reload
        </Button>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
