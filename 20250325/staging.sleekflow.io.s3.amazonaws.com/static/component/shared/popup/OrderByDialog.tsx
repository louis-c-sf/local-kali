import React, { RefObject, useRef, useState } from "react";
import { Portal } from "semantic-ui-react";
import { Placement } from "@popperjs/core";
import { usePopperPopup } from "./usePopperPopup";
import { isRef } from "../../../utility/isRef";
import { OrderByOptionType } from "../../../types/state/InboxStateType";
import styles from "./OrderByDialog.module.css";

const Items = (props: { options: OrderByOptionType[]; title: string }) => {
  const { title, options } = props;
  return (
    <ul>
      <div className={styles.title}>{title}</div>
      {options.map((option) => (
        <li
          className={option.isActive ? "active" : ""}
          onClick={option.onClick}
        >
          {option.label}
        </li>
      ))}
    </ul>
  );
};
const OrderByDialog = (props: {
  popperPlacement?: Placement;
  close: () => void;
  triggerRef: React.RefObject<HTMLElement | null> | HTMLElement | null;
  options: OrderByOptionType[];
  title: string;
  mountElement?: HTMLElement;
  className?: string;
  flowing?: boolean;
  small?: boolean;
  compact?: boolean;
  offset?: [number, number];
  ignoreOutsideClickNodes?: Array<RefObject<Element | null> | Element | null>;
  closeOnDocumentClick?: boolean;
  key?: string;
}) => {
  const {
    close,
    triggerRef,
    mountElement,
    ignoreOutsideClickNodes = [],
    closeOnDocumentClick = true,
    small = true,
    compact = false,
    options,
    title,
  } = props;

  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);

  const triggerRefInner = useRef<HTMLElement | null>(null);
  let passTriggerRef = null;

  if (triggerRef !== null) {
    if (!isRef(triggerRef)) {
      passTriggerRef = triggerRefInner;
      triggerRefInner.current = props.triggerRef as HTMLElement | null;
    } else {
      passTriggerRef = triggerRef;
    }
  }

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: triggerRef,
      onClose: close,
      placement: props.popperPlacement ?? "auto",
      offset: props.offset ?? [0, 0],
      ignoreOutsideClickNodes,
      closeOnOutsideClick: closeOnDocumentClick,
    },
    []
  );
  return (
    <Portal
      open
      onClose={close}
      mountNode={mountElement ?? document.body}
      triggerRef={passTriggerRef}
      closeOnDocumentClick={closeOnDocumentClick}
    >
      <div
        ref={setPopupNode}
        className={`app ui popup searchable visible dialog dropdown static 
          ${small ? "small" : ""}
          ${compact ? "compact" : ""}
          ${props.flowing ? "flowing" : ""}
          ${props.className ?? ""}
          ${styles.orderByPopup}`}
      >
        <Items options={options} title={title} />
      </div>
    </Portal>
  );
};
export default OrderByDialog;
