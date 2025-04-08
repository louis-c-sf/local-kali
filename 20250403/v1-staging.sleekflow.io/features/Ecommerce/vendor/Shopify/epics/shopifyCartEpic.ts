import { combineEpics } from "redux-observable";
import { updateShopifyCartEpic } from "features/Ecommerce/vendor/Shopify/epics/updateShopifyCartEpic";

export const shopifyCartEpic = combineEpics(
  // @ts-ignore
  updateShopifyCartEpic
);
