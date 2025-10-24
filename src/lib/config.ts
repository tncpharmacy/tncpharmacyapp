import { Product } from "@/types/medicine";
export const ENDPOINTS = {
  // 🔐 Auth
  LOGIN: "/user/login/",
  // REFRESH: "/user/token/refresh/", // 👉 agar backend se mile tab yaha add karna

  // 📍 Master Data
  GET_STATES: "/masterapp/state/",

  //Pharmacy Self(Pharmacy Admin)
  PHARMACY_SELF: "/pharmacy/pharmacies/", // get pharmacy self one
  PHARMACY_GET_PHARMACISTS: "/pharmacist/pharmacists/", // GET all
  PHARMACY_GET_PHARMACIST_BY_ID: (id: number | string) =>
    `/pharmacist/pharmacists/${id}/`, // GET one
  PHARMACY_CREATE_PHARMACIST: "/pharmacist/register/", // POST
  PHARMACY_UPDATE_PHARMACIST: (id: number | string) =>
    `/pharmacist/pharmacists/${id}/`, // PATCH
  PHARMACY_DELETE_PHARMACIST: (id: number | string) =>
    `/pharmacist/pharmacists/${id}/`, // DELETE

  //Pharmacist Self(Pharmacist Admin)
  PHARMACIST_SELF: "/pharmacist/self/", // get pharmacist self one

  //Clinic Self(Pharmacist Admin)
  CLINIC_SELF: "/clinic/clinics/", // get pharmacist self one

  // 🏥 Clinic (Superadmin side)
  GET_CLINIC: "/clinic/superadmin/clinics/", // GET all
  GET_CLINIC_BY_ID: (id: number | string) => `/clinic/superadmin/clinics/${id}`, // GET one
  CREATE_CLINIC: "/clinic/register/", // POST
  UPDATE_CLINIC: (id: number | string) => `/clinic/superadmin/clinics/${id}`, // PATCH
  DELETE_CLINIC: (id: number | string) => `/clinic/superadmin/clinics/${id}`, // DELETE

  // 🏥 Pharmacies (Superadmin side)
  GET_PHARMACY_LIST: "/pharmacy/list/", // general list
  GET_PHARMACIES: "/pharmacy/superadmin/pharmacies/", // GET all
  GET_PHARMACY_BY_ID: (id: number | string) =>
    `/pharmacy/superadmin/pharmacies/${id}/`, // GET one
  CREATE_PHARMACY: "/pharmacy/register/", // POST
  UPDATE_PHARMACY: (id: number | string) =>
    `/pharmacy/superadmin/pharmacies/${id}/`, // PATCH
  DELETE_PHARMACY: (id: number | string) =>
    `/pharmacy/superadmin/pharmacies/${id}/`, // DELETE

  // 👨‍⚕️ Pharmacists
  GET_PHARMACISTS: "/pharmacist/pharmacists/", // GET all
  GET_PHARMACIST_BY_ID: (id: number | string) =>
    `/pharmacist/pharmacists/${id}/`, // GET one
  CREATE_PHARMACIST: "/pharmacist/register/", // POST
  UPDATE_PHARMACIST: (id: number | string) => `/pharmacist/pharmacists/${id}/`, // PATCH
  DELETE_PHARMACIST: (id: number | string) => `/pharmacist/pharmacists/${id}/`, // DELETE

  // category for home page
  CATEGORY: {
    CREATE: "/masterapp/category/create/",
    UPDATE: (id: number) => `/masterapp/category/${id}/`,
    GET_ALL: "/masterapp/category/",
    GET_ALL_LIST: "/masterapp/category/list/",
    GET_BY_ID: (id: number) => `/masterapp/category/${id}/`,
    DELETE: (id: number) => `/masterapp/category/${id}/`,
  },

  // sub category for home page
  SUBCATEGORY: {
    CREATE: "/masterapp/subcategory/create/",
    UPDATE: (id: number) => `/masterapp/subcategory/${id}/`,
    GET_ALL: "/masterapp/subcategory/",
    GET_ALL_LIST: "/masterapp/subcategory/list/",
    GET_BY_ID: (id: number) => `/masterapp/subcategory/${id}/`,
    DELETE: (id: number) => `/masterapp/subcategory/${id}/`,
  },

  // manufacturer for home page
  MANUFACTURER: {
    //CREATE: "/masterapp/subcategory/create/",
    //UPDATE: (id: number) => `/masterapp/subcategory/${id}/`,
    GET_ALL: "/masterapp/manufacturer/",
    GET_ALL_LIST: "/masterapp/manufacturer/list/",
    GET_BY_ID: (id: number) => `/masterapp/manufacturer/${id}/`,
    // DELETE: (id: number) => `masterapp/manufacturer/${id}/`,
  },

  // generic for home page
  GENERIC: {
    //CREATE: "/masterapp/subcategory/create/",
    //UPDATE: (id: number) => `/masterapp/subcategory/${id}/`,
    GET_ALL: "/masterapp/generic/",
    GET_ALL_LIST: "/masterapp/generic/list/",
    GET_BY_ID: (id: number) => `/masterapp/generic/${id}/`,
    // DELETE: (id: number) => `masterapp/generic/${id}/`,
  },

  // unit for home page
  UNIT: {
    //CREATE: "/masterapp/subcategory/create/",
    //UPDATE: (id: number) => `/masterapp/subcategory/${id}/`,
    GET_ALL: "/masterapp/unit/",
    GET_ALL_LIST: "/masterapp/unit/list/",
    GET_BY_ID: (id: number) => `/masterapp/unit/${id}/`,
    //DELETE: (id: number) => `masterapp/unit/${id}/`,
  },

  // buyer
  BUYER: {
    LOGIN: "/buyer/validate/",
    CREATE: "/buyer/register/",
    DELETE: (id: number) => `/buyer/create/${id}/`,
  },

  // medicines
  MEDICINES: {
    GET_ALL_LIST: "/medicine/list/",
    GET_ALL_PRODUCT_LIST: "/medicine/product/list/",
    GET_PRODUCT_LIST_BY_GENERIC: (productId: number) =>
      `/medicine/medicine-by-generic/?product_id=${productId}`,
    GET_MENU_MEDICINE: "/website/medicine/category/1/",
    GET_BY_MENU_ID: (id: number) => `/website/medicine/${id}/`,
    GET_GROUP_CARE: "/masterapp/care-group/list/",
    GET_MENU_OTHER_MEDICINE: (categoryId: number) =>
      `/website/other/medicine/list/?category_id=${categoryId}`,
    GET_BY_MENU_OTHER_ID: (id: number) => `/website/other/medicine/${id}/`,
    GET_MEDICINE_LIST_BY_GENERIC: (medicineId: number) =>
      `website/generic/medicine/${medicineId}/`,
  },

  // Purchase Stock
  PURCHASE_STOCK: {
    CREATE: "/stock/purchase/create/",
  },
};
