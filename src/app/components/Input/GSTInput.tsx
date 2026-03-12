import React, { useState } from "react";

interface GSTInputProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  colClass?: string;
  onChange: (value: string) => void;
}

const GSTInput: React.FC<GSTInputProps> = ({
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

    if (val.length > 15) return;

    let isValid = true;

    for (let i = 0; i < val.length; i++) {
      const char = val[i];

      if (i < 2 && !/[0-9]/.test(char)) isValid = false; // first 2 digits
      else if (i >= 2 && i < 7 && !/[A-Z]/.test(char))
        isValid = false; // next 5 letters
      else if (i >= 7 && i < 11 && !/[0-9]/.test(char))
        isValid = false; // next 4 digits
      else if (i === 11 && !/[A-Z]/.test(char)) isValid = false; // letter
      else if (i === 12 && !/[A-Z0-9]/.test(char))
        isValid = false; // alphanumeric
      else if (i === 13 && char !== "Z") isValid = false; // Z
      else if (i === 14 && !/[A-Z0-9]/.test(char)) isValid = false; // alphanumeric
    }

    if (!isValid) {
      setError("Invalid GST format. Example: 09AALCT9310Q1Z1");
      return;
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
          placeholder="09AALCT9310Q1Z1"
        />

        {error && <small className="text-danger fw-semibold">{error}</small>}
      </div>
    </div>
  );
};

export default GSTInput;
