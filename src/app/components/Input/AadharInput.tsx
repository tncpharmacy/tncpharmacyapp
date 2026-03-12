import React, { useState } from "react";

interface AadharInputProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  colClass?: string;
  onChange: (value: string) => void;
}

const AadharInput: React.FC<AadharInputProps> = ({
  label,
  name,
  value,
  required = false,
  colClass = "col-md-4",
  onChange,
}) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // only digits

    if (val.length > 12) return;

    // format with dash
    if (val.length > 8) {
      val = `${val.slice(0, 4)}-${val.slice(4, 8)}-${val.slice(8)}`;
    } else if (val.length > 4) {
      val = `${val.slice(0, 4)}-${val.slice(4)}`;
    }

    // validation
    if (val.replace(/-/g, "").length !== 12) {
      setError("Aadhar number must be 12 digits");
    } else {
      setError("");
    }

    onChange(val);
  };

  return (
    <div className={colClass}>
      <div className="txt_col">
        <span className="lbl1">
          {label} {required && <span className="text-danger">*</span>}
        </span>

        <input
          type="text"
          name={name}
          className="txt1"
          value={value || ""}
          onChange={handleChange}
          maxLength={14}
          placeholder=""
        />

        {error && <small className="text-danger fw-semibold">{error}</small>}
      </div>
    </div>
  );
};

export default AadharInput;
