import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
// import "@/styles/globals.css";

import { Providers } from "./Provider";

export const metadata: Metadata = {
  title: "TnC PHARMACY",
  description: "Trust and Care",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
