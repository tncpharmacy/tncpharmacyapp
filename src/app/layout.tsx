import "./styles/common.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import Providers from "./Provider";

import AuthInitializer from "@/components/AuthInitializer/AuthInitializer";
import LayoutFix from "@/components/LayoutFix/LayoutFix";
import CookieBanner from "@/app/components/CookieBanner/CookieBanner";
import AnalyticsProvider from "@/components/AnalyticsProvider/AnalyticsProvider";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="canonical" href="https://tncpharmacy.in/" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Pharmacy",
              name: "TNC Pharmacy",
              url: "https://tncpharmacy.in",
              telephone: "+91-XXXXXXXXXX",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
            }),
          }}
        />
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KH3SXDFT');
          `}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KH3SXDFT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AnalyticsProvider />
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
