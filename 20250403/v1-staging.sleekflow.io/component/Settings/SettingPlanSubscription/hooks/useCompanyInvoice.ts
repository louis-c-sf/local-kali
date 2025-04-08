import React, { useState } from "react";
import { useAppSelector } from "AppRootContext";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { BillRecordsType } from "types/CompanyType";
import { formatCurrency } from "utility/string";
import { CloudAPIInvoiceResponse } from "./useCloudAPIInvoice";
export const CLOUD_API_HEADER = [
  "billDate",
  "status",
  "amount",
  "facebookBusinessAccount",
  "billDescription",
];
const SUBSCRIPTION_HEADER = ["billDate", "status", "amount", "billDescription"];
export type SubscriptionHeaderType = typeof SUBSCRIPTION_HEADER[number];
export type CloudAPIHeaderType = typeof CLOUD_API_HEADER[number];
// export type InvoiceHeaderType = typeof CLOUD_API_HEADER | typeof SUBSCRIPTION_HEADER;
type BillingInfoType = typeof CLOUD_API_HEADER[number] | "invoice";
export function useCompanyInvoice() {
  const { t } = useTranslation();
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  function denormalizedCloudAPITopUp(
    cloudAPIInvoices?: CloudAPIInvoiceResponse
  ) {
    const content = cloudAPIInvoices?.businessBalanceInvoices.map<
      Record<BillingInfoType, string>
    >((s) => ({
      billDate: moment
        .unix(s.bill_date)
        .utcOffset(selectedTimeZone)
        .format("LL"),
      status: t("settings.plan.modal.invoice.paid"),
      amount: formatCurrency(
        s.pay_amount.amount,
        s.pay_amount.currency_iso_code
      ),
      facebookBusinessAccount: s.facebook_business_name,
      billDescription: s.description,
      invoice: s.invoice_pdf,
    }));
    return {
      header: CLOUD_API_HEADER,
      content,
    };
  }
  function denormalizedSubscription(billRecords?: BillRecordsType[]) {
    const content = billRecords?.map<Record<BillingInfoType, string>>((s) => ({
      billDate: moment
        .utc(s.periodStart)
        .utcOffset(selectedTimeZone)
        .format("LL"),
      status: t("settings.plan.modal.invoice.paid"),
      facebookBusinessAccount: "",
      amount: formatCurrency(s.payAmount, s.subscriptionPlan.currency),
      billDescription: s.subscriptionPlan.subscriptionName,
      invoice: s.invoice_pdf,
    }));
    return {
      header: SUBSCRIPTION_HEADER,
      content,
    };
  }
  return {
    denormalizedSubscription,
    denormalizedCloudAPITopUp,
  };
}
