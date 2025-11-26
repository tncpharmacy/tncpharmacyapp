import { jwtDecode } from "jwt-decode";
import { safeLocalStorage } from "./safeLocalStorage";

interface BuyerTokenPayload {
  id: number;
  name: string;
  email: string;
  number: string;
  uhid: string;
  exp: number; // expiry timestamp
}

/**
 * ✅ Safely load and decode buyer token
 */
export const loadBuyerFromToken = (): BuyerTokenPayload | null => {
  try {
    // 🔹 Run only in browser
    if (typeof window === "undefined") return null;

    const access = safeLocalStorage.getItem("buyerAccessToken");
    if (!access) return null;

    // 🔹 Validate JWT format before decoding
    const parts = access.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid JWT format found in buyerAccessToken");
      safeLocalStorage.removeItem("buyerAccessToken");
      safeLocalStorage.removeItem("buyerRefreshToken");
      return null;
    }

    // 🔹 Decode token
    const decoded = jwtDecode<BuyerTokenPayload>(access);

    // 🔹 Check expiry
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn("Buyer access token expired — removing it.");
      safeLocalStorage.removeItem("buyerAccessToken");
      safeLocalStorage.removeItem("buyerRefreshToken");
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("Failed to decode buyer token:", err);
    safeLocalStorage.removeItem("buyerAccessToken");
    safeLocalStorage.removeItem("buyerRefreshToken");
    return null;
  }
};
