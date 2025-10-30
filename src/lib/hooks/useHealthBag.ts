// hooks/useHealthBag.ts
import { useEffect, useState, useCallback } from "react";
import {
  createHealthBag,
  fetchHealthBag,
  deleteHealthBag,
} from "@/lib/api/healthBag";
import { HealthBag } from "@/types/healthBag";

const GUEST_KEY = "healthBagGuest";

export const useHealthBag = ({ userId }: { userId: number | null }) => {
  const [items, setItems] = useState<HealthBag[]>([]);

  // Load initial items
  useEffect(() => {
    if (userId) {
      fetchHealthBag(userId).then((res) => setItems(res.data));
    } else {
      const guest = localStorage.getItem(GUEST_KEY);
      setItems(guest ? JSON.parse(guest) : []);
    }
  }, [userId]);

  // Save guest cart
  const saveGuest = useCallback((newItems: HealthBag[]) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(newItems));
  }, []);

  // ✅ Add item (stable)
  const addItem = useCallback(
    (item: HealthBag) => {
      setItems((prev) => {
        const newItems = [...prev, item];
        if (!userId) saveGuest(newItems);
        setTimeout(
          () => window.dispatchEvent(new Event("healthBagUpdated")),
          0
        );
        return newItems;
      });

      if (userId) {
        createHealthBag(item)
          .then((res) => {
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, ...res } : i))
            );
          })
          .catch(() => {
            setItems((prev) => prev.filter((i) => i.id !== item.id)); // rollback
          });
      }
    },
    [userId, saveGuest]
  );

  // ✅ Remove item (stable)
  const removeItem = useCallback(
    (productId: number) => {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.product_id !== productId);
        if (!userId) saveGuest(newItems);
        setTimeout(
          () => window.dispatchEvent(new Event("healthBagUpdated")),
          0
        );
        return newItems;
      });

      if (userId) {
        deleteHealthBag(productId).catch(() => {});
      }
    },
    [userId, saveGuest]
  );

  // ✅ Merge guest cart (stable)
  const mergeGuestCart = useCallback(() => {
    if (!userId) return;
    const guest = localStorage.getItem(GUEST_KEY);
    if (!guest) return;

    const guestItems: HealthBag[] = JSON.parse(guest);
    guestItems.forEach((item) => addItem({ ...item, buyer_id: userId }));
    localStorage.removeItem(GUEST_KEY);
  }, [userId, addItem]);

  return { items, addItem, removeItem, mergeGuestCart };
};
