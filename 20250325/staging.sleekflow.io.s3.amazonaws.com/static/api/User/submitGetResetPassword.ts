import { postWithExceptions } from "api/apiRequest";

type ResetPasswordResponseType = {
  url: string;
};

export async function submitGetResetPassword(
  staffId: string
): Promise<ResetPasswordResponseType> {
  return await postWithExceptions("/Company/Staff/Auth0/ResetPasswordLink", {
    param: { staff_identity_id: staffId },
  });
}
