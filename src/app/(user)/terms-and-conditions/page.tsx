// "use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | TnC Pharmacy",
  description:
    "Read the terms and conditions for using TnC Pharmacy's online pharmacy services. Covers ordering, payments, prescriptions, and liability.",

  alternates: {
    canonical: "/terms-and-conditions",
  },

  openGraph: {
    title: "Terms & Conditions | TnC Pharmacy",
    description:
      "Understand the rules, responsibilities, and policies for using our services.",
    url: "https://tncpharmacy.in/terms-and-conditions",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Terms and Conditions TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | TnC Pharmacy",
    description:
      "Know the terms for ordering medicines and using our services.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsAndConditions() {
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
                    <span>Term & Condition</span>
                  </li>
                </ol>
              </nav>
            </ol>
          </nav>
          <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
            {/* H1 */}
            <h1 className="fw-bold text-primary mb-4">Terms & Conditions</h1>

            <p>
              <strong>Effective Date:</strong> May 2026
            </p>

            <p>
              Please read these Terms & Conditions ({'"Terms"'}) carefully
              before using the TnC Pharmacy website (www.tncpharmacy.in) and
              services. By accessing or using our website, you agree to be bound
              by these Terms.
            </p>

            {/* 1 */}
            <h5 className="fw-bold mt-4">1. About Us</h5>
            <p>
              TnC Pharmacy and Labs Pvt. Ltd. is a registered company operating
              an online pharmacy platform. We are licensed to sell and
              distribute pharmaceutical products in accordance with the Drugs
              and Cosmetics Act, 1940 and applicable rules.
            </p>

            {/* 2 */}
            <h5 className="fw-bold mt-4">2. Eligibility</h5>
            <p>
              You must be at least 18 years of age to use our services. By
              creating an account or placing an order, you confirm that you are
              legally eligible. Minors may only use our services under the
              supervision of a parent or legal guardian.
            </p>

            {/* 3 */}
            <h5 className="fw-bold mt-4">3. Account Responsibility</h5>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You agree to provide accurate and complete
              information during registration. You must notify us immediately of
              any unauthorized use of your account.
            </p>

            {/* 4 */}
            <h5 className="fw-bold mt-4">4. Ordering & Prescriptions</h5>
            <p>
              All prescription medicines require a valid prescription from a
              registered medical practitioner. We reserve the right to reject or
              cancel orders if the prescription is invalid, illegible, or does
              not meet regulatory requirements. Our pharmacists may contact you
              or your doctor for prescription clarification.
            </p>

            {/* 5 */}
            <h5 className="fw-bold mt-4">5. Pricing & Payment</h5>
            <p>
              All prices displayed on our website are in Indian Rupees (INR) and
              include applicable taxes unless stated otherwise. We reserve the
              right to modify prices without prior notice. In case of pricing
              errors, we will notify you and offer the option to proceed at the
              correct price or cancel the order.
            </p>

            {/* 6 */}
            <h5 className="fw-bold mt-4">6. Product Information</h5>
            <p>
              We make every effort to display accurate product information
              including descriptions, images, and pricing. However, we do not
              warrant that descriptions are error-free or complete. Product
              images are for illustration purposes and actual products may vary
              slightly in appearance.
            </p>

            {/* 7 */}
            <h5 className="fw-bold mt-4">7. Intellectual Property</h5>
            <p>
              All content on this website including text, graphics, logos,
              images, and software is the property of TnC Pharmacy and Labs Pvt.
              Ltd. or its licensors and is protected by intellectual property
              laws. You may not reproduce, distribute, or create derivative
              works without our written consent.
            </p>

            {/* 8 */}
            <h5 className="fw-bold mt-4">8. Limitation of Liability</h5>
            <p>
              TnC Pharmacy shall not be liable for any indirect, incidental,
              special, or consequential damages arising from the use of our
              services. Our maximum liability for any claim shall not exceed the
              amount paid by you for the specific order in question. We are not
              liable for delays caused by courier partners, natural disasters,
              or events beyond our control.
            </p>

            {/* 9 */}
            <h5 className="fw-bold mt-4">9. Governing Law</h5>
            <p>
              These Terms are governed by the laws of India. Any disputes
              arising from these Terms shall be subject to the exclusive
              jurisdiction of the courts in Noida, Uttar Pradesh.
            </p>

            {/* 10 */}
            <h5 className="fw-bold mt-4">10. Contact</h5>
            <p>
              For questions about these Terms, contact:
              <br />
              <strong>Email:</strong> legal@tncpharmacy.in
              <br />
              <strong>Phone:</strong> +91 7042079595
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
