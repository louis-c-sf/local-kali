import { postWithExceptions } from "api/apiRequest";

export async function submitSendResetPassword(email: string) {
  return await postWithExceptions("/auth0/account/RequestPasswordReset", {
    param: {
      email,
    },
  });
}
