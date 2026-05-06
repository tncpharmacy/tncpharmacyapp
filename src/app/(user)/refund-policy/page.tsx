// "use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "Refund Policy | TnC Pharmacy -- Quick & Transparent Refunds",
  description:
    "TnC Pharmacy refund policy. Get refunds within 2-7 business days via UPI, card, or bank transfer. Full transparency on all refund timelines.",

  alternates: {
    canonical: "/refund-policy",
  },

  openGraph: {
    title: "Refund Policy | TnC Pharmacy",
    description:
      "Learn about refund eligibility, timelines, payment methods, and cancellation refunds at TnC Pharmacy.",
    url: "https://tncpharmacy.in/refund-policy",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Refund Policy TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Refund Policy | TnC Pharmacy",
    description:
      "Refund process, timelines, and eligibility explained clearly.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicy() {
  return (
    <>
      <div className="page-wrapper">
        <div className="container py-4">
          <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
            <ol className="breadcrumb">
              <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link href="/" style={{ textDecoration: "none" }}>
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item text-muted">
                    <span>Refund Policy</span>
                  </li>
                </ol>
              </nav>
            </ol>
          </nav>
          <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
            <h1 className="fw-bold text-primary mb-4">Refund Policy</h1>

            <p>
              <strong>Effective Date:</strong> May 2026
            </p>

            <h5 className="fw-bold mt-4">When You Are Eligible for a Refund</h5>
            <p>Refunds are processed in the following scenarios:</p>

            <ul>
              <li>
                Your return request has been approved under our Return Policy.
              </li>
              <li>Your order was cancelled before it was shipped.</li>
              <li>
                A product was out of stock after your order was placed and could
                not be fulfilled.
              </li>
              <li>
                You were charged an incorrect amount due to a system error.
              </li>
            </ul>

            <h5 className="fw-bold mt-4">Refund Process</h5>

            <div className="table-responsive mt-3">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Payment Method</th>
                    <th>Refund Method</th>
                    <th>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>UPI / Wallet</td>
                    <td>Refunded to same UPI/Wallet</td>
                    <td>2-3 business days</td>
                  </tr>
                  <tr>
                    <td>Credit / Debit Card</td>
                    <td>Refunded to same card</td>
                    <td>5-7 business days</td>
                  </tr>
                  <tr>
                    <td>Net Banking</td>
                    <td>Refunded to bank account</td>
                    <td>5-7 business days</td>
                  </tr>
                  <tr>
                    <td>Cash on Delivery</td>
                    <td>Bank transfer (NEFT/IMPS)</td>
                    <td>7-10 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              For COD refunds, you will need to provide your bank account
              details (account number, IFSC code, account holder name) to our
              support team.
            </p>

            <p>
              Partial refunds may be issued if only part of your order is being
              returned or if the product shows signs of use.
            </p>

            <h5 className="fw-bold mt-4">Cancellation Refunds</h5>

            <p>
              If you cancel your order before it is shipped, a full refund will
              be processed within 2–3 business days. Orders that have already
              been shipped cannot be cancelled but can be returned after
              delivery under our Return Policy.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
