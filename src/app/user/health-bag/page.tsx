"use client";

import React, { useEffect, useRef, useState } from "react";
import SiteHeader from "@/app/user/components/header/header";
import { Button, Form, Image } from "react-bootstrap";
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
import Footer from "@/app/user/components/footer/footer";
import { useShuffledOnce } from "@/lib/hooks/useShuffledOnce";
import { HealthBag } from "@/types/healthBag";
import DoseInstructionSelect from "@/app/components/Input/DoseInstructionSelect";
import Input from "@/app/components/Input/InputColSm";
import { getAddress } from "@/lib/features/addressSlice/addressSlice";
import AddressBar from "../components/AddressBar/AddressBar";
import toast from "react-hot-toast";
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
  category_id: number; // Category mapping

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
  prescription_required?: boolean;

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

export default function HealthBags() {
  const [quantities, setQuantities] = useState<number[]>([1, 1]);
  const [dose, setDose] = useState("");
  const [mounted, setMounted] = useState(false);
  const [billingAddress, setBillingAddress] = useState<
    number | null | undefined
  >(null);

  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSelecting = useRef(false);
  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const {
    items: bagItem,
    addItem,
    removeItem,
    mergeGuestCart,
    fetchCart,
  } = useHealthBag({
    userId: buyer?.id || null,
  });

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
    dispatch(getMedicinesByCategoryId(5));
    dispatch(getMedicinesByCategoryId(7));
    dispatch(getMedicinesByCategoryId(9));
    dispatch(getMedicinesMenuByOtherId(0));
    dispatch(getProductList());
  }, [dispatch]);

  // --- Sync localBag with Redux items ---
  useEffect(() => {
    const newLocalBag = bagItem?.length ? bagItem.map((i) => i.productid) : [];

    // ✅ Prevent infinite loop — only update if changed
    if (JSON.stringify(newLocalBag) !== JSON.stringify(localBag)) {
      setLocalBag(newLocalBag);
    }
  }, [bagItem, localBag]);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  useEffect(() => {
    fetchCart(); // ensures cart is synced after any add/remove
  }, [fetchCart]);

  //Sync quantities from cart API
  useEffect(() => {
    if (bagItem && bagItem.length > 0) {
      const apiQuantities = bagItem.map((item) => item.qty ?? 1);
      setQuantities(apiQuantities);
    }
  }, [bagItem]);

  // --- Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAdd = async (item: any) => {
    setLocalBag((prev) => [...prev, item.product_id]);
    setProcessingIds((prev) => [...prev, item.product_id]);
    try {
      await addItem({
        id: 0,
        buyer_id: buyer?.id || 0,
        product_id: item.product_id,
        quantity: 1,
      } as HealthBag);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== item.product_id));
    }
  };

  const handleRemove = async (productId: number) => {
    setLocalBag((prev) => prev.filter((id) => id !== productId));
    setProcessingIds((prev) => [...prev, productId]);
    try {
      await removeItem(productId);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  // 👇 onClick function
  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  const handleQuantityChange = async (index: number, delta: number) => {
    const newQuantities = quantities.map((q, i) =>
      i === index ? Math.max(1, q + delta) : q
    );
    setQuantities(newQuantities);

    const item = bagItem[index];
    if (item) {
      await addItem({
        ...item,
        quantity: newQuantities[index],
      });
    }
  };

  // 🟢 Merge: cart items (from LS/API) + product details (from all product list)
  const mergedItems = (bagItem || []).map((cartItem) => {
    const product = productList.find(
      (p) => p.id === cartItem.productid || p.product_id === cartItem.productid
    );

    const mrp =
      product?.MRP !== undefined
        ? typeof product.MRP === "string"
          ? parseFloat(product.MRP)
          : product.MRP
        : 0;

    const discount =
      product?.discount !== undefined
        ? typeof product.discount === "string"
          ? parseFloat(product.discount)
          : product.discount
        : 0;

    const discountMrp = mrp ? mrp - (mrp * discount) / 100 : 0;

    return {
      ...cartItem,
      name: product?.medicine_name || cartItem.productname || "",
      category_id: product?.category_id || 0,
      manufacturer: product?.Manufacturer || "",
      pack_size: product?.pack_size || "",
      mrp,
      discount,
      discountMrp,
      image:
        product?.primary_image && product.primary_image.document
          ? `${mediaBase}${product.primary_image.document.replace(
              /^https?:\/\/68\.183\.174\.17/,
              ""
            )}`
          : "/images/tnc-default.png",
    };
  });

  // ✅ Calculate totals
  const handlingCharges = 12;
  const totals = mergedItems.reduce(
    (acc, item, index) => {
      const qty = quantities[index] ?? 1;

      acc.totalMrp += (item.mrp ?? 0) * qty;
      acc.totalDiscount += ((item.mrp ?? 0) - item.discountMrp) * qty;
      acc.totalPay += item.discountMrp * qty;

      return acc;
    },
    { totalMrp: 0, totalDiscount: 0, totalPay: 0 }
  );

  const grandTotal = totals.totalPay + handlingCharges;

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
      quantity: quantities[index] ?? 1,
      mrp: item.mrp,
      discount: item.discount,
      rate: item.discountMrp,
      doses: "", // optional: tu baad me dose field add karega
      instruction: "", // optional
      status: "1",
    }));

    const checkoutPayload = {
      payment_mode: 1, // default UPI/manual
      payment_status: "1",
      amount: grandTotal,
      order_type: 1, // pharmacy
      pharmacy_id: 1, // static for now
      address_id: billingAddress,
      status: "1",
      products,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutPayload));
    //toast.success("Checkout data saved!");
  };

  const handleContinue = () => {
    if (!buyer?.id) {
      toast.error("Please login to continue with your order!");
      return;
    }

    checkoutData(); // ✅ Save checkout info in LS
    router.push("/checkout"); // Go to checkout page
  };

  const handleSelect = (product: Medicine) => {
    const actualId = product.product_id || product.productid || product.id; // ✅ safe ID fallback

    const path =
      product.category_id === 1
        ? `/medicines-details/${encodeId(actualId)}`
        : `/product-details/${encodeId(actualId)}`;

    router.push(path);
  };

  const handleItemSelect = (item: Medicine) => {
    isSelecting.current = true;
    handleSelect(item);
  };
  return (
    <>
      <SiteHeader />

      <section className="py-4 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Left: Items List */}
            <div className="col-lg-8">
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
              <h5 className="mb-3 fw-semibold">
                {mergedItems.length} items added
              </h5>
              <div className="border rounded p-3 mb-3 bg-white">
                {mergedItems.length > 0 ? (
                  mergedItems.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-start border-bottom pb-3 mb-3"
                    >
                      <span
                        onClick={() => handleItemSelect(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <Image
                          src={`${item.image}`}
                          alt={item.name}
                          className="me-3 rounded"
                          style={{
                            width: 90,
                            height: 90,
                            objectFit: "contain",
                          }}
                        />
                      </span>
                      <div className="flex-grow-1">
                        <h6 className="fw-semibold mb-1">{item.name}</h6>
                        <p
                          className="mb-1 fw-semibold  small"
                          style={{ fontSize: "14px" }}
                        >
                          {item.pack_size}
                        </p>
                        <p
                          className="mb-1 fw-semibold text-success small"
                          style={{
                            fontSize: "13px",
                          }}
                        >
                          {item.manufacturer}
                        </p>

                        {/* <div className="row">
                          <DoseInstructionSelect
                            type="select"
                            label="Doses"
                            name="dose"
                            value={dose}
                            onChange={(e) => setDose(e.target.value)}
                            colSm={4}
                            required
                          />
                        </div> */}
                        <button
                          className="text-danger small border-0 bg-transparent p-0"
                          onClick={() => handleRemove(item.productid)}
                        >
                          <i
                            className="bi bi-trash text-danger"
                            style={{ fontSize: "16px" }}
                          ></i>
                        </button>
                      </div>

                      <div className="text-end ms-3">
                        <h6 className="mb-2 text-success">
                          ₹{item.discountMrp.toLocaleString()}{" "}
                          <small className="text-muted text-decoration-line-through">
                            MRP ₹{(item.mrp ?? 0).toLocaleString()}
                          </small>
                          <br />
                          <span className="text-danger small">
                            {item.discount}% off
                          </span>
                        </h6>

                        <div className="d-inline-flex align-items-center border rounded px-2 py-1">
                          <Button
                            variant="link"
                            className="p-0 text-dark fw-bold"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            <i className="bi bi-dash-lg"></i>
                          </Button>
                          <span className="mx-2">{quantities}</span>
                          <Button
                            variant="link"
                            className="p-0 text-dark fw-bold"
                            onClick={() => handleQuantityChange(index, +1)}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center my-3">
                    No items in your cart
                  </p>
                )}
              </div>
            </div>

            {/* Right: Bill Summary */}
            <div className="col-lg-4">
              <div className="border rounded p-3 bg-white sticky-summary">
                <h6 className="fw-semibold mb-3">Bill summary</h6>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Item total (MRP)</span>
                  <span>₹{totals.totalMrp.toLocaleString()}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Handling charges</span>
                  <span>₹{handlingCharges}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Total discount</span>
                  <span className="text-success">
                    -₹{totals.totalDiscount.toLocaleString()}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Shipping fee</span>
                  <span className="text-muted">As per delivery address</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-3 fw-semibold">
                  <span>To be paid</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>

                <Button
                  className="w-100 py-2 fw-semibold continue-btn"
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
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
                shuffled7.slice(0, 5).map((item) => {
                  const mrp = item.MRP
                    ? parseFloat(item.MRP.toString())
                    : Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

                  const discount = parseFloat(item.Discount) || 0;
                  const discountedPrice = Math.round(
                    mrp - (mrp * discount) / 100
                  );

                  const imageUrl = item.DefaultImageURL
                    ? item.DefaultImageURL.startsWith("http")
                      ? item.DefaultImageURL
                      : `${mediaBase}${item.DefaultImageURL}`
                    : "/images/tnc-default.png";
                  const isInBag =
                    localBag.includes(item.product_id) ||
                    bagItem.some(
                      (i) =>
                        i.productid === item.product_id || // backend data
                        i.product_id === item.product_id // guest/local data
                    );

                  return (
                    <div
                      key={item.product_id}
                      className="col-6 col-md-4 col-lg-5th"
                    >
                      <div className="product-card bg-white border rounded p-3 h-100 d-flex flex-column">
                        <div className="product-image-wrapper mb-2">
                          <Image
                            src={imageUrl}
                            alt={item.ProductName}
                            className="img-fluid mx-auto d-block"
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
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
                                ₹{discountedPrice}
                              </div>
                              {discountedPrice ? (
                                <div className="text-success small">
                                  {discount}% off
                                </div>
                              ) : null}
                              {discountedPrice ? (
                                <small className="text-muted text-decoration-line-through">
                                  MRP ₹{mrp}
                                </small>
                              ) : null}
                            </div>
                            <Button
                              size="sm"
                              className={`btn-1 btn-HO ${
                                isInBag ? "remove" : "add"
                              }`}
                              style={{ borderRadius: "35px" }}
                              disabled={processingIds.includes(item.product_id)}
                              onClick={() =>
                                isInBag
                                  ? handleRemove(item.product_id)
                                  : handleAdd(item)
                              }
                            >
                              {processingIds.includes(item.product_id)
                                ? "Processing..."
                                : isInBag
                                ? "REMOVE"
                                : "ADD"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Loading medicines...</p>
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
                shuffled5.slice(0, 5).map((item) => {
                  const mrp = item.MRP
                    ? parseFloat(item.MRP.toString())
                    : Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

                  const discount = parseFloat(item.Discount) || 0;
                  const discountedPrice = Math.round(
                    mrp - (mrp * discount) / 100
                  );

                  const imageUrl = item.DefaultImageURL
                    ? item.DefaultImageURL.startsWith("http")
                      ? item.DefaultImageURL
                      : `${mediaBase}${item.DefaultImageURL}`
                    : "/images/tnc-default.png";
                  const isInBag =
                    localBag.includes(item.product_id) ||
                    bagItem.some(
                      (i) =>
                        i.productid === item.product_id || // backend data
                        i.product_id === item.product_id // guest/local data
                    );
                  return (
                    <div
                      key={item.product_id}
                      className="col-6 col-md-4 col-lg-5th"
                    >
                      <div className="product-card bg-white border rounded p-3 h-100 d-flex flex-column">
                        <div className="product-image-wrapper mb-2">
                          <Image
                            src={imageUrl}
                            alt={item.ProductName}
                            className="img-fluid mx-auto d-block"
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
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
                                ₹{discountedPrice}
                              </div>
                              {discountedPrice ? (
                                <div className="text-success small">
                                  {discount}% off
                                </div>
                              ) : null}
                              {discountedPrice ? (
                                <small className="text-muted text-decoration-line-through">
                                  MRP ₹{mrp}
                                </small>
                              ) : null}
                            </div>
                            <Button
                              size="sm"
                              className={`btn-1 btn-HO ${
                                isInBag ? "remove" : "add"
                              }`}
                              style={{ borderRadius: "35px" }}
                              disabled={processingIds.includes(item.product_id)}
                              onClick={() =>
                                isInBag
                                  ? handleRemove(item.product_id)
                                  : handleAdd(item)
                              }
                            >
                              {processingIds.includes(item.product_id)
                                ? "Processing..."
                                : isInBag
                                ? "REMOVE"
                                : "ADD"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Loading medicines...</p>
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
                shuffled9.slice(0, 5).map((item) => {
                  const mrp = item.MRP
                    ? parseFloat(item.MRP.toString())
                    : Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

                  const discount = parseFloat(item.Discount) || 0;
                  const discountedPrice = Math.round(
                    mrp - (mrp * discount) / 100
                  );

                  const imageUrl = item.DefaultImageURL
                    ? item.DefaultImageURL.startsWith("http")
                      ? item.DefaultImageURL
                      : `${mediaBase}${item.DefaultImageURL}`
                    : "/images/tnc-default.png";
                  const isInBag =
                    localBag.includes(item.product_id) ||
                    bagItem.some(
                      (i) =>
                        i.productid === item.product_id || // backend data
                        i.product_id === item.product_id // guest/local data
                    );

                  return (
                    <div
                      key={item.product_id}
                      className="col-6 col-md-4 col-lg-5th"
                    >
                      <div className="product-card bg-white border rounded p-3 h-100 d-flex flex-column">
                        <div className="product-image-wrapper mb-2">
                          <Image
                            src={imageUrl}
                            alt={item.ProductName}
                            className="img-fluid mx-auto d-block"
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              opacity:
                                imageUrl === "/images/tnc-default.png"
                                  ? 0.3
                                  : 1, // ✅ only default image faded
                            }}
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
                                ₹{discountedPrice}
                              </div>
                              {discountedPrice ? (
                                <div className="text-success small">
                                  {discount}% off
                                </div>
                              ) : null}
                              {discountedPrice ? (
                                <small className="text-muted text-decoration-line-through">
                                  MRP ₹{mrp}
                                </small>
                              ) : null}
                            </div>
                            <Button
                              size="sm"
                              className={`btn-1 btn-HO ${
                                isInBag ? "remove" : "add"
                              }`}
                              style={{ borderRadius: "35px" }}
                              disabled={processingIds.includes(item.product_id)}
                              onClick={() =>
                                isInBag
                                  ? handleRemove(item.product_id)
                                  : handleAdd(item)
                              }
                            >
                              {processingIds.includes(item.product_id)
                                ? "Processing..."
                                : isInBag
                                ? "REMOVE"
                                : "ADD"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Loading medicines...</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
