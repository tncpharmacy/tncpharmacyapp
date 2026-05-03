import Link from "next/link";
import "@/app/(user)/css/site-style.css";
import SiteHeader from "@/app/(user)/components/header/header";
import Footer from "@/app/(user)/components/footer/footer";
import { getMenuData } from "@/lib/server/menu";

export default async function NotFound() {
  const { categories, subcategories } = await getMenuData();

  return (
    <>
      <SiteHeader
        initialCategories={categories}
        initialSubcategories={subcategories}
      />

      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "red" }}>
          Page Not Found
        </h1>
        <p>Sorry, the page you are looking for {"doesn't"} exist.</p>

        <Link
          href="/"
          style={{
            marginTop: "20px",
            display: "inline-block",
            padding: "10px 20px",
            background: "#0070f3",
            color: "#fff",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          Go Back Home
        </Link>
      </div>
      <Footer />
    </>
  );
}
