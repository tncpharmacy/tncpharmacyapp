// app/pharmacyadmin/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export const metadata = {
  title: "Pharmacist Admin | TnC Pharmacist",
  description: "Pharmacist admin dashboard",
};

export default function PharmacistAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pharmacistadmin-layout">
      <ProtectedRoute>{children}</ProtectedRoute>
    </div>
  );
}
