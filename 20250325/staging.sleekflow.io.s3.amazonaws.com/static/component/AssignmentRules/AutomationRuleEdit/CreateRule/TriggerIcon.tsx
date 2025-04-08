import React from "react";
import styles from "./TriggerIcon.module.css";
import iconStyles from "../../../shared/Icon/Icon.module.css";

const iconMap = {
  incomingMessage: styles.incomingMessage,
  schedule: styles.schedule,
  updatedContact: styles.updatedContact,
  shopifyFulfillmentUpdate: styles.shopifyFulfillmentUpdate,
  shopifyAbandonedCart: styles.shopifyAbandonedCart,
  shopifyOrderUpdate: styles.shopifyOrderUpdate,
  shopifyUpdatedCustomers: styles.shopifyUpdatedCustomers,
  template: styles.template,
  customize: styles.customize,
  facebookPostComment: styles.facebookPostComment,
  instagramPostComment: styles.instagramPostComment,
};
const sizeMap = {
  medium: "",
  small: styles.small,
};

export type TriggerIconNameType = keyof typeof iconMap;

export function isTriggerIconName(x: unknown): x is TriggerIconNameType {
  return Object.keys(iconMap).includes(x as string);
}

type SizeType = keyof typeof sizeMap;

export function TriggerIcon(props: {
  name: TriggerIconNameType;
  size?: SizeType;
  shifted?: boolean;
}) {
  const { name, size = "medium", shifted = false } = props;
  return (
    <span
      className={`
        ${iconStyles.icon} ${iconMap[name]} ${sizeMap[size]}
        ${shifted ? styles.shifted : ""}
      `}
    />
  );
}
