// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiError = (err: any) => {
  return err?.response?.data?.message || "Something went wrong";
};
