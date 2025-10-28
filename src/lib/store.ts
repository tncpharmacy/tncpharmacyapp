import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/features/authSlice/authSlice";
import pharmacyReducer from "@/lib/features/pharmacySlice/pharmacySlice";
import stateReducer from "@/lib/features/stateSlice/stateSlice";
import pharmacistReducer from "@/lib/features/pharmacistSlice/pharmacistSlice";
import pharmacyListReducer from "@/lib/features/pharmacyListSlice/pharmacyListSlice";
import pharmacySelfReducer from "@/lib/features/pharmacySelfSlice/pharmacySelfSlice";
import pharmacistSelfReducer from "@/lib/features/pharmacistSelfSlice/pharmacistSelfSlice";
import pharmacistByPharmacySlice from "@/lib/features/pharmacistByPharmacySlice/pharmacistByPharmacySlice";
import categoryReducer from "@/lib/features/categorySlice/categorySlice";
import subcategoryReducer from "@/lib/features/subCategorySlice/subCategorySlice";
import clinicReducer from "@/lib/features/clinicSlice/clinicSlice";
import unitReducer from "@/lib/features/unitSlice/unitSlice";
import genericReducer from "@/lib/features/genericSlice/genericSlice";
import manufacturerReducer from "@/lib/features/manufacturerSlice/manufacturerSlice";
import medicineReducer from "@/lib/features/medicineSlice/medicineSlice";
import buyerReducer from "@/lib/features/buyerSlice/buyerSlice";
import purchaseReducer from "@/lib/features/purchaseStockSlice/purchaseStockSlice";
import healthBagReducer from "@/lib/features/healthBagSlice/healthBagSlice";
import addressReducer from "@/lib/features/addressSlice/addressSlice";

//
// ✅ STEP 1 — Load preloaded state from localStorage
//
const loadState = () => {
  try {
    const user = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (user && accessToken) {
      return {
        auth: {
          user: JSON.parse(user),
          accessToken,
          refreshToken,
          isAuthenticated: true,
          loading: false,
          error: null,
          restoreComplete: true,
        },
      };
    }
  } catch (err) {
    console.warn("Failed to load persisted auth state:", err);
  }

  return undefined;
};

//
// ✅ STEP 2 — Configure store with preloadedState
//
export const store = configureStore({
  reducer: {
    auth: authReducer,
    pharmacy: pharmacyReducer,
    states: stateReducer,
    pharmacist: pharmacistReducer,
    pharmacyList: pharmacyListReducer,
    selfPharmacy: pharmacySelfReducer,
    selfPharmacist: pharmacistSelfReducer,
    pharmacistByPharmacy: pharmacistByPharmacySlice,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    clinicList: clinicReducer,
    unit: unitReducer,
    generic: genericReducer,
    manufacturer: manufacturerReducer,
    medicine: medicineReducer,
    buyer: buyerReducer,
    purchaseStock: purchaseReducer,
    healthBag: healthBagReducer,
    address: addressReducer,
  },
  preloadedState: loadState(), // ✅ instant load on refresh
});

//
// ✅ STEP 3 — Export types
//
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
