import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "How to Order Medicines Online | TnC Pharmacy",
  description:
    "Learn how to order medicines online from TnC Pharmacy. Simple step-by-step guide for ordering, prescription upload, and delivery.",
};

export default function HowToOrder() {
  return (
    <div className="bg-light">
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
                  <span>How to Order</span>
                </li>
              </ol>
            </nav>
          </ol>
        </nav>
        <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          {/* H1 */}
          <h1 className="fw-bold text-primary mb-4">How to Order</h1>

          <p>
            Ordering on TnC Pharmacy is quick and easy. Follow these simple
            steps:
          </p>

          {/* Steps */}
          <div className="mt-4">
            <div className="mb-3">
              <strong>Step 1: Search or Browse – </strong>
              Use the search bar to find your medicine by name or browse our
              categories (Ayurveda, Nutrition, Healthcare Devices, etc.).
            </div>

            <div className="mb-3">
              <strong>Step 2: Add to Health Bag – </strong>
              Click {'"ADD"'} on the products you need. Adjust quantities in
              your Health Bag.
            </div>

            <div className="mb-3">
              <strong>Step 3: Upload Prescription (if needed) – </strong>
              For prescription medicines, upload a clear photo or PDF of your
              doctor’s prescription.
            </div>

            <div className="mb-3">
              <strong>Step 4: Checkout – </strong>
              Enter your delivery address, choose a payment method (UPI, Card,
              COD), and place your order.
            </div>

            <div className="mb-3">
              <strong>Step 5: Pharmacist Verification – </strong>
              Our pharmacist reviews your order (especially prescription items)
              to ensure everything is correct and safe.
            </div>

            <div className="mb-3">
              <strong>Step 6: Delivery – </strong>
              Your order is packed, shipped, and delivered to your doorstep.
              Track it via SMS/email.
            </div>
          </div>

          {/* Highlight box */}
          <div className="alert alert-info mt-4">
            Tip: Keep your prescription ready for faster order processing.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
