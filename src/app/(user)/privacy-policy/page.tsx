// "use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/(user)/components/header/header";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | TnC Pharmacy – Your Data is Safe With Us",
  description:
    "Read how TnC Pharmacy protects your personal and prescription data. SSL encrypted. GDPR-aligned practices. We never sell your information.",

  alternates: {
    canonical: "/privacy-policy",
  },

  openGraph: {
    title: "Privacy Policy | TnC Pharmacy",
    description:
      "Your personal and prescription data is protected with secure and compliant practices.",
    url: "https://tncpharmacy.in/privacy-policy",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Privacy Policy TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | TnC Pharmacy",
    description: "Learn how your data is securely handled and protected.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <>
      <div className="page-wrapper bg-light">
        {/* <SiteHeader /> */}

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
                    <span>Privacy Policy</span>
                  </li>
                </ol>
              </nav>
            </ol>
          </nav>
          <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
            {/* H1 */}
            <h1 className="fw-bold text-primary mb-4">Privacy Policy</h1>

            <p>
              <strong>Effective Date:</strong> May 2026
            </p>

            <p>
              TnC Pharmacy and Labs Pvt. Ltd. ({'"we", "us", "our"'}) is
              committed to protecting the privacy and security of your personal
              information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our
              website www.tncpharmacy.in or use our services.
            </p>

            {/* INFO WE COLLECT */}
            <h5 className="fw-bold mt-4">Information We Collect</h5>

            <h6 className="fw-semibold mt-3">
              Personal Information You Provide
            </h6>
            <p>
              When you create an account, place an order, or contact us, we may
              collect your name, email address, phone number, delivery address,
              date of birth, and payment information (processed by third-party
              payment gateways — we do not store card details).
            </p>

            <h6 className="fw-semibold mt-3">Prescription Information</h6>
            <p>
              When you upload a prescription, we collect the prescription image
              and details for the sole purpose of verifying and dispensing your
              medicines. Prescription data is handled in accordance with
              applicable pharmacy regulations and is accessible only to our
              licensed pharmacists.
            </p>

            <h6 className="fw-semibold mt-3">
              Automatically Collected Information
            </h6>
            <p>
              When you browse our website, we may automatically collect IP
              address, browser type, device information, pages visited, time
              spent on pages, and cookies (see Cookie Policy below).
            </p>

            {/* USE */}
            <h5 className="fw-bold mt-4">How We Use Your Information</h5>
            <p>
              We use your information to process and deliver your orders, verify
              prescriptions through licensed pharmacists, communicate order
              updates via SMS and email, improve our website and services, send
              promotional offers (only if you opt-in), comply with legal and
              regulatory requirements, and prevent fraud.
            </p>

            {/* SHARING */}
            <h5 className="fw-bold mt-4">Information Sharing</h5>
            <p>
              We do not sell, rent, or trade your personal information to third
              parties. We may share your information with:
            </p>

            <ul>
              <li>Logistics and delivery partners (for order delivery)</li>
              <li>Payment processors (for transaction processing)</li>
              <li>Regulatory authorities (when required by law)</li>
              <li>
                Technology service providers (who help operate our platform
                under strict confidentiality agreements)
              </li>
            </ul>

            {/* SECURITY */}
            <h5 className="fw-bold mt-4">Data Security</h5>
            <p>
              We implement industry-standard security measures including SSL/TLS
              encryption for data in transit, encrypted databases for data at
              rest, access controls limiting data access to authorized personnel
              only, and regular security audits. While we strive to protect your
              data, no method of electronic transmission or storage is 100%
              secure.
            </p>

            {/* RIGHTS */}
            <h5 className="fw-bold mt-4">Your Rights</h5>
            <p>
              You have the right to access your personal data by contacting us,
              request correction of inaccurate data, request deletion of your
              account and associated data (subject to legal retention
              requirements), opt out of marketing communications at any time,
              and withdraw consent for data processing.
            </p>

            {/* COOKIE */}
            <h5 className="fw-bold mt-4">Cookie Policy</h5>
            <p>
              Our website uses cookies to enhance your browsing experience,
              remember your preferences, and analyze site traffic. You can
              control cookies through your browser settings. Disabling cookies
              may affect some website functionality.
            </p>

            {/* CHANGES */}
            <h5 className="fw-bold mt-4">Changes to This Policy</h5>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated effective date. We
              encourage you to review this policy periodically.
            </p>

            {/* CONTACT */}
            <h5 className="fw-bold mt-4">Contact Us</h5>
            <p>
              For privacy-related queries or requests, contact us at:
              <br />
              <strong>Email:</strong> privacy@tncpharmacy.in
              <br />
              <strong>Phone:</strong> +91 7042079595
              <br />
              <strong>Address:</strong> TnC Pharmacy and Labs Pvt. Ltd., Shop
              No. 61, Ground Floor, Ganga Shopping Complex, Block 1, Sector 29,
              Noida, Uttar Pradesh – 201301.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
