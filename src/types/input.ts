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

export interface InputOption {
  label: string;
  value: string | number;
}
export interface InputPropsColSm {
  label: string;
  name: string;
  type?: string;
  value?: string | number | null;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  options?: InputOption[];
  colClass?: string;
  colSm?: number; // ✅ New
  colMd?: number; // ✅ New
  colLg?: number; // ✅ New
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  max?: string | number;
  min?: string | number;
  maxLength?: number;
}
