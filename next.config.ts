import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["68.183.174.17"],
  },
  eslint: {
    // Allow production builds even if ESLint errors are present
    ignoreDuringBuilds: true,
    // Optional: you can also disable specific rules
    dirs: ["src"], // directories to run ESLint on
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "https://api.tncpharmacy.in/media/:path*",
      },
      //User routes
      {
        source: "/profile",
        destination: "/user/profile",
      },
      {
        source: "/search-text",
        destination: "/user/search-text",
      },
      {
        source: "/all-group-care/:id",
        destination: "/user/all-group-care/:id",
      },
      {
        source: "/all-product/:id",
        destination: "/user/all-product/:id",
      },
      {
        source: "/all-products/:categoryId/:subCategoryId",
        destination: "/user/all-products/:categoryId/:subCategoryId",
      },
      {
        source: "/product-details/:id",
        destination: "/user/product-details/:id",
      },
      {
        source: "/all-medicine",
        destination: "/user/all-medicine/all-medicine",
      },
      {
        source: "/medicines-details/:id",
        destination: "/user/medicines-details/:id",
      },
      {
        source: "/health-bag",
        destination: "/user/health-bag",
      },
      {
        source: "/address",
        destination: "/user/address",
      },
      {
        source: "/checkout",
        destination: "/user/checkout",
      },
      {
        source: "/about-us",
        destination: "/user/about-us",
      },
      {
        source: "/contact-us",
        destination: "/user/contact-us",
      },
      {
        source: "/return-policy",
        destination: "/user/return-policy",
      },
      {
        source: "/refund-policy",
        destination: "/user/refund-policy",
      },
      {
        source: "/shipping-policy",
        destination: "/user/shipping-policy",
      },
      {
        source: "/terms-and-conditions",
        destination: "/user/terms-and-conditions",
      },
      {
        source: "/privacy-policy",
        destination: "/user/privacy-policy",
      },
      {
        source: "/editorial-policy",
        destination: "/user/editorial-policy",
      },
      {
        source: "/FAQs",
        destination: "/user/FAQs",
      },
      {
        source: "/our-stores",
        destination: "/user/our-stores",
      },
      {
        source: "/blog",
        destination: "/user/blog",
      },
      // {
      //   source: "/address",
      //   destination: "/user/address/add",
      // },

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
        source: "/purchase-invoice",
        destination: "/admin/purchase-invoice",
      },
      {
        source: "/export",
        destination: "/admin/purchase-invoice/export",
      },
      {
        source: "/import",
        destination: "/admin/purchase-invoice/import",
      },
      {
        source: "/add-clinic",
        destination: "/admin/clinic/add",
      },
      // {
      //   source: "/update-clinic/:id",
      //   destination: "/admin/clinic/add/:id",
      // },
      {
        source: "/clinic",
        destination: "/admin/clinic",
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
        source: "/medicine",
        destination: "/admin/medicine/medicine-item",
      },
      {
        source: "/add-medicine",
        destination: "/admin/medicine/medicine-item/add-medicine",
      },
      {
        source: "/update-medicine/:id",
        destination: "/admin/medicine/medicine-item/add-medicine/:id",
      },
      {
        source: "/add-other-product",
        destination: "/admin/medicine/medicine-item/add-product",
      },
      {
        source: "/update-other-product/:id",
        destination: "/admin/medicine/medicine-item/add-product/:id",
      },
      {
        source: "/category",
        destination: "/admin/medicine/category",
      },
      {
        source: "/sub-category",
        destination: "/admin/medicine/sub-category",
      },
      {
        source: "/unit",
        destination: "/admin/medicine/unit",
      },
      {
        source: "/generic",
        destination: "/admin/medicine/generic",
      },
      {
        source: "/manufacturer",
        destination: "/admin/medicine/manufacturer",
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
        source: "/admin/contact-us",
        destination: "/admin/contact-us",
      },
      {
        source: "/advertisement",
        destination: "/admin/advertisement",
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
      // {
      //   source: "/add-supplier",
      //   destination: "/pharmacy/supplier/add-supplier",
      // },
      // {
      //   source: "/supplier",
      //   destination: "/pharmacy/supplier/list-supplier",
      // },
      {
        source: "/pharmacy/patient-health-bag",
        destination: "/pharmacy/buyerHealthBag",
      },
      {
        source: "/pharmacy/order",
        destination: "/pharmacy/order",
      },
      {
        source: "/pharmacy/purchase-invoice",
        destination: "/pharmacy/purchase-invoice",
      },
      {
        source: "/pharmacy/export",
        destination: "/pharmacy/purchase-invoice/export",
      },
      {
        source: "/pharmacy/import",
        destination: "/pharmacy/purchase-invoice/import",
      },
      {
        source: "/pharmacy/add-medicine",
        destination: "/pharmacy/medicine/medicine-item/add",
      },
      // {
      //   source: "/pharmacy/update-medicine",
      //   destination: "/pharmacy/medicine/medicine-item/add/:id",
      // },
      {
        source: "/pharmacy/medicine",
        destination: "/pharmacy/medicine/medicine-item",
      },
      {
        source: "/pharmacy/add-other-product",
        destination: "/pharmacy/medicine/other-item/add",
      },
      // {
      //   source: "/pharmacy/update-other-product",
      //   destination: "/pharmacy/medicine/other-item/add/:id",
      // },
      {
        source: "/pharmacy/other-product",
        destination: "/pharmacy/medicine/other-item",
      },
      {
        source: "/pharmacy/retail-counter",
        destination: "/pharmacy/retail-counter",
      },
      {
        source: "/pharmacy/stock",
        destination: "/pharmacy/stock",
      },
      {
        source: "/pharmacy/supplier",
        destination: "/pharmacy/supplier",
      },
      {
        source: "/pharmacy/change-password",
        destination: "/pharmacy/change-password",
      },

      // Pharmacist Routes
      {
        source: "/pharmacist/stock",
        destination: "/pharmacist/stock",
      },
      {
        source: "/pharmacist/add-medicine",
        destination: "/pharmacist/medicine/medicine-item/add",
      },
      {
        source: "/patient-prescriptions",
        destination: "/pharmacist/patient-prescriptions",
      },
      // {
      //   source: "/pharmacist/update-medicine",
      //   destination: "/pharmacist/medicine/medicine-item/add/:id",
      // },
      {
        source: "/pharmacist/medicine",
        destination: "/pharmacist/medicine/medicine-item",
      },
      {
        source: "/pharmacist/add-other-product",
        destination: "/pharmacist/medicine/other-item/add",
      },
      // {
      //   source: "/pharmacist/update-other-product",
      //   destination: "/pharmacist/medicine/other-item/add/:id",
      // },
      {
        source: "/pharmacist/other-product",
        destination: "/pharmacist/medicine/other-item",
      },
      {
        source: "/pharmacist/view-profile",
        destination: "/pharmacist/pharmacist-profile/view-profile",
      },
      {
        source: "/pharmacist/update-profile",
        destination: "/pharmacist/pharmacist-profile/update-profile",
      },
      // {
      //   source: "/pharmacist/orders",
      //   destination: "/pharmacist/order/order-list",
      // },
      {
        source: "/pharmacist/purchase-invoice",
        destination: "/pharmacist/purchase-invoice",
      },
      {
        source: "/pharmacist/export",
        destination: "/pharmacist/purchase-invoice/export",
      },
      {
        source: "/pharmacist/import",
        destination: "/pharmacist/purchase-invoice/import",
      },
      {
        source: "/pharmacist-dashboard",
        destination: "/pharmacist/pharmacist-dashboard",
      },
      {
        source: "/pharmacist/retail-counter",
        destination: "/pharmacist/retail-counter",
      },
      {
        source: "/pharmacist/retail-counter-prescription",
        destination: "/pharmacist/retail-counter-prescription",
      },
      {
        source: "/pharmacist/orders",
        destination: "/pharmacist/order",
      },
      {
        source: "/pharmacist/patient-health-bag",
        destination: "/pharmacist/buyerHealthBag",
      },
      {
        source: "/pharmacist/add-supplier",
        destination: "/pharmacist/supplier/add",
      },
      {
        source: "/pharmacist/update-supplier/:id",
        destination: "/pharmacist/supplier/add/:id",
      },
      {
        source: "/pharmacist/supplier",
        destination: "/pharmacist/supplier",
      },
      {
        source: "/pharmacist/change-password",
        destination: "/pharmacist/change-password",
      },

      // Doctor Routes
      {
        source: "/doctor-dashboard",
        destination: "/doctor/doctor-dashboard",
      },
    ];
  },
};

export default nextConfig;
