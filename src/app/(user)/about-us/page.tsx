import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "About TnC Pharmacy | Trusted Online Pharmacy in Noida, India",
  description:
    "Learn about TnC Pharmacy and Labs Pvt. Ltd. -- your trusted online pharmacy for genuine medicines, healthcare devices, and wellness products. 100% pharmacist verified orders.",

  alternates: {
    canonical: "/about-us",
  },

  openGraph: {
    title: "About TnC Pharmacy | Trusted Online Pharmacy",
    description:
      "Know more about TnC Pharmacy and our mission to make healthcare affordable and accessible.",
    url: "https://tncpharmacy.in/about-us",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "About TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "About TnC Pharmacy",
    description: "Trusted online pharmacy delivering genuine medicines.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};
export default function AboutUs() {
  return (
    <div className="page-wrapper bg-light">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "TnC Pharmacy",
            url: "https://tncpharmacy.in",
            logo: "https://tncpharmacy.in/og-image.png",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-7042079595",
              contactType: "customer service",
              areaServed: "IN",
            },
            address: {
              "@type": "PostalAddress",
              streetAddress:
                "Shop No. 61, Ground Floor, Ganga Shopping Complex",
              addressLocality: "Noida",
              addressRegion: "UP",
              postalCode: "201301",
              addressCountry: "IN",
            },
          }),
        }}
      />
      {/* <SiteHeader /> */}

      <section className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="bg-white shadow-sm rounded-3 p-4 p-md-5">
              {/* TITLE */}
              <h1 className="fw-bold text-primary mb-4">About TnC Pharmacy</h1>

              {/* WHO WE ARE */}
              <h5 className="fw-bold mt-4">Who We Are</h5>

              <p>
                TnC Pharmacy and Labs Pvt. Ltd. is a trusted online pharmacy and
                healthcare solutions provider based in Noida, Uttar Pradesh.
                Founded with the mission of making quality healthcare
                accessible, affordable, and convenient, we bring genuine
                medicines and wellness products right to your doorstep. Learn
                how to <Link href="/how-to-order">order medicines online</Link>,
                explore our <Link href="/offers">latest offers</Link>, or{" "}
                <Link href="/contact-us">contact our pharmacy in Noida</Link>.
              </p>

              <p>
                The name <strong>TnC</strong> stands for “Trust and Care” — two
                values that drive everything we do. From sourcing medicines
                directly from licensed manufacturers to ensuring
                pharmacist-verified orders, every step in our process is
                designed to put your health and safety first.
              </p>

              {/* MISSION */}
              <h5 className="fw-bold mt-4">Our Mission</h5>
              <p>
                To make quality healthcare affordable and accessible to every
                Indian household by leveraging technology, a robust supply
                chain, and a deep commitment to patient safety. We believe that
                no one should have to compromise on health due to cost or
                convenience barriers.
              </p>

              {/* VISION */}
              <h5 className="fw-bold mt-4">Our Vision</h5>
              <p>
                To become India’s most trusted digital pharmacy platform — known
                for genuine medicines, transparent pricing, and a healthcare
                experience that combines the warmth of a neighbourhood pharmacy
                with the convenience of modern technology.
              </p>

              {/* WHY CHOOSE */}
              <h5 className="fw-bold mt-4">Why Choose TnC Pharmacy?</h5>

              <ul className="mt-3">
                <li>
                  <strong>100% Genuine Medicines –</strong> Every product is
                  sourced directly from licensed manufacturers and authorized
                  distributors. We never deal in counterfeit or grey-market
                  products.
                </li>

                <li>
                  <strong>Up to 70% Off on Generic Medicines –</strong> We
                  believe quality healthcare should not be a luxury. Our generic
                  medicine range delivers the same efficacy at a fraction of the
                  cost.
                </li>

                <li>
                  <strong>Pharmacist-Verified Orders –</strong> Every
                  prescription order is reviewed by a qualified pharmacist
                  before dispatch. Your safety is our responsibility.
                </li>

                <li>
                  <strong>Trusted Brand Sourcing –</strong> We partner with
                  India’s leading pharmaceutical companies including Abbott,
                  Cipla, Sun Pharma, Dr. Reddy’s, Lupin, Mankind, Dabur,
                  Himalaya, and many more.
                </li>

                <li>
                  <strong>Fast & Free Shipping –</strong> We deliver across
                  India with free shipping on qualifying orders. Most orders in
                  the NCR region are delivered within 24–48 hours.
                </li>

                <li>
                  <strong>Secure Payments –</strong> Multiple payment options
                  including UPI, debit/credit cards, net banking, wallets, and
                  Cash on Delivery for your convenience.
                </li>

                <li>
                  <strong>Easy Prescription Upload –</strong> Simply upload a
                  photo of your prescription, and our pharmacists will prepare
                  and verify your order. You can also follow our{" "}
                  <Link href="/prescription-guide">
                    Prescription Upload Guide
                  </Link>{" "}
                  for step-by-step instructions.
                </li>
              </ul>

              {/* WHAT WE OFFER */}
              <h5 className="fw-bold mt-4">What We Offer</h5>

              <p>
                Our product catalogue spans across multiple health categories
                including Ayurveda & Herbal products, Nutrition & Supplements,
                Healthcare Devices (BP monitors, glucometers, nebulizers), Baby
                Care, Personal Care, Women’s Health, and over-the-counter
                essentials.
              </p>

              <p>
                We also offer prescription medicines that are dispensed only
                against a valid prescription as required by law.
              </p>

              {/* LOCATION */}
              <h5 className="fw-bold mt-4">Our Location</h5>

              <p>
                <strong>TnC Pharmacy and Labs Pvt. Ltd.</strong>
                <br />
                Shop No. 61, Ground Floor,
                <br />
                Ganga Shopping Complex, Block 1,
                <br />
                Sector 29, Noida, Uttar Pradesh – 201301
                <br />
                <br />
                <strong>Phone:</strong> +91 7042079595 (10:00 AM - 6:00 PM)
                <br />
                <strong>Phone:</strong> +91 8062521280 (24x7)
                <br />
                <strong>Email:</strong> support@tncpharmacy.in
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
