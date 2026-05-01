import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title: "Prescription Upload Guide | TnC Pharmacy",
  description:
    "Learn how to upload a valid prescription on TnC Pharmacy. Check required details and upload tips.",
};

export default function PrescriptionGuide() {
  return (
    <div className="bg-light">
      <section className="container my-5">
        <div className="col-lg-10 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          <h1 className="fw-bold text-primary mb-4">
            Prescription Upload Guide
          </h1>

          <p>A valid prescription must include:</p>

          <ul className="mt-3">
            <li>{"Doctor's"} name and registration number</li>
            <li>{"Patient's"} name</li>
            <li>Date of prescription (must be within 6 months)</li>
            <li>Medicine names with dosage instructions</li>
            <li>{"Doctor's"} signature and stamp</li>
          </ul>

          <h5 className="fw-bold mt-4">Tips for a Good Upload</h5>

          <ul className="mt-3">
            <li>Ensure the image is clear and well-lit</li>
            <li>All text should be readable</li>
            <li>The full prescription must be visible (not cropped)</li>
            <li>Accepted formats: JPG, PNG, PDF</li>
          </ul>
        </div>
      </section>
      <Footer />
    </div>
  );
}
