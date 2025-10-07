import React, { useState, useEffect, useRef } from "react";

interface Option {
  label: string;
  value: number | string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: number[];
  onChange: (selected: number[]) => void;
  maxSelect?: number;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  maxSelect = 3,
  placeholder = "-- Select --",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (value: string | number) => {
    const numValue = Number(value);
    if (selected.includes(numValue)) {
      onChange(selected.filter((v) => v !== numValue));
    } else {
      if (selected.length < maxSelect) {
        onChange([...selected, numValue]);
      } else {
        alert(`You can select up to ${maxSelect} items only`);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="txt_col"
      style={{ position: "relative", width: "100%" }}
      ref={dropdownRef}
    >
      <label
        className="lbl1"
        style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}
      >
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          minHeight: "40px",
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          background: "#f9f9f9",
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: "#aaa" }}>{placeholder}</span>
        ) : (
          options
            .filter((opt) => selected.includes(Number(opt.value)))
            .map((opt) => (
              <span
                key={opt.value}
                style={{
                  background: "#007bff",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                }}
              >
                {opt.label}
              </span>
            ))
        )}
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#fff",
            zIndex: 1000,
            marginTop: "4px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              width: "100%",
              padding: "8px 10px",
              borderBottom: "1px solid #eee",
              outline: "none",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              borderTop: "none",
            }}
          />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => toggleSelect(opt.value)}
                style={{
                  padding: "10px 12px",
                  background: selected.includes(Number(opt.value))
                    ? "#007bff"
                    : "#fff",
                  color: selected.includes(Number(opt.value)) ? "#fff" : "#333",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!selected.includes(Number(opt.value))) {
                    (e.currentTarget as HTMLElement).style.background =
                      "#f1f1f1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected.includes(Number(opt.value))) {
                    (e.currentTarget as HTMLElement).style.background = "#fff";
                  }
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
