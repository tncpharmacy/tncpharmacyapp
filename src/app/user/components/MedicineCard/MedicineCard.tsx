import React, { useEffect, useState } from "react";
import "../../css/medicine.css";
import { Medicine } from "@/types/medicine";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { HealthBag } from "@/types/healthBag";
import { Image } from "react-bootstrap";
import { formatAmount } from "@/lib/utils/formatAmount";
import {
  loadLocalHealthBag,
  removeLocalHealthBag,
} from "@/lib/features/healthBagSlice/healthBagSlice";

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
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  //const originalMrp = mrp ?? Math.floor(Math.random() * (5000 - 200 + 1)) + 200;
  // const discountPercent = parseFloat(discount || "0");
  // const discountedPrice = originalMrp - (originalMrp * discountPercent) / 100;
  // const originalMrp = mrp || 0;
  const originalMrp =
    mrp !== null && mrp !== undefined && Number(mrp) > 0 ? Number(mrp) : 275;
  const hasValidMrp =
    originalMrp !== null &&
    originalMrp !== undefined &&
    originalMrp !== 0 &&
    Number(originalMrp) > 0;

  const discountPercent = hasValidMrp ? Number(discount || 0) : 0;

  const discountedPrice = hasValidMrp
    ? originalMrp - (originalMrp * discountPercent) / 100
    : 0;

  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const { items, addItem, removeItem, mergeGuestCart } = useHealthBag({
    userId: buyer?.id || null,
  });

  // ---------- CHECK IF IN CART ----------
  // const isInBag =
  //   localBag.includes(id) ||
  //   items.some(
  //     (i) =>
  //       i.productid === id || // backend
  //       i.product_id === id // local/guest
  //   );

  // ---------- SYNC LOCAL CART ----------
  useEffect(() => {
    if (items?.length) {
      setLocalBag(
        items.map((i) => i.productid || i.product_id).filter(Boolean)
      );
    } else {
      setLocalBag([]);
    }
  }, [items]);

  // ---------- MERGE GUEST CART ----------
  useEffect(() => {
    if (buyer?.id) mergeGuestCart();
  }, [buyer?.id, mergeGuestCart]);

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [guestItems, setGuestItems] = useState<any[]>([]);
  // useEffect(() => {
  //   if (!buyer?.id) {
  //     const lsData = localStorage.getItem("healthbag");

  //     if (!lsData) {
  //       setGuestItems([]); // 🔥 ensure empty
  //       return;
  //     }

  //     try {
  //       setGuestItems(JSON.parse(lsData));
  //     } catch {
  //       setGuestItems([]);
  //     }
  //   }
  // }, [buyer?.id]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    // 🟢 LOGIN USER
    if (buyer?.id) {
      await addItem({
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
  };

  const handleRemove = async (productId: number) => {
    setProcessingIds((prev) => [...prev, productId]);

    try {
      // 🟢 LOGIN USER
      if (buyer?.id) {
        await removeItem(productId);
      }

      // 🔵 GUEST USER
      else {
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

        // ✅ sync redux
        dispatch(loadLocalHealthBag());
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getProductId = (item: any) => {
    return item.productid ?? item.product_id ?? id;
  };

  const source = items;

  const isInBag = source.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (i: any) => getProductId(i) === id
  );

  // 👇 onClick function
  const handleClick = (id: number) => {
    router.push(`/medicines-details/${encodeId(id)}`);
  };

  let imageSrc = "/images/tnc-default.png";

  if (primary_image?.document) {
    // remove domain from URL
    const cleaned = primary_image.document.replace(/^https?:\/\/[^/]+/i, "");
    // ensure no double slash
    const finalPath = cleaned.startsWith("/") ? cleaned : "/" + cleaned;
    imageSrc = mediaBase + finalPath;
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
              style={{ display: "inline-block" }}
            >
              <Image
                src={imageSrc}
                alt="No Image Available"
                width={70}
                height={60}
                style={{
                  opacity: imageSrc === "/images/tnc-default.png" ? 0.3 : 1,
                }}
              />
            </div>

            {/* ✅ Zoom box */}
            {imageSrc !== "/images/tnc-default.png" && (
              <div
                className={`zoomBox shadow-xl ${isHovered ? "active" : ""}`}
                style={{
                  top: openUpward ? "-320px" : "70px",
                }}
              >
                {isHovered && (
                  <Image
                    src={imageSrc}
                    alt={medicine_name}
                    // fill
                    style={{
                      height: "100%",
                      objectFit: "contain",
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
                className="medicine-name hover-link"
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
              <p className="medicine-text">{manufacturer_name}</p>
            )}
            {generic_name && <p className="medicine-salt">{generic_name}</p>}
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
                  ₹{discountedPrice.toFixed(2)}
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
                    MRP ₹{originalMrp.toFixed(2)}
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
              className={`btn-1 btn-HO ${isInBag ? "remove" : "add"}`}
              disabled={processingIds.includes(id)}
              onClick={() => (isInBag ? handleRemove(id) : handleAdd(id))}
            >
              {processingIds.includes(id)
                ? "Processing..."
                : isInBag
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
