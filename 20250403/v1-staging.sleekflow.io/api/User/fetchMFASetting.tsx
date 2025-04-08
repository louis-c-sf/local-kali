import { postWithExceptions } from "api/apiRequest";
type MFAType = {
  mfa_id: string;
  mfa_type: "totp";
  confirmed: boolean;
  created_at: string;
};

export type MFAResponseType = Array<MFAType> | {};

export async function fetchMFASetting(
  staffId: string
): Promise<MFAResponseType> {
  return await postWithExceptions(`/auth0/account/GetMfaList`, {
    param: {
      user_id: staffId,
    },
  });
}
