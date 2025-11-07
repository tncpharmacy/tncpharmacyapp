import React, { useState, useMemo } from "react";
// Import path corrected to refer to the new file in the same directory
import MedicineCard from "./MedicineCard";
import { Image } from "react-bootstrap";
import { Medicine } from "@/types/medicine";
import { useAppSelector } from "@/lib/hooks";

interface MedicineListProps {
  medicines: Medicine[];
  loading: boolean;
}

const MedicineList: React.FC<MedicineListProps> = ({ medicines, loading }) => {
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
          <div className="search_query">
            <a className="query_search_btn" href="javascript:void(0)">
              <i className="bi bi-search"></i>
            </a>
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
        {loading ? (
          <p>Loading products...</p>
        ) : filteredMedicines.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredMedicines.map((med, idx) => (
            <MedicineCard key={med.id || idx} {...med} />
          ))
        )}
      </div>
    </>
  );
};

export default MedicineList;
