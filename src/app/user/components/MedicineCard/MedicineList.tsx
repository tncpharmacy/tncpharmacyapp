import React, { useState, useEffect, useMemo, useRef } from "react";
import MedicineCard from "./MedicineCard";
import { Image } from "react-bootstrap";
import { Medicine } from "@/types/medicine";

interface MedicineListProps {
  medicines: Medicine[] | undefined | null;
  loading: boolean;
}

const MedicineList: React.FC<MedicineListProps> = ({ medicines, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const [visibleData, setVisibleData] = useState<Medicine[]>([]);
  const [limit, setLimit] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const safeMedicines = Array.isArray(medicines) ? medicines : [];

  // Set initial visible items
  useEffect(() => {
    setVisibleData(safeMedicines.slice(0, limit));
  }, [safeMedicines, limit]);

  // Search logic
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return visibleData;
    return visibleData.filter((m) =>
      m.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [visibleData, searchTerm]);

  // ------------------------------
  // 🔥 INTERSECTION OBSERVER LOGIC
  // ------------------------------
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const container = document.querySelector(".body_contain");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLimit((prev) => prev + 20);
        }
      },
      {
        root: container, // <<--- IMPORTANT
        threshold: 1.0,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="pageTitle">
        <Image src={"/images/favicon.png"} alt="" /> Medicine
      </div>

      {/* Search */}
      <div className="row">
        <div className="col-md-12">
          <div className="search_query">
            <a className="query_search_btn" href="#">
              <i className="bi bi-search"></i>
            </a>
            <input
              type="text"
              className="txt1 my-box"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* First time loader */}
      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary"></div>
        </div>
      )}
      {/* Medicines */}
      <div className="medicine-grid">
        {filteredMedicines.map((med, i) => (
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
