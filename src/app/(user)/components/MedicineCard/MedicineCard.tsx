import React, { useEffect, useState } from "react";
import "../../css/medicine.css";
import { Medicine } from "@/types/medicine";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { HealthBag } from "@/types/healthBag";
import { formatAmount } from "@/lib/utils/formatAmount";
import {
  loadLocalHealthBag,
  removeLocalHealthBag,
} from "@/lib/features/healthBagSlice/healthBagSlice";
import { formatPrice } from "@/lib/utils/formatPrice";
import Image from "next/image";

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
  const dispatch = useAppDispatch();
  // zooming box state
  const [isHovered, setIsHovered] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  // --- Local states for instant UI ---
  // const [localBag, setLocalBag] = useState<number[]>([]);
  const [localState, setLocalState] = useState<{ [key: number]: boolean }>({});
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const originalMrp =
    mrp !== null && mrp !== undefined && Number(mrp) > 0 ? Number(mrp) : 275;

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
  useEffect(() => {
    if (buyer?.id) mergeGuestCart();
  }, [buyer?.id, mergeGuestCart]);

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
    router.push(`/medicines-details/${encodeId(id)}`);
  };

  let imageSrc = "/images/tnc-default.png";

  if (primary_image?.document) {
    const cleaned = primary_image.document.replace(/^https?:\/\/[^/]+/i, "");

    const base = mediaBase?.endsWith("/") ? mediaBase.slice(0, -1) : mediaBase;

    const path = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;

    imageSrc = `${base}/${path}`;
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageSrc === "/images/tnc-default.png") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    setOpenUpward(spaceBelow < 320);
    setIsHovered(true);
  };

  return (
    <div className="medicine-card">
      <div className="medicine-content">
        {/* Top section */}
        <div
          className="medicine-top"
          style={{ cursor: "pointer" }}
          onClick={() => handleClick(id)}
        >
          {/* Image with zoom on hover */}
          <div className="medicine-imgs" style={{ position: "relative" }}>
            {/* ✅ Only image hover controls zoom */}
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() =>
                imageSrc !== "/images/tnc-default.png" && setIsHovered(false)
              }
              style={{
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={imageSrc}
                alt={medicine_name}
                width={80}
                height={80}
                loading="lazy"
                sizes="80px"
                style={{
                  objectFit: "contain",
                  opacity: imageSrc === "/images/tnc-default.png" ? 0.3 : 1,
                }}
              />
            </div>

            {/* ✅ Zoom box */}
            {imageSrc !== "/images/tnc-default.png" && (
              <div
                className={`zoomBox shadow-xl ${isHovered ? "active" : ""}`}
                style={{
                  top: openUpward ? "-220px" : "70px",
                  position: "absolute",
                  width: "250px",
                  height: "250px",
                  padding: "10px",
                  background: "#fff",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  zIndex: 9999,
                }}
              >
                {isHovered && (
                  <Image
                    src={imageSrc}
                    alt={medicine_name}
                    width={220}
                    height={220}
                    sizes="250px"
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Medicine Details */}
          <div className="medicine-details">
            <div className="medicine-header">
              <h3
                className="medicine-name hover-link pd-title"
                style={
                  {
                    // textDecoration: "none",
                    // color: "inherit",
                    // cursor: "pointer",
                  }
                }
                //onClick={() => handleClick(id)}
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
              <p className="medicine-text pd-title">{manufacturer_name}</p>
            )}
            {generic_name && (
              <p className="medicine-salt pd-title">{generic_name}</p>
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div className="medicine-bottom">
          {/* If no valid MRP => OUT OF STOCK */}
          <div style={{ cursor: "pointer" }} onClick={() => handleClick(id)}>
            {discountPercent > 0 ? (
              <div className="d-flex flex-column align-items-start">
                {/* Discounted Price */}
                <p className="text-success fw-bold mb-1">
                  ₹{formattedDiscountedPrice}
                </p>

                {/* Original MRP + Discount */}
                <p className="text-muted mb-0">
                  <span
                    className="medicine-mrp text-muted mb-0"
                    style={{
                      textDecoration: "line-through",
                      fontSize: "13px",
                    }}
                  >
                    MRP ₹{formattedMrp}
                  </span>{" "}
                  <span
                    className="text-danger fw-bold"
                    style={{ fontSize: "13px" }}
                  >
                    ({discountPercent}% OFF)
                  </span>
                </p>
              </div>
            ) : (
              <p className="medicine-mrp">₹{formatAmount(originalMrp || 0)}</p>
            )}
          </div>
          {/* <p className="medicine-mrp">MRP ₹{formatCurrency(mrp)}</p>; */}
          <div className="text-end">
            {/* <button
              className={`btn-1 btn-HO ${isInBag ? "remove" : "add"}`}
              disabled={!hasValidMrp || processingIds.includes(id)}
              style={{
                opacity: !hasValidMrp ? 0.5 : 1,
                cursor: !hasValidMrp ? "not-allowed" : "pointer",
                pointerEvents: !hasValidMrp ? "none" : "auto",
              }}
              onClick={() => (isInBag ? handleRemove(id) : handleAdd(id))}
            >
              {processingIds.includes(id)
                ? "Processing..."
                : isInBag
                ? "REMOVE"
                : "ADD"}
            </button> */}
            <button
              className={`btn-1 btn-HO ${showRemove ? "remove" : "add"}`}
              style={{ borderRadius: "35px" }}
              disabled={processingIds.includes(id)}
              onClick={() => (showRemove ? handleRemove(id) : handleAdd(id))}
            >
              {processingIds.includes(id)
                ? "Processing..."
                : showRemove
                ? "REMOVE"
                : "ADD"}
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
