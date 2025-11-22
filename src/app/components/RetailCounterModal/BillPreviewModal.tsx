"use client";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";
import { Image, Modal } from "react-bootstrap";

// Mock style object
const styles = {
  modalContentWrapper: "p-4 border rounded",
  customerInfo: "mb-4 p-3 bg-light rounded",
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
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const [language, setLanguage] = useState("en");
  const [translatedCart, setTranslatedCart] = useState<CartItem[]>(cart || []);
  const [isTranslating, setIsTranslating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;
    setTranslatedCart(cart || []);
    setLanguage("en");
    setApiError(null);
  }, [show, cart]);

  // 🔵 PRINT BILL — ONLY BILL SECTION
  const handlePrintBill = () => {
    const bill = printRef.current;
    if (!bill) return;

    const billHtml = bill.querySelector(".bill-section")?.innerHTML || "";

    const win = window.open("", "_blank", "width=800,height=1000");
    if (!win) return; // <-- FIX

    win.document.write(`
    <html>
      <head>
        <title>Bill</title>
        <style>
          body { font-family: Arial; padding: 10px; }
          table, th, td { border:1px solid #000; border-collapse: collapse; }
          th, td { padding:6px; }
          @page { size: A4; margin:10mm; }
        </style>
      </head>
      <body>
        ${billHtml}
      </body>
    </html>
  `);

    win.document.close();
    win.print();
    win.close();
  };

  // 🟡 PRINT LABEL — ONLY CARD SECTION
  const handlePrintLabel = () => {
    const bill = printRef.current;
    if (!bill) return;

    const cardHtml = bill.querySelector(".card-section")?.innerHTML || "";

    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;

    win.document.write(`
    <html>
    <head>
      <title>Label</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 60mm !important;
          height: 50mm !important;
          padding: 0;
          margin: 0 !important;
          background: #fff !important;
        }

        /* Remove all outer container shadow/margins */
        body > div, body > * {
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: #fff !important;
        }

        .print-card {
          width: 60mm !important;
          height: 50mm !important;
          padding: 2px 3px !important;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          page-break-inside: avoid !important;
          break-inside: avoid-page !important;
          border: none !important;
          box-shadow: none !important;
          background: #fff !important;
        }

        .label-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-line {
          border-top: 1px solid #000;
          margin: 1px 0 2px 0;
        }

        p {
          font-size: 8px !important;
          line-height: 1.05 !important;
          margin: 1px 0 !important;
        }

        .date-text {
          font-size: 7px !important;
        }

        .footer-line {
          border-top: 1px solid #000;
          margin: 2px 0 1px 0 !important;
        }

        .footer-website,
        .footer-support {
          font-size: 9px !important;
          text-align: center;
          line-height: 1 !important;
          margin: 0 !important;
        }

        .footer-wish {
          font-size: 8px !important;
          text-align: center;
          font-style: italic;
          margin: 0 !important;
        }

        @page {
          size: 60mm 50mm;
          margin: 0;
        }
      </style>
    </head>

    <body>
      <div class="print-card">
        ${cardHtml}
      </div>
    </body>
    </html>
  `);

    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

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
          {/* ---------------- BILL SECTION (ONLY FOR PRINT BILL) ---------------- */}
          <div className="bill-section">
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Image
                  src="/images/logo.png"
                  alt="TnC Pharmacy"
                  style={{ height: 90, width: 200, objectFit: "contain" }}
                />
              </div>

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

            {/* Billing Table */}
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#007bff",
                marginBottom: "10px",
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
                {translatedCart.map((item, idx) => {
                  const total = item.qty * item.price;
                  const discountAmount = item.Disc
                    ? (total * item.Disc) / 100
                    : 0;
                  const subtotal = total - discountAmount;

                  return (
                    <tr key={idx}>
                      <td>{item.medicine_name}</td>
                      <td>
                        {item.pack_size
                          ? `${item.pack_size} × ${item.qty}`
                          : item.qty}
                      </td>
                      <td>{item.price}</td>
                      <td>{item.Disc}</td>
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
          </div>

          {/* PAGE BREAK */}
          <div style={{ pageBreakBefore: "always" }}></div>

          {/* ---------------- CARD SECTION (ONLY FOR PRINT LABEL) ---------------- */}
          <div className="card-section" style={{ marginTop: 24 }}>
            {translatedCart.map((item, idx) => (
              <div
                key={idx}
                // SCREEN styling — border visible in modal. For print we inject CSS that removes border.
                style={{
                  width: 220, // purely for modal visual scale
                  border: "1px solid #ccc",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 4,
                  background: "#fff",
                  display: "inline-block",
                }}
              >
                {/* header (modal) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/images/logo-bw-h.png"
                    alt="logo-bw"
                    width={90}
                    height={30}
                  />
                  <p className="date-text" style={{ fontSize: 12, margin: 0 }}>
                    <strong>Date:</strong>{" "}
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* header line (visible in both modal and print) */}
                <div style={{ borderTop: "1px solid #000", margin: "8px 0" }} />

                <p style={{ margin: "2px 0" }}>
                  <strong>Patient:</strong> {customerName}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>UHID:</strong> {"UHID0001"}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Medicine:</strong> {item.medicine_name}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Dose:</strong> {item.dose_form}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Instruction:</strong> {item.remarks}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Qty:</strong>{" "}
                  {item.pack_size
                    ? `${item.pack_size} × ${item.qty}`
                    : item.qty}
                </p>

                {/* footer line (visible in both modal and print) */}
                <div
                  style={{ borderTop: "1px solid #000", margin: "8px 0 6px 0" }}
                />

                {/* footer compact & centered */}
                <p className="footer-website">www.tncpharmacy.in</p>
                <p className="footer-support">24×7 Support: 7042079595</p>
                <p className="footer-wish">Get Well Soon</p>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>

      {/* ---------------- FOOTER ---------------- */}
      <Modal.Footer className="border-0 pt-0">
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Close
        </button>

        {/* 🟡 PRINT LABEL BUTTON */}
        <button className="btn btn-warning" onClick={handlePrintLabel}>
          Print Label
        </button>

        {/* 🔵 PRINT BILL BUTTON */}
        <button className="btn btn-primary" onClick={handlePrintBill}>
          Print Bill
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default BillPreviewModal;
