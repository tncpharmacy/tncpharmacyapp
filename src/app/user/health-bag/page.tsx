"use client";

import React, { useState } from "react";
import SiteHeader from "@/app/user/components/header/header";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/site-style.css";
import Link from "next/link";

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

      {/* Product suggestion section with big images and correct content */}
      <section className="py-5">
        <div className="container">
          {productSections.map((section, idx) => (
            <div key={idx} className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold">{section.title}</h5>
                <a href="#" className="text-primary small text-decoration-none">
                  View all
                </a>
              </div>

              <div className="row g-3">
                {section.products.map((p, i) => (
                  <div key={i} className="col-6 col-md-4 col-lg-5th">
                    <div className="product-card bg-white border rounded p-3 h-100 d-flex flex-column">
                      <div className="product-image-wrapper mb-2">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="img-fluid mx-auto d-block"
                        />
                      </div>

                      <h6 className="product-title small mb-1">{p.name}</h6>

                      <div className="rating small text-muted mb-1">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <i
                            key={sIdx}
                            className={`bi bi-star-fill ${
                              sIdx < Math.round(p.rating ?? 4)
                                ? "text-warning"
                                : "text-muted"
                            }`}
                          />
                        ))}
                        <span className="ms-2">({p.reviews ?? 0})</span>
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <div className="fw-semibold">₹{p.price}</div>
                            {p.mrp ? (
                              <small className="text-muted text-decoration-line-through">
                                ₹{p.mrp}
                              </small>
                            ) : null}
                            {p.discount ? (
                              <div className="text-success small">
                                {p.discount}% off
                              </div>
                            ) : null}
                          </div>
                          <Button
                            size="sm"
                            className="btn-outline-primary text-white-bold"
                          >
                            Add To Bag
                          </Button>
                        </div>
                        <div className="small text-muted mt-2">
                          Get by Tomorrow
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
