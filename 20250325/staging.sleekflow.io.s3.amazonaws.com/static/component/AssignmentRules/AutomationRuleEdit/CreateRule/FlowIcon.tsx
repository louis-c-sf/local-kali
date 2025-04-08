import React from "react";
import styles from "./FlowIcon.module.css";
import iconStyles from "../../../shared/Icon/Icon.module.css";

const iconMap = {
  assign: styles.assign,
  cart: styles.cart,
  contacts: styles.contacts,
  contactUpdate: styles.contactUpdate,
  message: styles.message,
  orderConfirmed: styles.orderConfirmed,
  orderUpdated: styles.orderUpdated,
  store: styles.store,
};

export type IconNameType = keyof typeof iconMap;

export function FlowIcon(props: { name: IconNameType }) {
  const { name } = props;
  return <span className={`${iconStyles.icon} ${iconMap[name]}`} />;
}
