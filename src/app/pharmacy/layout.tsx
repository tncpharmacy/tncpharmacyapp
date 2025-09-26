// app/pharmacyadmin/layout.tsx
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export const metadata = {
  title: "Pharmacy Admin | TnC Pharmacy",
  description: "Pharmacy admin dashboard",
};

export default function PharmacyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pharmacyadmin-layout">
      <ProtectedRoute>{children}</ProtectedRoute>
    </div>
  );
}
