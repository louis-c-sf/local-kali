import { CloudAPITemplateFormValue } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";
import { Whatsapp360DialogTemplateMessageComponentButtonType } from "types/MessageType";
import { walkWhatsappTemplateParts } from "component/Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";
import { whereEq } from "ramda";

export function buildButtons(
  item: CloudAPITemplateFormValue
): Whatsapp360DialogTemplateMessageComponentButtonType[] {
  if (!item.buttons.buttons) {
    return [];
  }

  return item.buttons.buttons.reduce<
    Whatsapp360DialogTemplateMessageComponentButtonType[]
  >((acc, btn, idx) => {
    if (btn.type === "CALL_TO_ACTION" && btn.buttonType === "URL" && btn.url) {
      const vars = walkWhatsappTemplateParts(btn.url).filter(
        whereEq({ type: "var" })
      );
      if (vars.length > 0) {
        return [
          ...acc,
          {
            type: "button",
            sub_type: "url",
            parameters: vars.map((v, idx) => ({
              type: "text",
              text: "",
              index: idx,
            })),
            text: btn.text,
            index: idx,
          },
        ];
      }
    }
    return acc;
  }, []);
}
