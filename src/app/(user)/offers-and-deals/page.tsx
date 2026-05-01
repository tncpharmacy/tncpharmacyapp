import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title: "Offers & Deals | TnC Pharmacy – Up to 70% Off on Medicines",
  description:
    "Grab the latest deals and discounts on medicines, healthcare products, and supplements at TnC Pharmacy. New offers every week.",

  alternates: {
    canonical: "/offers",
  },

  openGraph: {
    title: "Offers & Deals | TnC Pharmacy – Up to 70% Off on Medicines",
    description:
      "Latest discounts and deals on medicines and healthcare products at TnC Pharmacy.",
    url: "https://tncpharmacy.in/offers",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TnC Pharmacy Offers & Deals",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Offers & Deals | TnC Pharmacy",
    description: "Get up to 70% off on medicines and healthcare products.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function OffersAndDeals() {
  return (
    <div className="bg-light">
      <section className="container my-5">
        <div className="col-lg-10 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          <h1 className="fw-bold text-primary mb-4">Offers & Deals</h1>

          <p>
            This page displays current offers, discount codes, seasonal sales,
            and bundle deals. Keep checking regularly for the latest promotions.
          </p>

          <h5 className="fw-bold mt-4">Current Offers</h5>

          <ul className="mt-3">
            <li>
              <strong>First Order Discount –</strong> Get extra 15% off on your
              first order using code <strong>TNCFIRST</strong>
            </li>
            <li>
              <strong>Generic Medicine Deals –</strong> Save up to 70% on
              generic medicines
            </li>
            <li>
              <strong>Seasonal Health Kits –</strong> Monsoon kits, winter care,
              summer essentials
            </li>
            <li>
              <strong>Combo Packs –</strong> BP monitor + test strips, diabetic
              care bundles
            </li>
          </ul>

          <div className="alert alert-success mt-4">
            Offers are updated regularly. Check back frequently for new deals.
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
