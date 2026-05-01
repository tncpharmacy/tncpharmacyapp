// "use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title: "Shipping & Delivery Policy | TnC Pharmacy -- Free & Fast Delivery",
  description:
    "TnC Pharmacy delivers across India. Same-day delivery in Noida NCR. Free shipping on qualifying orders. Track your medicine delivery in real-time.",

  alternates: {
    canonical: "/shipping-policy",
  },

  openGraph: {
    title: "Shipping Policy | TnC Pharmacy",
    description:
      "Delivery timelines, shipping charges, coverage, tracking, and packaging details at TnC Pharmacy.",
    url: "https://tncpharmacy.in/shipping-policy",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shipping Policy TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Shipping Policy | TnC Pharmacy",
    description:
      "Know delivery timelines, shipping charges, and tracking details.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ShippingPolicy() {
  return (
    <>
      <div className="page-wrapper bg-light">
        <section className="container my-5">
          <div className="col-lg-10 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
            <h1 className="fw-bold text-primary mb-4">Shipping Policy</h1>

            <p>
              <strong>Effective Date:</strong> May 2026
            </p>

            <h5 className="fw-bold mt-4">Delivery Coverage</h5>
            <p>
              TnC Pharmacy delivers across India. We currently serve all major
              cities and towns. Delivery availability to your specific location
              can be checked by entering your pincode during checkout.
            </p>

            <h5 className="fw-bold mt-4">Delivery Timelines</h5>

            <div className="table-responsive mt-3">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Region</th>
                    <th>Standard Delivery</th>
                    <th>Express Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Noida / Delhi NCR</td>
                    <td>24–48 hours</td>
                    <td>Same day (if ordered before 12 PM)</td>
                  </tr>
                  <tr>
                    <td>
                      Metro Cities (Mumbai, Bangalore, Chennai, Kolkata,
                      Hyderabad)
                    </td>
                    <td>2–4 business days</td>
                    <td>1–2 business days</td>
                  </tr>
                  <tr>
                    <td>Tier 2 Cities</td>
                    <td>3–5 business days</td>
                    <td>2–3 business days</td>
                  </tr>
                  <tr>
                    <td>Other Areas / Remote Locations</td>
                    <td>5–7 business days</td>
                    <td>Not available</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h5 className="fw-bold mt-4">Shipping Charges</h5>
            <p>
              Free shipping is available on orders above the qualifying amount
              (displayed at checkout). For orders below the threshold, a nominal
              shipping fee applies based on your location and order weight.
            </p>

            <h5 className="fw-bold mt-4">Order Tracking</h5>
            <p>
              Once your order is dispatched, you will receive a tracking link
              via SMS and email. You can also track your order by logging into
              your account and visiting the {"'My Orders'"} section.
            </p>

            <h5 className="fw-bold mt-4">Packaging</h5>
            <p>
              All medicines are packed in tamper-proof, temperature-appropriate
              packaging to maintain product integrity. Prescription medicines
              are sealed separately with batch number and expiry details
              visible. Cold-chain products (if applicable) are shipped with ice
              packs in insulated packaging.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
