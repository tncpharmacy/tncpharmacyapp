"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { getSearchSuggestions } from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import { formatAmount } from "@/lib/utils/formatAmount";

type SearchMatch = {
  _matchType: "medicine" | "generic" | "manufacturer";
  data: Medicine;
};

type Props = {
  placeholder?: string;
  onSelect?: (item: SearchMatch) => void;
  redirectOnSelect?: boolean;
  className?: string;
};

export default function GlobalSearchBox({
  placeholder = "Search medicines...",
  onSelect,
  redirectOnSelect = false,
  className = "",
}: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // 🔥 API CALL
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setShowList(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await dispatch(getSearchSuggestions(search)).unwrap();
        const list: Medicine[] = Array.isArray(res?.data) ? res.data : [];

        const final: SearchMatch[] = [];

        const manufacturerSet = new Set();

        list.forEach((item) => {
          final.push({ _matchType: "medicine", data: item });

          if (item.generic_name) {
            final.push({ _matchType: "generic", data: item });
          }

          const man = item.manufacturer_name?.toLowerCase();
          if (man && !manufacturerSet.has(man)) {
            manufacturerSet.add(man);
            final.push({ _matchType: "manufacturer", data: item });
          }
        });

        setResults(final);
        setShowList(final.length > 0);
      } catch (err) {
        console.error(err);
        setResults([]);
        setShowList(false);
      }
    }, 300);

    return () => clearTimeout(timer);
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

    // if (redirectOnSelect) {
    //   if (item._matchType === "medicine") {
    //     const path =
    //       item.data.category_id === 1
    //         ? `/medicines-details/${encodeId(item.data.id)}`
    //         : `/product-details/${encodeId(item.data.id)}`;

    //     router.push(path);
    //   }

    //   if (item._matchType === "generic") {
    //     router.push(`/all-generic/${encodeId(item.data.generic_id)}`);
    //   }

    //   if (item._matchType === "manufacturer") {
    //     router.push(`/all-manufacturer/${encodeId(item.data.manufacturer_id)}`);
    //   }
    // }
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
        onKeyDown={handleKeyDown}
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
                    {item._matchType === "medicine"
                      ? item.data.medicine_name || item.data.pack_size
                      : item._matchType === "generic"
                      ? item.data.generic_name
                      : item.data.manufacturer_name}
                  </span>

                  {/* RIGHT SIDE */}
                  {item._matchType === "medicine" ? (
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          color: "green",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        ₹
                        {formatAmount(
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
                        MRP ₹{formatAmount(item.data.mrp || 0)}
                      </span>
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "red",
                        fontWeight: 600,
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item._matchType === "generic"
                        ? "in Salt Composition"
                        : "in Manufacturer"}
                    </span>
                  )}
                </div>

                {/* --- ROW 2 (ONLY FOR MEDICINE) --- */}
                {item._matchType === "medicine" && (
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
                      {item.data.generic_name}
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
                )}

                {/* --- ROW 3 (ONLY FOR MEDICINE) --- */}
                {item._matchType === "medicine" && (
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "green",
                      lineHeight: "1.3",
                      marginTop: "2px", // 👈 ADD THIS
                    }}
                  >
                    {item.data.manufacturer_name}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
