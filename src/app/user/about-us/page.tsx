"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Image } from "react-bootstrap";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";

export default function AboutUs() {
  return (
    <div className="page-wrapper bg-light">
      <SiteHeader />

      <section className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-md-12">
            <div className="card shadow-sm border-0 rounded-3 p-4 p-md-5">
              <h2 className="fw-bold text-center mb-4 text-primary">
                About TnC Pharmacy
              </h2>

              <p className="text-muted text-center mb-5">
                Delivering health and wellness to your doorstep with trust and
                care.
              </p>

              <div className="about-content">
                <h5 className="fw-semibold mt-4 text-secondary">Our Story</h5>
                <p>
                  TnC Pharmacy was founded with a vision to make healthcare
                  accessible, affordable, and convenient for everyone. We
                  understand the importance of timely medicines and reliable
                  healthcare products — that’s why we bring you a trusted
                  platform where you can order medicines, wellness products, and
                  health supplements with ease.
                </p>

                <h5 className="fw-semibold mt-4 text-secondary">
                  What We Offer
                </h5>
                <ul>
                  <li>
                    Wide range of genuine medicines and healthcare essentials
                  </li>
                  <li>Doctor consultations and health checkup services</li>
                  <li>Quick and reliable doorstep delivery</li>
                  <li>Easy return and refund policies</li>
                  <li>Secure online payment options</li>
                </ul>

                <h5 className="fw-semibold mt-4 text-secondary">Our Mission</h5>
                <p>
                  Our mission is to make quality healthcare products and
                  services available to everyone, anywhere. We strive to bridge
                  the gap between pharmacies and patients using technology and
                  compassion.
                </p>

                <h5 className="fw-semibold mt-4 text-secondary">
                  Why Choose Us?
                </h5>
                <ul>
                  <li>100% genuine and verified medicines</li>
                  <li>Licensed pharmacists and trusted suppliers</li>
                  <li>Affordable prices and regular discounts</li>
                  <li>Dedicated customer support available 24x7</li>
                </ul>

                <div className="text-center mt-4">
                  <Image
                    src="/images/about-us.png"
                    alt="About TnC Pharmacy"
                    fluid
                    className="rounded-3 shadow-sm my-3"
                    style={{ maxHeight: "350px", objectFit: "cover" }}
                  />
                </div>

                <h5 className="fw-semibold mt-4 text-secondary">Contact Us</h5>
                <p>
                  Have questions or feedback? We’d love to hear from you.
                  <br />
                  <strong>Email:</strong>{" "}
                  <a href="mailto:care@tncpharmacy.in" className="text-primary">
                    care@tncpharmacy.in
                  </a>
                  <br />
                  <strong>Phone:</strong> +91 7042079595
                  <br />
                  <strong>Address:</strong>
                  TnC Pharmacy and Labs Pvt. Ltd.
                  <br />
                  Shop No. 61, Ground Floor,
                  <br />
                  Ganga Shopping Complex, Block 1,
                  <br />
                  Sector 29, Noida,
                  <br />
                  Uttar Pradesh – 201301
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
