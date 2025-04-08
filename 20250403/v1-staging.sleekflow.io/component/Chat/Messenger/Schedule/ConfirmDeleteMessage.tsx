import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../AppRootContext";
import { DangerModal } from "../../../shared/modal/DangerModal";

export function ConfirmDeleteMessage(props: { messageId: number }) {
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();

  return (
    <DangerModal
      title={t("chat.schedule.confirm.title")}
      cancel={{
        content: t("chat.schedule.confirm.cancel"),
        handle: () => {
          loginDispatch({
            type: "INBOX.SCHEDULE.MESSAGE_DELETE_CANCEL",
          });
        },
      }}
      confirm={{
        content: t("chat.schedule.confirm.delete"),
        handle: () => {
          loginDispatch({
            type: "INBOX.SCHEDULE.MESSAGE_DELETE_CONFIRM",
            messageId: props.messageId,
          });
        },
      }}
      body={
        <Trans i18nKey={"chat.schedule.confirm.body"}>
          Are you sure you want to delete your scheduled message permanently?
          This cannot be undone.
        </Trans>
      }
    />
  );
}
