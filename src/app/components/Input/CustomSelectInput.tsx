import React, { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectInputProps {
  label: string;
  name: string;
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  colClass?: string;
  required?: boolean;
  error?: string;
  onAddOption?: (label: string) => void; // parent ko notify karega
}

const CustomSelectInput: React.FC<CustomSelectInputProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  colClass = "col-md-4",
  required = false,
  error,
  onAddOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(""); // selected label
  const [searchText, setSearchText] = useState(""); // filter text

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    if (!value) {
      setInputValue("");
      return;
    }

    const selectedOption = options.find(
      (opt) => String(opt.value) === String(value)
    );

    if (selectedOption) {
      setInputValue(selectedOption.label);
      setSearchText(""); // 🔥 reset filter
    }
  }, [value, options]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const itemEl = listEl.children[highlightedIndex] as HTMLElement;
    if (itemEl) itemEl.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 < filteredOptions.length ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredOptions[highlightedIndex];
      if (selected) {
        setInputValue(selected.label);
        onChange(selected.value);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleOptionClick = (opt: Option) => {
    setInputValue(opt.label); // selected text
    setSearchText(""); // reset search
    onChange(opt.value);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    if (!newOptionText.trim()) return;
    if (onAddOption) {
      onAddOption(newOptionText); // redux ko naya option bhej dega
    }
    setNewOptionText("");
    setShowModal(false);
  };

  return (
    <div
      className={`${colClass}`}
      ref={containerRef}
      style={{ position: "relative" }}
    >
      <div
        className="txt_col"
        style={{ display: "flex", alignItems: "center" }}
      >
        <div style={{ flex: 1 }}>
          <span className="lbl1">
            {label} {required && <span className="text-danger">*</span>}
          </span>
          <input
            type="text"
            name={name}
            className="txt1"
            value={inputValue}
            onFocus={() => {
              setIsOpen(true);
              setSearchText(""); // 🔥 show full list
              setHighlightedIndex(0);
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              setSearchText(e.target.value); // 🔍 search only
              setIsOpen(true);
            }}
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={`-- ${label} --`}
            required={required}
            autoComplete="off"
          />
          {isOpen && filteredOptions.length > 0 && (
            <ul
              ref={listRef}
              style={{
                border: "1px solid #ccc",
                maxHeight: "150px",
                overflowY: "auto",
                margin: 0,
                padding: 0,
                listStyle: "none",
                position: "absolute",
                background: "#fff",
                zIndex: 1000,
                width: "100%",
              }}
            >
              {filteredOptions.map((opt, index) => (
                <li
                  key={opt.value}
                  onClick={() => handleOptionClick(opt)}
                  style={{
                    padding: "8px 12px",
                    background: index === highlightedIndex ? "#007bff" : "#fff",
                    color: index === highlightedIndex ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
          {error && <small className="text-danger">{error}</small>}
        </div>

        {/* Add Button */}
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
          }}
        >
          +
        </button>
      </div>

      {/* Modal Popup */}
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

export default CustomSelectInput;
