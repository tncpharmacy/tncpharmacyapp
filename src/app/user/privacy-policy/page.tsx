"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="page-wrapper bg-light">
        <SiteHeader />

        <section className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="card shadow-sm border-0 rounded-3 p-4 p-md-5">
                <h2 className="fw-bold text-center mb-4 text-primary">
                  Privacy Policy
                </h2>
                <hr />

                <div
                  style={{
                    fontSize: "0.93rem",
                    lineHeight: "1.7",
                    color: "#333",
                  }}
                >
                  <h5 className="fw-semibold mt-4">1. Data Collection</h5>
                  <p>
                    We collect personal information like name, email, contact
                    number, and address for order processing and communication.
                  </p>

                  <h5 className="fw-semibold mt-4">2. Data Usage</h5>
                  <p>
                    The collected data helps us deliver orders, improve
                    services, and provide personalized offers.
                  </p>

                  <h5 className="fw-semibold mt-4">3. Data Protection</h5>
                  <p>
                    We use advanced encryption and secure servers to protect
                    your information. We never share data without consent.
                  </p>

                  <h5 className="fw-semibold mt-4">4. Third-Party Links</h5>
                  <p>
                    Our site may contain links to external websites. We are not
                    responsible for their privacy practices.
                  </p>

                  <h5 className="fw-semibold mt-4">5. Contact</h5>
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
