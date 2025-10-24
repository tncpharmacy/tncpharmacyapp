import React, { useState, useMemo } from "react";
// Import path corrected to refer to the new file in the same directory
import MedicineCard from "./MedicineCard";
import { Image } from "react-bootstrap";
import { Medicine } from "@/types/medicine";

interface MedicineListProps {
  medicines: Medicine[];
}

const MedicineList: React.FC<MedicineListProps> = ({ medicines }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter the medicines based on the search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) {
      return medicines;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return medicines.filter((med) =>
      med.medicine_name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [medicines, searchTerm]);

  return (
    <>
      <div className="pageTitle">
        <Image src={"/images/favicon.png"} alt="" /> Medicine
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="txt_col">
            <span className="lbl1">Search</span>
            <input
              type="text"
              className="txt1 my-box" // Bootstrap
              placeholder="Search medicines..."
              // 2. Add value and onChange handler
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="medicine-grid">
        {/* Use the filtered list for display */}
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((med, idx) => (
            <MedicineCard key={med.id || idx} {...med} />
          ))
        ) : (
          <p className="text-center text-muted w-100 py-4">
            No medicines found matching {searchTerm}
          </p>
        )}
      </div>
    </>
  );
};

export default MedicineList;
