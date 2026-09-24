/**
 * Counter customer lookup (pharmacist / pharmacy screens only).
 *
 * The counter used buyerLogin / buyerRegister — the CUSTOMER's login flow.
 * Since TNC-15 those send the customer a WhatsApp OTP and return no id until
 * the code is verified, so counter sales texted customers a login code and
 * then failed with "Unable to fetch Buyer ID". These thunks call the staff
 * endpoint /buyer/counter/ instead: no OTP, and the id comes straight back.
 *
 * They keep the old response shape ({ data: { existing, id, name, number,
 * uhid } }) so the counter pages only swap the thunk name. No reducer: they
 * must not touch the logged-in *buyer* state (the pharmacist isn't one).
 */
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";

export interface CounterBuyer {
  existing: boolean;
  /** Present whenever a customer was found or created. */
  id: number;
  name?: string | null;
  number?: string | null;
  uhid?: string | null;
  email?: string | null;
}

export interface CounterBuyerResponse {
  success: boolean;
  message: string;
  data: CounterBuyer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reason = (err: any, fallback: string) =>
  err?.response?.data?.message || fallback;

/** Look a customer up by mobile. Never creates, never sends an OTP. */
export const counterBuyerLookup = createAsyncThunk<
  CounterBuyerResponse,
  { login_id: string },
  { rejectValue: string }
>("counterBuyer/lookup", async ({ login_id }, { rejectWithValue }) => {
  try {
    const res = await api.get(ENDPOINTS.BUYER.COUNTER, {
      params: { number: login_id },
    });
    return res.data as CounterBuyerResponse;
  } catch (err) {
    return rejectWithValue(reason(err, "Customer lookup failed"));
  }
});

/** Find the customer by mobile, or create them. No OTP. */
export const counterBuyerCreate = createAsyncThunk<
  CounterBuyerResponse,
  { name: string; email: string; number: string; uhid: string },
  { rejectValue: string }
>("counterBuyer/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post(ENDPOINTS.BUYER.COUNTER, payload);
    return res.data as CounterBuyerResponse;
  } catch (err) {
    return rejectWithValue(reason(err, "Could not save the customer"));
  }
});
