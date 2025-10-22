// components/HorizontalAccordionTabs.tsx

import React, { useState, useRef } from "react";

const HorizontalAccordionTabs: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Accordion content की height जानने के लिए ref का उपयोग करें
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

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
    // Transition सिर्फ max-height property पर लगाएं
    transition: "max-height 0.5s ease-in-out",
    overflow: "hidden", // जब max-height 0 हो तो content छुप जाए

    // max-height को dynamically सेट करें
    maxHeight: isOpen
      ? `${contentRef.current ? contentRef.current.scrollHeight : 0}px`
      : "0px",
  };

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
            aria-controls="collapseOne"
            style={headerButtonStyle}
          >
            All Generic Strength
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
                    <div className="d-flex justify-content-between my-2">
                      <div>
                        <div className="">
                          <a href="#">Noworm Chewable Tablet....</a>
                        </div>
                        <div className="descr">Alkem Laboratories Ltd</div>
                      </div>
                      <div className="text-end">
                        <div className="title">₹8.2/chewable tablet</div>
                        <div className="descr">same price</div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between my-2">
                      <div>
                        <div className="">
                          <a href="#">Noworm Chewable Tablet....</a>
                        </div>
                        <div className="descr">Alkem Laboratories Ltd</div>
                      </div>
                      <div className="text-end">
                        <div className="title">₹8.2/chewable tablet</div>
                        <div className="descr">same price</div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between my-2">
                      <div>
                        <div className="">
                          <a href="#">Noworm Chewable Tablet....</a>
                        </div>
                        <div className="descr">Alkem Laboratories Ltd</div>
                      </div>
                      <div className="text-end">
                        <div className="title">₹8.2/chewable tablet</div>
                        <div className="descr">same price</div>
                      </div>
                    </div>
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
