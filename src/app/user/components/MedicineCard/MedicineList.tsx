import React from "react";
import MedicineCard from "./MedicineCard";
import { Medicine } from "@/types/medicine";

interface MedicineListProps {
  medicines: Medicine[];
}

const MedicineList: React.FC<MedicineListProps> = ({ medicines }) => {
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
        {medicines?.length > 0 ? (
          medicines.map((med, idx) => <MedicineCard key={idx} {...med} />)
        ) : (
          <p>No medicines available.</p>
        )}
      </div>
    </>
  );
};

export default MedicineList;
