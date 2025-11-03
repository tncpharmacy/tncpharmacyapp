"use client";

import React, { useEffect, useState } from "react";
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
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

type CartItem = {
  name: string;
  pack: string;
  img: string;
  price: number;
  mrp: number;
  discount: number;
};

type Product = {
  name: string;
  img: string;
  price: number;
  mrp?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
};

export default function HealthBags() {
  const [quantities, setQuantities] = useState<number[]>([1, 1]);
  const [dose, setDose] = useState("");
  // --- Local states for instant UI ---
  const [localBag, setLocalBag] = useState<number[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const dispatch = useAppDispatch();
  const router = useRouter();
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
    if (bagItem?.length) {
      setLocalBag(bagItem.map((i) => i.productid)); // ✅ correct key
    } else {
      setLocalBag([]);
    }
  }, [bagItem]);

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id, mergeGuestCart]);

  useEffect(() => {
    fetchCart(); // ensures cart is synced after any add/remove
  }, [fetchCart]);

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

  const handleQuantityChange = (index: number, delta: number) =>
    setQuantities((prev) =>
      prev.map((q, i) => (i === index ? Math.max(1, q + delta) : q))
    );

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
      manufacturer: product?.Manufacturer || "",
      pack_size: product?.pack_size || "",
      mrp,
      discount,
      discountMrp,
      image:
        product?.DefaultImageURL && product.DefaultImageURL !== ""
          ? product.DefaultImageURL.startsWith("http")
            ? product.DefaultImageURL
            : `${mediaBase}${product.DefaultImageURL}`
          : "/images/tnc-default.png",
    };
  });

  const handlingCharges = 12;
  // const totalDiscount = items.reduce(
  //   (acc, it, i) => acc + (it.MRP - it.MRP) * quantities[i],
  //   0
  // );
  // const itemTotal = items.reduce(
  //   (acc, it, i) => acc + it.price * quantities[i],
  //   0
  // );
  // const toBePaid = itemTotal + handlingCharges;

  return (
    <>
      <SiteHeader />

      <section className="py-4 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Left: Items List */}
            <div className="col-lg-8">
              <h5 className="mb-3 fw-semibold">2 items added</h5>
              <p className="text-muted small mb-4">
                Items not requiring prescription
              </p>

              <div className="border rounded p-3 mb-3 bg-white">
                {mergedItems.length > 0 ? (
                  mergedItems.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-start border-bottom pb-3 mb-3"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="me-3 rounded"
                        style={{ width: 90, height: 90, objectFit: "contain" }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-semibold mb-1">{item.name}</h6>
                        <p
                          className="mb-1 fw-semibold  small"
                          style={{ fontSize: "13px" }}
                        >
                          {item.manufacturer}
                        </p>
                        <p
                          className="mb-1 fw-semibold  small"
                          style={{ fontSize: "14px" }}
                        >
                          {item.pack_size}
                        </p>
                        <div className="row">
                          <DoseInstructionSelect
                            type="select"
                            label="Doses"
                            name="dose"
                            value={dose}
                            onChange={(e) => setDose(e.target.value)}
                            colSm={4}
                            required
                          />
                        </div>
                        <button
                          className="text-danger small border-0 bg-transparent p-0"
                          onClick={() => handleRemove(item.productid)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="text-end ms-3">
                        <h6 className="mb-1 text-danger">
                          ₹{item.discountMrp.toLocaleString()} <br />
                          <span className="text-success small">
                            {item.discount}% off
                          </span>
                          <br />
                          <small className="text-muted text-decoration-line-through">
                            ₹{(item.mrp ?? 0).toLocaleString()}
                          </small>{" "}
                        </h6>

                        <div className="d-inline-flex align-items-center border rounded px-2 py-1">
                          <Button
                            variant="link"
                            className="p-0 text-dark fw-bold"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            <i className="bi bi-dash-lg"></i>
                          </Button>
                          <span className="mx-2">{quantities[index]}</span>
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
                  {/* <span>₹{items.reduce((s, it) => s + it.mrp, 0)}</span> */}
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Handling charges</span>
                  <span>₹{handlingCharges}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Total discount</span>
                  {/* <span className="text-success">-₹{totalDiscount}</span> */}
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Shipping fee</span>
                  <span className="text-muted">As per delivery address</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-3 fw-semibold">
                  <span>To be paid</span>
                  {/* <span>₹{toBePaid}</span> */}
                </div>

                <div className="mb-3 small">
                  <span className="fw-semibold">Delivering to</span>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span>Gurgaon</span>
                    <Link
                      href="/address"
                      className="text-primary text-decoration-none small"
                    >
                      Add Address
                    </Link>
                  </div>
                </div>

                <Button className="w-100 py-2 fw-semibold continue-btn">
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
                                  ₹{mrp}
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
                                  ₹{mrp}
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
                                  ₹{mrp}
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
