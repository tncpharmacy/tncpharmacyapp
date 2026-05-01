import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title: "Customer Reviews | TnC Pharmacy Testimonials",

  description:
    "Read real customer reviews and testimonials of TnC Pharmacy. Trusted online pharmacy delivering genuine medicines, fast delivery, and verified services across India.",

  alternates: {
    canonical: "/reviews",
  },

  openGraph: {
    title: "Customer Reviews | TnC Pharmacy Testimonials",
    description:
      "Read real customer reviews and testimonials of TnC Pharmacy. Trusted online pharmacy delivering genuine medicines, fast delivery, and verified services across India.",
    url: "https://tncpharmacy.in/reviews",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TnC Pharmacy Reviews",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Customer Reviews | TnC Pharmacy Testimonials",
    description:
      "Read real customer reviews and testimonials of TnC Pharmacy. Trusted online pharmacy delivering genuine medicines across India.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function Reviews() {
  return (
    <div className="bg-light">
      <section className="container my-5">
        <div className="col-lg-10 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          {/* H1 */}
          <h1 className="fw-bold text-primary mb-4">
            Testimonials / Customer Reviews
          </h1>

          {/* Intro (doc content) */}
          <p>
            Display real customer testimonials with name, location, and star
            rating. This builds trust for new visitors.
          </p>

          <p>
            Ask satisfied customers to leave Google reviews and showcase them
            here. Even 5–10 genuine reviews make a big difference for a pharmacy
            website.
          </p>

          {/* Reviews Section */}
          <div className="row mt-4">
            {/* Review 1 */}
            <div className="col-md-6 mb-4">
              <div className="border p-3 rounded shadow-sm h-100">
                <p className="mb-1 text-warning">★★★★★</p>
                <p>
                  Fast delivery and genuine medicines. Prices are much lower
                  compared to local stores.
                </p>
                <small className="text-muted">Rohit Sharma, Noida</small>
              </div>
            </div>

            {/* Review 2 */}
            <div className="col-md-6 mb-4">
              <div className="border p-3 rounded shadow-sm h-100">
                <p className="mb-1 text-warning">★★★★★</p>
                <p>
                  Very easy to upload prescription and quick verification.
                  Highly recommended.
                </p>
                <small className="text-muted">Priya Verma, Delhi</small>
              </div>
            </div>

            {/* Review 3 */}
            <div className="col-md-6 mb-4">
              <div className="border p-3 rounded shadow-sm h-100">
                <p className="mb-1 text-warning">★★★★☆</p>
                <p>
                  Good discounts on generic medicines and smooth ordering
                  experience.
                </p>
                <small className="text-muted">Amit Singh, Ghaziabad</small>
              </div>
            </div>

            {/* Review 4 */}
            <div className="col-md-6 mb-4">
              <div className="border p-3 rounded shadow-sm h-100">
                <p className="mb-1 text-warning">★★★★★</p>
                <p>Customer support is helpful and delivery is on time.</p>
                <small className="text-muted">Neha Gupta, Greater Noida</small>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="alert alert-info mt-4">
            Have you ordered from TnC Pharmacy? Share your experience and help
            others make informed decisions.
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
