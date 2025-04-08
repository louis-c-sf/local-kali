import { postWithExceptions } from "api/apiRequest";

export default async function submitTopUp(
  facebookBusinessId: string,
  topUpId: string
) {
  return await postWithExceptions("/company/whatsapp/cloudapi/top-up", {
    param: {
      topUpPlanId: topUpId,
      facebookBusinessId: facebookBusinessId,
      redirectToUrl: `${window.location.protocol}//${window.location.host}`,
    },
  });
}
