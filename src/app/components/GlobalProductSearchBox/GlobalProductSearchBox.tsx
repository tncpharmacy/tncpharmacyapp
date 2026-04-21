"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getSearchProductBased } from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/formatPrice";

type SearchMatch = {
  data: Medicine;
};

type Props = {
  placeholder?: string;
  onSelect?: (item: SearchMatch) => void;
  redirectOnSelect?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; //
};

export default function GlobalProductSearchBox({
  placeholder = "Search medicines...",
  onSelect,
  onKeyDown,
}: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [hasSearched, setHasSearched] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const { searchProductLoading } = useAppSelector((state) => state.medicine);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 🔥 API CALL
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setShowList(false);
      setHasSearched(false);
      return;
    }

    let isActive = true;

    const timer = setTimeout(async () => {
      try {
        setHasSearched(true);
        const res = await dispatch(getSearchProductBased(search)).unwrap();

        if (!isActive) return;

        const list: Medicine[] = Array.isArray(res?.data) ? res.data : [];

        const final = list.map((item) => ({ data: item }));

        setResults(final);
        setShowList(true);
      } catch (err) {
        if (!isActive) return;
        setResults([]);
        setShowList(true);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [search, dispatch]);

  // 🔥 OUTSIDE CLICK
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutside = (e: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 SELECT HANDLER
  const handleSelect = (item: SearchMatch) => {
    setSearch("");
    setShowList(false);
    setHighlightIndex(-1);

    if (onSelect) {
      onSelect(item);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList || results.length === 0) return;

    // DOWN
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    }

    // UP
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }

    // ENTER
    if (e.key === "Enter") {
      e.preventDefault();

      if (highlightIndex >= 0) {
        handleSelect(results[highlightIndex]);
      }
    }

    // ESC
    if (e.key === "Escape") {
      setShowList(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // typing ke time list open rakho
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") {
      if (search.trim()) {
        setShowList(true);
      }
    }
  };

  useEffect(() => {
    const list = document.getElementById("search-list");
    const item = document.getElementById(`item-${highlightIndex}`);

    if (list && item) {
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;

      if (itemTop < list.scrollTop) {
        list.scrollTop = itemTop;
      } else if (itemBottom > list.scrollTop + list.clientHeight) {
        list.scrollTop = itemBottom - list.clientHeight;
      }
    }
  }, [highlightIndex]);

  const emptyStyle = {
    position: "absolute",
    top: "69%",
    left: 0,
    width: "100%",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    marginTop: "6px",
    padding: "12px",
    zIndex: 999,
    border: "1px solid #eee",
    textAlign: "center" as const,
    fontSize: "13px",
    color: "#777",
  };

  return (
    <div ref={wrapperRef} className="search_query header_search_query">
      <a className="query_search_btn" href="javascript:void(0)">
        <i className="bi bi-search"></i>
      </a>
      <input
        type="text"
        className="header_search_input"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setHighlightIndex(-1);
        }}
        onFocus={() => search && setShowList(true)}
        onKeyDown={(e) => {
          handleKeyDown(e);

          if (onKeyDown) {
            onKeyDown(e);
          }
        }}
        onKeyUp={handleKeyUp}
      />

      {showList && results.length > 0 && (
        <ul
          id="search-list"
          style={{
            position: "absolute",
            top: "69%",
            left: 0,
            width: "100%",
            maxHeight: "320px",
            overflowY: "auto",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            marginTop: "6px",
            padding: "6px 0",
            zIndex: 999,
            border: "1px solid #eee",
          }}
        >
          {results.map((item, index) => (
            <li
              id={`item-${index}`}
              key={index}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightIndex(index)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                background: index === highlightIndex ? "#f6faff" : "#fff",
                borderBottom: "1px solid #f2f2f2",
                transition: "0.2s",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {/* 🔥 ROW 1: TITLE + PRICE / TAG */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#000",
                      marginRight: "10px",
                      flex: 1,
                      lineHeight: "1.3",
                      marginBottom: "4px", // 👈 ADD THIS
                    }}
                  >
                    {item.data.medicine_name}
                  </span>

                  {/* RIGHT SIDE */}
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        color: "green",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      ₹
                      {formatPrice(
                        (item.data.mrp ?? 0) -
                          ((item.data.mrp ?? 0) *
                            Number(item.data.discount ?? 0)) /
                            100
                      )}
                    </span>

                    <span
                      style={{
                        marginLeft: 6,
                        textDecoration: "line-through",
                        color: "#777",
                        fontSize: "12px",
                      }}
                    >
                      MRP ₹{formatPrice(item.data.mrp || 0)}
                    </span>
                  </span>
                </div>

                {/* --- ROW 2 (ONLY FOR MEDICINE) --- */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#555",
                    marginBottom: "8px",
                    marginTop: "2px",
                  }}
                >
                  <span style={{ marginTop: "2px" }}>
                    {item.data.pack_size}
                  </span>

                  <span
                    style={{
                      color: "red",
                      marginTop: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {item.data.discount}% OFF
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "green",
                    marginBottom: "8px",
                    marginTop: "2px",
                  }}
                >
                  <span style={{ marginTop: "2px" }}>
                    {item.data.manufacturer_name}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showList &&
        hasSearched &&
        !searchProductLoading &&
        results.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "69%",
              left: 0,
              width: "100%",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              marginTop: "6px",
              padding: "12px",
              zIndex: 999,
              border: "1px solid #eee",
              textAlign: "center",
              fontSize: "13px",
              color: "#777",
            }}
          >
            No products found
          </div>
        )}
    </div>
  );
}
