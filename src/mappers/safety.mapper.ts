import { SafetyAdvice, SafetyLabel } from "@/types/safetyAdvice";
import { MedicineSafety } from "@/types/medicine";

export const mapSafetyAdvice = (
  apiData: SafetyAdvice,
  safetyLabels?: SafetyLabel[]
): SafetyAdvice | MedicineSafety => {
  if (!apiData) return {};

  // 🔹 Agar labels nahi mile → simple SafetyAdvice return
  if (!safetyLabels) {
    return { ...apiData };
  }

  // 🔹 Helper
  const getLabel = (id: number | null) =>
    safetyLabels.find((l) => l.id_safetylabel === id) || null;

  // 🔹 UI friendly MedicineSafety
  return {
    alcohol: apiData.alcohol,
    alcohol_label: getLabel(apiData.alcohol_label),

    pregnancy: apiData.pregnancy,
    pregnancy_label: getLabel(apiData.pregnancy_label),

    breast_feeding: apiData.breast_feeding,
    breast_feeding_label: getLabel(apiData.breast_feeding_label),

    driving: apiData.driving,
    driving_label: getLabel(apiData.driving_label),

    kidney: apiData.kidney,
    kidney_label: getLabel(apiData.kidney_label),

    liver: apiData.liver,
    liver_label: getLabel(apiData.liver_label),

    heart: apiData.heart,
    heart_label: getLabel(apiData.heart_label),
  };
};
