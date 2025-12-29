import { MedicineSafety } from "@/types/medicine";
import { SafetyAdvice } from "@/types/safetyAdvice";

export const mapSafetyAdviceToMedicineSafety = (
  apiData: SafetyAdvice
): MedicineSafety => {
  return {
    alcohol: apiData.alcohol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alcohol_label: apiData.alcohol_label as any,

    pregnancy: apiData.pregnancy,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pregnancy_label: apiData.pregnancy_label as any,

    breast_feeding: apiData.breast_feeding,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    breast_feeding_label: apiData.breast_feeding_label as any,

    driving: apiData.driving,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    driving_label: apiData.driving_label as any,

    kidney: apiData.kidney,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kidney_label: apiData.kidney_label as any,

    liver: apiData.liver,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liver_label: apiData.liver_label as any,

    heart: apiData.heart,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    heart_label: apiData.heart_label as any,
  };
};
