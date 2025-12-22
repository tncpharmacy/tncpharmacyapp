"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/hooks";

type Item = {
  id?: number;
  name: string;
};

interface SmartCreateInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;

  list: Item[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createAction: (payload: { name: string }) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshAction: () => any;

  placeholder?: string;
}

const SmartCreateInput: React.FC<SmartCreateInputProps> = ({
  label,
  value,
  onChange,
  list,
  createAction,
  refreshAction,
  placeholder,
}) => {
  const dispatch = useAppDispatch();

  const [showList, setShowList] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isArrowNav, setIsArrowNav] = useState(false);

  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isSavingRef = useRef(false);
  const enterPressedRef = useRef(false);

  const safeLower = (v?: string) =>
    typeof v === "string" ? v.toLowerCase() : "";

  const filteredList = list.filter((i) =>
    safeLower(i.name).startsWith(safeLower(isArrowNav ? "" : value))
  );

  // ---------- OUTSIDE CLICK ----------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowList(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- SCROLL ----------
  useEffect(() => {
    if (!listRef.current || highlightIndex < 0) return;

    const listEl = listRef.current;
    const itemEl = listEl.children[highlightIndex] as HTMLElement;
    if (!itemEl) return;

    const listRect = listEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    if (itemRect.bottom > listRect.bottom) {
      listEl.scrollTop += itemRect.bottom - listRect.bottom;
    }
    if (itemRect.top < listRect.top) {
      listEl.scrollTop -= listRect.top - itemRect.top;
    }
  }, [highlightIndex]);

  // ---------- SAVE / SELECT ----------
  const handleEnter = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      if (!value.trim()) return;

      // arrow selected
      if (highlightIndex >= 0 && filteredList[highlightIndex]) {
        onChange(filteredList[highlightIndex].name);
        setShowList(false);
        setHighlightIndex(-1);
        return;
      }

      // exact existing
      const existing = list.find((i) => safeLower(i.name) === safeLower(value));

      if (existing) {
        onChange(existing.name);
        setShowList(false);
        return;
      }

      // create new
      const res = await dispatch(createAction({ name: value.trim() })).unwrap();

      onChange(res?.name || value);
      setShowList(false);
      setHighlightIndex(-1);

      await dispatch(refreshAction());

      toast.success(`${label} saved`);
    } catch {
      toast.error(`Failed to save ${label}`);
    } finally {
      setTimeout(() => {
        isSavingRef.current = false;
      }, 0);
    }
  };

  // ---------- KEYBOARD ----------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsArrowNav(true);

      const next =
        highlightIndex < filteredList.length - 1 ? highlightIndex + 1 : 0;

      setHighlightIndex(next);

      const item = filteredList[next];
      if (item) {
        onChange(item.name); // ✅ safe now
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsArrowNav(true);

      const next =
        highlightIndex > 0 ? highlightIndex - 1 : filteredList.length - 1;

      setHighlightIndex(next);

      const item = filteredList[next];
      if (item) {
        onChange(item.name); // ✅ safe now
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();

      enterPressedRef.current = true;
      handleEnter();
    }
  };
  useEffect(() => {
    if (!showList || !inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();

    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, [showList, value]);

  return (
    <div
      className="txt_col"
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        overflow: "visible",
        marginTop: 0,
      }}
    >
      <label className="lbl1 fw-bold">{label}</label>

      <input
        ref={inputRef}
        type="text"
        className="form-control"
        style={{
          height: "38px",
          fontSize: "14px",
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setIsArrowNav(false);
          onChange(e.target.value);
          setShowList(true);
          setHighlightIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => value && setShowList(true)}
        onBlur={() => {
          if (enterPressedRef.current) {
            enterPressedRef.current = false;
            return;
          }
          handleEnter();
        }}
      />

      {showList && filteredList.length > 0 && (
        <ul
          ref={listRef}
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            border: "1px solid #ddd",
            borderRadius: "6px",
            maxHeight: "140px",
            overflowY: "auto",
            background: "#fff",

            position: "fixed", // 🔥🔥🔥 MAIN FIX
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,

            zIndex: 1000000, // modal + table se upar
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          }}
        >
          {filteredList.map((i, index) => (
            <li
              key={`${i.id || "temp"}-${index}`}
              onMouseEnter={() => setHighlightIndex(index)}
              onMouseDown={() => {
                onChange(i.name);
                setShowList(false);
                setHighlightIndex(-1);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                background: index === highlightIndex ? "#edf0f3" : "#fff",
              }}
            >
              {i.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SmartCreateInput;
