import axiosInstance from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { ContactItem, ContactResponse } from "@/types/contactUs";

// =============== GET ALL CONTACT FORM LIST ===============
export const fetchContactUs = async (): Promise<ContactResponse> => {
  const res = await axiosInstance.get<ContactResponse>(
    ENDPOINTS.CONTACT_US.GET_ALL
  );
  return res.data;
};

// =============== GET SINGLE CONTACT BY ID ===============
export const fetchContactById = async (
  contactId: number
): Promise<ContactItem> => {
  const res = await axiosInstance.get<{ data: ContactItem }>(
    ENDPOINTS.CONTACT_US.GET_BY_ID(contactId)
  );
  return res.data.data;
};

// =============== CREATE CONTACT FORM ENTRY ===============
export const createContactForm = async (payload: {
  name: string;
  email: string;
  number: string;
  subject: string;
  contact_summary: string;
}): Promise<boolean> => {
  const res = await axiosInstance.post<{ success: boolean }>(
    ENDPOINTS.CONTACT_US.CREATE,
    payload
  );
  return res.data.success;
};

// =============== DELETE CONTACT ===============
export const deleteContact = async (contactId: number): Promise<boolean> => {
  const res = await axiosInstance.delete<{ success: boolean }>(
    ENDPOINTS.CONTACT_US.DELETE(contactId)
  );
  return res.data.success;
};
