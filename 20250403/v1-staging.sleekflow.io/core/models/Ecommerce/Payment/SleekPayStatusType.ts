export enum ShippingConditionType {
  ALWAYS_SHOW = 0,
  ORDER_PRICING_RANGE = 1,
}

export enum DeliveryEstimateUnit {
  HOUR = 0,
  DAY = 1,
  BUSINESS_DAY = 2,
}

export enum PaymentLinkExpirationType {
  DAYS = 0,
  DATE = 1,
}

export interface ShippingOption {
  displayName: string;
  shippingFee: number;
  currency: string;
  deliveryEstimateMin: number;
  deliveryEstimateMax: number;
  deliveryEstimateUnit: DeliveryEstimateUnit;
  condition: {
    shippingOptionConditionType: ShippingConditionType;
    orderPriceRangeLower: number;
    orderPriceRangeUpper: number;
  };
}

interface AccountInfo {
  default_currency: string;
  business_profile: {
    support_email: string;
    support_phone: string;
  };
  settings: {
    branding: {
      logo: string;
      primary_color: string;
      secondary_color: string;
    };
  };
}

export interface SleekPayStatusType {
  accountId: string;
  status: string;
  shippingOptions: ShippingOption[];
  isShippingEnabled: boolean;
  shippingAllowedCountries: string[];
  accountInfo: AccountInfo;
  companyLogoUrl: string;
  countryCode: string; //todo check with API
  connectStripeResponse: {
    title: string;
    url: string;
    trackingUrl: string;
  };
  paymentLinkExpirationOption: {
    expireAt: string;
    expireNumberOfDaysAfter: number;
    paymentLinkExpirationType: PaymentLinkExpirationType;
  };
}
