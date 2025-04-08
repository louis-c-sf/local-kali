import { AutomationTypeEnum } from "../../../../types/AssignmentRuleType";
import styles from "./TypeLabel.module.css";
import React, { ReactNode } from "react";
import { TriggerIcon } from "./TriggerIcon";
import { IncomingMessageIcon } from "./assets/trigger/IncomingMessageIcon";
import { UpdatedContactIcon } from "./assets/trigger/UpdatedContactIcon";
import { ScheduleIcon } from "./assets/trigger/ScheduleIcon";

const COLOR_MAP: { [k in AutomationTypeEnum]: string } = {
  MessageReceived: styles.blue,
  NewContactMessage: styles.red,
  ContactAdded: styles.red,
  Assignment: styles.gray,
  RecurringJob: styles.yellow,
  ShopifyNewAbandonedCart: styles.gray,
  ShopifyNewCustomerTrigger: styles.darkBlue,
  ShopifyUpdatedCustomerTrigger: styles.darkBlue,
  FieldValueChanged: styles.red,
  ShopifyNewOrUpdatedOrderTrigger: styles.green,
  ShopifyFulfillmentStatusTrigger: styles.purple,
  FacebookPostComment: styles.purple,
  InstagramMediaComment: styles.purple,
  OutgoingMessageTrigger: styles.blue,
};
//TODO: not sure color of FB/IG

const ICON_MAP: { [key in AutomationTypeEnum]?: ReactNode } = {
  MessageReceived: <IncomingMessageIcon />,
  NewContactMessage: <UpdatedContactIcon />,
  ContactAdded: <UpdatedContactIcon />,
  // Assignment: styles.gray,
  RecurringJob: <ScheduleIcon />,
  ShopifyNewAbandonedCart: (
    <TriggerIcon name={"shopifyAbandonedCart"} size={"small"} shifted />
  ),
  ShopifyNewCustomerTrigger: (
    <TriggerIcon name={"shopifyUpdatedCustomers"} size={"small"} shifted />
  ),
  FieldValueChanged: <UpdatedContactIcon />,
  ShopifyNewOrUpdatedOrderTrigger: (
    <TriggerIcon name={"shopifyOrderUpdate"} size={"small"} shifted />
  ),
  ShopifyFulfillmentStatusTrigger: (
    <TriggerIcon name={"shopifyFulfillmentUpdate"} size={"small"} shifted />
  ),
};

export function TypeLabel(props: {
  automationType: AutomationTypeEnum;
  name: string;
  onClose?: () => void;
}) {
  const icon = ICON_MAP[props.automationType];
  return (
    <div className={`${styles.label} ${COLOR_MAP[props.automationType]}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.name}>{props.name}</span>
      {props.onClose && (
        <span
          className={styles.close}
          onClick={(e) => {
            e.stopPropagation();
            props.onClose!();
          }}
        >
          &times;
        </span>
      )}
    </div>
  );
}
