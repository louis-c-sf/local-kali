import moment from "moment";

export interface WebClientInfoResponseType {
  id: number;
  webClientSenderId: number;
  webPath: string;
  ipAddress: string;
  ipAddressType: string;
  country: string;
  countryCode: string;
  organisationName: string;
  businessName: string;
  businessWebsite: string;
  isp: string;
  timezone: string;
  region: string;
  city: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  onlineStatus?: string;
  device?: string;
}

export function sortedFromLatest(records: WebClientInfoResponseType[]) {
  return [...records].sort(
    (a: WebClientInfoResponseType, b: WebClientInfoResponseType) => {
      const dateA = moment(a.updatedAt ?? a.createdAt);
      const dateB = moment(b.updatedAt ?? b.createdAt);
      return dateB.diff(dateA);
    }
  );
}

export function sortedFromOldest(records: WebClientInfoResponseType[]) {
  return sortedFromLatest(records).reverse();
}
