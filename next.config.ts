import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/admin-dashboard",
        destination: "/admin/admin-dashboard",
      },
      {
        source: "/add-pharmacy",
        destination: "/admin/add-pharmacy",
      },
      {
        source: "/pharmacy",
        destination: "/admin/pharmacy",
      },
      {
        source: "/add-pharmacist",
        destination: "/admin/add-pharmacist",
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
    ];
  },
};

export default nextConfig;
