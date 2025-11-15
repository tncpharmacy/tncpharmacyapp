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
    GET: (id: number) => `/buyer/profile/${id}/`,
    PUT: (id: number) => `/buyer/profile/${id}/`,

    // 🔹 Added Order APIs
    POST_ORDER: (buyerId: number) => `/order/create-order/${buyerId}/`,
    GET_ORDER_LIST: (buyerId: number) => `/order/buyer/list/${buyerId}`,
    GET_ORDER_DETAIL: (orderId: number) => `/order/buyer/detail/${orderId}`,
  },

  // Prescription Upload
  PRESCRIPTION_UPLOAD: {
    LOGIN_UPDATE: "/ocr/prescription/update-buyer/",
    PUBLIC_CREATE: "/ocr/prescription/upload/",
    GET_PRESCRIPTION_LIST_PHARMACIST: "/ocr/prescriptions/active/",
    PRESCRIPTION_RECEIVED_BY_PHARMACIST: (prescriptionId: number) =>
      `/ocr/prescriptions/update/${prescriptionId}/`,
  },

  // medicines
  MEDICINES: {
    GET_ALL_LIST: "/medicine/list/",
    GET_MEDICINE_LIST_BY_ID: (id: number) => `/medicine/list/${id}/`,
    GET_MEDICINE_LIST_UPDATE: (id: number | string) =>
      `/medicine/update/${id}/`,
    GET_ALL_PRODUCT_LIST: "/medicine/product/list/",
    GET_PRODUCT_LIST_BY_GENERIC: (productId: number) =>
      `/medicine/medicine-by-generic/?product_id=${productId}`,
    GET_MENU_MEDICINE: "/website/medicine/category/1/",
    GET_BY_MENU_ID: (id: number) => `/website/medicine/${id}/`,
    GET_GROUP_CARE: "/masterapp/care-group/list/",
    GET_GROUP_CARE_BY_ID: (groupId: number) => `/website/group/${groupId}/`,
    GET_MENU_OTHER_MEDICINE: (categoryId: number) =>
      `/website/other/medicine/list/?category_id=${categoryId}`,
    GET_BY_MENU_OTHER_ID: (id: number) => `/website/other/medicine/${id}/`,
    GET_MEDICINE_LIST_BY_GENERIC: (medicineId: number) =>
      `website/generic/medicine/${medicineId}/`,
    GET_CATEGORY_ID_BY_SUBCATEGORY: (
      categoryId: number,
      subCategoryId: number
    ) =>
      `website/medicine/list/?category_id=${categoryId}&sub_category_id=${subCategoryId}`,
  },

  // add to card
  HEALTHBAG: {
    CREATE: "/cart/add/",
    GET_ALL: (id: number) => `/cart/view/${id}/`,
    DELETE: (id: number) => `/cart/delete/${id}/`,
    GET_ADMIN: "/cart/superadmin/buyers/",
    QUANTITY_INCREASE: (cartId: number) =>
      `/cart/quantity/${cartId}/?quantity=Increase`,
    QUANTITY_DECREASE: (cartId: number) =>
      `/cart/quantity/${cartId}/?quantity=Decrease`,
  },

  // add to card
  HEALTHBAG_PHARMACIST: {
    CREATE: "/cart/pharmacist/add/",
    GET_ALL: (id: number) => `/cart/pharmacist/view/${id}/`,
    DELETE: (id: number) => `/cart/pharmacist/delete/${id}/`,
    QUANTITY_INCREASE: (cartId: number) =>
      `/cart/pharmacist/quantity/${cartId}/?quantity=Increase`,
    QUANTITY_DECREASE: (cartId: number) =>
      `/cart/pharmacist/quantity/${cartId}/?quantity=Decrease`,
  },

  PHARMACIST_ORDER: {
    // 🔹 Added Order APIs
    POST_ORDER: (buyerId: number) =>
      `/order/pharmacist/create-order/${buyerId}/`,
    GET_ORDER_BY_ORDERID: (orderId: number) =>
      `/order/pharmacist/list/${orderId}/`,
    GET_ORDER_LIST: "/order/list/",
  },

  // address
  ADDRESS: {
    CREATE: "/address/create/",
    UPDATE: (id: number) => `/address/update/${id}/`,
    GET_ALL: (buyerId: number) => `/address/view/${buyerId}/`,
    GET_BY_ID: (buyerId: number, addressId: number) =>
      `/address/view/${buyerId}/address/${addressId}/`,
    DELETE: (id: number) => `/address/delete/?id=${id}`,
  },

  // Purchase Stock
  PURCHASE_STOCK: {
    CREATE: "/stock/purchase/create/",
    GET_STOCK_LIST_PHARMACY: (id: number) =>
      `/stock/pharmacy/${id}/stock-details/`,
  },
};
