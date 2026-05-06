import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "Partner with TnC Pharmacy | Business Opportunities",
  description:
    "Partner with TnC Pharmacy. Opportunities for pharmacists, distributors, manufacturers, and healthcare professionals.",
};

export default function Partner() {
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
                  <span>Partner With Us</span>
                </li>
              </ol>
            </nav>
          </ol>
        </nav>
        <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          <h1 className="fw-bold text-primary mb-4">Partner With Us</h1>

          <p>
            Are you a pharmacist, distributor, or pharmaceutical manufacturer
            looking to expand your reach?
          </p>

          <p>
            Partner with TnC Pharmacy and join {"India's"} growing digital
            healthcare ecosystem.
          </p>

          <h5 className="fw-bold mt-4">Opportunities We Offer</h5>

          <ul className="mt-3">
            <li>
              <strong>Pharmacy Partners –</strong> List your inventory on our
              platform
            </li>
            <li>
              <strong>Distributors –</strong> Supply to our fulfilment network
            </li>
            <li>
              <strong>Manufacturers –</strong> Get your products featured to
              thousands of customers
            </li>
            <li>
              <strong>Healthcare Professionals –</strong> Refer patients for
              doorstep medicine delivery
            </li>
          </ul>

          <div className="mt-4 p-3 bg-light border rounded">
            <strong>Contact:</strong> business@tncpharmacy.in
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
