"use client";

import React, { useEffect, useState } from "react";
import SiteHeader from "@/app/user/components/header/header";
import { Button, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/site-style.css";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useHealthBag } from "@/lib/hooks/useHealthBag";
import { getCategories } from "@/lib/features/categorySlice/categorySlice";
import {
  getMedicinesByCategoryId,
  getMedicinesMenuByOtherId,
} from "@/lib/features/medicineSlice/medicineSlice";
import { encodeId } from "@/lib/utils/encodeDecode";
import Footer from "@/app/user/components/footer/footer";
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

export default function HealthBag() {
  const [quantities, setQuantities] = useState<number[]>([1, 1]);
  const despatch = useAppDispatch();
  const router = useRouter();
  // start for increse header count code
  const buyer = useAppSelector((state) => state.buyer.buyer);
  const {
    items: bagItem,
    addItem,
    removeItem,
    mergeGuestCart,
  } = useHealthBag({
    userId: buyer?.id || null,
  });

  // Merge guest cart into logged-in cart once
  useEffect(() => {
    if (buyer?.id) {
      mergeGuestCart();
    }
  }, [buyer?.id]);

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
  //console.log("medicineMenuByCategory5", medicineMenuByCategory5);
  useEffect(() => {
    despatch(getCategories());
    despatch(getMedicinesByCategoryId(5));
    despatch(getMedicinesByCategoryId(7));
    despatch(getMedicinesByCategoryId(9));
    despatch(getMedicinesMenuByOtherId(0));
  }, [despatch]);

  // 👇 onClick function
  const handleClick = (product_id: number) => {
    router.push(`/product-details/${encodeId(product_id)}`);
  };

  const handleQuantityChange = (index: number, delta: number) =>
    setQuantities((prev) =>
      prev.map((q, i) => (i === index ? Math.max(1, q + delta) : q))
    );

  const items: CartItem[] = [
    {
      name: "Accu-Chek Active Blood Glucometer Kit (Box of 10 Test strips Free) | Blood Glucose Monitors",
      pack: "Packet of 1 kit",
      img: "/images/products/gluco-meter.png",
      price: 921,
      mrp: 1124,
      discount: 18,
    },
    {
      name: "Protinex Diabetes Care Protein Powder with Vitamins | For Strength, Blood Sugar & Weight Management",
      pack: "Box of 400 gm powder",
      img: "/images/products/protinex.png",
      price: 587,
      mrp: 675,
      discount: 13,
    },
  ];

  const handlingCharges = 12;
  const totalDiscount = items.reduce(
    (acc, it, i) => acc + (it.mrp - it.price) * quantities[i],
    0
  );
  const itemTotal = items.reduce(
    (acc, it, i) => acc + it.price * quantities[i],
    0
  );
  const toBePaid = itemTotal + handlingCharges;

  const productSections: { title: string; products: Product[] }[] = [
    {
      title: "Healthcare & Medical Supplies",
      products: [
        {
          name: "Digital Thermometer (Fast Read)",
          img: "/images/products/pd-img-9.jpg",
          price: 299,
          mrp: 399,
          discount: 25,
          rating: 4.6,
          reviews: 47,
        },
        {
          name: "Automatic BP Monitor with Cuff",
          img: "/images/products/pd-img-6.jpg",
          price: 999,
          mrp: 1299,
          discount: 23,
          rating: 4.4,
          reviews: 153,
        },
        {
          name: "Pulse Oximeter (Fingertip)",
          img: "/images/products/pd-img-16.jpg",
          price: 649,
          mrp: 799,
          discount: 18,
          rating: 4.3,
          reviews: 98,
        },
        {
          name: "Accu-Chek Active Blood Glucose Glucometer Kit With Vial Of 10 Strips, 10 Lancets",
          img: "/images/products/pd-img-20.jpg",
          price: 649,
          mrp: 799,
          discount: 18,
          rating: 4.3,
          reviews: 98,
        },
        {
          name: "Digital Thermometer (Fast Read)",
          img: "/images/products/pd-img-9.jpg",
          price: 299,
          mrp: 399,
          discount: 25,
          rating: 4.6,
          reviews: 47,
        },
      ],
    },
    {
      title: "Ayurveda & Herbal",
      products: [
        {
          name: "Dabur Chyawanprash - 1kg",
          img: "/images/products/pd-img-11.jpg",
          price: 475,
          mrp: 599,
          discount: 21,
          rating: 4.5,
          reviews: 312,
        },
        {
          name: "Himalaya Ashwagandha 60 Tablets",
          img: "/images/products/pd-img-13.jpg",
          price: 199,
          mrp: 249,
          discount: 20,
          rating: 4.2,
          reviews: 84,
        },
        {
          name: "Zandu Balm - Pain Relief",
          img: "/images/products/pd-img-19.jpg",
          price: 120,
          mrp: 150,
          discount: 20,
          rating: 4.1,
          reviews: 64,
        },
        {
          name: "Dabur Jamun Neem Karela Juice - 1L | Helps Control Blood Sugar Level & Reduces Bad Cholesterol ",
          img: "/images/products/pd-img-12.jpg",
          price: 150,
          mrp: 250,
          discount: 20,
          rating: 4.1,
          reviews: 64,
        },
        {
          name: "Dabur Chyawanprash - 1kg",
          img: "/images/products/pd-img-11.jpg",
          price: 475,
          mrp: 599,
          discount: 21,
          rating: 4.5,
          reviews: 312,
        },
      ],
    },
    {
      title: "Wellness & Lifestyle",
      products: [
        {
          name: "Whey Protein Shake - 1kg (Chocolate)",
          img: "/images/products/pd-img-4.jpg",
          price: 850,
          mrp: 999,
          discount: 15,
          rating: 4.4,
          reviews: 214,
        },
        {
          name: "Omega-3 Fish Oil 60 Caps",
          img: "/images/products/pd-img-17.jpg",
          price: 699,
          mrp: 799,
          discount: 12,
          rating: 4.3,
          reviews: 132,
        },
        {
          name: "Daily Multivitamin - 60 Tablets",
          img: "/images/products/pd-img-18.jpg",
          price: 499,
          mrp: 599,
          discount: 17,
          rating: 4.2,
          reviews: 73,
        },
        {
          name: "Centrum MultivitaminMineral Supplement for Women 50, India | Ubuy",
          img: "/images/products/pd-img-21.jpg",
          price: 499,
          mrp: 599,
          discount: 17,
          rating: 4.2,
          reviews: 73,
        },
        {
          name: "Cadbury Bournvita - Health Drink, 75 gm Pouch , 200 gm Jar , 500 gm Ja",
          img: "/images/products/pd-img-1.jpg",
          price: 850,
          mrp: 999,
          discount: 15,
          rating: 4.4,
          reviews: 214,
        },
      ],
    },
  ];

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
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start border-bottom pb-3 mb-3"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="me-3 rounded"
                      style={{ width: 90, height: 90, objectFit: "contain" }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="fw-semibold mb-1">{item.name}</h6>
                      <p className="text-muted small mb-1">{item.pack}</p>
                      <a
                        href="#"
                        className="text-danger small text-decoration-none"
                      >
                        Remove
                      </a>
                    </div>

                    <div className="text-end ms-3">
                      <h6 className="mb-1">
                        ₹{item.price.toLocaleString()}{" "}
                        <small className="text-muted text-decoration-line-through">
                          ₹{item.mrp.toLocaleString()}
                        </small>{" "}
                        <span className="text-success small">
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
                ))}
              </div>
            </div>

            {/* Right: Bill Summary */}
            <div className="col-lg-4">
              <div className="border rounded p-3 bg-white sticky-summary">
                <h6 className="fw-semibold mb-3">Bill summary</h6>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Item total (MRP)</span>
                  <span>₹{items.reduce((s, it) => s + it.mrp, 0)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Handling charges</span>
                  <span>₹{handlingCharges}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Total discount</span>
                  <span className="text-success">-₹{totalDiscount}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small">
                  <span>Shipping fee</span>
                  <span className="text-muted">As per delivery address</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-3 fw-semibold">
                  <span>To be paid</span>
                  <span>₹{toBePaid}</span>
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
              {medicineMenuByCategory7 && medicineMenuByCategory7.length > 0 ? (
                [...medicineMenuByCategory7] // copy array
                  .sort(() => Math.random() - 0.5) // shuffle items randomly
                  .slice(0, 5) // sirf 5 items lo
                  .map((item) => {
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
                    const isInBag = bagItem.some(
                      (i) => i.product_id === item.product_id
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
                                className="btn-outline-primary text-white-bold"
                                onClick={() =>
                                  isInBag
                                    ? removeItem(item.product_id)
                                    : addItem({
                                        id: Date.now(),
                                        buyer_id: buyer?.id || 0,
                                        product_id: item.product_id,
                                        quantity: 1,
                                      })
                                }
                              >
                                {isInBag ? "REMOVE" : "ADD"}
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
              {medicineMenuByCategory5 && medicineMenuByCategory5.length > 0 ? (
                [...medicineMenuByCategory5] // copy array
                  .sort(() => Math.random() - 0.5) // shuffle items randomly
                  .slice(0, 5) // sirf 5 items lo
                  .map((item) => {
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
                    const isInBag = bagItem.some(
                      (i) => i.product_id === item.product_id
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
                                className="btn-outline-primary text-white-bold"
                                onClick={() =>
                                  isInBag
                                    ? removeItem(item.product_id)
                                    : addItem({
                                        id: Date.now(),
                                        buyer_id: buyer?.id || 0,
                                        product_id: item.product_id,
                                        quantity: 1,
                                      })
                                }
                              >
                                {isInBag ? "REMOVE" : "ADD"}
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
              {medicineMenuByCategory9 && medicineMenuByCategory9.length > 0 ? (
                [...medicineMenuByCategory9] // copy array
                  .sort(() => Math.random() - 0.5) // shuffle items randomly
                  .slice(0, 5) // sirf 5 items lo
                  .map((item) => {
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
                    const isInBag = bagItem.some(
                      (i) => i.product_id === item.product_id
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
                                className="btn-outline-primary text-white-bold"
                                onClick={() =>
                                  isInBag
                                    ? removeItem(item.product_id)
                                    : addItem({
                                        id: Date.now(),
                                        buyer_id: buyer?.id || 0,
                                        product_id: item.product_id,
                                        quantity: 1,
                                      })
                                }
                              >
                                {isInBag ? "REMOVE" : "ADD"}
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
