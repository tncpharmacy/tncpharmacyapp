import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["68.183.174.17"], // yahan tera image server IP ya domain
  },
  async rewrites() {
    return [
      // Backend API rewrites
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
      // Admin dashboard routes
      {
        source: "/admin-dashboard",
        destination: "/admin/admin-dashboard",
      },
      {
        source: "/add-pharmacy",
        destination: "/admin/pharmacy/add",
      },
      {
        source: "/update-pharmacy/:id",
        destination: "/admin/pharmacy/add/:id",
      },
      {
        source: "/pharmacy",
        destination: "/admin/pharmacy",
      },
      {
        source: "/add-pharmacist",
        destination: "/admin/pharmacist/add",
      },
      {
        source: "/update-pharmacist/:id",
        destination: "/admin/pharmacist/add/:id",
      },
      {
        source: "/pharmacist",
        destination: "/admin/pharmacist",
      },
      {
        source: "/doctors",
        destination: "/admin/doctors",
      },
      {
        source: "/add-doctor",
        destination: "/admin/add-doctor",
      },
      {
        source: "/add-suppliers",
        destination: "/admin/supplier/add-supplier",
      },
      {
        source: "/categories",
        destination: "/admin/medicine/medicine-category",
      },
      {
        source: "/variants",
        destination: "/admin/medicine/medicine-variant",
      },
      {
        source: "/brands",
        destination: "/admin/medicine/medicine-brand",
      },
      {
        source: "/units",
        destination: "/admin/medicine/medicine-unit",
      },
      {
        source: "/manufacturers",
        destination: "/admin/medicine/medicine-manufacturer",
      },
      {
        source: "/strengths",
        destination: "/admin/medicine/medicine-strength",
      },
      {
        source: "/orders",
        destination: "/admin/order/order-list",
      },
      {
        source: "/medicines",
        destination: "/admin/medicine/medicine-list",
      },
      {
        source: "/add-medicines",
        destination: "/admin/medicine/add-medicine",
      },
      {
        source: "/supplier",
        destination: "/admin/supplier/list-supplier",
      },
      {
        source: "/add-supplier",
        destination: "/admin/supplier/add-supplier",
      },
      {
        source: "/buyer",
        destination: "/admin/buyer",
      },
      {
        source: "/profile",
        destination: "/doctor/doctor-profile",
      },
      // Pharmacy routes
      {
        source: "/pharmacy/add-pharmacist",
        destination: "/pharmacy/pharmacist/add",
      },
      {
        source: "/pharmacy/update-pharmacist/:id",
        destination: "/pharmacy/pharmacist/add/:id",
      },
      {
        source: "/pharmacy/pharmacist",
        destination: "/pharmacy/pharmacist",
      },
      {
        source: "/view-profile",
        destination: "/pharmacy/pharmacy-profile/view-profile",
      },
      {
        source: "/update-profile",
        destination: "/pharmacy/pharmacy-profile/update-profile",
      },
      {
        source: "/pharmacy-dashboard",
        destination: "/pharmacy/pharmacy-dashboard",
      },
      {
        source: "/add-supplier",
        destination: "/pharmacy/supplier/add-supplier",
      },
      {
        source: "/supplier",
        destination: "/pharmacy/supplier/list-supplier",
      },
      {
        source: "/category",
        destination: "/pharmacy/medicine/medicine-category",
      },
      {
        source: "/variant",
        destination: "/pharmacy/medicine/medicine-variant",
      },
      {
        source: "/brand",
        destination: "/pharmacy/medicine/medicine-brand",
      },
      {
        source: "/unit",
        destination: "/pharmacy/medicine/medicine-unit",
      },
      {
        source: "/manufacturer",
        destination: "/pharmacy/medicine/medicine-manufacturer",
      },
      {
        source: "/strength",
        destination: "/pharmacy/medicine/medicine-strength",
      },
      {
        source: "/order",
        destination: "/pharmacy/order/order-list",
      },
      {
        source: "/medicine",
        destination: "/pharmacy/medicine/medicine-list",
      },
      {
        source: "/add-medicine",
        destination: "/pharmacy/medicine/add-medicine",
      },

      // Pharmacist Routes
      {
        source: "/pharmacist/view-profile",
        destination: "/pharmacist/pharmacist-profile/view-profile",
      },
      {
        source: "/pharmacist/update-profile",
        destination: "/pharmacist/pharmacist-profile/update-profile",
      },
    ];
  },
};

export default nextConfig;
