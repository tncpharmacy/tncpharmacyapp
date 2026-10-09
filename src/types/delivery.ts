/**
 * Shapes returned by /api/delivery/ (tncpharmacyapi delivery/presenters.py).
 *
 * Order journey:
 *   placed -> confirmed -> packed -> rider_assigned -> out_for_delivery -> delivered
 * plus "failed" (rider could not deliver) and "cancelled".
 */
export type DeliveryStageKey =
  | "placed"
  | "confirmed"
  | "packed"
  | "rider_assigned"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "cancelled";

export interface TimelineStep {
  key: Exclude<DeliveryStageKey, "failed" | "cancelled">;
  label: string;
  done: boolean;
  at: string | null; // ISO date-time
}

export type ShipmentStatus =
  | "searching"
  | "assigned"
  | "picked_up"
  | "delivered"
  | "cancelled"
  | "failed";

export interface ShipmentEvent {
  at: string;
  status: ShipmentStatus | null;
  provider_status: string | null;
  source: "pharmacist" | "webhook" | "refresh" | "system";
  message: string;
}

/** The rider booking. Patients get the first block only. */
export interface Shipment {
  status: ShipmentStatus;
  status_label: string;
  partner: string;
  is_test_partner: boolean;
  tracking_url: string | null;
  courier_name: string | null;
  courier_phone: string | null;
  booked_on: string | null;
  assigned_on: string | null;
  picked_up_on: string | null;
  delivered_on: string | null;
  is_active: boolean;
  // staff only
  id?: number;
  provider?: string;
  provider_order_id?: string | null;
  provider_order_name?: string | null;
  provider_status?: string | null;
  quoted_fee?: string | null;
  cod_amount?: string;
  distance_km?: string | null;
  thermobox?: boolean;
  note?: string | null;
  failure_reason?: string | null;
  ended_on?: string | null;
  events?: ShipmentEvent[];
}

export interface PharmacistDeliveryView {
  order_id: number;
  order_number: string | null;
  delivery_status: string;
  delivery_status_name: string;
  stage: DeliveryStageKey;
  timeline: TimelineStep[];
  delivery_fee: string | null;
  delivery_distance_km: string | null;
  shipment: Shipment | null;
  partner: {
    name: string;
    label: string | null;
    is_test: boolean;
    configured: boolean;
    message?: string;
  };
  /** Online order not paid yet: nothing can move until it is. */
  awaiting_payment: boolean;
  actions: {
    confirm: boolean;
    pack: boolean;
    /** Hand changes allowed now (no partner rider): {stage: "3"|"2"|"7"} */
    manual: { stage: string; label: string }[];
    book_rider: boolean;
    cancel_rider: boolean;
    refresh: boolean;
    simulate: boolean;
  };
}

export interface RiderQuote {
  partner: string;
  is_test_partner: boolean;
  fee: string;
  cod_amount: string;
  distance_km: string | null;
  pickup: string;
  drop: string;
  drop_phone: string;
}

export interface BuyerTracking {
  order_id: number;
  order_number: string | null;
  stage: DeliveryStageKey;
  delivery_status_name: string;
  timeline: TimelineStep[];
  shipment: Shipment | null;
  can_cancel: boolean;
  delivery_fee: string | null;
}

/** GET /delivery/buyer/quote/?address_id= — what the health bag shows. */
export interface DeliveryFeeQuote {
  fee: string;
  distance_km: string | null;
  free: boolean;
  deliverable: boolean;
  method: "free_radius" | "partner" | "rate_card" | "unknown_location" | "no_address" | "too_far";
  message: string;
  free_radius_km: number;
  max_radius_km: number;
}
