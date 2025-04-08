export const PaymentLinkOptionKeyDict = {
  shopify: "Shopify",
  stripe: "Stripe",
} as const;
export const PaymentLinkOptionDict = {
  [PaymentLinkOptionKeyDict.shopify]: 0,
  [PaymentLinkOptionKeyDict.stripe]: 1,
} as const;

export const useConvertPaymentLinkOption = () => {
  //key: string; value: number
  const findPaymentLinkOptionValueByKey = (optionKey: string) => {
    const entry = Object.entries(PaymentLinkOptionDict).find(
      ([key, val]) => key === optionKey
    );
    return entry ? entry[1] : null;
  };

  const findPaymentLinkOptionKeyByValue = (optionValue: number) => {
    const entry = Object.entries(PaymentLinkOptionDict).find(
      ([key, val]) => val === optionValue
    );
    return entry ? entry[0] : null;
  };
  return {
    findOptionKeyByValue: findPaymentLinkOptionKeyByValue,
    findOptionValueByKey: findPaymentLinkOptionValueByKey,
  };
};
