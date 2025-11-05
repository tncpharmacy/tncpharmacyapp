"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";

export default function ShippingPolicy() {
  return (
    <>
      <div className="page-wrapper bg-light">
        <SiteHeader />

        <section className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="card shadow-sm border-0 rounded-3 p-4 p-md-5">
                <h2 className="fw-bold text-center mb-4 text-primary">
                  Shipping Policy
                </h2>
                <hr />

                <div
                  style={{
                    fontSize: "0.93rem",
                    lineHeight: "1.7",
                    color: "#333",
                  }}
                >
                  <h5 className="fw-semibold mt-4">1. Delivery Coverage</h5>
                  <p>
                    We deliver across major cities and towns in India. Some
                    remote areas may not be serviceable due to logistic
                    limitations.
                  </p>

                  <h5 className="fw-semibold mt-4">
                    2. Estimated Delivery Time
                  </h5>
                  <p>
                    Orders are typically shipped within{" "}
                    <strong>1–2 business days</strong>
                    and delivered within <strong>3–7 business days</strong>{" "}
                    depending on your location.
                  </p>

                  <h5 className="fw-semibold mt-4">3. Shipping Charges</h5>
                  <p>
                    We offer free shipping on orders above ₹499. Orders below
                    that may incur a nominal delivery charge.
                  </p>

                  <h5 className="fw-semibold mt-4">4. Order Tracking</h5>
                  <p>
                    Once your order is shipped, a tracking link will be shared
                    via email or SMS for real-time updates.
                  </p>

                  <div className="text-center mt-5">
                    <p className="text-secondary small mb-0">
                      © {new Date().getFullYear()} TnC Pharmacy. All Rights
                      Reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
