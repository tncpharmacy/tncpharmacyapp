export interface OptionType {
  label: string;
  value: string | number;
}

export interface InputProps {
  label: string;
  name: string;
  value?: string | number;
  type?: "text" | "number" | "email" | "password" | "date" | "select";
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  colClass?: string;
  options?: OptionType[]; // sirf select ke liye
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  max?: string | number;
  min?: string | number;
  maxLength?: number;
}
