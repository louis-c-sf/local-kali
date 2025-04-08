import { postWithExceptions } from "api/apiRequest";

export async function submitExportPayment(props: {
  receiverEmailAddress: string;
  startDate: string;
  endDate: string;
  platformCountry: string;
}) {
  const { receiverEmailAddress, startDate, endDate, platformCountry } = props;
  return await postWithExceptions(
    `/SleekPay/report/export?receiverEmailAddress=${receiverEmailAddress}&startDate=${startDate}&endDate=${endDate}&platformCountry=${platformCountry}`,
    {
      param: {},
    }
  );
}
