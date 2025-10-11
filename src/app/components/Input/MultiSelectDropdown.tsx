import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

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
  onAddOption?: (label: string) => void; // same as CustomSelectInput
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  maxSelect = 3,
  placeholder = "-- Categories --",
  onAddOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");

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
        toast.error(`You can select up to ${maxSelect} items only`);
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

  const handleAddNew = () => {
    if (!newOptionText.trim()) return;
    if (onAddOption) {
      onAddOption(newOptionText); // notify parent
    }
    setNewOptionText("");
    setShowModal(false);
  };

  return (
    <div
      className="col-md-8"
      style={{ position: "relative" }}
      ref={dropdownRef}
    >
      <div
        className="txt_col"
        style={{ display: "flex", alignItems: "center" }}
      >
        {/* Dropdown area */}
        <div style={{ flex: 1 }}>
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
              borderRadius: "8px",
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

          {/* Dropdown list */}
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
                      color: selected.includes(Number(opt.value))
                        ? "#fff"
                        : "#333",
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
                        (e.currentTarget as HTMLElement).style.background =
                          "#fff";
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

        {/* Add button — same style as CustomSelectInput */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            marginLeft: "8px",
            padding: "6px 10px",
            fontSize: "18px",
            borderRadius: "6px",
            border: "1px solid #e6f0ff",
            background: "#e6f0ff",
            color: "#6f6969",
            cursor: "pointer",
            height: "fit-content",
            alignSelf: "flex-start",
          }}
        >
          +
        </button>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <h4>Add {label}</h4>
            <input
              type="text"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              placeholder={`Enter new ${label}`}
              style={{
                width: "100%",
                padding: "8px",
                margin: "12px 0",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  marginRight: "6px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#f1f1f1",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNew}
                style={{
                  flex: 1,
                  marginLeft: "6px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #007bff",
                  background: "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
