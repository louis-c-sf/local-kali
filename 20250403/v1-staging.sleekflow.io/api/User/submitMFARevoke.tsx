import { postWithExceptions } from "api/apiRequest";

export async function submitMFARevoke({
  userMFA,
  id,
}: {
  userMFA: string;
  id: string;
}) {
  return await postWithExceptions("/auth0/account/ResetMfa", {
    param: {
      user_id: id,
      mfa_id: userMFA,
    },
  });
}
