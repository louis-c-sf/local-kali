import {
  PaymentStatusType,
  PaymentHistoryRecordNormalizedType,
} from "../../../../core/models/Ecommerce/Payment/PaymentLinkType";
import { getMomentComparator } from "../../../../utility/array";
import { TabMapType } from "./contracts";

export function buildPaymentsSelectors(
  payments: PaymentHistoryRecordNormalizedType[],
  pageSize: number,
  tabMap: TabMapType
) {
  function getPaymentsPage(statuses: PaymentStatusType[], page: number) {
    const sliceStart = (page - 1) * pageSize;
    const sliceEnd = sliceStart + pageSize;
    return getPaymentsByStatus(statuses).slice(sliceStart, sliceEnd);
  }

  function getPagesCount(status: PaymentStatusType) {
    const items = getPaymentsByStatus(tabMap[status].statuses).length;
    return Math.ceil(items / pageSize);
  }

  function getPaymentsByStatus(statuses: PaymentStatusType[]) {
    const byDate = getMomentComparator({ invalidValueMeans: "GREATER" });
    return payments
      .filter((p) => statuses.includes(p.status))
      .sort((a, b) => -byDate(a.createdAt, b.createdAt));
  }

  return { getPaymentsPage, getPagesCount, getPaymentsByStatus };
}
