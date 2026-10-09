"use client";

import React, { useMemo, useCallback } from "react";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductCardUI from "@/app/(user)/components/MedicineCard/ProductCardUI";

interface ProductSectionProps {
  categoryId: number;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  encodeId: (id: number) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleAdd: (item: any) => void;
  handleRemove: (id: number) => void;
  handleClick: (id: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localState: any;
  processingIds: number[];
  /** no longer used — the card is the same on every screen size */
  isMobile?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mediaBase: any;
}

export default function ProductSection({
  categoryId,
  title,
  products,
  router,
  encodeId,
  handleAdd,
  handleRemove,
  handleClick,
  items,
  localState,
  processingIds,
  mediaBase,
}: ProductSectionProps) {
  const itemIds = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Set(items.map((i: any) => Number(i.product_id)));
  }, [items]);

  // 🔥 HEAVY CALCULATION MEMOIZED
  const processedProducts = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return products.map((item: any) => {
      const mrpRaw = item.MRP ?? item.mrp ?? 0;
      const parsedMrp = Number(mrpRaw);

      // No price means not for sale — never invent one (the card shows
      // "Price unavailable" and hides ADD).
      const baseMrp =
        Number.isFinite(parsedMrp) && parsedMrp > 0 ? parsedMrp : 0;

      const mrp = Number(baseMrp.toFixed(2));
      const formattedMrp = formatPrice(mrp);

      const discount = parseFloat(item.Discount || "0") || 0;
      const discountedPriceRaw = mrp - (mrp * discount) / 100;
      const formattedDiscountedPrice = formatPrice(discountedPriceRaw);

      const images = item.DefaultImageURL;

      const defaultImg = Array.isArray(images)
        ? images.find((img) => img.default_image === 1)
        : null;

      const imageUrl = defaultImg?.document
        ? `${mediaBase}${defaultImg.document}`
        : "/images/tnc-default.png";

      const isInBag = itemIds.has(item.product_id);

      const showRemove =
        localState[item.product_id] !== undefined
          ? localState[item.product_id]
          : isInBag;

      return {
        ...item,
        formattedMrp,
        formattedDiscountedPrice,
        discount,
        imageUrl,
        isInBag,
        showRemove,
      };
    });
  }, [products, mediaBase, itemIds, localState]);

  // 🔥 NAVIGATION MEMO
  const handleViewAll = useCallback(() => {
    router.push(`/all-product/${encodeId(categoryId)}`);
  }, [router, encodeId, categoryId]);

  return (
    <section className="pd_section">
      <div className="container">
        {/* HEADER */}
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <h2 className="section_title">{title}</h2>

          <button className="btn-outline" onClick={handleViewAll}>
            View All <i className="bi bi-arrow-right"></i>
          </button>
        </div>

        {/* One card for desktop and mobile — Figma "store/Product card v2" */}
        <div className="pc-grid pc-grid--rail">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {processedProducts.map((item: any) => (
            <ProductCardUI
              key={item.product_id}
              inStock={item.in_stock}
              image={item.imageUrl}
              name={item.ProductName}
              manufacturer={item.Manufacturer}
              packSize={item.pack_size}
              price={item.formattedDiscountedPrice}
              mrp={item.formattedMrp}
              discount={item.discount}
              showRx={Number(item.prescription_required) === 1}
              isInCart={item.showRemove}
              loading={processingIds.includes(item.product_id)}
              onAdd={() => handleAdd(item)}
              onRemove={() => handleRemove(item.product_id)}
              onClick={() => handleClick(item.product_id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
