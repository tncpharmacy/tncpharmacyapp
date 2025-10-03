import React from "react";
import MedicineCard from "./MedicineCard";

const medicines = [
  {
    name: "Avastin 100mg Injection",
    pack: "vial of 1 Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (100mg)",
    mrp: 33863,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Actorise 40 Injection",
    pack: "prefilled syringe of 0.4 ml Injection",
    company: "Cipla Ltd",
    salt: "Darbepoetin alfa (40mcg)",
    mrp: 2745.19,
    prescription: true,
    availability: "NOT AVAILABLE",
  },
  {
    name: "Avastin 400mg Injection",
    pack: "vial of 16 ml Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (400mg)",
    mrp: 123506,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Avastin 100mg Injection",
    pack: "vial of 1 Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (100mg)",
    mrp: 33863,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Actorise 40 Injection",
    pack: "prefilled syringe of 0.4 ml Injection",
    company: "Cipla Ltd",
    salt: "Darbepoetin alfa (40mcg)",
    mrp: 2745.19,
    prescription: true,
    availability: "NOT AVAILABLE",
  },
  {
    name: "Avastin 400mg Injection",
    pack: "vial of 16 ml Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (400mg)",
    mrp: 123506,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Avastin 100mg Injection",
    pack: "vial of 1 Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (100mg)",
    mrp: 33863,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Actorise 40 Injection",
    pack: "prefilled syringe of 0.4 ml Injection",
    company: "Cipla Ltd",
    salt: "Darbepoetin alfa (40mcg)",
    mrp: 2745.19,
    prescription: true,
    availability: "NOT AVAILABLE",
  },
  {
    name: "Avastin 400mg Injection",
    pack: "vial of 16 ml Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (400mg)",
    mrp: 123506,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Avastin 100mg Injection",
    pack: "vial of 1 Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (100mg)",
    mrp: 33863,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Actorise 40 Injection",
    pack: "prefilled syringe of 0.4 ml Injection",
    company: "Cipla Ltd",
    salt: "Darbepoetin alfa (40mcg)",
    mrp: 2745.19,
    prescription: true,
    availability: "NOT AVAILABLE",
  },
  {
    name: "Avastin 400mg Injection",
    pack: "vial of 16 ml Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (400mg)",
    mrp: 123506,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Avastin 100mg Injection",
    pack: "vial of 1 Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (100mg)",
    mrp: 33863,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Actorise 40 Injection",
    pack: "prefilled syringe of 0.4 ml Injection",
    company: "Cipla Ltd",
    salt: "Darbepoetin alfa (40mcg)",
    mrp: 2745.19,
    prescription: true,
    availability: "NOT AVAILABLE",
  },
  {
    name: "Avastin 400mg Injection",
    pack: "vial of 16 ml Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (400mg)",
    mrp: 123506,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Avastin 100mg Injection",
    pack: "vial of 1 Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (100mg)",
    mrp: 33863,
    prescription: true,
    availability: "ADD",
  },
  {
    name: "Actorise 40 Injection",
    pack: "prefilled syringe of 0.4 ml Injection",
    company: "Cipla Ltd",
    salt: "Darbepoetin alfa (40mcg)",
    mrp: 2745.19,
    prescription: true,
    availability: "NOT AVAILABLE",
  },
  {
    name: "Avastin 400mg Injection",
    pack: "vial of 16 ml Injection",
    company: "Roche Products India Pvt Ltd",
    salt: "Bevacizumab (400mg)",
    mrp: 123506,
    prescription: true,
    availability: "ADD",
  },
];

const MedicineList = () => {
  return (
    <>
      <div className="row">
        <div className="col-md-8">
          <div className="txt_col">
            <span className="lbl1">Search</span>
            <input
              type="text"
              className="txt1 rounded my-box" // Bootstrap
              // className="border px-3 py-2 w-full rounded-md" // Tailwind
              placeholder="Search medicines..."
              //value={searchTerm}
              //onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="medicine-grid">
        {medicines.map((med, idx) => (
          <MedicineCard key={idx} {...med} />
        ))}
      </div>
    </>
  );
};

export default MedicineList;
