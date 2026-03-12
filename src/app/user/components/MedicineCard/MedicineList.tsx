import React, { useState, useEffect, useMemo, useRef } from "react";
import MedicineCard from "./MedicineCard";
import { Image } from "react-bootstrap";
import { Medicine } from "@/types/medicine";
import TncLoader from "@/app/components/TncLoader/TncLoader";

interface MedicineListProps {
  medicines: Medicine[] | undefined | null;
  loading: boolean;
}

const MedicineList: React.FC<MedicineListProps> = ({ medicines, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // const [visibleData, setVisibleData] = useState<Medicine[]>([]);
  const [limit, setLimit] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const safeMedicines = useMemo(
    () => (Array.isArray(medicines) ? medicines : []),
    [medicines]
  );

  // ✅ STEP 1 : SEARCH ON FULL DATA
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return safeMedicines;

    return safeMedicines.filter((m) =>
      m.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeMedicines, searchTerm]);

  // ✅ STEP 2 : APPLY LIMIT AFTER SEARCH
  const visibleData = useMemo(
    () => filteredMedicines.slice(0, limit),
    [filteredMedicines, limit]
  );

  // ------------------------------
  // 🔥 INTERSECTION OBSERVER LOGIC
  // ------------------------------
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;

      setLimit((prev) => {
        if (prev >= filteredMedicines.length) return prev;
        return prev + 20;
      });
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [filteredMedicines.length]);

  return (
    <>
      {/* <div className="pageTitle">
        <Image src={"/images/favicon.png"} alt="" /> Medicine
      </div> */}

      {/* SEARCH */}
      {/* TITLE + SEARCH IN SAME ROW */}
      <div className="row align-items-center mb-3">
        {/* LEFT SIDE : PRODUCT NAME */}
        <div className="col-md-9">
          <div className="pageTitle m-0">
            <Image src={"/images/favicon.png"} alt="" /> Medicine
          </div>
        </div>

        {/* RIGHT SIDE : SEARCH BOX */}
        <div className="col-md-3">
          <div className="search_query">
            <a className="query_search_btn" href="javascript:void(0)">
              <i className="bi bi-search"></i>
            </a>
            <input
              type="text"
              className="txt1 my-box"
              placeholder="Search medicine..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setLimit(20); // reset scroll on new search
              }}
            />
          </div>
        </div>
      </div>

      {/* First time loader */}
      {loading && (
        <div className="text-center my-4">
          <TncLoader />
        </div>
      )}
      {/* Medicines */}
      <div className="medicine-grid">
        {visibleData.map((med, i) => (
          <MedicineCard key={i} {...med} />
        ))}
      </div>

      {/* 👇 This div triggers infinite scroll */}
      <div
        ref={loadMoreRef}
        style={{ height: "40px", marginTop: "20px" }}
      ></div>
    </>
  );
};

export default MedicineList;
