import React, { useEffect, useState } from "react";
import { Checkbox } from "semantic-ui-react";
import { ModalForm } from "../../../shared/ModalForm";
import { TargetedChannelType } from "../../../../types/BroadcastCampaignType";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ChannelsValueDropdown } from "../../../shared/ChannelsValueDropdown";
import styles from "./SelectInitTemplates.module.css";
import { ChannelType } from "../../../Chat/Messenger/types";
import { useAppDispatch } from "AppRootContext";

export function SelectInitTemplates(props: {
  channelsAllowed: ChannelType[];
  confirm: (value: TargetedChannelType[], selectAll: boolean) => void;
}) {
  const { channelsAllowed, confirm } = props;
  const [value, setValue] = useState<TargetedChannelType[]>([]);
  const { t } = useTranslation();
  const history = useHistory();
  const loginDispatch = useAppDispatch();
  useEffect(() => {
    loginDispatch({
      type: "INBOX.WHATSAPP_360TEMPLATE.RESET",
    });
  }, []);
  return (
    <ModalForm
      onConfirm={() => confirm(value, false)}
      title={t("broadcast.edit.initChannels.title")}
      opened
      centeredContent
      horizontalActions
      disableSubmit={value.length === 0}
      confirmText={t("form.button.next")}
      onCancel={history.goBack}
      cancelText={t("form.button.cancel")}
      isLoading={false}
    >
      <div className={`ui form ${styles.form}`}>
        <p>{t("broadcast.edit.initChannels.text")}</p>
        <div className={`field ${styles.field}`}>
          <ChannelsValueDropdown
            value={value}
            multiple={false}
            excludeAll
            onChange={setValue}
            enabledChannels={channelsAllowed}
          />
        </div>
      </div>
    </ModalForm>
  );
}
