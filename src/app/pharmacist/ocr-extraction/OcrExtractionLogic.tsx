"use client";

import AddBillingItemModal from "@/app/components/RetailCounterModal/AddBillingItemModal";
import GenericOptionsModal from "@/app/components/RetailCounterModal/GenericOptionsModal";
import HealthBagModal from "@/app/components/RetailCounterModal/HealthBagModal";
import {
  getMedicineByGenericId,
  getProductByGenericId,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { OptionType } from "@/types/input";
import { Medicine } from "@/types/medicine";
import { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Alert,
  Spinner,
  ListGroup,
  Image,
  Button,
} from "react-bootstrap";
import Tesseract from "tesseract.js";

interface OcrLogicProps {
  imageUrl: string;
  prescriptionId: string;
  buyerEmail?: string | null;
  buyerName?: string | null;
  buyerMobile?: number | null;
  buyerId?: number | null;
}

export default function OcrExtractionLogic({
  imageUrl,
  prescriptionId,
  buyerEmail,
  buyerName,
  buyerMobile,
  buyerId,
}: OcrLogicProps) {
  const dispatch = useAppDispatch();
  const [medicines, setMedicines] = useState<string[]>([]);
  const [loadings, setLoadings] = useState(true);
  const [pdfReady, setPdfReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cart, setCart] = useState<any[]>([]);

  const [selectedGenericId, setSelectedGenericId] = useState<number | null>(
    null
  );
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);

  const {
    medicines: productList,
    genericAlternatives: productListByGeneric,
    loading,
  } = useAppSelector((state) => state.medicine);
  const [selectedMedicines, setSelectedMedicines] = useState<string | null>(
    null
  );
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Medicine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState<Medicine | null>(null);

  const [isHealthBagOpen, setIsHealthBagOpen] = useState(false);

  // Handlers for the new modal
  const handleOpenHealthBag = () => setIsHealthBagOpen(true);
  const handleCloseHealthBag = () => setIsHealthBagOpen(false);

  // Initial product list fetch
  useEffect(() => {
    dispatch(getProductList());
    //dispatch(getPharmacy());
  }, [dispatch]);

  // ✅ Step 1 — Load PDF.js dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/pdfjs/pdf.js";
    script.async = true;

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "/pdfjs/pdf.worker.js";
      console.log("✅ PDF.js loaded successfully");
      setPdfReady(true);
    };

    script.onerror = () => {
      setError("Failed to load PDF.js library");
    };

    document.body.appendChild(script);

    // ✅ Correct cleanup function (return void)
    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // ✅ Step 2 — Convert PDF → Image
  const convertPdfToImage = async (url: string): Promise<string> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjs = (window as any).pdfjsLib;
      const pdfData = await fetch(url).then((res) => res.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.4 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // 🧠 Render for OCR only (not added to DOM)
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Return image for Tesseract to read (not display)
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("PDF to Image conversion failed:", error);
      throw error;
    }
  };

  // ✅ Extract only medicine names
  const extractMedicine = (text: string): string[] => {
    const words = text
      .split(/[\s,«\+\/]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2);

    const finalNames = new Set<string>();

    const knownMedicineParts = {
      Glymprd: "AB Glymprd",
      Aceclo: "Aceclo Plus",
      Glimestar: "Glimestar",
      Altiva: "Altiva",
      Fexova: "Fexova",
    };
    for (const partKey of Object.keys(knownMedicineParts)) {
      // TypeScript ko batane ke liye ki 'partKey' ek valid key hai.
      const key = partKey as keyof typeof knownMedicineParts;

      // Check if any word fragment includes this core medicine part
      for (const word of words) {
        const lowerWord = word.toLowerCase();

        // Agar fragment mein core name mil gaya (e.g., 'Aed Altiva' mein 'Altiva' mil gaya)
        if (lowerWord.includes(key.toLowerCase())) {
          // Guaranteed clean name add karo (e.g., 'Altiva').
          finalNames.add(knownMedicineParts[key]);
          break; // Is medicine ko check kar liya, next par chalo
        }
      }
    }

    // 4. Return the unique, sorted list.
    return Array.from(finalNames).sort();
  };
  // ✅ Run OCR
  const runOCR = useCallback(async () => {
    try {
      setLoadings(true);
      let processedImage = imageUrl;
      if (imageUrl.toLowerCase().endsWith(".pdf")) {
        processedImage = await convertPdfToImage(imageUrl);
      }

      const worker = await Tesseract.createWorker("eng");
      const result = await worker.recognize(processedImage);
      await worker.terminate();

      const meds = extractMedicine(result.data.text);
      setMedicines(meds);
    } catch (err) {
      console.error(err);
      setError("OCR processing failed.");
    } finally {
      setLoadings(false);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl) return;
    if (imageUrl.endsWith(".pdf") && !pdfReady) return;
    runOCR();
  }, [imageUrl, pdfReady]);

  const handleMedicineClick = async (medName: string) => {
    setSelectedMedicine(medName); // 1. Match Product

    const matched = productList.find((item) =>
      item.medicine_name?.toLowerCase().includes(medName.toLowerCase())
    );

    console.log("matched", matched);
    if (!matched) {
      alert(`No matching product found for ${medName}`);
      return;
    }
    setSelectedProduct(matched); // 2. Check Category and Decide Workflow

    const categoryId = matched.category_id;
    const productId = matched.id;

    if (categoryId === 1) {
      // 🅰️ Category 1: Needs Generic Alternatives Modal
      // ID existence check (required for dispatch)
      if (productId) {
        // ID paas karo (Number() me convert karke for safety)
        dispatch(getProductByGenericId(Number(productId))); // Open Generic Options Modal
        setIsModalOpen(true);
      } else {
        console.error("Product ID is missing for category 1:", matched);
        alert("Error: Product ID missing for fetching alternatives.");
      }
    } else {
      // 🅱️ Other Categories: Direct to Billing/Qty Modal
      // setItemToConfirm mein matched product ko daalo
      handleSkipGenericModal(matched); // isQtyModalOpen ab handleSkipGenericModal ke andar open hoga
    }
  };

  const handleSkipGenericModal = (item: Medicine) => {
    const itemWithGeneric = {
      ...item,
      generic_name: item.generic_name || item.GenericName || "N/A",
    };
    console.log("📦 handleSkipGenericModal itemWithGeneric:", itemWithGeneric);
    setItemToConfirm(itemWithGeneric);
    setIsQtyModalOpen(true);
  };
  const handleCloseQtyModal = () => {
    setIsQtyModalOpen(false);
    setItemToConfirm(null);
  }; // Final Add to Cart handler (From Qty Modal)

  //   const handleSelectMedicine = (selectedOption: OptionType | null) => {
  //     if (selectedOption) {
  //       const selectedMedicines = productList.find(
  //         (m) => m.id === selectedOption.value
  //       );
  //       if (
  //         !selectedMedicine ||
  //         typeof selectedMedicine.category_id === "undefined"
  //       ) {
  //         console.error("Selected medicine or category_id is missing.");
  //         return;
  //       }

  //       const genericId = selectedMedicine.id;
  //       const categoryId = selectedMedicine.category_id;
  //       setSelectedGenericId(null);
  //       setSelectedMedicines(selectedMedicines);
  //       if (categoryId === 1) {
  //         dispatch(getProductByGenericId(genericId));
  //         setSelectedGenericId(genericId);
  //       } else {
  //         handleSkipGenericModal(selectedMedicines);
  //       }
  //     } else {
  //       setSelectedGenericId(null);
  //       setSelectedMedicines(null);
  //       setIsModalOpen(false);
  //       setIsQtyModalOpen(false);
  //       setItemToConfirm(null);
  //     }
  //   };

  // Final Add to Cart handler (From Qty Modal)
  // Final Add to Cart handler (From Qty Modal)
  // OcrExtractionLogic.tsx mein handleFinalAddToCart function ko aise update karo:

  // OcrExtractionLogic.tsx mein handleFinalAddToCart function

  const handleFinalAddToCart = (
    item: Medicine,
    qty: number,
    doseForm: string,
    remarks: string
  ) => {
    const mrp = item.MRP || 0;

    const itemToAdd = {
      ...item,
      dose_form: doseForm,
      qty: qty,
      remarks: remarks, // unitPrice aur price ab seedha number (mrp) ko use kar rahe hain
      unitPrice: mrp,
      price: mrp * qty,
      generic_name: item.generic_name || item.GenericName || "N/A",
      pack_size: item.pack_size || "N/A",
      cartItemId: Date.now() + Math.random(),
    };

    console.log("🧾 handleFinalAddToCart itemToAdd:", itemToAdd);
    setCart((prevCart) => {
      return [...prevCart, itemToAdd];
    });
    handleCloseQtyModal();
    setSelectedMedicine(null);
    handleOpenHealthBag();
  };

  // Update handleSelectAlternative (Must call handleCloseQtyModal to close first modal)
  const handleSelectAlternative = (item: Medicine) => {
    console.log("📦 handleSelectAlternative (from GenericOptionsModal):", item);
    setIsModalOpen(false);
    setItemToConfirm(item); // item should already include generic_name after fix #1
    setIsQtyModalOpen(true);
  };

  const handleBackToGeneric = () => {
    setIsQtyModalOpen(false);
    setIsModalOpen(true);
  };
  return (
    <Row>
      {/* LEFT: Medicines */}
      <Col md={6}>
        <h5 className="mb-3">Detected Medicines</h5>
        {/* 🎯 Health Bag Button */}
        <button
          className="btn btn-primary px-4 mb-2"
          onClick={handleOpenHealthBag}
          disabled={cart.length === 0}
        >
          🛒 Health Bag ({cart.length})
        </button>
        {loadings && (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Extracting medicines...</p>
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loadings && !error && medicines.length > 0 && (
          <ListGroup>
            {medicines.map((med, index) => (
              <ListGroup.Item
                action
                key={index}
                onClick={() => handleMedicineClick(med)}
              >
                {med}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        {!loadings && !error && medicines.length === 0 && (
          <Alert variant="warning">No medicines detected.</Alert>
        )}
      </Col>

      {/* RIGHT: PDF or Image Preview */}
      <Col md={6}>
        <h4>Prescription (ID: {prescriptionId})</h4>

        {imageUrl.toLowerCase().endsWith(".pdf") ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "85vh",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {/* ✅ Clean single-view PDF preview */}
            <object
              data={`${imageUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              type="application/pdf"
              width="100%"
              height="100%"
            >
              <iframe
                src={`${imageUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Prescription PDF Preview"
              ></iframe>
            </object>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Image
              src={imageUrl}
              alt="Prescription"
              style={{
                width: "100%",
                height: "85vh",
                objectFit: "contain",
                display: "block",
                background: "#f8f9fa",
              }}
            />
          </div>
        )}
      </Col>
      <GenericOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productListByGeneric={productListByGeneric}
        loading={loading}
        onAddToCart={handleSelectAlternative}
        selectedOriginalItem={selectedProduct}
      />
      {/* 2. ✅ New Qty/Dose Form Modal */}
      <AddBillingItemModal
        isOpen={isQtyModalOpen}
        onClose={handleCloseQtyModal}
        item={itemToConfirm}
        onConfirmAdd={handleFinalAddToCart}
        onBack={handleBackToGeneric}
      />
      <HealthBagModal
        isOpen={isHealthBagOpen}
        onClose={handleCloseHealthBag}
        cartItems={cart} // Cart data yahan se paas ho raha hai
        // Agar tum remove functionality chahte ho toh:
        // onRemoveItem={(itemId) => setCart(cart.filter(item => item.cartItemId !== itemId))}
      />
    </Row>
  );
}
