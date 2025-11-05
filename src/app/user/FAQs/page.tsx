"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Accordion } from "react-bootstrap";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";

export default function FAQs() {
  return (
    <div className="page-wrapper bg-light">
      <SiteHeader />

      <section className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-12">
            <div className="card shadow-sm border-0 rounded-3 p-4 p-md-5">
              <h2 className="fw-bold text-center mb-4 text-primary">FAQs</h2>
              <p className="text-muted text-center mb-5">
                Frequently Asked Questions — everything you need to know about{" "}
                <strong>TnC Pharmacy</strong>.
              </p>

              <Accordion defaultActiveKey="0" alwaysOpen>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    What is TnC Pharmacy and what services do you offer?
                  </Accordion.Header>
                  <Accordion.Body>
                    TnC Pharmacy is an online pharmacy and healthcare platform
                    that allows users to order medicines, health products, and
                    wellness essentials online. We also provide doctor
                    consultations and healthcare services.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    How can I place an order on TnC Pharmacy?
                  </Accordion.Header>
                  <Accordion.Body>
                    You can search for the required medicine or product, add it
                    to your cart, and complete the payment using your preferred
                    payment method. Orders can be placed via our website or
                    mobile application.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    What payment methods are accepted?
                  </Accordion.Header>
                  <Accordion.Body>
                    We accept major debit/credit cards, UPI, PhonePe, Google
                    Pay, and other secure payment gateways. Cash on Delivery
                    (COD) may also be available in selected areas.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>How can I track my order?</Accordion.Header>
                  <Accordion.Body>
                    Once your order is confirmed, you will receive an email/SMS
                    with tracking details. You can also view your order status
                    in your account under “My Orders”.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="4">
                  <Accordion.Header>
                    Can I cancel or modify my order?
                  </Accordion.Header>
                  <Accordion.Body>
                    Orders can be modified or canceled before they are
                    dispatched. Once shipped, cancellation is not possible. You
                    can check our{" "}
                    <a href="/return-policy" className="text-primary">
                      Return Policy
                    </a>{" "}
                    for details.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="5">
                  <Accordion.Header>
                    What is the return and refund process?
                  </Accordion.Header>
                  <Accordion.Body>
                    Returns are accepted only for damaged, expired, or incorrect
                    products. Refunds are initiated within 5–7 business days
                    after inspection. For details, refer to our{" "}
                    <a href="/refund-policy" className="text-primary">
                      Refund Policy
                    </a>
                    .
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="6">
                  <Accordion.Header>
                    How can I contact customer support?
                  </Accordion.Header>
                  <Accordion.Body>
                    You can reach us through:
                    <ul>
                      <li>
                        Email:{" "}
                        <a
                          href="mailto:care@tncpharmacy.in"
                          className="text-primary"
                        >
                          care@tncpharmacy.in
                        </a>
                      </li>
                      <li>Phone: +91 97178 XXXXX (10:00 AM - 6:00 PM)</li>
                      <li>WhatsApp: +91 97178 XXXXX (24x7)</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

              <div className="text-center mt-5">
                <p className="text-secondary small">
                  © {new Date().getFullYear()} TnC Pharmacy. All Rights
                  Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
