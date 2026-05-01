// "use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/(user)/components/header/header";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title: "Return Policy",
  description:
    "Read TnC Pharmacy's return policy. Learn about eligibility, non-returnable items, return process, and timelines.",

  alternates: {
    canonical: "https://tncpharmacy.in/return-policy",
  },

  openGraph: {
    title: "Return Policy | TnC Pharmacy",
    description:
      "Understand our return policy for medicines and healthcare products.",
    url: "https://tncpharmacy.in/return-policy",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Return Policy - TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Return Policy | TnC Pharmacy",
    description: "Know how returns work at TnC Pharmacy.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ReturnPolicy() {
  return (
    <div className="page-wrapper">
      {/* <SiteHeader /> */}

      <section className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-12">
            <div className="card shadow-sm border-0 rounded-3 p-4 p-md-5">
              <h2 className="fw-bold text-center mb-4 text-primary">
                Return Policy
              </h2>
              <hr />

              <div className="terms-content" style={{ fontSize: "0.9rem" }}>
                <h5 className="fw-semibold mt-4">1. Eligibility for Returns</h5>
                <p>
                  Products can be returned within 7 days of delivery only if
                  they are unused, unsealed, and in original condition.
                </p>

                <h5 className="fw-semibold mt-4">2. Non-Returnable Items</h5>
                <p>
                  Medicines, baby food, healthcare devices, and hygiene products
                  are not eligible for return due to safety and regulatory
                  reasons.
                </p>

                <h5 className="fw-semibold mt-4">3. Return Process</h5>
                <p>
                  To initiate a return, email us at{" "}
                  <a href="mailto:care@tncpharmacy.in" className="text-primary">
                    care@tncpharmacy.in
                  </a>{" "}
                  with your order details. We will arrange pickup and verify the
                  product condition.
                </p>

                <h5 className="fw-semibold mt-4">4. Refund Timeline</h5>
                <p>
                  Once inspection is completed, refund or replacement will be
                  processed within <strong>5–7 business days</strong>.
                </p>

                <div className="text-center mt-5">
                  <p className="text-secondary small">
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
  );
}
