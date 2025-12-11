export interface PasswordResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface PasswordPayload {
  userId: number;
  userTypeId: number;
  data: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  };
}
