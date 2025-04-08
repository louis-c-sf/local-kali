import { CurrencyDict } from "./CurrencyDict";
import { FreeTrialHubDict } from "./types";

export const MonthlyPrice = {
  [CurrencyDict.USD]: {
    [FreeTrialHubDict.salesforce]: 499,
    [FreeTrialHubDict.hubspot]: 199,
  },
  [CurrencyDict.HKD]: {
    [FreeTrialHubDict.salesforce]: 3919,
    [FreeTrialHubDict.hubspot]: 1599,
  },
  [CurrencyDict.CNY]: {
    [FreeTrialHubDict.salesforce]: 3359,
    [FreeTrialHubDict.hubspot]: 1399,
  },
  [CurrencyDict.SGD]: {
    [FreeTrialHubDict.salesforce]: 709,
    [FreeTrialHubDict.hubspot]: 279,
  },
  [CurrencyDict.MYR]: {
    [FreeTrialHubDict.salesforce]: 2219,
    [FreeTrialHubDict.hubspot]: 889,
  },
  [CurrencyDict.EUR]: {
    [FreeTrialHubDict.salesforce]: 499,
    [FreeTrialHubDict.hubspot]: 199,
  },
  [CurrencyDict.GBP]: {
    [FreeTrialHubDict.salesforce]: 419,
    [FreeTrialHubDict.hubspot]: 169,
  },
  [CurrencyDict.CAD]: {
    [FreeTrialHubDict.salesforce]: 649,
    [FreeTrialHubDict.hubspot]: 259,
  },
  [CurrencyDict.AUD]: {
    [FreeTrialHubDict.salesforce]: 739,
    [FreeTrialHubDict.hubspot]: 299,
  },
  [CurrencyDict.IDR]: {
    [FreeTrialHubDict.salesforce]: 7494000,
    [FreeTrialHubDict.hubspot]: 3000000,
  },
  [CurrencyDict.AED]: {
    [FreeTrialHubDict.salesforce]: 1839,
    [FreeTrialHubDict.hubspot]: 739,
  },
  [CurrencyDict.BRL]: {
    [FreeTrialHubDict.salesforce]: 2689,
    [FreeTrialHubDict.hubspot]: 1099,
  },
  [CurrencyDict.INR]: {
    [FreeTrialHubDict.hubspot]: 8499,
    [FreeTrialHubDict.salesforce]: 21199,
  },
};

const AdditionalStaffType = {
  pro: "pro",
  premium: "premium",
};

export const AdditionalStaffMonthlyPrice = {
  [CurrencyDict.USD]: {
    [AdditionalStaffType.pro]: 19,
    [AdditionalStaffType.premium]: 39,
  },
  [CurrencyDict.HKD]: {
    [AdditionalStaffType.pro]: 149,
    [AdditionalStaffType.premium]: 299,
  },
  [CurrencyDict.CNY]: {
    [AdditionalStaffType.pro]: 119,
    [AdditionalStaffType.premium]: 249,
  },
  [CurrencyDict.SGD]: {
    [AdditionalStaffType.pro]: 29,
    [AdditionalStaffType.premium]: 59,
  },
  [CurrencyDict.MYR]: {
    [AdditionalStaffType.pro]: 79,
    [AdditionalStaffType.premium]: 159,
  },
  [CurrencyDict.EUR]: {
    [AdditionalStaffType.pro]: 19,
    [AdditionalStaffType.premium]: 39,
  },
  [CurrencyDict.GBP]: {
    [AdditionalStaffType.pro]: 19,
    [AdditionalStaffType.premium]: 39,
  },
  [CurrencyDict.CAD]: {
    [AdditionalStaffType.pro]: 29,
    [AdditionalStaffType.premium]: 59,
  },
  [CurrencyDict.AUD]: {
    [AdditionalStaffType.pro]: 29,
    [AdditionalStaffType.premium]: 59,
  },
  [CurrencyDict.IDR]: {
    [AdditionalStaffType.pro]: 269000,
    [AdditionalStaffType.premium]: 549000,
  },
  [CurrencyDict.AED]: {
    [AdditionalStaffType.pro]: 69,
    [AdditionalStaffType.premium]: 139,
  },
  [CurrencyDict.BRL]: {
    [AdditionalStaffType.pro]: 109,
    [AdditionalStaffType.premium]: 209,
  },
  [CurrencyDict.INR]: {
    [AdditionalStaffType.pro]: 898,
    [AdditionalStaffType.premium]: 1698,
  },
};
