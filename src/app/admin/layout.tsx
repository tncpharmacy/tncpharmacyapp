"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = "Admin | TnC Pharmacy";
  }, []);

  return (
    <div className="admin-layout">
      <ProtectedRoute>{children}</ProtectedRoute>
    </div>
  );
}
