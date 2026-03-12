import React, { useState } from "react";

interface LicenseInputProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  colClass?: string;
  onChange: (value: string) => void;
}

const LicenseInput: React.FC<LicenseInputProps> = ({
  label,
  name,
  value,
  required = false,
  colClass = "col-md-4",
  onChange,
}) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();

    // max length control
    if (val.length > 15) return;

    // validation
    if (val && val.length < 10) {
      setError("License number must be at least 10 characters");
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
          maxLength={15}
          placeholder=""
        />

        {error && <small className="text-danger fw-semibold">{error}</small>}
      </div>
    </div>
  );
};

export default LicenseInput;
