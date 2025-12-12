// app/layout.tsx
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import ToastProvider from "@/components/ToastProvider/ToastProvider";
import Providers from "./Provider";

// Axios setup
import { setUnauthorizedHandler } from "@/lib/axios";
import { store } from "@/lib/store";
import { logout } from "@/lib/features/authSlice/authSlice";

// run 1 time on app start
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
        <ToastProvider />
      </body>
    </html>
  );
}
