// hooks/useHealthBag.ts
import { useEffect, useState } from "react";
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
  const saveGuest = (newItems: HealthBag[]) =>
    localStorage.setItem(GUEST_KEY, JSON.stringify(newItems));

  // Add item
  const addItem = (item: HealthBag) => {
    setItems((prev) => {
      const newItems = [...prev, item]; // ✅ latest state
      if (!userId) saveGuest(newItems); // guest save
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
  };

  // Remove item
  const removeItem = (productId: number) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.product_id !== productId);
      if (!userId) saveGuest(newItems);
      return newItems;
    });

    if (userId) {
      deleteHealthBag(productId).catch(() => {});
    }
  };

  // Merge guest cart after login
  const mergeGuestCart = () => {
    if (!userId) return;
    const guest = localStorage.getItem(GUEST_KEY);
    if (!guest) return;

    const guestItems: HealthBag[] = JSON.parse(guest);
    guestItems.forEach((item) => addItem({ ...item, buyer_id: userId }));
    localStorage.removeItem(GUEST_KEY);
  };

  return { items, addItem, removeItem, mergeGuestCart };
};
