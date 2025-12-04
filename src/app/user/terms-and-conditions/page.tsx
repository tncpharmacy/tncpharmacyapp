"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";

export default function TermsAndConditions() {
  return (
    <>
      <div className="page-wrapper bg-light">
        <SiteHeader />

        <section className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="card shadow-sm border-0 rounded-3 p-4 p-md-5">
                {/* Heading section */}
                <h2 className="fw-bold text-center mb-4 text-primary">
                  Terms & Conditions
                </h2>
                <hr />

                {/* Terms Content */}
                <div
                  className="terms-content"
                  style={{
                    fontSize: "0.93rem",
                    lineHeight: "1.7",
                    color: "#333",
                  }}
                >
                  <h5 className="fw-semibold mt-4">1. Introduction</h5>
                  <p>
                    Welcome to <strong>Our Platform</strong>. By accessing or
                    using our website, mobile application, or services, you
                    agree to comply with and be bound by the following Terms and
                    Conditions. Please read them carefully before using our
                    services.
                  </p>

                  <h5 className="fw-semibold mt-4">
                    2. Eligibility & Account Responsibility
                  </h5>
                  <p>
                    You must be at least 18 years old to register or make
                    purchases on our platform. You are responsible for
                    maintaining the confidentiality of your login credentials
                    and all activities under your account.
                  </p>

                  <h5 className="fw-semibold mt-4">3. Product Information</h5>
                  <p>
                    We strive to provide accurate product details, pricing, and
                    images. However, minor variations may occur. Prices and
                    product availability are subject to change without prior
                    notice.
                  </p>

                  <h5 className="fw-semibold mt-4">4. Orders & Payments</h5>
                  <p>
                    By placing an order, you authorize us to charge your
                    selected payment method. Orders may be canceled by us in
                    case of stock unavailability, pricing errors, or payment
                    failure. Refunds will be processed as per our{" "}
                    <a href="/refund-policy" className="text-primary">
                      Refund Policy
                    </a>
                    .
                  </p>

                  <h5 className="fw-semibold mt-4">5. Shipping & Delivery</h5>
                  <p>
                    We aim to deliver products within the estimated timelines.
                    Delays may occur due to logistics or unforeseen
                    circumstances. Please refer to our{" "}
                    <a href="/shipping-policy" className="text-primary">
                      Shipping Policy
                    </a>{" "}
                    for more details.
                  </p>

                  <h5 className="fw-semibold mt-4">6. Returns & Refunds</h5>
                  <p>
                    If you receive a damaged or incorrect product, please raise
                    a return request within the specified time. Returns are
                    accepted as per our{" "}
                    <a href="/return-policy" className="text-primary">
                      Return Policy
                    </a>
                    .
                  </p>

                  <h5 className="fw-semibold mt-4">7. Intellectual Property</h5>
                  <p>
                    All logos, content, graphics, and trademarks are the
                    property of their respective owners. Unauthorized use is
                    strictly prohibited.
                  </p>

                  <h5 className="fw-semibold mt-4">
                    8. Limitation of Liability
                  </h5>
                  <p>
                    We shall not be liable for any indirect, incidental, or
                    consequential damages arising out of your use or inability
                    to use our services or products.
                  </p>

                  <h5 className="fw-semibold mt-4">9. Changes to Terms</h5>
                  <p>
                    We reserve the right to update or modify these Terms at any
                    time. Updates will be effective upon posting on this page.
                    Please check periodically for changes.
                  </p>

                  <h5 className="fw-semibold mt-4">10. Contact Us</h5>
                  <p>
                    If you have any questions about these Terms, you can contact
                    our support team at{" "}
                    <a
                      href="mailto: care@tncpharmacy.in"
                      className="text-primary"
                    >
                      care@tncpharmacy.in
                    </a>
                    .
                  </p>

                  <div className="text-center mt-5">
                    <p className="text-secondary small mb-0">
                      © {new Date().getFullYear()} Tnc Pharmacy. All Rights
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
