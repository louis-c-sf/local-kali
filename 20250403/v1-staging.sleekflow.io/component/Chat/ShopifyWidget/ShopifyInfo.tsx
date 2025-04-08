import ShopifyFields, { TrackingNumberUrlType } from "./ShopifyFields";
import React from "react";
import { OrderHistoryType } from "../../../types/Chat/Shopify/OrderHistoryType";

const orderField = [
  "orderName",
  "createdAt",
  "url",
  "adminUrl",
  "updatedAt",
  "payment",
  "status",
  "fulfillment",
  "courier",
  "note",
];

function isNotOrderNumber(infoKey: string) {
  return infoKey !== "orderName";
}

export function ShopifyInfo(props: { order: OrderHistoryType }) {
  const { order } = props;
  return (
    <>
      {Object.keys(order)
        .filter(isNotOrderNumber)
        .map((infoKey) => {
          if (orderField.includes(infoKey)) {
            return (
              <ShopifyFields
                key={`${order["orderName"]}_${infoKey}`}
                title={infoKey}
                value={order[infoKey]}
                type="order-detail"
              />
            );
          }
          if (infoKey === "fulfillments") {
            const fulfillmentsWithDetails = order.fulfillments.filter(
              (f) =>
                f.tracking_company &&
                f.tracking_urls.length > 0 &&
                f.tracking_numbers.length > 0
            );
            if (fulfillmentsWithDetails.length === 0) {
              return;
            }
            const courierServices = fulfillmentsWithDetails.map(
              (f) => f.tracking_company
            );
            const trackingNumber: TrackingNumberUrlType[] =
              fulfillmentsWithDetails.map((f) => ({
                url: f.tracking_url,
                display: f.tracking_number,
              }));
            return (
              <>
                <ShopifyFields
                  key={`${order["orderName"]}_courier`}
                  title={"courier"}
                  value={courierServices.join()}
                  type="order-detail"
                />
                <ShopifyFields
                  key={`${order["orderName"]}_trackingNumber`}
                  title={"trackingNumber"}
                  value={trackingNumber}
                  type="order-detail"
                />
              </>
            );
          }
        })}
    </>
  );
}
