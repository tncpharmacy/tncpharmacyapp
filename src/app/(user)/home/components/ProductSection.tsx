"use client";

import React, { useMemo, useCallback } from "react";
import { formatPrice } from "@/lib/utils/formatPrice";
import Image from "next/image";
import { Button } from "react-bootstrap";
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
  isMobile: boolean;
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
  isMobile,
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

      const baseMrp =
        Number.isFinite(parsedMrp) && parsedMrp > 0 ? parsedMrp : 275;

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

        <div className="row">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {processedProducts.map((item: any) => {
            // const isInBag = items.some(
            //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
            //   (i: any) => Number(i.product_id) === item.product_id
            // );

            // const showRemove =
            //   localState[item.product_id] !== undefined
            //     ? localState[item.product_id]
            //     : isInBag;

            // 🔥 MOBILE (CARD UI)
            if (isMobile) {
              return (
                <ProductCardUI
                  key={item.product_id}
                  image={item.imageUrl}
                  name={item.ProductName}
                  manufacturer={item.Manufacturer}
                  packSize={item.pack_size}
                  price={item.formattedDiscountedPrice}
                  mrp={item.formattedMrp}
                  discount={item.discount}
                  showRx={false}
                  isInCart={item.isInBag}
                  loading={processingIds.includes(item.product_id)}
                  onAdd={() => handleAdd(item)}
                  onRemove={() => handleRemove(item.product_id)}
                  onClick={() => handleClick(item.product_id)}
                />
              );
            }

            // 🔥 DESKTOP GRID
            return (
              <div className="col" key={item.product_id}>
                <div className="pd_box">
                  <div className="pd_img">
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={200}
                      height={200}
                      sizes="(max-width: 768px) 50vw, 200px"
                      style={{
                        height: "220px",
                        objectFit: "contain",
                        cursor: "pointer",
                        opacity:
                          item.imageUrl === "/images/tnc-default.png" ? 0.3 : 1,
                      }}
                      onClick={() => handleClick(item.product_id)}
                    />
                  </div>

                  <div className="pd_content">
                    <h3
                      className="pd-title hover-link fw-bold"
                      style={{ cursor: "pointer", color: "#264b8c" }}
                      onClick={() => handleClick(item.product_id)}
                    >
                      {item.ProductName || ""}
                    </h3>

                    <h6 className="pd-title fw-bold">
                      {item.Manufacturer || ""}
                    </h6>

                    <div className="pd_price">
                      <span className="new_price">
                        ₹{item.formattedDiscountedPrice}
                      </span>

                      <span className="old_price">
                        <del>MRP ₹{item.formattedMrp}</del> {item.discount}% off
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className={`btn-1 btn-HO ${
                        item.showRemove ? "remove" : "add"
                      }`}
                      style={{ borderRadius: "35px" }}
                      onClick={() =>
                        item.showRemove
                          ? handleRemove(item.product_id)
                          : handleAdd(item)
                      }
                    >
                      {item.showRemove ? "REMOVE" : "ADD"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
