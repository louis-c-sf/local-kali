import { useQueryData } from "api/apiHook";
export interface CloudAPIInvoiceResponse {
  businessBalanceInvoices: Array<BusinessBalanceInvoiceType>;
  count: number;
}
interface BusinessBalanceInvoiceType {
  facebook_business_id: string;
  facebook_business_name: string;
  invoice_pdf: string;
  status: "paid";
  bill_date: number;
  pay_amount: {
    currency_iso_code: string;
    amount: number;
  };
  description: string;
}
export function useCloudAPIInvoice() {
  const { loading, data } = useQueryData<CloudAPIInvoiceResponse>(
    "/company/whatsapp/cloudapi/top-up/invoices",
    {}
  );
  return {
    loading,
    data,
  };
}
