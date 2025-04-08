import React, { useState } from "react";
import { Ref } from "semantic-ui-react";
import OrderByDialog from "component/shared/popup/OrderByDialog";
import iconStyles from "../../shared/Icon/Icon.module.css";
import styles from "./OrderByDropdown.module.css";
import {
  InboxOrderDic,
  InboxOrderDictEnum,
  OrderByOptionType,
} from "../../../types/state/InboxStateType";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { equals } from "ramda";

const OrderByDropdown = () => {
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const orderBy = useAppSelector((s) => s.inbox.filter.orderBy, equals);
  const [opened, setOpened] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null
  );

  function onClose() {
    setOpened(false);
  }

  const handleClick = (option: InboxOrderDictEnum) => {
    loginDispatch({
      type: "CHAT_UPDATE_ORDERBY",
      orderBy: option,
    });
    onClose();
  };

  const title = t("chat.sort.title");
  const options = [
    {
      key: "newest",
      value: InboxOrderDic.newest,
      label: t("chat.sort.options.newest"),
      onClick: () => handleClick(InboxOrderDic.newest),
      isActive: orderBy === InboxOrderDic.newest,
      isDisabled: false,
    },
    {
      key: "oldest",
      value: InboxOrderDic.oldest,
      label: t("chat.sort.options.oldest"),
      onClick: () => handleClick(InboxOrderDic.oldest),
      isActive: orderBy === InboxOrderDic.oldest,
      isDisabled: false,
    },
  ];

  let ignoreOutsideClickNodes: Element[] = [];
  if (triggerElement) {
    ignoreOutsideClickNodes.push(triggerElement);
  }

  return (
    <>
      <Ref innerRef={setTriggerElement}>
        <div
          className={styles.orderByDropdown}
          onClick={() => {
            setOpened((o) => !o);
          }}
        >
          <span className={`${iconStyles.icon} ${styles.sortIcon}`} />
        </div>
      </Ref>
      {opened && (
        <OrderByDialog
          small={false}
          close={onClose}
          triggerRef={triggerElement}
          mountElement={triggerElement?.parentElement ?? undefined}
          popperPlacement={"bottom-start"}
          offset={[0, 14]}
          ignoreOutsideClickNodes={ignoreOutsideClickNodes}
          options={options as OrderByOptionType[]}
          title={title}
        />
      )}
    </>
  );
};
export default OrderByDropdown;
