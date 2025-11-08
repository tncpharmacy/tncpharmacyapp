"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";
import { Image } from "react-bootstrap";

export default function UpiPayment() {
  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <section className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="container mt-4 text-center">
                <h5 className="fw-semibold mb-3">
                  Scan to Pay (PhonePe / GooglePay)
                </h5>
                <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
                  <Image
                    src="/my-upi-qr.png"
                    alt="QR Code"
                    width={220}
                    height={220}
                    className="mx-auto mb-3"
                  />
                  <p className="text-muted small">
                    Scan the above QR code and complete your payment.
                  </p>
                  <p className="fw-semibold text-success">
                    Once paid, your order will be confirmed automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
