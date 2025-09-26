import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export const metadata = {
  title: "Admin | TnC Pharmacy",
  description: "Admin dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <ProtectedRoute>{children}</ProtectedRoute>
    </div>
  );
}
