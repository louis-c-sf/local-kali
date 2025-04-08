import { WhatsappTemplateCallbackType } from "../../API/fetchCallbackTemplates";
import { IdNormalizedWhatsAppTemplateLanguageType } from "../../../../component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";

export function containsCallback(callback: WhatsappTemplateCallbackType) {
  return (tpl: IdNormalizedWhatsAppTemplateLanguageType) => {
    return tpl.id === callback.templateName;
  };
}
