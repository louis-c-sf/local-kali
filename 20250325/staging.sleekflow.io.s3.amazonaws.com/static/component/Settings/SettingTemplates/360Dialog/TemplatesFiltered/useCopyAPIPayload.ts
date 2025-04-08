import { copyToClipboard } from "utility/copyToClipboard";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { WhatsappWebhookPayloadType } from "features/Whatsapp360/models/WhatsappWebhookPayloadType";
import { ExtendedMessagePayloadType } from "types/MessageType";
import { htmlEscape } from "../../../../../lib/utility/htmlEscape";

export function useCopyAPIPayload() {
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const copyW360Payload = (template: WhatsappWebhookPayloadType) => {
    copyPayload(JSON.stringify(template.extendedMessage, undefined, 2));
  };

  const copyW360ZapierPayload = (template: WhatsappWebhookPayloadType) => {
    copyPayload(JSON.stringify(template.extendedMessage, undefined, 0));
  };

  function copyCloudAPIPayload(template: ExtendedMessagePayloadType) {
    copyPayload(
      JSON.stringify(template.extendedMessagePayloadDetail, undefined, 2)
    );
  }

  function copyCloudAPIZapierPayload(template: ExtendedMessagePayloadType) {
    copyPayload(
      JSON.stringify(template.extendedMessagePayloadDetail, undefined, 0)
    );
  }

  function copyPayload(content: string) {
    try {
      copyToClipboard(content);
      flash(t("flash.inbox.message.copied"));
    } catch (e) {
      flash(t("flash.common.error.general", { error: htmlEscape(`${e}`) }));
      console.error(e);
    }
  }

  return {
    copyWhatsapp360: copyW360Payload,
    copyWhatsapp360Zapier: copyW360ZapierPayload,
    copyCloudApi: copyCloudAPIPayload,
    copyCloudApiZapier: copyCloudAPIZapierPayload,
  };
}
