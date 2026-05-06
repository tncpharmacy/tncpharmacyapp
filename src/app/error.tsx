"use client";

import "@/app/(user)/css/site-style.css";
import SiteHeader from "@/app/(user)/components/header/header";
import Footer from "@/app/(user)/components/footer/footer";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <>
      <SiteHeader initialCategories={[]} initialSubcategories={[]} />

      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontSize: "48px", color: "red" }}>Something went wrong</h1>

        <p>We encountered an unexpected error.</p>

        <button onClick={() => reset()} className="btn btn-primary">
          Try Again
        </button>
      </div>

      <Footer />
    </>
  );
}
