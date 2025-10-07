import React, { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  colClass?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "Type here...",
  required = false,
  error,
  colClass = "col-md-12",
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    triggerChange();
    editorRef.current?.focus();
  };

  const handleAddLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const triggerChange = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    triggerChange();
  };

  return (
    <div className={`${colClass}`}>
      <div className="txt_col">
        <span className="lbl1 mb-2">
          {label} {required && <span className="text-danger">*</span>}
        </span>

        {/* Editor Box */}
        <div
          className={`richbox ${isFocused ? "focused" : ""}`}
          style={{
            border: `1px solid ${isFocused ? "#4a90e2" : "#ced4da"}`,
            borderRadius: "6px",
            background: "#fff",
            transition: "all 0.2s ease",
            marginTop: "2px",
          }}
        >
          {/* Toolbar Header */}
          <div
            className="toolbar"
            style={{
              borderBottom: "1px solid #e0e0e0",
              background: "#f8f9fa",
              padding: "6px 8px",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("bold")}
            >
              <b>B</b>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("italic")}
            >
              <i>I</i>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("underline")}
            >
              <u>U</u>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("insertUnorderedList")}
            >
              •
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("insertOrderedList")}
            >
              1.
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleAddLink}
            >
              🔗
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("removeFormat")}
            >
              ⌫
            </button>
          </div>

          {/* Content Area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={triggerChange}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            data-placeholder={placeholder}
            style={{
              minHeight: "150px",
              padding: "10px",
              fontSize: "14px",
              lineHeight: "1.5",
              outline: "none",
              borderBottomLeftRadius: "6px",
              borderBottomRightRadius: "6px",
            }}
          />
        </div>

        {error && <small className="text-danger">{error}</small>}
      </div>

      {/* Inline styling for toolbar buttons */}
      <style>{`
        .toolbar button {
          background: #fff;
          border: 1px solid #ddd;
          padding: 4px 6px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .toolbar button:hover {
          background: #e8f0ff;
        }
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
        }
        .richbox.focused {
          box-shadow: 0 0 0 2px rgba(74,144,226,0.2);
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
