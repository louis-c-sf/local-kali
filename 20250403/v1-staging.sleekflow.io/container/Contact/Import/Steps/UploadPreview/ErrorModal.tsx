import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { FlatModal } from "component/shared/modal/FlatModal";
import { Button, Modal } from "semantic-ui-react";
import { CopyField } from "component/Channel/CopyField";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";
import React from "react";

export function ErrorModal(props: { error: string; onClose: () => void }) {
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  function onCopy() {
    flash(t("form.field.copy.copied"));
  }

  return (
    <FlatModal
      open
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      size={"small"}
    >
      <Modal.Header>
        {t("profile.list.import.modal.previewError.header")}
      </Modal.Header>
      <Modal.Content>
        <Trans
          i18nKey={"profile.list.import.modal.previewError.text"}
          values={{ error: props.error }}
        >
          <p>
            Please copy below error code below and contact our customer support.
          </p>
          <CopyField
            label={""}
            onCopy={onCopy}
            long={true}
            text={props.error}
          />
        </Trans>
      </Modal.Content>
      <Modal.Actions className={"vertical"}>
        <a
          href={getWhatsAppSupportUrl()}
          className={"ui button primary"}
          target={"_blank"}
          rel={"noreferrer noopener"}
        >
          {t("profile.list.import.modal.previewError.help")}
        </a>
        <Button onClick={props.onClose}>{t("nav.backShort")}</Button>
      </Modal.Actions>
    </FlatModal>
  );
}
