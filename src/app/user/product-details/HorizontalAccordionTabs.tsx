import { getMedicineByGenericId } from "@/lib/features/medicineSlice/medicineSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { encodeId } from "@/lib/utils/encodeDecode";
import { formatAmount } from "@/lib/utils/formatAmount";
import { Medicine } from "@/types/medicine";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
interface IDProps {
  id: number;
}
interface GenericListProps {
  genericListByMedicine: Medicine[];
}
const HorizontalAccordionTabs: React.FC<IDProps> = ({ id }) => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useAppDispatch();
  const contentRef = useRef<HTMLDivElement>(null);
  const genericListByMedicineRaw = useAppSelector(
    (state) => state.medicine.genericAlternativesMedicines
  );
  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  const genericListByMedicine: Medicine[] = Array.isArray(
    genericListByMedicineRaw
  )
    ? genericListByMedicineRaw
    : genericListByMedicineRaw
    ? [genericListByMedicineRaw]
    : [];

  useEffect(() => {
    if (id) dispatch(getMedicineByGenericId(id));
  }, [id]);
  // Header Button के लिए Styles (BG और Shadow हटा दिया गया)
  const headerButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    boxShadow: "none",
    borderBottom: isOpen ? "1px solid #dee2e6" : "none",
  };

  // Header h2 के लिए Styles
  const headerH2Style: React.CSSProperties = {
    marginBottom: "0",
  };

  // Accordion Body के लिए Dynamic Styles
  const bodyStyle: React.CSSProperties = {
    transition: "max-height 0.5s ease-in-out",
    overflow: "hidden",
    maxHeight: isOpen ? "1000px" : "0px", // large enough
  };

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.parentElement!.style.maxHeight =
        contentRef.current.scrollHeight + "px";
    }
  }, [isOpen, genericListByMedicine.length]);

  return (
    <div className="accordion" id="singleAccordionExample">
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingOne" style={headerH2Style}>
          <button
            // 'collapsed' class हटा दिया क्योंकि हम अब JS से animation control कर रहे हैं
            className={`accordion-button ${isOpen ? "" : "collapsed"} fw-bold`}
            type="button"
            onClick={toggleAccordion}
            aria-expanded={isOpen}
            // aria-controls="collapseOne"
            style={headerButtonStyle}
          >
            TnC Trusted Generic
          </button>
        </h2>

        {/* Accordion Body - Now controlled by React max-height transition */}
        <div
          id="collapseOne"
          // Bootstrap collapse classes हटा दें (Smoothness के लिए)
          className="accordion-collapse"
          aria-labelledby="headingOne"
          data-bs-parent="#singleAccordionExample"
          style={bodyStyle} // Dynamic max-height style apply किया गया
        >
          {/* Content Wrapper को ref दें */}
          <div className="accordion-body" ref={contentRef}>
            <div className="view_box">
              <div id="all-alternative">
                <div className="col-12">
                  <div className="mb-3">
                    <div className="sec_title">All Generic Strength</div>
                    <div className="descr">
                      For informational purposes only. Consult a doctor before
                      taking any medicines.
                    </div>
                    {/* Items को फुल width (w-50 हटा दिया) */}
                    {genericListByMedicine.map((item) => {
                      // 1️⃣ Random MRP generate (80 to 500)
                      // const randomMRP =
                      //   Math.floor(Math.random() * (500 - 80 + 1)) + 80;

                      const mrp = Number(item.mrp ?? 0);
                      const discount = Number(item.discount ?? 0);
                      const discountedPrice = mrp - (mrp * discount) / 100;
                      const perCapsule = (
                        discountedPrice / item.pack_qty
                      ).toFixed(2);
                      const unitCode =
                        item.pack_size?.match(/[A-Z]+/)?.[0] || "";
                      const unitMap: Record<string, string> = {
                        CAP: "capsule",
                        TAB: "tablet",
                      };

                      const unit = unitMap[unitCode] || unitCode.toLowerCase();

                      return (
                        <div
                          className="d-flex justify-content-between align-items-center my-2"
                          key={item.id}
                          style={{
                            borderBottom: "1px solid #eee",
                            paddingBottom: "8px",
                            paddingTop: "8px",
                          }}
                        >
                          {/* Left Side */}
                          <div>
                            <div>
                              <Link
                                href={`/medicines-details/${encodeId(item.id)}`}
                              >
                                {item.medicine_name}
                              </Link>
                            </div>
                            <div
                              className="descr"
                              style={{ color: "#28a745", fontSize: "13px" }}
                            >
                              {item.manufacturer_name}
                              <br />
                              <div
                                className="descr"
                                style={{
                                  color: "#d32f2f",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                }}
                              >
                                (₹{perCapsule} per {unit})
                              </div>
                            </div>
                          </div>

                          {/* Right Side */}
                          <div className="text-end">
                            {discount > 0 ? (
                              <>
                                <div
                                  className="title"
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    color: "#d32f2f",
                                  }}
                                >
                                  ₹{formatAmount(discountedPrice)}
                                </div>
                                <div
                                  //className="descr"
                                  style={{
                                    fontSize: "13px",
                                    color: "#888",
                                    textDecoration: "line-through",
                                  }}
                                >
                                  ₹{formatAmount(mrp)}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#007bff",
                                    fontWeight: 500,
                                  }}
                                >
                                  {discount}% off
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  className="title"
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    color: "#d32f2f",
                                  }}
                                >
                                  ₹{formatAmount(mrp)}
                                </div>
                                <div
                                  className="descr"
                                  style={{ fontSize: "13px", color: "#555" }}
                                >
                                  same price
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalAccordionTabs;
