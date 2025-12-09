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
import healthBagPharmacistReducer from "@/lib/features/healthBagPharmacistSlice/healthBagPharmacistSlice";
import addressReducer from "@/lib/features/addressSlice/addressSlice";
import prescriptionReducer from "@/lib/features/prescriptionSlice/prescriptionSlice";
import pharmacistPrescriptionReducer from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";
import pharmacistOrderReducer from "@/lib/features/pharmacistOrderSlice/pharmacistOrderSlice";
import pharmacistBuyerListReducer from "@/lib/features/pharmacistBuyerListSlice/pharmacistBuyerListSlice";
import healthBagBuyerByPharmacistReducer from "@/lib/features/healthBagBuyerByPharmacistSlice/healthBagBuyerByPharmacistSlice";
import supplierReducer from "@/lib/features/supplierSlice/supplierSlice";

//
// ✅ STEP 1 — Load preloaded state from localStorage
//
const loadState = () => {
  // ✅ FIX: Prevent crash during SSR
  if (typeof window === "undefined") return undefined;

  try {
    const user = window.localStorage.getItem("user");
    const accessToken = window.localStorage.getItem("accessToken");
    const refreshToken = window.localStorage.getItem("refreshToken");

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
    prescription: prescriptionReducer,
    pharmacistPrescription: pharmacistPrescriptionReducer,
    healthBagPharmacist: healthBagPharmacistReducer,
    pharmacistOrder: pharmacistOrderReducer,
    pharmacistBuyerList: pharmacistBuyerListReducer,
    healthBagBuyerByPharmacist: healthBagBuyerByPharmacistReducer,
    supplier: supplierReducer,
  },
  preloadedState: loadState(), // ✅ instant load on refresh
});

//
// ✅ STEP 3 — Export types
//
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
