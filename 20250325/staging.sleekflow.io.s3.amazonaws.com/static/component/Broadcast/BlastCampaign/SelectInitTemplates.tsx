import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import styles from "./SelectInitTemplates.module.css";
import { ChannelType } from "../../Chat/Messenger/types";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { ModalForm } from "../../shared/ModalForm";
import { ChannelsValueDropdown } from "../../shared/ChannelsValueDropdown";

export function SelectInitTemplates(props: {
  channelsAllowed: ChannelType[];
  confirm: (value: TargetedChannelType) => void;
  loading: boolean;
}) {
  const { channelsAllowed, confirm } = props;
  const [value, setValue] = useState<TargetedChannelType>();
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <ModalForm
      onConfirm={() => {
        value && confirm(value);
      }}
      title={t("broadcast.edit.initChannels.title")}
      opened
      centeredContent
      horizontalActions
      disableSubmit={value === undefined}
      confirmText={t("form.button.next")}
      onCancel={() => history.goBack()}
      cancelText={t("form.button.cancel")}
      isLoading={props.loading}
    >
      <div className={`ui form ${styles.form}`}>
        <p>{t("broadcast.edit.initChannels.text")}</p>
        <div className={`field ${styles.field}`}>
          <ChannelsValueDropdown
            value={value ? [value] : []}
            excludeAll
            search={false}
            onChange={(value) => setValue(value[0])}
            enabledChannels={channelsAllowed}
            multiple={false}
          />
        </div>
      </div>
    </ModalForm>
  );
}
