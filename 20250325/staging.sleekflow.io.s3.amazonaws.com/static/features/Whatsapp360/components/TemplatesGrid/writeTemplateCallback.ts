import { WhatsappTemplateCallbackType } from "../../API/fetchCallbackTemplates";
import { IdNormalizedWhatsAppTemplateLanguageType } from "../../../../component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { containsCallback } from "./containsCallback";
import { adjust } from "ramda";
import { NormalizedWhatsAppTemplateLanguageType } from "../../models/OptInType";

export function writeTemplateCallback(callback: WhatsappTemplateCallbackType) {
  return (
    templates: IdNormalizedWhatsAppTemplateLanguageType[] | undefined
  ) => {
    if (!templates) {
      return;
    }

    const matchIndex = templates.findIndex(containsCallback(callback));
    if (matchIndex > -1) {
      return adjust(
        matchIndex,
        (tpl) => {
          const updatedTemplate: NormalizedWhatsAppTemplateLanguageType = {
            ...tpl.template,
            callbacks: callback.callbackActions,
          };
          return { id: tpl.id, template: updatedTemplate };
        },
        templates
      );
    }
    return templates;
  };
}
