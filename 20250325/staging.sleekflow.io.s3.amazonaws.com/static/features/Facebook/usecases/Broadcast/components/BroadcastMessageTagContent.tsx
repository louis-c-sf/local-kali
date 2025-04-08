import React, { ReactNode } from "react";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { MessageTagEnum } from "../../../models/FacebookOTNTypes";
import styles from "./FacebookOTNBroadcastTypeSelection.module.css";
import StatusAlert from "component/shared/StatusAlert";
import { FieldError } from "../../../../../component/shared/form/FieldError";

function ItemTooltip(props: { text: string; tooltip: ReactNode }) {
  return (
    <InfoTooltip
      placement={"right"}
      offset={[0, 30]}
      trigger={
        <div className={"text-full"}>
          <span className={"text"}>{props.text}</span>
        </div>
      }
    >
      {props.tooltip}
    </InfoTooltip>
  );
}

const BroadcastMessageTagContent = (props: {
  setOption: (value: string) => void;
  selectedOption: string;
  errorMessage: string;
  disabled: boolean;
}) => {
  const { setOption, selectedOption, errorMessage, disabled } = props;
  const { t } = useTranslation();
  const messageTagOptions = [
    {
      key: "accountUpdate",
      text: t(
        "broadcast.broadcastTypeSelection.messageTag.dropdown.options.accountUpdate.name"
      ),
      value: MessageTagEnum.account_update,
      content: (
        <ItemTooltip
          text={t(
            "broadcast.broadcastTypeSelection.messageTag.dropdown.options.accountUpdate.name"
          )}
          tooltip={t(
            "broadcast.broadcastTypeSelection.messageTag.dropdown.options.accountUpdate.hint"
          )}
        />
      ),
    },
    {
      key: "postPurchaseUpdate",
      text: t(
        "broadcast.broadcastTypeSelection.messageTag.dropdown.options.postPurchaseUpdate.name"
      ),
      value: MessageTagEnum.post_purchase_update,
      content: (
        <ItemTooltip
          text={t(
            "broadcast.broadcastTypeSelection.messageTag.dropdown.options.postPurchaseUpdate.name"
          )}
          tooltip={t(
            "broadcast.broadcastTypeSelection.messageTag.dropdown.options.postPurchaseUpdate.hint"
          )}
        />
      ),
    },
    {
      key: "confirmedEventUpdate",
      text: t(
        "broadcast.broadcastTypeSelection.messageTag.dropdown.options.confirmedEventUpdate.name"
      ),
      value: MessageTagEnum.confirmed_event_update,
      content: (
        <ItemTooltip
          text={t(
            "broadcast.broadcastTypeSelection.messageTag.dropdown.options.confirmedEventUpdate.name"
          )}
          tooltip={t(
            "broadcast.broadcastTypeSelection.messageTag.dropdown.options.confirmedEventUpdate.hint"
          )}
        />
      ),
    },
  ];

  const warningList = {
    [MessageTagEnum.confirmed_event_update]: [
      t(
        "broadcast.broadcastTypeSelection.messageTag.warning.list.confirmedEventUpdate.notSigned"
      ),
      t(
        "broadcast.broadcastTypeSelection.messageTag.warning.list.confirmedEventUpdate.message"
      ),
    ],
    [MessageTagEnum.post_purchase_update]: [
      t(
        "broadcast.broadcastTypeSelection.messageTag.warning.list.postPurchaseUpdate.message"
      ),
    ],
    [MessageTagEnum.account_update]: [
      t(
        "broadcast.broadcastTypeSelection.messageTag.warning.list.accountUpdate.recurringContent"
      ),
    ],
  };

  return (
    <div className={styles.messageTagContainer}>
      <label htmlFor="messageTag">
        {t("broadcast.broadcastTypeSelection.messageTag.dropdown.label")}
      </label>
      <FieldError text={errorMessage} />
      <Dropdown
        onChange={(_, data: DropdownProps) => {
          setOption(data.value as string);
        }}
        value={selectedOption as string}
        options={messageTagOptions}
        placeholder={t(
          "broadcast.broadcastTypeSelection.messageTag.dropdown.placeholder"
        )}
        selection
        search
        selectOnBlur={false}
        disabled={disabled}
      />
      {selectedOption !== "" && (
        <StatusAlert
          type="warning"
          headerText={t(
            "broadcast.broadcastTypeSelection.messageTag.warning.header"
          )}
          className={styles.warning}
        >
          <>
            <div className="title">
              {t("broadcast.broadcastTypeSelection.messageTag.warning.title")}
            </div>
            <ul>
              <li key="promotional_content">
                {t(
                  "broadcast.broadcastTypeSelection.messageTag.warning.list.common.content"
                )}
              </li>
              {warningList[selectedOption].map(
                (list: string, index: number) => (
                  <li key={index}>{list}</li>
                )
              )}
              <li key="prompt">
                {t(
                  "broadcast.broadcastTypeSelection.messageTag.warning.list.common.prompts"
                )}
              </li>
            </ul>
          </>
        </StatusAlert>
      )}
      <div className={styles.messageTagHint}>
        {t("broadcast.broadcastTypeSelection.messageTag.dropdown.hint")}
      </div>
    </div>
  );
};
export default BroadcastMessageTagContent;
