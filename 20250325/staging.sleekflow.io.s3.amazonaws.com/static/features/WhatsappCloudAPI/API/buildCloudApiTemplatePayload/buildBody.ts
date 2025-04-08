import { CloudAPITemplateFormValue } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";
import { Whatsapp360DialogTemplateMessageComponentBodyType } from "types/MessageType";
import { walkWhatsappTemplateParts } from "component/Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";

export function buildBody(
  data: CloudAPITemplateFormValue
): Whatsapp360DialogTemplateMessageComponentBodyType | undefined {
  const contentVars = walkWhatsappTemplateParts(data.body.text ?? "").filter(
    (p) => p.type === "var"
  );
  if (contentVars.length === 0) {
    return;
  }
  return {
    type: "body",
    parameters: contentVars.map((_, idx) => {
      return { text: `{{${idx + 1}}}`, type: "text" };
    }),
  };
}
