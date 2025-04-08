export interface PaymentLinkResponseType {
  paymentIntentId: string;
  title: string;
  url: string;
  trackingUrl: string;
}

export interface ShopifyPaymentLinkResponseType {
  sleekflow_url: string;
}

export function isShopifyPaymentLinkResponseType(
  obj: any
): obj is ShopifyPaymentLinkResponseType {
  return obj.sleekflow_url !== undefined;
}
