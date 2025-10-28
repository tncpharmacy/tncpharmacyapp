import React, { useEffect, useState } from "react";
import "../../css/medicine.css";
import Image from "next/image";
import { Medicine } from "@/types/medicine";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import { useAppSelector } from "@/lib/hooks";
import { useHealthBag } from "@/lib/hooks/useHealthBag";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function MedicineCard({
  id,
  medicine_name,
  manufacturer_name,
  generic_name,
  dose_form,
  mrp = 0,
  prescription_required,
  discount,
  pack_size,
  primary_image,
}: Medicine) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const originalMrp = mrp ?? Math.floor(Math.random() * (5000 - 200 + 1)) + 200;
  const discountPercent = parseFloat(discount || "0");
  const discountedPrice = originalMrp - (originalMrp * discountPercent) / 100;

  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  const isInBag = items.some((i) => i.product_id === id);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id]);

  // end for increse header count code
  // 👇 onClick function
  const handleClick = (id: number) => {
    router.push(`/medicines-details/${encodeId(id)}`);
  };

  const fullUrl = primary_image?.document || "";
  const path = fullUrl ? new URL(fullUrl).pathname : "";
  const imageSrc = primary_image
    ? `${mediaBase}${path}`
    : "/images/tnc-default.png";

  return (
    <div className="medicine-card">
      <div className="medicine-content">
        {/* Top section */}
        <div className="medicine-top">
          {/* Image with zoom on hover */}
          <div
            className="medicine-imgs"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={imageSrc}
              alt="No Image Available"
              width={70}
              height={60}
              style={{
                opacity: imageSrc === "/images/tnc-default.png" ? 0.3 : 1, // ✅ only default image faded
              }}
            />
            {isHovered && (
              <div className="zoomBox shadow-xl">
                <Image
                  src={imageSrc}
                  alt={medicine_name}
                  fill
                  style={{
                    height: "100%",
                    objectFit: "contain",
                    opacity: imageSrc === "/images/tnc-default.png" ? 0.3 : 1, // ✅ only default image faded
                  }}
                />
              </div>
            )}
          </div>

          {/* Medicine Details */}
          <div className="medicine-details">
            <div className="medicine-header">
              <h3
                className="medicine-name hover-link"
                style={{
                  // textDecoration: "none",
                  // color: "inherit",
                  cursor: "pointer",
                }}
                onClick={() => handleClick(id)}
              >
                {medicine_name}
              </h3>
              {prescription_required && (
                <div className="relative medicine-badge">
                  <Image
                    src="/images/RX-small.png"
                    alt="Prescription Required"
                    title="Prescription Required"
                    height={25}
                    width={30}
                    className="absolute top-0 right-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
            {pack_size && <p className="medicine-text">{pack_size}</p>}
            {manufacturer_name && (
              <p className="medicine-text">{manufacturer_name}</p>
            )}
            {generic_name && <p className="medicine-salt">{generic_name}</p>}
          </div>
        </div>

        {/* Bottom section */}
        <div className="medicine-bottom">
          {discountPercent > 0 ? (
            <div className="d-flex flex-column align-items-start">
              <p className="medicine-discounted text-success fw-bold mb-1">
                ₹{formatCurrency(discountedPrice)}
              </p>
              <p
                className="text-danger fw-bold mb-1"
                style={{ fontSize: "12px" }}
              >
                ({discountPercent}% OFF)
              </p>
              <p
                className="medicine-mrp text-muted mb-0"
                style={{ textDecoration: "line-through" }}
              >
                ₹{formatCurrency(originalMrp)}
              </p>
            </div>
          ) : (
            <p className="medicine-mrp">₹{formatCurrency(originalMrp)}</p>
          )}
          {/* <p className="medicine-mrp">MRP ₹{formatCurrency(mrp)}</p>; */}
          <div className="text-end">
            <button
              className="btn-1"
              onClick={() =>
                isInBag
                  ? removeItem(id)
                  : addItem({
                      id: Date.now(),
                      buyer_id: buyer?.id || 0,
                      product_id: id,
                      quantity: 1,
                    })
              }
            >
              {isInBag ? "REMOVE" : "ADD"}
            </button>
          </div>
          {/* {availability === "ADD" ? (
            <button className="medicine-btn">ADD</button>
          ) : (
            <span className="medicine-na">{availability}</span>
          )} */}
        </div>
      </div>
    </div>
  );
}
