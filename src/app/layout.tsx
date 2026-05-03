import "./styles/common.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import Providers from "./Provider";

import AuthInitializer from "@/components/AuthInitializer/AuthInitializer";
import LayoutFix from "@/components/LayoutFix/LayoutFix";
import CookieBanner from "@/app/components/CookieBanner/CookieBanner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>

      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <LayoutFix />

        <Providers>
          <AuthInitializer />
          {/* ✅ Main content wrapper (IMPORTANT) */}
          <main id="main">{children}</main>
        </Providers>
        <CookieBanner />
        <ToastProvider />
      </body>
    </html>
  );
}
