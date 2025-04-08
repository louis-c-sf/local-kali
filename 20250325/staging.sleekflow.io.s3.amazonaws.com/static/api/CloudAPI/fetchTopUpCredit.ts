import { getWithExceptions } from "api/apiRequest";

interface CloudAPITopUpCreditType {
  id: string;
  name: string;
  price: {
    currency_iso_code: string;
    amount: number;
  };
}
interface CloudAPITopUpCreditResponseType {
  top_up_plans: CloudAPITopUpCreditType[];
}
export async function fetchTopUpCredit(): Promise<CloudAPITopUpCreditResponseType> {
  return await getWithExceptions("/company/whatsapp/cloudapi/top-up", {
    param: {},
  });
}
