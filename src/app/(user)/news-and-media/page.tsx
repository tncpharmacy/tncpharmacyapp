import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title: "News & Media | TnC Pharmacy Updates & Announcements",
  description:
    "Stay updated with the latest news, product launches, and announcements from TnC Pharmacy. Read updates on healthcare initiatives, partnerships, and services.",

  alternates: {
    canonical: "/news-and-media",
  },

  openGraph: {
    title: "TnC Pharmacy News & Media",
    description: "Latest news, announcements, and updates from TnC Pharmacy.",
    url: "https://tncpharmacy.in/news-and-media",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TnC Pharmacy News & Media",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "News & Media | TnC Pharmacy",
    description: "Read the latest updates and announcements from TnC Pharmacy.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function NewsMedia() {
  return (
    <div className="bg-light">
      <section className="container my-5">
        <div className="col-lg-10 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          <h1 className="fw-bold text-primary mb-4">News & Media</h1>

          <h5 className="fw-bold">Latest Updates from TnC Pharmacy</h5>
          <p>
            Stay up to date with the latest news, product launches, health
            initiatives, and company milestones from TnC Pharmacy.
          </p>

          {/* NEWS 1 */}
          <h6 className="fw-bold mt-4 text-primary">
            TnC Pharmacy Launches Online Store with Up to 70% Off on Generic
            Medicines
          </h6>

          <p>
            TnC Pharmacy and Labs Pvt. Ltd. has launched its full-featured
            online pharmacy platform at www.tncpharmacy.in, offering genuine
            medicines, healthcare devices, ayurvedic products, and nutrition
            supplements with delivery across India.
          </p>

          <p>
            Customers can enjoy up to 70% off on generic medicines,
            pharmacist-verified prescriptions, and multiple payment options
            including COD.
          </p>

          {/* NEWS 2 */}
          <h6 className="fw-bold mt-4 text-primary">
            Prescription Upload Feature Now Live
          </h6>

          <p>
            Patients can now upload prescriptions directly on the TnC Pharmacy
            website or mobile app. Our licensed pharmacists review every
            prescription before dispensing, ensuring complete safety and
            regulatory compliance.
          </p>

          {/* NEWS 3 */}
          <h6 className="fw-bold mt-4 text-primary">
            TnC Pharmacy Partners with 25+ Leading Manufacturers
          </h6>

          <p>
            We have established direct partnerships with major pharmaceutical
            companies including Abbott, Cipla, Sun Pharma, Dr. Reddy’s, Lupin,
            Dabur, Himalaya, and Patanjali to bring verified, genuine medicines
            at the best prices.
          </p>

          {/* MEDIA */}
          <h5 className="fw-bold mt-5">Media Enquiries</h5>

          <p>
            For press releases, interviews, or media partnership enquiries,
            please contact us at media@tncpharmacy.in or call +91 7042079595.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
