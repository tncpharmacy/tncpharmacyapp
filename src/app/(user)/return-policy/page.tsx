// "use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/(user)/components/header/header";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "Return Policy | TnC Pharmacy -- Easy Returns & Exchanges",
  description:
    "Read TnC Pharmacy's return policy. Easy returns for damaged, defective, or wrong products within 24 hours of delivery. Hassle-free process.",

  alternates: {
    canonical: "/return-policy",
  },

  openGraph: {
    title: "Return Policy | TnC Pharmacy",
    description:
      "Understand return eligibility, process, timelines, and replacement conditions at TnC Pharmacy.",
    url: "https://tncpharmacy.in/return-policy",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Return Policy TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Return Policy | TnC Pharmacy",
    description:
      "Return eligibility, process, and timelines explained clearly.",
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
                  <span>Return Policy</span>
                </li>
              </ol>
            </nav>
          </ol>
        </nav>
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="bg-white shadow-sm rounded-3 p-4 p-md-5">
              {/* H1 */}
              <h1 className="fw-bold text-primary mb-4">Return Policy</h1>

              {/* EFFECTIVE DATE */}
              <p>
                <strong>Effective Date:</strong> May 2026
              </p>

              <p>
                At TnC Pharmacy, customer satisfaction is our priority. We
                understand that sometimes things may not go as planned, and we
                have a fair return policy to ensure your experience is smooth.
              </p>

              {/* CONDITIONS */}
              <h5 className="fw-bold mt-4">Conditions for Return</h5>

              <p>You may request a return in the following situations:</p>

              <ol>
                <li>
                  <strong>Wrong Product Delivered –</strong> You received a
                  product different from what you ordered.
                </li>
                <li>
                  <strong>Damaged or Defective Product –</strong> The product
                  was damaged during transit or has a manufacturing defect.
                </li>
                <li>
                  <strong>Expired Product –</strong> The product received has
                  passed its expiry date.
                </li>
                <li>
                  <strong>Missing Items –</strong> One or more items from your
                  order are missing.
                </li>
              </ol>

              {/* NON RETURNABLE */}
              <h5 className="fw-bold mt-4">Non-Returnable Items</h5>

              <p>
                Due to safety and regulatory requirements in the pharmaceutical
                industry, the following items cannot be returned:
              </p>

              <ul>
                <li>
                  Medicines once opened, used, or if the tamper-proof seal is
                  broken
                </li>
                <li>
                  Prescription medicines (Schedule H, H1, X drugs) that have
                  been delivered correctly as per prescription
                </li>
                <li>
                  Products with special storage requirements (cold chain,
                  refrigerated items) once delivered
                </li>
                <li>Personal care and hygiene products once opened</li>
                <li>Any item not in its original packaging</li>
              </ul>

              {/* PROCESS */}
              <h5 className="fw-bold mt-4">How to Request a Return</h5>

              <p>
                <strong>Step 1:</strong> Contact our customer support within 24
                hours of delivery at +91 8062521280 or support@tncpharmacy.in.
              </p>

              <p>
                <strong>Step 2:</strong> Provide your order number, the item(s)
                you wish to return, and the reason for return.
              </p>

              <p>
                <strong>Step 3:</strong> Share clear photos of the product and
                packaging showing the issue.
              </p>

              <p>
                <strong>Step 4:</strong> Our team will review your request and
                respond within 24–48 hours.
              </p>

              <p>
                <strong>Step 5:</strong> If approved, we will arrange a pickup
                or provide return shipping instructions.
              </p>

              {/* TIMELINE */}
              <h5 className="fw-bold mt-4">Return Timeline</h5>

              <p>
                Return requests must be raised within 24 hours of delivery.
                Items must be returned in their original packaging within 7 days
                of return approval. Products received after 7 days of approval
                may not be accepted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
