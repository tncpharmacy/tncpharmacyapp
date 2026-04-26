"use client";

import React, { useEffect, useRef, useState } from "react";
import SiteHeader from "@/app/(user)/components/header/header";
import { Button, Form, Image, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/site-style.css";
import "../css/user-style.css";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import {
  getMedicinesByCategoryId,
  getMedicinesMenuByOtherId,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { encodeId } from "@/lib/utils/encodeDecode";
import Footer from "@/app/(user)/components/footer/footer";
import { useShuffledOnce } from "@/lib/hooks/useShuffledOnce";
import { HealthBag } from "@/types/healthBag";
import DoseInstructionSelect from "@/app/components/Input/DoseInstructionSelect";
import Input from "@/app/components/Input/InputColSm";
import { getAddress } from "@/lib/features/addressSlice/addressSlice";
import AddressBar from "../components/AddressBar/AddressBar";
import toast from "react-hot-toast";
import { formatAmount } from "@/lib/utils/formatAmount";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import BuyerLoginModal from "@/app/buyer-login/page";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductCardUI from "../components/MedicineCard/ProductCardUI";
import { uploadPrescriptionFromBuyerCartThunk } from "@/lib/features/prescriptionSlice/prescriptionSlice";
import { getReOrderCart } from "@/lib/features/buyerSlice/buyerSlice";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export interface Medicine {
  // --- Core Identifiers ---
  id: number; // Internal ID
  medicine_id?: number; // Alternate ID (if exists)
  product_id?: number; // Product reference
  productid?: number; // Sometimes backend uses lowercase
  buyer_id?: number; // Buyer / user relation

  // --- Basic Info ---
  name?: string; // Short name
  medicine_name?: string; // Full medicine name
  productname?: string; // Alternate name field
  manufacturer?: string; // Manufacturer name
  category_id?: number; // Category mapping

  // --- Pricing & Offers ---
  mrp: number | null; // Original price
  discount: number; // Discount percentage
  discountMrp?: number; // Calculated discounted price
  unit?: string; // e.g., TAB, ML, GM
  pack_size?: string; // e.g., 10 TAB, 200 ML
  AvailableQTY?: string; // Stock quantity as string
  quantity?: number; // Quantity user selected
  qty?: number; // Alternate naming

  // --- Image Info ---
  image?: string; // Final image URL
  primary_image?: {
    id: number;
    document: string;
    default_image: number;
  } | null; // API nested image structure

  // --- Descriptions / Details ---
  product_introduction?: string;
  composition?: string;
  uses?: string;
  side_effects?: string;
  storage?: string;
  prescription_required?: number;

  // --- Meta Info ---
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  status?: number;
  success?: boolean;

  // --- Count / Misc ---
  count?: number;
  message?: string;
}

type ImageType = {
  id: number;
  document: string;
  default_image: number;
};

type CartItem = {
  id: number;
  productid: number;
  name: string;
  manufacturer: string;
  pack_size: string;
  prescription_required: number; // ✅ number hi rahega
  qty: number;
  mrp: number;
  discount: number;
  discountMrp: number;
  image: string;
};
export default function ReOrderBag() {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const [dose, setDose] = useState("");
  const [mounted, setMounted] = useState(false);
  const [billingAddress, setBillingAddress] = useState<
    number | null | undefined
  >(null);

  // for login popup
  const [showBuyerLogin, setShowBuyerLogin] = useState(false);
  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  // for precription upload state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSelecting = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const {
    items: bagItem,
    addItem,
    removeItem,
    mergeGuestCart,
    fetchCart,
    increaseQty,
    decreaseQty,
    updateGuestQuantity,
  } = useHealthBag({
    userId: buyer?.id || null,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [guestItems, setGuestItems] = useState<any[]>([]);
  const reorderCart = useAppSelector((state) => state.buyer.reorderCart);
  const prescriptionId = useAppSelector((state) => state.buyer.prescriptionId);

  useEffect(() => {
    if (!buyer?.id) {
      const lsData = localStorage.getItem("healthbag");

      if (!lsData) {
        setGuestItems([]); // 🔥 ensure empty
        return;
      }

      try {
        setGuestItems(JSON.parse(lsData));
      } catch {
        setGuestItems([]);
      }
    }
  }, [buyer?.id]);
  const activeAddresses = useAppSelector((state) => state.address.addresses);
  // ✅ Filter only actie addresses
  const defaultAddress = activeAddresses?.find(
    (addr) => addr.default_address === 1
  );

  useEffect(() => {
    if (defaultAddress && typeof defaultAddress.id === "number") {
      setBillingAddress(defaultAddress.id);
    }
  }, [defaultAddress]);

  useEffect(() => {
    if (buyer?.id) {
      dispatch(getAddress(buyer?.id));
    }
  }, [dispatch, buyer?.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Sync localBag with Redux items ---
  useEffect(() => {
    const newLocalBag = bagItem?.length ? bagItem.map((i) => i.productid) : [];

    // ✅ Prevent infinite loop — only update if changed
    if (JSON.stringify(newLocalBag) !== JSON.stringify(localBag)) {
      setLocalBag(newLocalBag);
    }
  }, [bagItem, localBag]);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  useEffect(() => {
    if (buyer?.id) {
      dispatch(getReOrderCart(buyer.id));
    }
  }, [buyer?.id, dispatch]);

  //Sync quantities from cart API
  useEffect(() => {
    const itemsToSync = reorderCart.length > 0 ? reorderCart : bagItem;

    if (!itemsToSync) return;

    setQuantities((prev) => {
      const updated = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemsToSync.forEach((item: any) => {
        // ❗ only set if not exists
        if (!updated[item.productid]) {
          updated[item.productid] = Number(item.qty) || 1;
        }
      });

      return updated;
    });
  }, [bagItem, reorderCart]);

  const handleRemove = async (productId: number) => {
    setProcessingIds((prev) => [...prev, productId]);

    try {
      // 🟢 LOGIN USER
      if (buyer?.id) {
        await removeItem(productId);
      }
      // 🔵 GUEST USER
      else {
        const updated = guestItems.filter(
          (item) => (item.productid ?? item.product_id) !== productId
        );

        localStorage.setItem("healthbag", JSON.stringify(updated));
        setGuestItems(updated);
        dispatch(loadLocalHealthBag());
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  // 👇 onClick function
  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  // 🟢 Merge: cart items (from LS/API) + product details (from all product list)
  const sourceItems = buyer?.id ? reorderCart : guestItems;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getFinalImage(item: any, isLoggedIn: boolean) {
    const base = mediaBase?.replace(/\/$/, "") || "";

    // 🟢 LOGIN USER
    if (isLoggedIn) {
      if (item.medicine_image?.document) {
        return `${base}/${item.medicine_image.document.replace(/^\//, "")}`;
      }
    }

    // 🔵 GUEST USER

    const img = item.image;

    // ✅ CASE 1: ARRAY
    if (Array.isArray(img)) {
      const defaultImg = img.find((i) => i.default_image === 1);
      if (defaultImg?.document) {
        return `${base}/${defaultImg.document.replace(/^\//, "")}`;
      }
    }

    // ✅ CASE 2: OBJECT (🔥 tera issue yahi hai)
    if (img && typeof img === "object" && img.document) {
      return `${base}/${img.document.replace(/^\//, "")}`;
    }

    // ✅ CASE 3: STRING
    if (typeof img === "string") {
      return img.startsWith("http") ? img : `${base}/${img.replace(/^\//, "")}`;
    }

    return "/images/tnc-default.png";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedItems = sourceItems.map((item: any) => {
    const rawMrp = Number(item.mrp) || 0;

    // 🔥 fallback + validation
    const mrp = Number.isFinite(rawMrp) && rawMrp > 0 ? rawMrp : 275;

    const discount = Number(item.discount) || 0;

    // 👉 discounted price raw
    const discountMrpRaw = mrp - (mrp * discount) / 100;

    return {
      id: item.id || 0,
      productid: item.productid,

      // 🔥 NAME FIX
      name: item.name || item.productname || item.medicine_name || "",

      manufacturer: item.manufacturer || "",
      pack_size: item.pack_size || "",
      prescription_required: Number(item.prescription_required) || 0,

      qty: quantities[item.productid] ?? Number(item.qty) ?? 1,

      // 👉 RAW values (for calculations)
      mrp,
      discount,
      discountMrp: discountMrpRaw,

      // 👉 FORMATTED values (for UI)
      formattedMrp: formatPrice(mrp),
      formattedDiscountMrp: formatPrice(discountMrpRaw),

      image: getFinalImage(item, !!buyer?.id),
    };
  });

  const handleQuantityChange = async (
    productId: number,
    cartId: number,
    delta: number
  ) => {
    const current = quantities[productId] || 1;
    const updated = current + delta;

    if (updated < 1) return;

    // UI update (optimistic)
    setQuantities((prev) => ({
      ...prev,
      [productId]: updated,
    }));

    if (!buyer?.id) {
      updateGuestQuantity(productId, updated);
      return;
    }

    try {
      if (delta === 1) {
        await increaseQty(cartId, productId, updated);
      } else {
        await decreaseQty(cartId, productId, updated);
      }

      // 🔥 IMPORTANT: refetch
      dispatch(getReOrderCart(buyer.id));
    } catch (err) {
      console.log(err);

      // rollback (optional but pro)
      setQuantities((prev) => ({
        ...prev,
        [productId]: current,
      }));
    }
  };

  const totals = mergedItems.reduce(
    (acc, item) => {
      const qty = quantities[item.productid] ?? item.qty ?? 1;

      const mrp = Number(item.mrp) || 0;
      const discount = Number(item.discount) || 0;

      // 🔥 exact discounted price
      const finalPrice = mrp - (mrp * discount) / 100;

      acc.totalMrp += mrp * qty;
      acc.totalDiscount += (mrp - finalPrice) * qty;
      acc.totalPay += finalPrice * qty;

      return acc;
    },
    { totalMrp: 0, totalDiscount: 0, totalPay: 0 }
  );
  // 🚚 Delivery logic
  const DELIVERY_THRESHOLD = 599;
  const DELIVERY_FEE = 40;

  // 🔥 formatted values (NO .00 issue)
  const formattedTotalMrp = formatPrice(totals.totalMrp);
  const formattedTotalDiscount = formatPrice(totals.totalDiscount);
  const formattedGrandTotal = formatPrice(totals.totalPay);

  const grandTotal = Number(totals.totalPay.toFixed(2));

  const deliveryFee = grandTotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  const finalPayable = grandTotal + deliveryFee;
  // const grandTotal = totals.totalPay;

  const checkoutData = () => {
    if (!buyer?.id) {
      toast.error("Please login to continue!");
      return;
    }

    if (!billingAddress) {
      toast.error("Please select delivery address!");
      return;
    }

    // Prepare product data
    const products = mergedItems.map((item, index) => ({
      product_id: item.productid,
      quantity: quantities[item.productid] ?? item.qty ?? 1,
      mrp: item.mrp,
      discount: item.discount,
      rate: item.discountMrp,
      doses: "",
      instruction: "",
      status: "1",
    }));

    const checkoutPayload = {
      payment_mode: 1, // default UPI/manual
      payment_status: "1",
      amount: formatPrice(finalPayable),
      order_type: 1, // pharmacy
      address_id: billingAddress,
      status: "1",
      products,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutPayload));
    //toast.success("Checkout data saved!");
  };

  const handleContinue = () => {
    if (!buyer?.id) {
      setShowBuyerLogin(true);
      return;
    }
    if (!billingAddress) {
      toast.error("Please select delivery address!");
      return;
    }
    const hasRxProduct = mergedItems.some(
      (item) => item.prescription_required === 1
    );
    const shouldOpenModal = !prescriptionId && hasRxProduct;
    if (shouldOpenModal) {
      setShowPrescriptionModal(true);
    } else {
      checkoutData();
      router.push("/checkout");
    }
  };

  // remove handler
  const handleRemoveFile = () => {
    setPrescriptionFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, PDF allowed!");
      return;
    }

    setPrescriptionFile(file);
  };

  const handleFinalContinue = async () => {
    if (!prescriptionFile) {
      toast.error("Please upload prescription to continue!");
      return;
    }

    if (!buyer?.id) {
      toast.error("Login required!");
      return;
    }

    const token = localStorage.getItem("token") || "";

    try {
      const formData = new FormData();
      formData.append("prescription_pic", prescriptionFile);

      await dispatch(
        uploadPrescriptionFromBuyerCartThunk({
          formData,
          token,
        })
      ).unwrap();
      checkoutData();
      setShowPrescriptionModal(false);
      router.push("/checkout");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error || "Upload failed!");
    }
  };

  const handleSelect = (product: Medicine) => {
    const actualId = product.product_id || product.productid || product.id; // ✅ safe ID fallback

    const path =
      product.category_id === 1
        ? `/medicines-details/${encodeId(actualId)}`
        : `/product-details/${encodeId(actualId)}`;

    router.push(path);
  };

  const isCartEmpty = mergedItems.length === 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (img: any) => {
    if (!img) return "/images/tnc-default.png";

    const base = mediaBase?.replace(/\/$/, "") || "";

    // ARRAY
    if (Array.isArray(img)) {
      const defaultImg = img.find((i) => i.default_image === 1);
      if (defaultImg?.document) {
        return `${base}/${defaultImg.document.replace(/^\//, "")}`;
      }
    }

    // OBJECT
    if (img.document) {
      return `${base}/${img.document.replace(/^\//, "")}`;
    }

    // STRING
    if (typeof img === "string") {
      return img.startsWith("http") ? img : `${base}/${img.replace(/^\//, "")}`;
    }

    return "/images/tnc-default.png";
  };

  const prescriptionItems = mergedItems.filter(
    (item) => item.prescription_required === 1
  );
  const shortenName = (name: string) => {
    if (!name) return "";

    const maxLength = 18;
    return name.length > maxLength
      ? name.slice(0, maxLength).trim() + "..."
      : name;
  };
  return (
    <>
      {/* <SiteHeader /> */}

      <section className="py-4 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Left: Items List */}
            <div className={isCartEmpty ? "col-12" : "col-lg-8"}>
              {mounted && buyer?.id ? (
                <AddressBar
                  address={
                    defaultAddress
                      ? {
                          id: defaultAddress.id ?? 0,
                          name: defaultAddress.name ?? "Unknown",
                          pincode: defaultAddress.pincode ?? "000000",
                          address_line: `${defaultAddress.address}, ${defaultAddress.location}`,
                          address_type_id: `${defaultAddress.address_type_id}`,
                        }
                      : null
                  }
                />
              ) : null}
              {!isCartEmpty && (
                <h5 className="mb-3 fw-semibold">
                  {mergedItems.length} items added
                </h5>
              )}
              <div className="border rounded p-3 mb-3 bg-white">
                {mergedItems.length > 0 ? (
                  mergedItems.map((item, index) => {
                    const imageUrl = getImageUrl(item.image);
                    const qty = quantities[item.productid] ?? item.qty ?? 1;
                    return (
                      <div
                        key={`${item.productid}-${index}`}
                        className="cart-item border-bottom pb-3 mb-3"
                      >
                        <div className="d-flex gap-2">
                          <span
                          // onClick={() => handleItemSelect(item)}
                          // style={{ cursor: "pointer" }}
                          >
                            <Image
                              src={imageUrl}
                              alt={""}
                              className="rounded cart-img"
                              style={{
                                width: 90,
                                height: 90,
                                objectFit: "contain",
                                opacity: imageUrl.includes("tnc-default")
                                  ? 0.3
                                  : 1,
                              }}
                            />
                          </span>

                          <div className="cart-content position-relative">
                            <div
                              className="flex-grow-1 pd-title ms-2"
                              // onClick={() => handleItemSelect(item)}
                              // style={{ cursor: "pointer" }}
                            >
                              <h6 className="fw-semibold pd-title mb-1">
                                {item.name}
                              </h6>

                              <p className="mb-1 small pd-title">
                                {item.pack_size}
                              </p>
                              <p className="text-success small mb-1 pd-title">
                                {item.manufacturer}
                              </p>

                              <div className="price-block">
                                ₹{item.formattedDiscountMrp}
                                <small className="text-muted text-decoration-line-through ms-2">
                                  ₹{item.formattedMrp}
                                </small>
                                <small className="text-danger ms-2">
                                  {item.discount}% off
                                </small>
                              </div>
                            </div>

                            {/* 🔥 RX BADGE OUTSIDE */}
                            {item.prescription_required === 1 && (
                              <Image
                                src="/images/RX-small.png"
                                alt="Prescription Required"
                                className="rx-badge"
                              />
                            )}
                          </div>
                        </div>

                        {/* BOTTOM ROW (QTY + DELETE) */}
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <button
                            className="text-danger border-0 bg-transparent"
                            onClick={() => handleRemove(item.productid)}
                          >
                            {/* <i className="bi bi-trash"></i> */}
                          </button>

                          <div className="qty-box" style={{ gap: "10px" }}>
                            {/* ➖ Minus button (disabled when qty = 1) */}
                            <Button
                              variant="link"
                              className="p-0 text-dark fw-bold"
                              disabled={(quantities[item.productid] ?? 1) <= 1}
                              onClick={() =>
                                handleQuantityChange(
                                  item.productid,
                                  item.id,
                                  -1
                                )
                              }
                            >
                              <i className="bi bi-dash-lg"></i>
                            </Button>

                            {/* Qty */}
                            <span>{quantities[item.productid] ?? 1}</span>

                            {/* ➕ Plus button */}
                            <Button
                              className="p-0 text-dark fw-bold"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productid,
                                  item.id,
                                  +1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="d-flex flex-column justify-content-center align-items-center bg-white border rounded"
                    style={{ minHeight: "300px" }}
                  >
                    <h5 className="fw-semibold">No items in your cart</h5>
                    <p className="text-muted mb-3">
                      Looks like you haven’t added anything yet
                    </p>
                    <Button onClick={() => router.push("/")} variant="primary">
                      Continue To Shopping
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Bill Summary */}
            {!isCartEmpty && (
              <div className="col-lg-4">
                <div className="border rounded p-3 bg-white sticky-summary">
                  <h6 className="fw-bold mb-3 text-primary">Bill summary</h6>

                  {/* Total MRP */}
                  <div className="d-flex justify-content-between mb-2 small fw-semibold">
                    <span>Total MRP</span>
                    <span>₹{formattedTotalMrp}</span>
                  </div>

                  {/* You Saved */}
                  <div className="d-flex justify-content-between mb-2 small text-success fw-semibold">
                    <span>Discount</span>
                    <span>- ₹{formattedTotalDiscount}</span>
                  </div>

                  {/* Total Price */}
                  <div className="d-flex justify-content-between mb-2 small text-success fw-semibold">
                    <span>Total Price</span>
                    <span>₹{formatPrice(grandTotal)}</span>
                  </div>

                  {/* 🚚 Delivery Fee */}
                  <div className="d-flex justify-content-between mb-2 small fw-semibold">
                    <span>Delivery Fee</span>

                    {deliveryFee === 0 ? (
                      <span className="text-success fw-semibold">
                        FREE{" "}
                        <span className="text-muted text-decoration-line-through ms-1">
                          ₹40
                        </span>
                      </span>
                    ) : (
                      <span>₹40</span>
                    )}
                  </div>

                  {/* 🚚 Free delivery banner */}
                  <div className="delivery-banner mb-2">
                    <i className="bi bi-truck me-2"></i>
                    <span className="delivery-text">
                      Enjoy FREE delivery on orders above ₹599
                    </span>
                  </div>

                  <hr />

                  {/* Final Pay */}
                  <div className="d-flex justify-content-between mb-1 fw-semibold">
                    <span>To Pay</span>
                    <span>₹{formatPrice(finalPayable)}</span>
                  </div>

                  {/* Extra highlight */}
                  {totals.totalDiscount > 0 && (
                    <div className="text-success small mb-3 fw-semibold">
                      🎉 You saved ₹{formattedTotalDiscount} on this order
                    </div>
                  )}

                  <Button
                    className="w-100 py-2 fw-semibold continue-btn fixed-mobile-btn"
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <BuyerLoginModal
        show={showBuyerLogin}
        handleClose={() => setShowBuyerLogin(false)}
      />
      <Modal
        show={showPrescriptionModal}
        onHide={() => setShowPrescriptionModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-semibold text-primary">
            Upload Prescription
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* 🔥 HEADER WITH RX */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <Image
              src="/images/RX-small.png"
              alt="rx"
              style={{ width: "24px", height: "24px" }}
            />
            <h6 className="mb-0 fw-semibold text-danger">
              Prescription Required
            </h6>
          </div>

          {/* 🔥 MESSAGE */}
          <p className="text-danger mb-3">
            A valid prescription is required for the following medicines:
          </p>

          {/* 🔥 PRODUCT LIST */}
          <div className="mb-3">
            <p className="fw-semibold text-success small mb-1 rx-product-list">
              (
              {prescriptionItems.map((item, index) => (
                <span key={index} className="small fw-bold">
                  {shortenName(item.name)}
                  {index !== prescriptionItems.length - 1 && ", "}
                </span>
              ))}
              )
            </p>
          </div>

          {/* 🔥 UPLOAD SECTION */}
          <div>
            <Form.Label className="fw-semibold">Upload Prescription</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>

          <small className="text-muted" style={{ fontSize: "10px" }}>
            Accepted formats: JPG, PNG, PDF (Max size recommended: 5MB)
          </small>

          {/* PREVIEW SAME AS BEFORE */}
          {prescriptionFile && (
            <div className="mt-3">
              <p className="fw-semibold">Preview:</p>

              {prescriptionFile.type.startsWith("image/") && (
                <Image
                  src={URL.createObjectURL(prescriptionFile)}
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              )}

              {prescriptionFile.type === "application/pdf" && (
                <div className="d-flex flex-column gap-2">
                  <p>{prescriptionFile.name}</p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(prescriptionFile),
                        "_blank"
                      )
                    }
                  >
                    View PDF
                  </Button>
                </div>
              )}

              <div className="mt-2">
                <Button variant="danger" size="sm" onClick={handleRemoveFile}>
                  <i className="bi bi-trash me-1"></i> Remove
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPrescriptionModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFinalContinue}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </>
  );
}
