"use client";
import { useState, useRef, useEffect } from "react";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  itemName: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  itemName,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-72" ref={containerRef}>
      {/* Input box showing selected count or placeholder */}
      <div
        className="border rounded p-2 cursor-pointer flex items-center gap-2 min-h-[40px]"
        onClick={toggleDropdown}
      >
        <input
          type="text"
          readOnly
          className="w-full border-none outline-none bg-transparent"
          style={{ border: "none", width: "100%" }}
          value={
            selected.length > 0
              ? `${selected.length} ${
                  selected.length === 1 ? itemName : itemName
                } Selected`
              : ""
          }
          placeholder={placeholder}
        />
        {/* <span className="ml-auto">{isOpen ? "▲" : "▼"}</span> */}
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div
          className="w-full bg-white border rounded mt-1 max-h-60 overflow-auto shadow-lg"
          style={{ position: "absolute", zIndex: "100", width: "100%" }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`p-2 cursor-pointer flex justify-between items-center hover:bg-blue-100 ${
                selected.includes(opt.value) ? "bg-blue-200 font-semibold" : ""
              }`}
              onClick={() => handleOptionClick(opt.value)}
            >
              <span>{opt.label}</span>
              {selected.includes(opt.value) && <span>✔</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
