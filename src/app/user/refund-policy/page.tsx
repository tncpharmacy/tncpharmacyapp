"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";

export default function RefundPolicy() {
  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <section className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="card shadow-sm border-0 rounded-3 p-4 p-md-5">
                <h2 className="fw-bold text-center mb-4 text-primary">
                  Refund Policy
                </h2>
                <hr />

                <div
                  style={{
                    fontSize: "0.93rem",
                    lineHeight: "1.7",
                    color: "#333",
                  }}
                >
                  <div className="terms-content" style={{ fontSize: "0.9rem" }}>
                    <h5 className="fw-semibold mt-4">1. Refund Eligibility</h5>
                    <p>
                      Refunds are applicable only if the product is damaged,
                      defective, or incorrect. The request must be made within{" "}
                      <strong>7 days</strong> of receiving the order.
                    </p>

                    <h5 className="fw-semibold mt-4">
                      2. Non-Refundable Items
                    </h5>
                    <ul>
                      <li>Opened or used products.</li>
                      <li>Items without original packaging.</li>
                      <li>Health or hygiene-related products.</li>
                    </ul>

                    <h5 className="fw-semibold mt-4">3. Refund Method</h5>
                    <p>
                      Approved refunds will be credited to your original payment
                      method within <strong>5–7 business days</strong>. In some
                      cases, processing time may vary depending on your bank or
                      payment provider.
                    </p>

                    <h5 className="fw-semibold mt-4">4. Contact for Refunds</h5>
                    <p>
                      For refund-related concerns, email us at{" "}
                      <a
                        href="mailto: support@tncpharmacy.in"
                        className="text-primary"
                      >
                        support@tncpharmacy.in
                      </a>
                      .
                    </p>

                    <div className="text-center mt-5">
                      <p className="text-secondary small mb-0">
                        © {new Date().getFullYear()} TnC Pharmacy. All Rights
                        Rights Reserved.
                      </p>
                    </div>
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
