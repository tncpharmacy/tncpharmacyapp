import React, { useState } from "react";
import "../../css/medicine.css";
import Image from "next/image";
import { Medicine } from "@/types/medicine";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";

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

  // 👇 onClick function
  const handleClick = (id: number) => {
    router.push(`/medicines-details/${encodeId(id)}`);
  };

  const fullUrl = primary_image?.document || "";
  const path = fullUrl ? new URL(fullUrl).pathname : "";
  const imageSrc = primary_image
    ? `${mediaBase}${path}`
    : "/images/tnc-default-small.png";

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
            <Image src={imageSrc} alt="" width={50} height={50} />
            {isHovered && (
              <div className="zoomBox shadow-lg">
                <Image
                  src={imageSrc}
                  alt={medicine_name}
                  fill
                  style={{ objectFit: "contain" }}
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
            <>
              <p className="medicine-discounted text-success fw-bold">
                ₹{formatCurrency(discountedPrice)}{" "}
                <span className="text-danger fw-semibold">
                  ({discountPercent}% OFF)
                </span>
              </p>
              <p
                className="medicine-mrp text-muted"
                style={{ textDecoration: "line-through", marginRight: "180px" }}
              >
                ₹{formatCurrency(originalMrp)}
              </p>
            </>
          ) : (
            <p className="medicine-mrp">₹{formatCurrency(originalMrp)}</p>
          )}
          {/* <p className="medicine-mrp">MRP ₹{formatCurrency(mrp)}</p>; */}
          <button className="medicine-btn">ADD</button>
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
