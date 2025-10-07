export interface DocumentFile {
  id?: number;
  document: string;
}

export interface MedicineFormData {
  id: number;
  item_name: string;
  pack_size: string;
  variant: string;
  product_introduction: string;
  prescription_required: number;
  generic: string;
  unit: string;
  manufacturer: string;
  category: string | number;
  sub_category: string | number;
  description: string;
  dose: string;
  uses: string;
  side_effect: string;
  direction_for_use: string;
  storage: string;
  status: "Active" | "Inactive";
  documents: DocumentFile[]; // existing uploaded docs
  uploadedFiles: File[]; // new files from InputFile
}
