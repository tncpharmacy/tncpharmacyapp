/**
 * GET /api/medicine/<id>/compare/ (tncpharmacyapi medicine/compare.py).
 *
 * "Compare before you buy": the medicine the customer opened, its TnC Trusted
 * brand and the cheapest strict equivalent, priced per unit because pack
 * sizes differ. Money fields are strings ("16.08") as sent by the API.
 */
export interface CompareItem {
  id: number;
  name: string;
  manufacturer: string | null;
  pack_size: string | null;
  units_per_pack: number | null;
  unit_label: string | null; // "tablet" | "capsule" | "ml" | ...
  mrp: string | null;
  discount: string;
  price: string | null;
  unit_price: string | null;
  in_stock: boolean;
  rx_required: boolean;
  brand_category: number | null;
  is_tnc_trusted: boolean;
  dose_form: string | null;
  image: string | null; // storage path; resolve with resolveMediaUrl
  saving_percent: number | null; // vs the opened medicine, only when cheaper
}

export type CompareReason =
  | null
  | "strength_unknown"
  | "selected_not_comparable"
  | "no_strict_match"
  | "selected_unpriced";

export interface MedicineCompare {
  selected: CompareItem;
  tnc_trusted: CompareItem | null;
  cheapest: CompareItem | null;
  selected_is_cheapest: boolean;
  selected_is_tnc_trusted: boolean;
  match_basis: {
    generic: string | null;
    dose_form: string | null;
    release: string[];
    unit: string | null;
  };
  reason: CompareReason;
}
