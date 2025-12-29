import { SafetyAdvice } from "@/types/safetyAdvice";
import { MedicineSafety } from "@/types/medicine";

/**
 * Maps SafetyAdvice API entity
 * to Medicine embedded safety model (UI friendly)
 */
export const mapSafetyAdviceToMedicineSafety = (
  apiData: SafetyAdvice
): MedicineSafety => {
  if (!apiData) return {};

  return {
    alcohol: apiData.alcohol,
    alcohol_label: apiData.alcohol_label,

    pregnancy: apiData.pregnancy,
    pregnancy_label: apiData.pregnancy_label,

    breast_feeding: apiData.breast_feeding,
    breast_feeding_label: apiData.breast_feeding_label,

    driving: apiData.driving,
    driving_label: apiData.driving_label,

    kidney: apiData.kidney,
    kidney_label: apiData.kidney_label,

    liver: apiData.liver,
    liver_label: apiData.liver_label,

    heart: apiData.heart,
    heart_label: apiData.heart_label,
  };
};
