import { TFunction } from "i18next";
import moment from "moment";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ShopifyWidget.module.css";
import { useShopifyLocales } from "./useShopifyLocales";
import { CopyField } from "./CopyField";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export interface TrackingNumberUrlType {
  url: string;
  display: string;
}

const isDate = (title: string) => {
  if (
    title.toLowerCase().includes("date") ||
    title == "createdAt" ||
    title == "updatedAt"
  )
    return true;
  return false;
};
const isTrackingNumber = (title: string) => {
  return title === "trackingNumber";
};
function ShopifyFieldsValue(props: {
  title: string;
  value: string | TrackingNumberUrlType[];
}) {
  const { title, value } = props;
  if (isDate(title)) {
    return <>{moment(value as string).format("YYYY-MM-DD h:mm A")}</>;
  }
  if (isTrackingNumber(title)) {
    const trackingValue = value as TrackingNumberUrlType[];
    return (
      <>
        {trackingValue.map((val) => (
          <a
            key={JSON.stringify(val)}
            className={styles.hyperlink}
            href={htmlEscape(val.url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {val.display}
          </a>
        ))}
      </>
    );
  }
  return <>{value}</>;
}

export default function ShopifyFields(props: {
  title: string;
  value: string | TrackingNumberUrlType[];
  type: string;
}) {
  const { t } = useTranslation();
  const { title, value, type } = props;
  const { orderDetailField, abandonedField } = useShopifyLocales();

  const getTitle = (t: TFunction, title: string, type: string) => {
    if (type == "abandoned-cart") return t(abandonedField[title]);
    if (type == "order-detail") return t(orderDetailField[title]);
    return title;
  };

  return (
    <div className={styles.shopifyFieldWrapper}>
      <div className={styles.shopifyFieldTitle}>{getTitle(t, title, type)}</div>
      <div className={styles.shopifyFieldValue}>
        {title.toLowerCase().includes("url") ? (
          <CopyField value={value as string} showText />
        ) : (
          <ShopifyFieldsValue title={title} value={value} />
        )}
      </div>
    </div>
  );
}
