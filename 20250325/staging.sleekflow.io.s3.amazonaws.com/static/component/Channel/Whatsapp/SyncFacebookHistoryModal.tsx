import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button, Form, Image, Modal } from "semantic-ui-react";
import { GET_FACEBOOK_SYNC } from "../../../api/apiPath";
import { getWithExceptions } from "../../../api/apiRequest";
import WhatsappSyncImg from "../../../assets/images/whatsapp-sync.svg";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { CloseButton } from "../../shared/CloseButton";

export default function SyncFacebookHistoryModal(props: {
  pageId: string | undefined;
  onDismiss: () => void;
  open: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const { pageId, onDismiss, open } = props;
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();

  async function syncHistory() {
    setLoading(true);
    try {
      if (pageId) {
        await getWithExceptions(GET_FACEBOOK_SYNC.replace("{pageId}", pageId), {
          param: {},
        });
        flash(t("flash.channels.sync.facebook.success"));
        onDismiss();
      }
    } catch (e) {
      console.error(`syncHistory error ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal className="sync-history-modal" open={open}>
      <Modal.Content>
        <CloseButton onClick={onDismiss} />
        <div className="header">
          <Trans i18nKey="channels.syncFacebook.header">
            Syncing conversations
            <br />
            from Facebook Messenger
          </Trans>
        </div>
        <Image fluid src={WhatsappSyncImg} />
        <div className="content">
          <Trans i18nKey="channels.syncFacebook.text">
            You may sync all your past contacts and conversations on
            <br />
            Facebook Messenger. Please also be aware of your contact limits.
          </Trans>
          <Form className="form">
            <Button
              primary
              content={t("channels.syncFacebook.buttons.syncNow")}
              loading={loading}
              onClick={loading ? undefined : syncHistory}
            />
          </Form>
        </div>
      </Modal.Content>
    </Modal>
  );
}
