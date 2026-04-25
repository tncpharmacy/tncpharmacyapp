import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getHealthBag,
  addLocalHealthBag,
  removeLocalHealthBag,
  loadLocalHealthBag,
  increaseHealthBagQty,
  decreaseHealthBagQty,
} from "@/lib/features/healthBagSlice/healthBagSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { HealthBag } from "@/types/healthBag";
import {
  createHealthBag,
  decreaseQuantity,
  deleteHealthBag,
  increaseQuantity,
} from "@/lib/api/healthBag";

const GUEST_KEY = "healthbag";

export const useHealthBag = ({ userId }: { userId: number | null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);
  const { items } = useSelector((state: RootState) => state.healthBag);

  const normalizedItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return safeItems.map((i: any) => ({
      ...i,
      product_id: Number(i.product_id ?? i.productid ?? i.id),
    }));
  }, [items]);
  // 🔹 Load cart on mount
  // useEffect(() => {
  //   if (userId) {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     dispatch(getHealthBag(userId) as any);
  //   } else {
  //     dispatch(loadLocalHealthBag());
  //   }
  //   setMounted(true);
  // }, [userId, dispatch]);

  // 🔹 Fetch cart depending on login state
  const fetchCart = useCallback(async () => {
    if (userId) {
      // ✅ Logged-in user → fetch from API
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await dispatch(getHealthBag(userId)).unwrap();
      } catch (err) {
        console.error("Error fetching API cart:", err);
      }
    } else {
      // ✅ Guest user → load from LS
      dispatch(loadLocalHealthBag());
    }
  }, [userId, dispatch]);

  useEffect(() => {
    fetchCart();
    setMounted(true);
  }, [fetchCart]);

  // 🔹 Add item
  const addItem = useCallback(
    async (item: HealthBag) => {
      if (!mounted) return;
      const already = normalizedItems.find(
        (i) =>
          i.product_id === item.product_id || i.productid === item.product_id
      );

      if (already) {
        // 🔥 instead of return → increase qty
        await increaseQty(already.id, item.product_id, already.qty + 1);
        return;
      }

      if (userId) {
        try {
          await createHealthBag({
            buyer_id: userId,
            product_id: item.product_id,
            quantity: item.quantity || 1,
          });

          dispatch(getHealthBag(userId));
        } catch (err) {
          console.error("Add item failed:", err);
        }
      } else {
        dispatch(addLocalHealthBag(item));
      }
    },
    [userId, mounted, normalizedItems, dispatch]
  );

  // 🔹 Remove item
  const removeItem = useCallback(
    async (productId: number) => {
      if (!mounted) return;

      // ✅ find item by productid (not product_id)
      const itemToDelete = normalizedItems.find(
        (i) => Number(i.product_id ?? i.productid ?? i.id) === Number(productId)
      );
      if (!itemToDelete) return;

      if (userId) {
        try {
          // console.log("🗑 Removing cart item id:", itemToDelete.id);
          await deleteHealthBag(itemToDelete.id); // ✅ send correct cart id to API
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (dispatch(getHealthBag(userId)) as any).unwrap();
        } catch (err) {
          console.error("Remove item failed:", err);
        }
      } else {
        dispatch(removeLocalHealthBag(productId));
      }
    },
    [userId, mounted, normalizedItems, dispatch]
  );

  const increaseQty = useCallback(
    async (cartId: number, productId: number, qty: number) => {
      if (!userId) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (dispatch as any)(
        increaseHealthBagQty({
          cart_id: cartId,
          buyer_id: userId,
          product_id: productId,
          quantity: qty,
        })
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await dispatch(getHealthBag(userId) as any);
    },
    [userId, dispatch]
  );

  const decreaseQty = useCallback(
    async (cartId: number, productId: number, qty: number) => {
      if (!userId) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (dispatch as any)(
        decreaseHealthBagQty({
          cart_id: cartId,
          buyer_id: userId,
          product_id: productId,
          quantity: qty,
        })
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await dispatch(getHealthBag(userId) as any);
    },
    [userId, dispatch]
  );

  // 🔹 Merge guest → user cart
  const mergeGuestCart = useCallback(async () => {
    if (!userId) return;

    const guest = localStorage.getItem(GUEST_KEY);
    if (!guest) return;

    const guestItems: HealthBag[] = JSON.parse(guest);
    if (guestItems.length === 0) return;

    try {
      // 👇 First loop: Send each guest item to backend
      for (const item of guestItems) {
        const payload = {
          buyer_id: userId,
          product_id: item.product_id || item.productid || item.id,
          quantity: item.quantity || 1,
        };
        // console.log("📦 Payload being sent to API:", payload); // 👈 add this
        await createHealthBag(payload);
      }

      // ✅ Clear LS only after successful merge
      localStorage.removeItem(GUEST_KEY);

      // ✅ Wait for all API calls to finish, then re-fetch cart cleanly
      await new Promise((resolve) => setTimeout(resolve, 500)); // small delay
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (dispatch(getHealthBag(userId)) as any).unwrap();

      // ✅ Trigger header update manually (optional)
      window.dispatchEvent(new Event("healthBagUpdated"));
    } catch (err) {
      console.error("❌ Merge guest cart failed:", err);
    }
  }, [userId, dispatch]);

  const updateGuestQuantity = (productId: number, qty: number) => {
    const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = cart.map((item: any) =>
      item.productid === productId ? { ...item, qty } : item
    );

    localStorage.setItem("healthbag", JSON.stringify(updated));
  };

  // 🔹 Merge guest cart automatically after login
  useEffect(() => {
    if (userId) {
      mergeGuestCart().then(() => {
        // console.log("🧩 LS after merge:", localStorage.getItem(GUEST_KEY));
      });
    }
  }, [userId, mergeGuestCart]);

  return {
    items: normalizedItems,
    addItem,
    removeItem,
    mergeGuestCart,
    updateGuestQuantity,
    fetchCart,
    increaseQty,
    decreaseQty,
  };
};
