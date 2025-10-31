"use client";

import React, { useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";
import { Image } from "react-bootstrap";

export default function ShippingTerms() {
  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <div className="container-fluid my-2">
          <div className="row justify-content-center">
            <div className="col-lg-12"></div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
