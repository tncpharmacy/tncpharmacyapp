import React, { useState, useEffect, useMemo, useRef } from "react";
import MedicineCard from "./MedicineCard";
import { Medicine } from "@/types/medicine";
import TncLoader from "@/app/components/TncLoader/TncLoader";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getMenuMedicinesList,
  getSearchSuggestions,
  resetMedicinesList,
} from "@/lib/features/medicineSlice/medicineSlice";
import Image from "next/image";

interface MedicineListProps {
  medicines: Medicine[] | undefined | null;
  loading: boolean;
  pageLoading: boolean;
}

const MedicineCardSkeleton = () => {
  return (
    <div className="medicine-card">
      <div className="medicine-content">
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#e5e7eb",
              borderRadius: "6px",
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                height: "14px",
                background: "#e5e7eb",
                marginBottom: "6px",
                width: "80%",
              }}
            />
            <div
              style={{
                height: "12px",
                background: "#e5e7eb",
                marginBottom: "6px",
                width: "60%",
              }}
            />
            <div
              style={{ height: "12px", background: "#e5e7eb", width: "50%" }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{ height: "14px", width: "60px", background: "#e5e7eb" }}
          />
          <div
            style={{
              height: "30px",
              width: "80px",
              background: "#e5e7eb",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const MedicineList: React.FC<MedicineListProps> = ({
  medicines,
  loading,
  pageLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useAppDispatch();
  const { suggestions } = useAppSelector((state) => state.medicine);

  // ✅ Safe medicines
  const safeMedicines = useMemo(
    () => (Array.isArray(medicines) ? medicines : []),
    [medicines]
  );

  // ✅ SEARCH (only on loaded data)
  // const filteredMedicines = useMemo(() => {
  //   if (!searchTerm) return safeMedicines;

  //   return safeMedicines.filter((m) => {
  //     const firstWord = m.medicine_name?.toLowerCase().split(" ")[0];
  //     return firstWord?.startsWith(searchTerm.toLowerCase());
  //   });
  // }, [safeMedicines, searchTerm]);
  useEffect(() => {
    if (!searchTerm) return;

    const delay = setTimeout(() => {
      dispatch(getSearchSuggestions(searchTerm));
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [searchTerm, dispatch]);

  const onlyMedicines = suggestions.filter(
    (item) => item.search_type_name === "medicine"
  );
  const displayData = searchTerm ? onlyMedicines : safeMedicines;

  return (
    <>
      {/* HEADER + SEARCH */}
      <div className="row align-items-center mb-3">
        <div className="col-md-9">
          <div className="pageTitle mt-3 mb-3">
            <Image src={"/images/favicon.png"} alt="" width={30} height={30} />{" "}
            Medicine
          </div>
        </div>

        {/* <div className="col-md-3">
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
                const value = e.target.value;
                setSearchTerm(value);

                if (!value) {
                  // 🔥 search clear → reset + first API call
                  dispatch(resetMedicinesList());
                  dispatch(getMenuMedicinesList(null));
                  // 🔥 scroll top
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          </div>
        </div> */}
      </div>
      {searchTerm && displayData.length === 0 && !loading && (
        <div className="text-start my-4">
          <h6>No products found</h6>
        </div>
      )}
      {/* First loader */}
      {(loading || pageLoading) && (
        <div className="medicine-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <MedicineCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Medicine Grid */}
      {!(loading || pageLoading) && (
        <div className="medicine-grid">
          {displayData.map((med, i) => (
            <MedicineCard key={med.id} {...med} />
          ))}
        </div>
      )}
    </>
  );
};

export default MedicineList;
