import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import Providers from "./Provider";

// Axios setup
import { setUnauthorizedHandler } from "@/lib/axios";
import { store } from "@/lib/store";
import { logout } from "@/lib/features/authSlice/authSlice";
import AuthInitializer from "@/components/AuthInitializer/AuthInitializer";
import LayoutFix from "@/components/LayoutFix/LayoutFix";
import { getMenuData } from "@/lib/server/menu";
import SiteHeader from "@/app/user/components/header/header";

// run 1 time on app start
// setUnauthorizedHandler(() => {
//   store.dispatch(logout());
//   window.location.href = "/";
// });

export const metadata: Metadata = {
  title: "TnC PHARMACY",
  description: "Trust and Care",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function shuffle(arr: any) {
    return [...arr].sort(() => 0.5 - Math.random());
  }

  const { categories, subcategories } = await getMenuData();

  const shuffledCategories = shuffle(categories);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>

      <body>
        <LayoutFix />
        <Providers>
          <AuthInitializer />
          <SiteHeader
            initialCategories={shuffledCategories}
            initialSubcategories={subcategories}
          />
          {children}
        </Providers>
        <ToastProvider />
      </body>
    </html>
  );
}
