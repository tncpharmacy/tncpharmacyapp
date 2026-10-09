"use client";

import { useEffect, useState } from "react";
import { getDeliveryFeeQuoteApi } from "@/lib/api/delivery";
import type { DeliveryFeeQuote } from "@/types/delivery";

/**
 * The delivery fee for the selected address, from the server.
 *
 * Rule (delivery/fees.py): free within 12 km of the pharmacy, the delivery
 * partner's fare beyond that, no delivery beyond 50 km. The bag only *shows*
 * this figure; the server works it out again when the order is placed, so a
 * stale value here can never change what is charged.
 */
export function useDeliveryQuote(addressId: number | null | undefined, enabled = true) {
  const [quote, setQuote] = useState<DeliveryFeeQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !addressId) {
      setQuote(null);
      setError(null);
      return;
    }
    let alive = true;
    setQuote(null); // never show the previous address's fee while this one loads
    setLoading(true);
    setError(null);
    getDeliveryFeeQuoteApi(Number(addressId))
      .then((q) => alive && setQuote(q))
      .catch(() => {
        if (!alive) return;
        setQuote(null);
        setError("Couldn't work out the delivery fee. It will be confirmed when you place the order.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [addressId, enabled]);

  const fee = quote ? Number(quote.fee) || 0 : 0;
  const deliverable = quote ? quote.deliverable : true;
  return { quote, fee, deliverable, loading, error };
}
