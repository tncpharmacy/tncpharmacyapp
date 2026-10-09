import React, { useState } from "react";
import ProductCardUI from "./ProductCardUI";
import { Medicine } from "@/types/medicine";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { HealthBag } from "@/types/healthBag";
import {
  loadLocalHealthBag,
  removeLocalHealthBag,
} from "@/lib/features/healthBagSlice/healthBagSlice";
import { formatPrice } from "@/lib/utils/formatPrice";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function MedicineCard({
  id,
  medicine_name,
  manufacturer_name,
  mrp = 0,
  prescription_required,
  discount,
  pack_size,
  primary_image,
  in_stock,
}: Medicine) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // --- Local states for instant UI ---
  const [localState, setLocalState] = useState<{ [key: number]: boolean }>({});
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // The API sends the MRP of the batch on the shelf (or the catalogue MRP
  // when nothing is in stock). A product with no price at all is not for
  // sale: never invent one for it.
  const originalMrp =
    mrp !== null && mrp !== undefined && Number(mrp) > 0 ? Number(mrp) : 0;

  const hasValidMrp =
    originalMrp !== null &&
    originalMrp !== undefined &&
    originalMrp !== 0 &&
    Number(originalMrp) > 0;

  // 👉 discount %
  const discountPercent = hasValidMrp ? Number(discount || 0) : 0;

  // 👉 discounted price raw
  const discountedPriceRaw = hasValidMrp
    ? originalMrp - (originalMrp * discountPercent) / 100
    : 0;

  // 👉 formatted values
  const formattedMrp = formatPrice(originalMrp);
  const formattedDiscountedPrice = formatPrice(discountedPriceRaw);

  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  // ---------- MERGE GUEST CART ----------
  // useEffect(() => {
  //   if (buyer?.id) mergeGuestCart();
  // }, [buyer?.id, mergeGuestCart]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    // 🔥 start processing
    setProcessingIds((prev) => [...prev, id]);
    setLocalState((prev) => ({ ...prev, [id]: true }));
    try {
      // 🟢 LOGIN USER
      if (buyer?.id) {
        addItem({
          id: 0,
          buyer_id: buyer?.id,
          product_id: id,
          quantity: 1,
        } as HealthBag);
      }

      // 🔵 GUEST USER (FULL DATA STORE)
      else {
        const lsData = localStorage.getItem("healthbag");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any[] = [];

        try {
          current = lsData ? JSON.parse(lsData) : [];
        } catch {
          current = [];
        }

        const newItem = {
          id: 0,
          productid: id,
          qty: 1,

          name: item?.ProductName || medicine_name,
          manufacturer: item?.Manufacturer || manufacturer_name,
          pack_size: item?.PackSize || pack_size,
          mrp: Number(item?.MRP ?? mrp ?? 0),
          discount: Number(item?.Discount ?? discount ?? 0),
          category_id: Number(item?.category_id ?? 0),
          image: item?.DefaultImageURL || primary_image || null,
        };

        const exists = current.find((i) => i.productid === id);

        let updated;

        if (exists) {
          updated = current.map((i) =>
            i.productid === id ? { ...i, qty: i.qty + 1 } : i
          );
        } else {
          updated = [...current, newItem];
        }

        // ✅ SAVE FULL DATA IN LS
        localStorage.setItem("healthbag", JSON.stringify(updated));

        // ✅ ONLY SYNC REDUX (NO LOCAL STATE)
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      console.error("Add failed:", err);
      setLocalState((prev) => ({ ...prev, [id]: false }));
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handleRemove = async (productId: number) => {
    setProcessingIds((prev) => [...prev, productId]);
    setLocalState((prev) => ({ ...prev, [id]: false }));
    try {
      if (buyer?.id) {
        removeItem(productId);
      } else {
        const lsData = localStorage.getItem("healthbag");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any[] = [];

        try {
          current = lsData ? JSON.parse(lsData) : [];
        } catch {
          current = [];
        }

        const updated = current.filter(
          (item) => (item.productid ?? item.product_id ?? item.id) !== productId
        );

        localStorage.setItem("healthbag", JSON.stringify(updated));
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      // ❌ rollback
      setLocalState((prev) => ({ ...prev, [id]: true }));
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isInBag = items.some((i: any) => Number(i.product_id) === id);
  const showRemove = localState[id] !== undefined ? localState[id] : isInBag;

  // 👇 onClick function
  const handleClick = (id: number) => {
    router.push(`/medicines-details/${encodeId(id)}?src=all`);
  };

  let imageSrc = "/images/tnc-default.png";

  if (primary_image?.document) {
    const cleaned = primary_image.document.replace(/^https?:\/\/[^/]+/i, "");

    const base = mediaBase?.endsWith("/") ? mediaBase.slice(0, -1) : mediaBase;

    const path = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;

    imageSrc = `${base}/${path}`;
  }

  return (
    <ProductCardUI
      image={imageSrc}
      name={medicine_name}
      manufacturer={manufacturer_name}
      packSize={pack_size}
      price={formattedDiscountedPrice}
      mrp={formattedMrp}
      discount={discountPercent}
      showRx={Number(prescription_required) === 1}
      isInCart={showRemove}
      inStock={in_stock}
      loading={processingIds.includes(id)}
      onAdd={() => handleAdd(id)}
      onRemove={() => handleRemove(id)}
      onClick={() => handleClick(id)}
    />
  );
}
