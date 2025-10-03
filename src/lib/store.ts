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
  },
});

// types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
