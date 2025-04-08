import { getWithExceptions } from "api/apiRequest";

export async function fetchShopifyChargeResult(chargeId: string) {
  return await getWithExceptions("/shopify/subscription/chargeResult", {
    param: {
      charge_id: chargeId,
    },
  });
}
