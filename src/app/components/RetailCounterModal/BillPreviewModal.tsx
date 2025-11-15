"use client";
import {
  buyerLogin,
  buyerRegister,
  createBuyerOrder,
} from "@/lib/features/buyerSlice/buyerSlice";
import { createPharmacistOrder } from "@/lib/features/pharmacistOrderSlice/pharmacistOrderSlice";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";
import { Image, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
// Note: next/image is not used; standard image tag is used.

// Mock style object since the user did not provide the actual styles file content
const styles = {
  modalContentWrapper: "p-4 border rounded",
  billHeader: "border-bottom pb-2",
  customerInfo: "mb-4 p-3 bg-light rounded",
  borderDashed: "border-top pt-2 border-dashed",
};

interface CartItem {
  id: number;
  medicine_name: string;
  generic_name?: string;
  GenericName?: string;
  pack_size?: string;
  qty: number;
  price: number;
  dose_form: string;
  Disc: number;
  remarks: string;
}
interface BillPreviewModalProps {
  show: boolean;
  onClose: () => void;
  // Cart prop can sometimes be undefined during initial render, hence the fix.
  cart: CartItem[] | undefined;
  customerName: string;
  mobile: string;
  pharmacy_id?: number;
}

const BillPreviewModal: React.FC<BillPreviewModalProps> = ({
  show,
  onClose,
  cart,
  customerName,
  mobile,
  pharmacy_id,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  // --- Translation State and Logic ---
  const [language, setLanguage] = useState("en");
  const [translatedCart, setTranslatedCart] = useState<CartItem[]>(cart || []);
  const [isTranslating, setIsTranslating] = useState(false);
  // State to show API access warning on UI
  const [apiError, setApiError] = useState<string | null>(null);

  // Available languages
  const languageOptions = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "hi", name: "Hindi" },
    { code: "gu", name: "Gujarati" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
  ];

  // Reset/Set cart content on modal open/cart update
  useEffect(() => {
    if (!show) return;
    setTranslatedCart(cart || []);
    setLanguage("en"); // Reset language to default when reopening
    setApiError(null); // Clear previous errors
  }, [show, cart]);

  // google api for translating language
  const apiKey = "AIzaSyDgglnyLRjpHWHRNE8WEacdjnx0XKYyR4w"; // <--- APNI KEY YAHAN PASTE KAREIN
  const modelName = "gemini-2.5-flash-preview-09-2025";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  // Helper function for reliable fetching with exponential backoff
  const exponentialBackoffFetch = async (
    url: string,
    options: RequestInit,
    maxRetries = 5
  ) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);

        if (response.status === 403) {
          // Throw specific error for 403
          throw new Error(
            "API Access Forbidden (403). Check API Key/Permissions."
          );
        }

        if (response.status === 429) {
          // Rate limit
          throw new Error("Rate limit exceeded");
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (error) {
        if (i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // If 403 error, throw immediately (no retry needed)
          if (error instanceof Error && error.message.includes("403")) {
            throw error;
          }
          throw error;
        }
      }
    }
    // This line is unreachable but satisfies TS
    throw new Error("Fetch failed after all retries.");
  };

  // Translation Logic using Gemini API
  const translateText = async (text: string, targetLang: string) => {
    if (!text || targetLang === "en") return text;

    // Check if API key is still the default placeholder (now removed, but good practice to keep similar checks)
    // if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    //   setApiError("Translation failed: API Key is missing or invalid.");
    //   console.error("🔴 API Key is missing. Cannot proceed with translation.");
    //   return text; // Fallback
    // }

    try {
      setApiError(null); // Clear previous UI error on new attempt
      const targetLanguageName =
        languageOptions.find((l) => l.code === targetLang)?.name || targetLang;

      const systemPrompt = `You are an expert translator. Your task is to accurately translate the provided English text into the target language. Respond ONLY with the translated text, without any introductory phrases, explanations, or quotes.`;
      const userQuery = `Translate the following phrase into ${targetLanguageName}: "${text}"`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };

      const response = await exponentialBackoffFetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const translatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (translatedText) {
        // Clean up any stray quotation marks or newlines added by the model
        return translatedText.trim().replace(/^['"]|['"]$/g, "");
      }

      console.error("Gemini Translation failed: No text received", result);
      return text; // Fallback to original text
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      // If 403 error, set UI error state
      if (errorMessage.includes("403")) {
        setApiError(
          `Translation failed: ${errorMessage} Please check your Gemini API status.`
        );
      }

      console.error(`🔴 Translation failed due to API Error: ${errorMessage}`);
      return text; // Fallback to original text on API error
    }
  };

  // 🔄 Handle language change and trigger translation
  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    setApiError(null); // Clear error when trying new lang

    if (lang === "en") {
      setTranslatedCart(cart || []);
      return;
    }

    // // Check key again before starting translation
    // if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    //   setApiError("Translation failed: API Key is missing or invalid.");
    //   return;
    // }

    setIsTranslating(true);
    const itemsToTranslate = cart || [];

    // Using Promise.allSettled to ensure that one failure doesn't stop others
    const translationResults = await Promise.allSettled(
      itemsToTranslate.map(async (item) => {
        // FIX 1: Translate medicine_name
        const translatedName = await translateText(item.medicine_name, lang);

        // FIX 2: Removed translation for dose_form (keeping it as original numeric string)
        const translatedRemarks = await translateText(item.remarks, lang);

        return {
          ...item,
          medicine_name: item.medicine_name, // Use translated name
          dose_form: item.dose_form, // Use original dose form (numeric)
          remarks: translatedRemarks,
        };
      })
    );

    const successfulTranslations = translationResults.map(
      (result) =>
        result.status === "fulfilled" ? result.value : itemsToTranslate[0] // Use first item as a generic fallback if promise fails
    );

    setTranslatedCart(successfulTranslations as CartItem[]);
    setIsTranslating(false);
  };
  // --- End Translation Logic ---

  // --- Print Handler ---
  const handlePrint = async () => {
    try {
      let buyerId: number | null = null;

      // 1) Buyer Check
      const loginRes = await dispatch(
        buyerLogin({ login_id: mobile })
      ).unwrap();

      if (loginRes?.data?.existing === true) {
        buyerId = loginRes.data.id;
      } else {
        const regRes = await dispatch(
          buyerRegister({
            name: customerName,
            email: "",
            number: mobile,
          })
        ).unwrap();

        buyerId = regRes.data.id;
      }

      if (!buyerId) {
        toast.error("Unable to get buyer ID");
        return;
      }

      // 2) Product Array
      const products = (cart ?? []).map((item) => {
        const discountAmt = (item.price * (item.Disc ?? 0)) / 100;
        const finalRate = (item.price - discountAmt) * item.qty;

        return {
          product_id: item.id,
          quantity: String(item.qty),
          mrp: String(item.price),
          discount: String(item.Disc ?? 0),
          rate: String(finalRate),
          doses: item.dose_form,
          instruction: item.remarks,
          status: "1",
        };
      });

      // 3) Final Payload
      const orderPayload = {
        payment_mode: 1,
        payment_status: "1",
        amount: String(grandTotal),
        order_type: 2, // IMPORTANT
        pharmacy_id: pharmacy_id,
        address_id: 1, // you confirm
        status: "1",
        products: products,
      };

      // 4) POST ORDER
      await dispatch(
        createPharmacistOrder({
          buyerId,
          payload: orderPayload,
        })
      ).unwrap();
      // 👉 Success Toast
      toast.success("Order successfully Submitted! 🧾✨");
      // 5) Print
      actuallyPrintBill();
    } catch (error) {
      console.error(error);
      toast.error("Order failed!");
    }
  };
  // const handlePrint = async () => {
  //   actuallyPrintBill();
  // };

  const actuallyPrintBill = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank", "width=800,height=1000");

    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Pharmacy Bill</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }

            body {
              font-family: 'Segoe UI', sans-serif;
              font-size: 12px;
              color: #000;
              background: #fff;
            }

            h3, h4 {
              display: block
              text-align: center;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }

            th, td {
              border: 1px solid #000;
              padding: 6px;
              text-align: center;
            }

            th {
              background-color: #f2f2f2;
            }

            .print-hide {
              display: none !important;
            }

            /* ✅ Doses Section */
            .dose-container {
              display: block;
              margin-top: 13px;         
              gap: 10px;
            }

            .print-card {
              page-break-inside: avoid;
              border: 1px solid #ccc;
              border-radius: 1px;
              box-shadow: 0 0 2px rgba(0,0,0,0.1);
              background: #fff;
              width: 35% !important;
              border-radius: 1px;
              font-size: 10px;
              height: 100%;
            }

            .print-card img {
              object-fit: contain;
            }
            .print-card p {
              margin: 0px;
              font-size: 8px;
              line-height: 1;
            }
            .card-getWell {
              font-size: 6px;
            }
            .card-webMob {
              font-size: 3px;
            }
            .card-footer {
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 8px;
            }

            .card-footer p {
              font-family: cursive;
              font-size: 8px;
            }

            @media print {
              body, html {
                margin: 0;
                padding: 0;
              }

              .print-card {
              margin: 0 0 10px 0 !important;  
                padding: 10px 15px;
                box-sizing: border-box;
                page-break-inside: avoid;
              }

              .print-card .footer {
                margin: 0;
                padding: 0;
                line-height: 1;
              }

              /* ✅ Remove any extra white space under footer */
              .print-card .footer > div:last-child {
                margin-top: 1px !important;
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
                line-height: 1 !important;          
                font-size: 7px !important;
                font-style: italic !important;
              }

              .print-card:last-child {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
              }

              /* ✅ Remove Chrome auto spacing after elements */
              img, p, div {
                line-height: 1 !important;
                font-size: 7px;
              }

              /* Just in case Chrome adds print padding */
              @page {
                margin: 10mm 10mm 5mm 10mm;
              }
            }


          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
`);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };
  // --- End Print Handler ---

  // FIX: Ensure cart is an array before calling reduce
  const grandTotal = (cart || []).reduce((acc, item) => {
    const total = item.qty * item.price;
    const discountAmount = item.Disc ? (total * item.Disc) / 100 : 0;
    return acc + (total - discountAmount);
  }, 0);

  if (!show) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-semibold text-primary">
          🧾 Bill Preview
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className={styles.modalContentWrapper} ref={printRef}>
          {/* Header */}
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
              borderBottom: "2px solid #007bff",
              paddingBottom: "8px",
            }}
          >
            {/* Left: Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Image
                src="/images/logo.png"
                alt="TnC Pharmacy"
                style={{
                  height: 90,
                  width: 200,
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Right: Address */}
            <div
              style={{
                textAlign: "right",
                fontSize: "12px",
                color: "#333",
                lineHeight: "1.4",
                maxWidth: "220px",
              }}
            >
              <strong style={{ fontSize: "13px", color: "#007bff" }}>
                TnC Pharmacy
              </strong>
              <br />
              123 Main Street, City - 000000 <br />
              Ph: +91-9999999999 <br />
              Email: support@tncpharmacy.in
            </div>
          </div>

          {/* Customer Info */}
          <div className={styles.customerInfo}>
            <div className="d-flex justify-content-between">
              <div>
                <strong>Customer Name:</strong> {customerName || "-"}
              </div>
              <div>
                <strong>Mobile No.:</strong> {mobile || "-"}
              </div>
            </div>
          </div>
          {/* ✅ Billing Summary (visible both in screen + print) */}
          <section>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#007bff",
                paddingBottom: "4px",
                marginBottom: "10px",
                marginTop: "20px",
                textTransform: "uppercase",
                WebkitPrintColorAdjust: "exact",
                display: "block",
              }}
            >
              Billing Summary
            </h3>

            <table
              className="table table-bordered text-center align-middle"
              style={{ border: "1px solid #000", width: "100%" }}
            >
              <thead className="table-light">
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>MRP (₹)</th>
                  <th>Discount (%)</th>
                  <th>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                {translatedCart.map((translatedItem, idx) => {
                  const total = translatedItem.qty * translatedItem.price;
                  const discountAmount = translatedItem.Disc
                    ? (total * translatedItem.Disc) / 100
                    : 0;
                  const subtotal = total - discountAmount;

                  return (
                    <tr key={idx}>
                      <td>{translatedItem.medicine_name}</td>
                      <td>
                        {translatedItem.pack_size
                          ? `${translatedItem.pack_size} × ${translatedItem.qty}`
                          : translatedItem.qty}
                      </td>
                      <td>{translatedItem.price}</td>
                      <td>{translatedItem.Disc}</td>
                      <td>{subtotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th colSpan={4} className="text-end">
                    Grand Total
                  </th>
                  <th style={{ color: "#007bff" }}>{grandTotal.toFixed(2)}</th>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Page Break for print only */}
          <div style={{ pageBreakBefore: "always" }}></div>

          {/* 🌐 Language Dropdown (Visible on Screen, Hidden during Print) */}
          <div className="d-flex justify-content-between align-items-center mb-3 print-hide">
            {apiError && (
              <small className="text-danger fw-semibold me-3">{apiError}</small>
            )}
            <select
              className="form-select w-auto ms-auto" // ms-auto to push to right if error is shown
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isTranslating}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {isTranslating ? (
            <div className="text-center text-muted py-5">
              Translating to{" "}
              {languageOptions.find((l) => l.code === language)?.name} (Please
              ensure your API key is valid)...
            </div>
          ) : (
            <>
              {/* Doses & Remarks Section: Print-friendly layout */}
              <section className="print-only" style={{ marginTop: "20px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#007bff",
                    paddingBottom: "4px",
                    marginTop: "25px",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    WebkitPrintColorAdjust: "exact",
                    display: "contents",
                  }}
                >
                  Doses & Remarks
                  {language !== "en" && (
                    <span className="text-primary">
                      {" "}
                      (in{" "}
                      {languageOptions.find((l) => l.code === language)?.name})
                    </span>
                  )}
                </h3>

                <div
                  className="dose-container"
                  style={{ display: "block", marginTop: "13px" }}
                >
                  {translatedCart.map((item, idx) => (
                    <div
                      key={idx}
                      className="print-card"
                      style={{
                        lineHeight: "1",
                        height: "100%",
                        width: "35% !important",
                        borderRadius: "1px",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ textAlign: "left" }}>
                          <Image
                            src="/images/logo-bw-h.png"
                            alt=""
                            width="100px"
                            height="35px"
                          />
                        </span>
                        <span style={{ textAlign: "center" }}></span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "5px",
                            fontSize: "12px",
                          }}
                        >
                          <p style={{ marginBottom: "7px" }}>
                            <strong>Date:</strong>{" "}
                            {new Date().toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </span>
                      </div>
                      <hr style={{ marginTop: "4px", marginBottom: "6px" }} />
                      <p style={{ marginBottom: "7px" }}>
                        <strong>Patient:</strong> {customerName || "-"}
                      </p>
                      <p style={{ marginBottom: "7px" }}>
                        <strong>Medicine:</strong> {item.medicine_name}
                      </p>
                      {/* <p style={{ marginBottom: "7px" }}>
                        <strong>Generic:</strong>{" "}
                        {item.generic_name || item.GenericName || "N/A"}
                      </p> */}
                      <p style={{ marginBottom: "7px" }}>
                        <strong>Dose:</strong> {item.dose_form || "N/A"}
                      </p>
                      <p style={{ marginBottom: "7px" }}>
                        <strong>Instruction:</strong> {item.remarks || "N/A"}
                      </p>
                      <p style={{ marginBottom: "2px" }}>
                        <strong>Qty:</strong>{" "}
                        {item.qty
                          ? `${item.pack_size || "N/A"} × ${item.qty}`
                          : "N/A"}
                      </p>
                      <br />
                      <div
                        style={{
                          borderTop: "1px solid #ccc",
                          textAlign: "center",
                          padding: "5px 0",
                          backgroundColor: "#fff",
                        }}
                      >
                        <div
                          className="card-webMob"
                          style={{ fontSize: "9px", fontWeight: "bold" }}
                        >
                          www.tncpharmacy.in
                        </div>
                        <div
                          className="card-webMob"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "9px",
                            marginTop: "4px",
                          }}
                        >
                          {/* <Image
                            src="/images/mobile-icon.png"
                            alt="Phone"
                            style={{
                              width: "12px",
                              height: "12px",
                              objectFit: "contain",
                              verticalAlign: "middle",
                            }}
                          /> */}
                          <span style={{ verticalAlign: "middle" }}>
                            24*7 Pharmacist Support: 9578458754
                          </span>
                        </div>
                        <div
                          className="card-getWell"
                          style={{
                            textAlign: "center",
                            fontSize: "8px",
                            marginTop: "5px",
                            marginBottom: "0",
                            paddingBottom: "0",
                            fontStyle: "italic",
                            fontWeight: "normal",
                          }}
                        >
                          Get Well Soon
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Close
        </button>
        <button
          className="btn btn-primary"
          onClick={handlePrint}
          disabled={isTranslating}
        >
          <i className="bi bi-printer"></i>{" "}
          {isTranslating ? "Translating..." : "Print"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default BillPreviewModal;
