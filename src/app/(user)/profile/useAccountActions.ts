"use client";

/**
 * Actions shared by the account pages (My Profile / My Orders / Saved
 * Addresses in BuyerProfile.tsx, and the order-details page). Kept in one
 * hook so both pages log out, reorder and cancel the same way.
 */
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/hooks";
import { buyerLogout, reOrder } from "@/lib/features/buyerSlice/buyerSlice";
import { clearLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import { buyerCancelOrderApi } from "@/lib/api/buyer";

export function useAccountActions() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  /** Same steps as the header's Logout. */
  const logout = useCallback(() => {
    dispatch(buyerLogout());
    dispatch(clearLocalHealthBag());
    localStorage.setItem("justLoggedOut", "true");
    sessionStorage.setItem("justLoggedOut", "true");
    localStorage.removeItem("redirectAfterLogin");
    localStorage.removeItem("shouldOpenLogin");
    localStorage.removeItem("loginModalOpened");
    router.replace("/");
  }, [dispatch, router]);

  /** Copies the order's items into the reorder bag and opens it. */
  const reorder = useCallback(
    async (orderId: number) => {
      try {
        await dispatch(reOrder(orderId)).unwrap();
        router.push("/reorder-bag");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(typeof err === "string" ? err : "Reorder failed");
      }
    },
    [dispatch, router]
  );

  /**
   * TNC-20: cancel while the order is still In Process. The API puts the
   * stock back and sends a WhatsApp confirmation. Resolves true on success.
   */
  const cancelOrder = useCallback(
    async (orderId: number): Promise<boolean> => {
      if (cancellingId) return false;
      const reason = window.prompt("Cancel this order? You can tell us why (optional):", "");
      if (reason === null) return false; // pressed Cancel on the prompt
      setCancellingId(orderId);
      try {
        await buyerCancelOrderApi(orderId, reason);
        toast.success("Order cancelled.");
        return true;
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;
        toast.error(e?.response?.data?.message || "Could not cancel the order.");
        return false;
      } finally {
        setCancellingId(null);
      }
    },
    [cancellingId]
  );

  return { logout, reorder, cancelOrder, cancellingId };
}
