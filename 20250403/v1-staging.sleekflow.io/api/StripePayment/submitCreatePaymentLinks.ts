import { postWithExceptions } from "api/apiRequest";
import {
  PaymentLinkSetType,
  PaymentLinkBaseType,
} from "core/models/Ecommerce/Payment/PaymentLinkType";
import { PaymentLinkResponseType } from "core/models/Ecommerce/Payment/PaymentLinkResponseType";

export function submitCreatePaymentLinks(
  request: PaymentLinkApiRequestType,
  countryCode?: string
): Promise<PaymentLinkResponseType> {
  const requestBody: PaymentLinkSetType = { ...request };
  if (countryCode) {
    requestBody.platformCountry = countryCode;
  }

  return postWithExceptions("/SleekPay/Generate/Payment", {
    param: requestBody,
  });
}

export interface PaymentLinkApiRequestType {
  userprofileId: string;
  lineItems: PaymentLinkWriteType[];
  shopifyId?: number | string; //optional if stripe <> shopify please specify
  expiredAt?: string; //optional for payment expired date
  platformCountry?: string;
}

export interface PaymentLinkWriteType extends PaymentLinkBaseType {
  totalDiscount: number;
  imageUrls?: string[];
  imageFiles?: Array<{
    file: string;
    filename: string;
  }>;
}
