import { Button, Modal } from "semantic-ui-react";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ChannelInfoConfiguredType } from "../../types/ChannelInfoType";

export function RemoveChannelModal(props: {
  showModal: boolean;
  onClose: () => void;
  loading: boolean;
  onExecute: (channel: ChannelInfoConfiguredType<any>) => void;
  onCancel: () => void;
  channel: ChannelInfoConfiguredType<any>;
}) {
  const { onCancel, onClose, onExecute, loading, showModal, channel } = props;
  const [error, setError] = useState<string>();
  const { t } = useTranslation();
  const isBlocked = loading && !error;

  return (
    <Modal
      open={showModal}
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={"wizard-modal"}
      size={"small"}
      onClose={onClose}
    >
      <Modal.Header className={"negative"}>
        {t("channels.form.remove.header")}
      </Modal.Header>
      <Modal.Content>
        <Trans
          i18nKey={"channels.form.remove.text"}
          values={{ name: channel.title }}
        >
          If you remove this {channel.title} channel from SleekFlow, your users
          will no longer be able to see any of its messages from the channel.
          However, previous messages will still be preserved in this workspace.
          <br />
          Are you sure you wish to do this?
        </Trans>
      </Modal.Content>
      <Modal.Actions>
        <Button
          primary
          onClick={async () => {
            if (isBlocked) {
              return;
            }
            try {
              setError(undefined);
              await onExecute(channel);
            } catch (e) {
              setError(t("form.field.any.error.common"));
            }
          }}
          disabled={isBlocked}
          loading={isBlocked}
        >
          {t("channels.form.remove.buttons.yes")}
        </Button>
        <Button onClick={loading ? undefined : onCancel} disabled={isBlocked}>
          {t("form.button.cancel")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
