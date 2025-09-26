import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import AdminDashboard from "@/app/admin/admin-dashboard/page";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
