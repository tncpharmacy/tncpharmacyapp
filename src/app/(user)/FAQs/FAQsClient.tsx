"use client";

import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Accordion } from "react-bootstrap";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export default function FAQsClient() {
  return (
    <div className="page-wrapper bg-light">
      {/* ✅ YAHAN LAGANA HAI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do you deliver medicines across India?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we deliver medicines across India with fast shipping.",
                },
              },
              {
                "@type": "Question",
                name: "Are medicines genuine?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "All medicines are 100% genuine and sourced from trusted suppliers.",
                },
              },
            ],
          }),
        }}
      />

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
                  <span>FAQs</span>
                </li>
              </ol>
            </nav>
          </ol>
        </nav>
        <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          <h1 className="fw-bold text-primary mb-4">
            FAQs – Online Pharmacy in Noida | TnC Pharmacy Help & Support
          </h1>

          <p className="text-muted small">
            Looking to buy medicines online in Noida? Find answers to common
            questions about ordering medicines, uploading prescriptions,
            delivery timelines, payments, and refunds at TnC Pharmacy.{" "}
            <Link href="/contact-us">Contact Page</Link> or check our{" "}
            <Link href="/how-to-order">How to Order Guide</Link>.
          </p>

          {/* ================= ORDERING ================= */}
          <h5 className="fw-bold mt-4">Ordering & Account</h5>

          <Accordion alwaysOpen className="mt-3">
            <Accordion.Item eventKey="100">
              <Accordion.Header>
                Q: How to order medicines online in Noida?
              </Accordion.Header>
              <Accordion.Body>
                A: You can order medicines online from TnC Pharmacy by searching
                products, adding them to your cart, and completing checkout. We
                provide fast delivery across Noida and Delhi NCR.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="101">
              <Accordion.Header>
                Q: Which is the best online pharmacy in Noida?
              </Accordion.Header>
              <Accordion.Body>
                A: TnC Pharmacy is a trusted online pharmacy in Noida offering
                genuine medicines, pharmacist verification, and up to 70%
                discounts on generic medicines.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="102">
              <Accordion.Header>
                Q: Do you provide medicine delivery in Noida?
              </Accordion.Header>
              <Accordion.Body>
                A: Yes, we offer fast medicine delivery in Noida, Ghaziabad, and
                Delhi NCR, with doorstep delivery and real-time tracking.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                Q: How do I place an order on TnC Pharmacy?
              </Accordion.Header>
              <Accordion.Body>
                A: Browse our product categories or search for your medicine.
                Add items to your Health Bag, proceed to checkout, enter your
                delivery address, and choose a payment method. For prescription
                medicines, upload a valid prescription during checkout.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>
                Q: Do I need a prescription to order medicines?
              </Accordion.Header>
              <Accordion.Body>
                A: Over-the-counter (OTC) medicines, supplements, and healthcare
                products can be ordered without a prescription. However,
                prescription medicines (Schedule H, H1, and X drugs) legally
                require a valid prescription from a registered medical
                practitioner. You can upload your prescription during checkout.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>
                Q: Can I order medicines for someone else?
              </Accordion.Header>
              <Accordion.Body>
                A: Yes, you can order medicines for family members or friends.
                Please ensure you provide the patient’s name and a valid
                prescription (if required). The delivery address can be
                different from your registered address.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>
                Q: How do I upload my prescription?
              </Accordion.Header>
              <Accordion.Body>
                A: Click on the “Upload Prescription” button on our homepage or
                visit our{" "}
                <Link href="/prescription-guide">
                  Prescription Upload Guide
                </Link>
                . or during checkout. You can take a photo of your prescription
                or upload a scanned PDF. Our pharmacist will review it and
                confirm your order.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4">
              <Accordion.Header>
                Q: Is there a minimum order value?
              </Accordion.Header>
              <Accordion.Body>
                A: There is no minimum order value. However, free shipping is
                available on orders above a qualifying amount (check the current
                threshold on our website).
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* ================= MEDICINES ================= */}
          <h5 className="fw-bold mt-5">Medicines & Products</h5>

          <Accordion alwaysOpen className="mt-3">
            <Accordion.Item eventKey="5">
              <Accordion.Header>
                Q: Are all medicines on TnC Pharmacy genuine?
              </Accordion.Header>
              <Accordion.Body>
                A: Yes, 100%. Every medicine on our platform is sourced directly
                from licensed manufacturers and authorized distributors. We
                never deal in counterfeit, grey-market, or expired products. All
                pharmacist-verified orders go through a quality check before
                dispatch.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="6">
              <Accordion.Header>
                Q: What are generic medicines? Are they safe?
              </Accordion.Header>
              <Accordion.Body>
                A: Generic medicines contain the same active ingredient, dosage,
                and form as branded medicines but are sold at a lower price
                because they don’t carry brand marketing costs. They are
                approved by drug regulatory authorities (CDSCO/DCGI) and are
                equally safe and effective. We offer up to 70% off on generic
                alternatives.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="7">
              <Accordion.Header>
                Q: What if the medicine I need is out of stock?
              </Accordion.Header>
              <Accordion.Body>
                A: If a product is out of stock, you can use the “Notify Me”
                feature and we will alert you when it’s available again.
                Alternatively, contact our customer support and we can help find
                a substitute or check availability.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="8">
              <Accordion.Header>
                Q: Do you sell ayurvedic and herbal products?
              </Accordion.Header>
              <Accordion.Body>
                A: Yes, we have a wide range of Ayurveda & Herbal products
                including ayurvedic oils, herbal supplements, immunity boosters,
                and wellness products from trusted brands like Dabur, Himalaya,
                Patanjali, and Organic India.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* ================= DELIVERY ================= */}
          <h5 className="fw-bold mt-5">Delivery & Shipping</h5>

          <Accordion alwaysOpen className="mt-3">
            <Accordion.Item eventKey="9">
              <Accordion.Header>Q: Where do you deliver?</Accordion.Header>
              <Accordion.Body>
                A: We deliver across India. For full details, check our{" "}
                <Link href="/shipping-policy">Shipping Policy</Link>. Most
                orders within the NCR region (Delhi, Noida, Gurgaon, Ghaziabad)
                are delivered within 24–48 hours. For other cities, delivery
                typically takes 3–7 business days depending on your location.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="10">
              <Accordion.Header>Q: How can I track my order?</Accordion.Header>
              <Accordion.Body>
                A: Once your order is shipped, you will receive a tracking link
                via SMS and email. You can also check your delivery status by
                logging into your account on our website.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="11">
              <Accordion.Header>
                Q: Is home delivery available for prescription medicines?
              </Accordion.Header>
              <Accordion.Body>
                A: Yes, we deliver prescription medicines to your doorstep after
                pharmacist verification. All prescription medicines are packed
                in tamper-proof packaging to maintain safety and compliance.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* ================= PAYMENTS ================= */}
          <h5 className="fw-bold mt-5">Payments</h5>

          <Accordion alwaysOpen className="mt-3">
            <Accordion.Item eventKey="12">
              <Accordion.Header>
                Q: What payment methods do you accept?
              </Accordion.Header>
              <Accordion.Body>
                A: We accept UPI (Google Pay, PhonePe, Paytm), credit cards,
                debit cards, net banking, mobile wallets, and Cash on Delivery
                (COD). All payments are processed through secure, encrypted
                payment gateways.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="13">
              <Accordion.Header>
                Q: Is Cash on Delivery available?
              </Accordion.Header>
              <Accordion.Body>
                A: Yes, COD is available for most locations across India. COD
                eligibility is shown at checkout based on your delivery pincode.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="14">
              <Accordion.Header>
                Q: Are online payments safe on your website?
              </Accordion.Header>
              <Accordion.Body>
                A: Absolutely. All transactions are processed through
                RBI-compliant, PCI-DSS certified payment gateways with 256-bit
                SSL encryption. We never store your card details on our servers.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* ================= RETURNS ================= */}
          <h5 className="fw-bold mt-5">Returns & Refunds</h5>

          <Accordion alwaysOpen className="mt-3">
            <Accordion.Item eventKey="15">
              <Accordion.Header>Q: Can I return medicines?</Accordion.Header>
              <Accordion.Body>
                A: Due to regulatory requirements, medicines cannot be returned
                once delivered unless they are damaged, defective, or the wrong
                item was sent. Please refer to our{" "}
                <Link href="/return-policy">Return Policy</Link> for complete
                details.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="16">
              <Accordion.Header>Q: How do I get a refund?</Accordion.Header>
              <Accordion.Body>
                A: If your return is approved, refunds are processed within 5–7
                business days to your original payment method. For COD orders,
                refunds are made via bank transfer. See our{" "}
                <Link href="/refund-policy">Refund Policy</Link> for details.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="17">
              <Accordion.Header>
                Q: What if I receive a damaged or wrong product?
              </Accordion.Header>
              <Accordion.Body>
                A: Please contact us within 24 hours of delivery with photos of
                the damaged/wrong product and your order number. We will arrange
                a replacement or full refund at no extra cost.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <p className="mt-4 fw-bold">
            Still have questions? Visit our{" "}
            <Link href="/contact-us">Contact Us</Link> or call +91 8062521280
            (24x7). or email support@tncpharmacy.in.
          </p>
          <p className="mt-4 text-muted small">
            TnC Pharmacy is a trusted online pharmacy in Noida Sector 29
            offering genuine medicines and fast delivery across Noida,
            Ghaziabad, and Delhi NCR.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
