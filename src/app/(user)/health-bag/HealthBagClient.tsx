"use client";

import React, { useEffect, useRef, useState } from "react";
import SiteHeader from "@/app/(user)/components/header/header";
import { Button, Image } from "react-bootstrap";
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
import {
  BagRow,
  BillSummary,
  CheckoutSteps,
  DeliverToCard,
  PrescriptionCard,
  StickyPayBar,
} from "./BagSections";
import type { CompareItem } from "@/types/compare";
import toast from "react-hot-toast";
import { formatAmount } from "@/lib/utils/formatAmount";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import BuyerLoginModal from "@/app/buyer-login/page";
import { loadLocalHealthBag } from "@/lib/features/healthBagSlice/healthBagSlice";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductCardUI from "../components/MedicineCard/ProductCardUI";
import { uploadPrescriptionFromBuyerCartThunk } from "@/lib/features/prescriptionSlice/prescriptionSlice";
import { useDeliveryQuote } from "@/lib/hooks/useDeliveryQuote";
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
export default function HealthBagClient() {
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

  const [localState, setLocalState] = useState<{ [key: number]: boolean }>({});
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  // for precription upload state
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const mergedRef = useRef(false);
  const isSelecting = useRef(false);
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
  const bagPrescriptionId = useAppSelector(
    (state) => state.healthBag.prescription_id
  );

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

  // Delivery fee for the chosen address, priced by the server: free within
  // 12 km of the pharmacy, the delivery partner's fare beyond, no delivery
  // beyond 50 km. (Replaces the old flat ₹40 below ₹599.)
  const {
    quote: deliveryQuote,
    fee: deliveryFee,
    deliverable,
    loading: deliveryLoading,
  } = useDeliveryQuote(buyer?.id ? billingAddress : null);

  useEffect(() => {
    if (buyer?.id) {
      dispatch(getAddress(buyer?.id));
    }
  }, [dispatch, buyer?.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { medicines: productList } = useAppSelector((state) => state.medicine);

  // end for increse header count code
  const medicineMenuByCategory5 = useAppSelector(
    (state) => state.medicine.byCategory[5] || []
  );
  const medicineMenuByCategory7 = useAppSelector(
    (state) => state.medicine.byCategory[7] || []
  );
  const medicineMenuByCategory9 = useAppSelector(
    (state) => state.medicine.byCategory[9] || []
  );
  const { list: categories } = useAppSelector((state) => state.category);
  const categoryNamesById: Record<number, string> = {};
  [5, 7, 9].forEach((id) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) categoryNamesById[id] = cat.category_name;
  });
  const shuffled5 = useShuffledOnce("category5", medicineMenuByCategory5);
  const shuffled7 = useShuffledOnce("category7", medicineMenuByCategory7);
  const shuffled9 = useShuffledOnce("category9", medicineMenuByCategory9);
  //console.log("medicineMenuByCategory5", medicineMenuByCategory5);
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getMedicinesByCategoryId({ categoryId: 5 }));
    dispatch(getMedicinesByCategoryId({ categoryId: 7 }));
    dispatch(getMedicinesByCategoryId({ categoryId: 9 }));
    dispatch(getMedicinesMenuByOtherId(0));
    dispatch(getProductList(null));
  }, [dispatch]);

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
    if (!buyer?.id) {
      mergedRef.current = false;
      return;
    }

    if (mergedRef.current) return;

    mergedRef.current = true;

    console.log("MERGING...");
    mergeGuestCart();
  }, [buyer?.id]);

  // useEffect(() => {
  //   fetchCart(); // ensures cart is synced after any add/remove
  // }, [fetchCart]);

  //Sync quantities from cart API
  // ✅ FIXED: Convert qty to number ALWAYS
  useEffect(() => {
    if (!bagItem) return;

    setQuantities((prev) => {
      const updated = { ...prev };

      bagItem.forEach((item) => {
        if (!updated[item.productid]) {
          updated[item.productid] = Number(item.qty) || 1;
        }
      });

      return updated;
    });
  }, [bagItem]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    const id = item.product_id;
    setLocalState((prev) => ({ ...prev, [id]: true }));
    try {
      if (buyer?.id) {
        await addItem({
          id: 0,
          buyer_id: buyer?.id,
          product_id: item.product_id,
          quantity: 1,
        } as HealthBag);
      } else {
        const newItem = {
          id: 0,
          productid: item.product_id,
          qty: 1,

          // 🔥 STORE FULL DATA
          name: item.ProductName || item.productname,
          manufacturer: item.Manufacturer || item.manufacturer,
          pack_size: item.PackSize || item.pack_size,
          mrp: Number(item.MRP ?? item.mrp ?? 0),
          discount: Number(item.Discount ?? item.discount ?? 0),
          image: item.DefaultImageURL || item.medicine_image || null,
        };

        const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exists = cart.find((i: any) => i.productid === item.product_id);

        let updated;

        if (exists) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updated = cart.map((i: any) =>
            i.productid === item.product_id ? { ...i, qty: i.qty + 1 } : i
          );
        } else {
          updated = [...cart, newItem];
        }

        localStorage.setItem("healthbag", JSON.stringify(updated));
        // setGuestItems(updated);
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      // ❌ rollback
      setLocalState((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemove = async (productId: number) => {
    setLocalState((prev) => ({ ...prev, [productId]: false }));
    try {
      // 🟢 LOGIN USER
      if (buyer?.id) {
        await removeItem(productId);
      }
      // 🔵 GUEST USER
      else {
        const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = cart.filter((i: any) => i.productid !== productId);

        localStorage.setItem("healthbag", JSON.stringify(updated));
        dispatch(loadLocalHealthBag());
      }
    } catch (err) {
      // ❌ rollback
      setLocalState((prev) => ({ ...prev, [productId]: true }));
    }
  };

  // 👇 onClick function
  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  // 🟢 Merge: cart items (from LS/API) + product details (from all product list)
  // const sourceItems = buyer?.id
  //   ? [...bagItem].sort((a, b) => a.productid - b.productid)
  //   : guestItems;

  const sourceItems = bagItem;

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
    // No price means not for sale: never invent one (it used to be 275).
    const mrp = Number.isFinite(rawMrp) && rawMrp > 0 ? rawMrp : 0;

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
      prescription_required: item.prescription_required || 0,

      qty: Number(item.qty) || 1,
      in_stock: item.in_stock,

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
    // UI update
    setQuantities((prev) => ({
      ...prev,
      [productId]: updated,
    }));

    // Guest
    if (!buyer?.id) {
      updateGuestQuantity(productId, updated);
      return;
    }

    // Logged user
    if (delta === 1) {
      await increaseQty(cartId, productId, updated);
    } else {
      await decreaseQty(cartId, productId, updated);
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
  // 🚚 Delivery fee comes from useDeliveryQuote (above).

  // 🔥 formatted values (NO .00 issue)
  const formattedTotalMrp = formatPrice(totals.totalMrp);
  const formattedTotalDiscount = formatPrice(totals.totalDiscount);
  const formattedGrandTotal = formatPrice(totals.totalPay);

  const grandTotal = Number(totals.totalPay.toFixed(2));

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
    if (!deliverable) {
      toast.error(deliveryQuote?.message || "We can't deliver to this address.");
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
      // Display only (checkout page); the server prices delivery itself.
      delivery_fee: deliveryFee,
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
    const unavailable = mergedItems.filter((i) => i.in_stock === false);
    if (unavailable.length) {
      toast.error(
        `Out of stock, please remove to continue: ${unavailable
          .map((i) => i.name)
          .join(", ")}`
      );
      return;
    }
    if (!billingAddress) {
      toast.error("Please select delivery address!");
      return;
    }
    if (deliveryLoading) {
      toast("Working out the delivery fee… one moment.");
      return;
    }
    if (!deliverable) {
      toast.error(deliveryQuote?.message || "We can't deliver to this address.");
      return;
    }
    const hasRxProduct = mergedItems.some(
      (item) => item.prescription_required === 1
    );
    if (hasRxProduct && !bagPrescriptionId) {
      toast.error("Upload the prescription to continue.");
      document.getElementById("bag-rx")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    checkoutData();
    router.push("/checkout");
  };

  // Prescription upload right in the bag (Figma B2 / B2b state C). It used
  // to be a pop-up after Continue; uploading here attaches it to the bag
  // (healthBag.prescription_id) the same way.
  const [rxUploading, setRxUploading] = useState(false);
  const uploadPrescriptionNow = async (file: File) => {
    if (!buyer?.id) {
      setShowBuyerLogin(true);
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG or PDF files can be uploaded.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("The file is larger than 5 MB.");
      return;
    }
    const token = localStorage.getItem("token") || "";
    setRxUploading(true);
    try {
      const formData = new FormData();
      formData.append("prescription_pic", file);
      await dispatch(uploadPrescriptionFromBuyerCartThunk({ formData, token })).unwrap();
      setPrescriptionFile(file);
      toast.success("Prescription attached");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error || "Upload failed!");
    } finally {
      setRxUploading(false);
    }
  };

  // "Same medicine for less" -> replace the bag line with the equivalent,
  // keeping the quantity. Only after the customer confirms in the row.
  const handleReplace = async (oldId: number, alt: CompareItem, qty: number) => {
    await handleRemove(oldId);
    if (buyer?.id) {
      await addItem({
        id: 0,
        buyer_id: buyer.id,
        product_id: alt.id,
        quantity: qty,
      } as HealthBag);
    } else {
      const cart = JSON.parse(localStorage.getItem("healthbag") || "[]");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rest = cart.filter((i: any) => i.productid !== alt.id);
      rest.push({
        id: 0,
        productid: alt.id,
        qty,
        name: alt.name,
        manufacturer: alt.manufacturer,
        pack_size: alt.pack_size,
        mrp: Number(alt.mrp ?? 0),
        discount: Number(alt.discount ?? 0),
        image: alt.image,
        prescription_required: alt.rx_required ? 1 : 0,
      });
      localStorage.setItem("healthbag", JSON.stringify(rest));
      dispatch(loadLocalHealthBag());
    }
    setQuantities((prev) => ({ ...prev, [alt.id]: qty }));
    toast.success(`Switched to ${alt.name}`);
  };

  const handleSelect = (product: Medicine) => {
    const actualId = product.product_id || product.productid || product.id; // ✅ safe ID fallback

    const path =
      product.category_id === 1
        ? `/medicines-details/${encodeId(actualId)}`
        : `/product-details/${encodeId(actualId)}`;

    router.push(path);
  };

  const handleItemSelect = (item: CartItem) => {
    isSelecting.current = true;
    handleSelect(item);
  };
  const isCartEmpty = mergedItems.length === 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (img: any) => {
    const base = mediaBase?.replace(/\/$/, "") || "";

    // ❌ NULL / EMPTY → local default
    if (!img) {
      return "/images/tnc-default.png";
    }

    // ✅ ARRAY
    if (Array.isArray(img)) {
      const defaultImg = img.find((i) => i.default_image === 1);
      if (defaultImg?.document) {
        return `${base}/${defaultImg.document.replace(/^\//, "")}`;
      }
    }

    // ✅ OBJECT
    if (typeof img === "object" && img.document) {
      return `${base}/${img.document.replace(/^\//, "")}`;
    }

    // ✅ STRING
    if (typeof img === "string") {
      return img.startsWith("http") ? img : `${base}/${img.replace(/^\//, "")}`;
    }

    // 🔥 fallback
    return "/images/tnc-default.png";
  };

  const prescriptionItems = mergedItems.filter(
    (item) => item.prescription_required === 1
  );
  // Why Continue is disabled (shown under the button and in the mobile bar).
  const outOfStockItems = mergedItems.filter((i) => i.in_stock === false);
  const blockReason: string | null = !buyer?.id
    ? null
    : !billingAddress
    ? "Choose a delivery address"
    : deliveryQuote && !deliverable
    ? "Choose an address we can deliver to"
    : outOfStockItems.length
    ? `Remove out-of-stock items: ${outOfStockItems.map((i) => i.name).join(", ")}`
    : prescriptionItems.length > 0 && !bagPrescriptionId
    ? "Upload the prescription to continue"
    : null;

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

      <section className="bf-page">
        <div className="container">
          <CheckoutSteps active={0} />
          {isCartEmpty ? (
            <div className="bf-card text-center p-5">
              <i className="bi bi-bag fs-1 bf-muted" aria-hidden="true" />
              <h1 className="h5 fw-semibold mt-2">Your bag is empty</h1>
              <p className="bf-muted mb-3">Looks like you haven&apos;t added anything yet.</p>
              <button type="button" className="bf-btn" onClick={() => router.push("/")}>
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="bf-title">
                  <h1>Your bag</h1>
                  <span className="bf-muted">
                    {mergedItems.length} {mergedItems.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <DeliverToCard
                  loggedIn={mounted && !!buyer?.id}
                  address={defaultAddress ?? null}
                  quote={deliveryQuote}
                  loading={deliveryLoading}
                  onLogin={() => setShowBuyerLogin(true)}
                />

                <PrescriptionCard
                  rxItemNames={prescriptionItems.map((i) => i.name)}
                  attached={!!bagPrescriptionId}
                  fileName={prescriptionFile?.name ?? null}
                  uploading={rxUploading}
                  loggedIn={mounted && !!buyer?.id}
                  onUpload={uploadPrescriptionNow}
                  onLogin={() => setShowBuyerLogin(true)}
                />

                <section className="bf-card bf-items" aria-label="Items">
                  <h2>Items</h2>
                  {mergedItems.map((item, index) => {
                    const qty = quantities[item.productid] ?? item.qty ?? 1;
                    return (
                      <BagRow
                        key={`${item.productid}-${index}`}
                        item={item}
                        qty={qty}
                        imageUrl={getImageUrl(item.image)}
                        onOpen={() => handleItemSelect(item)}
                        onIncrease={() => handleQuantityChange(item.productid, item.id, +1)}
                        onDecrease={() => handleQuantityChange(item.productid, item.id, -1)}
                        onRemove={() => handleRemove(item.productid)}
                        onReplace={(alt) => handleReplace(item.productid, alt, qty)}
                      />
                    );
                  })}
                </section>
                <button type="button" className="bf-link" onClick={() => router.push("/")}>
                  <i className="bi bi-plus-lg" aria-hidden="true" /> Add more items
                </button>
              </div>

              <div className="col-lg-4">
                <BillSummary
                  totalMrp={totals.totalMrp}
                  totalDiscount={totals.totalDiscount}
                  quote={deliveryQuote}
                  loading={deliveryLoading}
                  loggedIn={mounted && !!buyer?.id}
                  hasAddress={!!billingAddress}
                  toPay={finalPayable}
                  blockReason={blockReason}
                  onContinue={handleContinue}
                  ctaLabel={buyer?.id ? "Continue to payment" : "Log in to continue"}
                />
              </div>
            </div>
          )}
        </div>
        {!isCartEmpty && (
          <StickyPayBar
            amount={finalPayable}
            sub={blockReason && buyer?.id ? blockReason : "View bill above"}
            cta={buyer?.id ? "Continue" : "Log in to continue"}
            onClick={handleContinue}
            disabled={!!blockReason && !!buyer?.id}
          />
        )}
      </section>

      {/* Product Vitamins, Nutrition & Supplements */}
      <section className="py-5">
        <div className="container">
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold">{categoryNamesById[7]}</h5>
              <button
                className="btn-outline"
                onClick={() => router.push(`/all-product/${encodeId(7)}`)}
              >
                View All <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            <div className="row g-3">
              {shuffled7 && shuffled7.length > 0 ? (
                shuffled7.slice(0, 5).map((item, index) => {
                  const mrpRaw = item.MRP ?? item.mrp ?? 0;
                  const parsedMrp = Number(mrpRaw);
                  const baseMrp =
                    Number.isFinite(parsedMrp) && parsedMrp > 0
                      ? parsedMrp
                      : 275;
                  // 🔥 FORMAT FUNCTION
                  const formatPrice = (num: number) => {
                    return Number(num.toFixed(2)).toString();
                  };
                  // 👉 formatted MRP
                  const mrp = Number(baseMrp.toFixed(2));
                  const formattedMrp = formatPrice(mrp);
                  // 👉 discount
                  const discount = parseFloat(item.Discount || "0") || 0;
                  // 👉 discounted price
                  const discountedPriceRaw = mrp - (mrp * discount) / 100;
                  const formattedDiscountedPrice =
                    formatPrice(discountedPriceRaw);

                  const images = item.DefaultImageURL;

                  const defaultImg = Array.isArray(images)
                    ? images.find((img) => img.default_image === 1)
                    : null;

                  const imageUrl = defaultImg?.document
                    ? `${mediaBase}${defaultImg.document}`
                    : "/images/tnc-default.png";

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const isInBag = bagItem.some(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (i: any) => Number(i.product_id) === item.product_id
                  );
                  const showRemove =
                    localState[item.product_id] !== undefined
                      ? localState[item.product_id]
                      : isInBag;

                  return isMobile ? (
                    // 💻 DESKTOP/TABLET → CARD DESIGN (Reusable Component 🔥)
                    <ProductCardUI
                      key={`${item.product_id}-${index}`}
                      inStock={item.in_stock}
                      image={imageUrl}
                      name={item.ProductName}
                      manufacturer={item.Manufacturer}
                      packSize={item.pack_size} // generic nahi h → skip
                      price={formattedDiscountedPrice}
                      mrp={formattedMrp}
                      discount={discount}
                      showRx={false}
                      isInCart={isInBag}
                      loading={processingIds.includes(item.product_id)}
                      onAdd={() => handleAdd(item)}
                      onRemove={() => handleRemove(item.product_id)}
                      onClick={() => handleClick(item.product_id)}
                    />
                  ) : (
                    <div
                      key={item.product_id}
                      className="col-6 col-md-4 col-lg-5th"
                    >
                      <div className="product-card bg-white border rounded p-3 h-100 d-flex flex-column">
                        <div className="product-image-wrapper mb-2">
                          <Image
                            src={imageUrl}
                            alt={""}
                            className="img-fluid mx-auto d-block"
                            style={{
                              cursor: "pointer",
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
                            onClick={() => handleClick(item.product_id)}
                          />
                        </div>

                        <h3
                          className="pd-title hover-link"
                          onClick={() => handleClick(item.product_id)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.ProductName || ""}
                        </h3>
                        <h6 className="pd-title fw-bold">
                          {item.Manufacturer || ""}
                        </h6>

                        <div className="mt-auto">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <div className="fw-semibold">
                                ₹{formattedDiscountedPrice}
                              </div>
                              {formattedDiscountedPrice ? (
                                <div className="text-success small">
                                  {discount}% off
                                </div>
                              ) : null}
                              {formattedDiscountedPrice ? (
                                <small className="text-muted text-decoration-line-through">
                                  MRP ₹{formattedMrp}
                                </small>
                              ) : null}
                            </div>
                            <Button
                              title={(item.in_stock === false && !showRemove) ? "Currently out of stock" : undefined} disabled={(item.in_stock === false && !showRemove)}
                              size="sm"
                              className={`btn-1 btn-HO ${
                                isInBag ? "remove" : "add"
                              } ${(item.in_stock === false && !showRemove) ? "oos" : ""}`}
                              style={{ borderRadius: "35px" }}
                              onClick={() =>
                                showRemove
                                  ? handleRemove(item.product_id)
                                  : handleAdd(item)
                              }
                            >
                              {(item.in_stock === false && !showRemove) ? "OUT OF STOCK" : (showRemove ? "REMOVE" : "ADD")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="d-flex justify-content-center align-items-center">
                  <TncLoader />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Product Healthcare & Medical Supplies */}
      <section className="py-5">
        <div className="container">
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold">{categoryNamesById[5]}</h5>
              <button
                className="btn-outline"
                onClick={() => router.push(`/all-product/${encodeId(7)}`)}
              >
                View All <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            <div className="row g-3">
              {shuffled5 && shuffled5.length > 0 ? (
                shuffled5.slice(0, 5).map((item, index) => {
                  const mrpRaw = item.MRP ?? item.mrp ?? 0;
                  const parsedMrp = Number(mrpRaw);
                  const baseMrp =
                    Number.isFinite(parsedMrp) && parsedMrp > 0
                      ? parsedMrp
                      : 275;
                  // 🔥 FORMAT FUNCTION
                  const formatPrice = (num: number) => {
                    return Number(num.toFixed(2)).toString();
                  };
                  // 👉 formatted MRP
                  const mrp = Number(baseMrp.toFixed(2));
                  const formattedMrp = formatPrice(mrp);
                  // 👉 discount
                  const discount = parseFloat(item.Discount || "0") || 0;
                  // 👉 discounted price
                  const discountedPriceRaw = mrp - (mrp * discount) / 100;
                  const formattedDiscountedPrice =
                    formatPrice(discountedPriceRaw);

                  const images = item.DefaultImageURL;
                  const defaultImg = Array.isArray(images)
                    ? images.find((img) => img.default_image === 1)
                    : null;
                  const imageUrl = defaultImg?.document
                    ? `${mediaBase}${defaultImg.document}`
                    : "/images/tnc-default.png";

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const isInBag = bagItem.some(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (i: any) => Number(i.product_id) === item.product_id
                  );
                  const showRemove =
                    localState[item.product_id] !== undefined
                      ? localState[item.product_id]
                      : isInBag;
                  return isMobile ? (
                    // 💻 DESKTOP/TABLET → CARD DESIGN (Reusable Component 🔥)
                    <ProductCardUI
                      key={`${item.product_id}-${index}`}
                      inStock={item.in_stock}
                      image={imageUrl}
                      name={item.ProductName}
                      manufacturer={item.Manufacturer}
                      packSize={item.pack_size} // generic nahi h → skip
                      price={formattedDiscountedPrice}
                      mrp={formattedMrp}
                      discount={discount}
                      showRx={false}
                      isInCart={isInBag}
                      loading={processingIds.includes(item.product_id)}
                      onAdd={() => handleAdd(item)}
                      onRemove={() => handleRemove(item.product_id)}
                      onClick={() => handleClick(item.product_id)}
                    />
                  ) : (
                    <div
                      key={item.product_id}
                      className="col-6 col-md-4 col-lg-5th"
                    >
                      <div className="product-card bg-white border rounded p-3 h-100 d-flex flex-column">
                        <div className="product-image-wrapper mb-2">
                          <Image
                            src={imageUrl}
                            alt={""}
                            className="img-fluid mx-auto d-block"
                            style={{
                              cursor: "pointer",
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
                            onClick={() => handleClick(item.product_id)}
                          />
                        </div>

                        <h3
                          className="pd-title hover-link"
                          onClick={() => handleClick(item.product_id)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.ProductName || ""}
                        </h3>
                        <h6 className="pd-title fw-bold">
                          {item.Manufacturer || ""}
                        </h6>

                        <div className="mt-auto">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <div className="fw-semibold">
                                ₹{formattedDiscountedPrice}
                              </div>
                              {formattedDiscountedPrice ? (
                                <div className="text-success small">
                                  {discount}% off
                                </div>
                              ) : null}
                              {formattedDiscountedPrice ? (
                                <small className="text-muted text-decoration-line-through">
                                  MRP ₹{formattedMrp}
                                </small>
                              ) : null}
                            </div>
                            <Button
                              title={(item.in_stock === false && !showRemove) ? "Currently out of stock" : undefined} disabled={(item.in_stock === false && !showRemove)}
                              size="sm"
                              className={`btn-1 btn-HO ${
                                isInBag ? "remove" : "add"
                              } ${(item.in_stock === false && !showRemove) ? "oos" : ""}`}
                              style={{ borderRadius: "35px" }}
                              onClick={() =>
                                showRemove
                                  ? handleRemove(item.product_id)
                                  : handleAdd(item)
                              }
                            >
                              {(item.in_stock === false && !showRemove) ? "OUT OF STOCK" : (showRemove ? "REMOVE" : "ADD")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="d-flex justify-content-center align-items-center">
                  <TncLoader />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Product Ayurveda & Herbal */}
      <section className="py-5">
        <div className="container">
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold">{categoryNamesById[9]}</h5>
              <button
                className="btn-outline"
                onClick={() => router.push(`/all-product/${encodeId(7)}`)}
              >
                View All <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            <div className="row g-3">
              {shuffled9 && shuffled9.length > 0 ? (
                shuffled9.slice(0, 5).map((item, index) => {
                  const mrpRaw = item.MRP ?? item.mrp ?? 0;
                  const parsedMrp = Number(mrpRaw);
                  const baseMrp =
                    Number.isFinite(parsedMrp) && parsedMrp > 0
                      ? parsedMrp
                      : 275;
                  // 🔥 FORMAT FUNCTION
                  const formatPrice = (num: number) => {
                    return Number(num.toFixed(2)).toString();
                  };
                  // 👉 formatted MRP
                  const mrp = Number(baseMrp.toFixed(2));
                  const formattedMrp = formatPrice(mrp);
                  // 👉 discount
                  const discount = parseFloat(item.Discount || "0") || 0;
                  // 👉 discounted price
                  const discountedPriceRaw = mrp - (mrp * discount) / 100;
                  const formattedDiscountedPrice =
                    formatPrice(discountedPriceRaw);

                  const images = item.DefaultImageURL;
                  const defaultImg = Array.isArray(images)
                    ? images.find((img) => img.default_image === 1)
                    : null;
                  const imageUrl = defaultImg?.document
                    ? `${mediaBase}${defaultImg.document}`
                    : "/images/tnc-default.png";

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const isInBag = bagItem.some(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (i: any) => Number(i.product_id) === item.product_id
                  );
                  const showRemove =
                    localState[item.product_id] !== undefined
                      ? localState[item.product_id]
                      : isInBag;

                  return isMobile ? (
                    // 💻 DESKTOP/TABLET → CARD DESIGN (Reusable Component 🔥)
                    <ProductCardUI
                      key={`${item.product_id}-${index}`}
                      inStock={item.in_stock}
                      image={imageUrl}
                      name={item.ProductName}
                      manufacturer={item.Manufacturer}
                      packSize={item.pack_size} // generic nahi h → skip
                      price={formattedDiscountedPrice}
                      mrp={formattedMrp}
                      discount={discount}
                      showRx={false}
                      isInCart={isInBag}
                      loading={processingIds.includes(item.product_id)}
                      onAdd={() => handleAdd(item)}
                      onRemove={() => handleRemove(item.product_id)}
                      onClick={() => handleClick(item.product_id)}
                    />
                  ) : (
                    <div
                      key={item.product_id}
                      className="col-6 col-md-4 col-lg-5th"
                    >
                      <div className="product-card bg-white border rounded p-3 h-100 d-flex flex-column">
                        <div className="product-image-wrapper mb-2">
                          <Image
                            src={imageUrl}
                            alt={""}
                            className="img-fluid mx-auto d-block"
                            style={{
                              cursor: "pointer",
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
                            onClick={() => handleClick(item.product_id)}
                          />
                        </div>

                        <h3
                          className="pd-title hover-link"
                          onClick={() => handleClick(item.product_id)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.ProductName || ""}
                        </h3>
                        <h6 className="pd-title fw-bold">
                          {item.Manufacturer || ""}
                        </h6>

                        <div className="mt-auto">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <div className="fw-semibold">
                                ₹{formattedDiscountedPrice}
                              </div>
                              {formattedDiscountedPrice ? (
                                <div className="text-success small">
                                  {discount}% off
                                </div>
                              ) : null}
                              {formattedDiscountedPrice ? (
                                <small className="text-muted text-decoration-line-through">
                                  MRP ₹{formattedMrp}
                                </small>
                              ) : null}
                            </div>
                            <Button
                              title={(item.in_stock === false && !showRemove) ? "Currently out of stock" : undefined} disabled={(item.in_stock === false && !showRemove)}
                              size="sm"
                              className={`btn-1 btn-HO ${
                                isInBag ? "remove" : "add"
                              } ${(item.in_stock === false && !showRemove) ? "oos" : ""}`}
                              style={{ borderRadius: "35px" }}
                              onClick={() =>
                                showRemove
                                  ? handleRemove(item.product_id)
                                  : handleAdd(item)
                              }
                            >
                              {(item.in_stock === false && !showRemove) ? "OUT OF STOCK" : (showRemove ? "REMOVE" : "ADD")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="d-flex justify-content-center align-items-center">
                  <TncLoader />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <BuyerLoginModal
        show={showBuyerLogin}
        handleClose={() => setShowBuyerLogin(false)}
      />
      <Footer />
    </>
  );
}
