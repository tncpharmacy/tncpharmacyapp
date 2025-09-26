// app/layout.tsx
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import Providers from "./Provider";

// 🔹 Axios circular-safe logout setup
import { setUnauthorizedHandler } from "@/lib/axios";
import { store } from "@/lib/store";
import { logout } from "@/lib/features/authSlice/authSlice";

// setup once at app start
setUnauthorizedHandler(() => {
  store.dispatch(logout());
  window.location.href = "/";
});

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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>

        {/* Toast Container */}
        <ToastProvider />
      </body>
    </html>
  );
}
