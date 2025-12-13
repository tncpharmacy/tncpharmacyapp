"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";
import { useRouter } from "next/navigation";

export default function CodSuccess() {
  const router = useRouter();
  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <section className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="container mt-5 text-center">
                <i className="bi bi-check-circle-fill text-success fs-1"></i>
                <h4 className="fw-semibold mt-3">Order Placed Successfully!</h4>
                <p className="text-muted">
                  Your order has been placed with Cash on Delivery. You’ll
                  receive updates soon.
                </p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => router.push("/profile")}
                >
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
