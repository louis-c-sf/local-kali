import { CloudAPITemplateFormValue } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";
import {
  TemplateMessageComponentType,
  Whatsapp360DialogTemplateMessageComponentHeaderType,
  Whatsapp360DialogTemplateMessageComponentHeaderParameterType,
} from "types/MessageType";
import { HeaderFormatEnum } from "types/WhatsappTemplateResponseType";
import { walkWhatsappTemplateParts } from "component/Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";

export function buildHeader(
  item: CloudAPITemplateFormValue
): Whatsapp360DialogTemplateMessageComponentHeaderType | undefined {
  switch (item.header.format) {
    case HeaderFormatEnum.TEXT:
      if (item.header.text) {
        const params = walkWhatsappTemplateParts(item.header.text).filter(
          (p) => p.type === "var"
        );
        if (params.length > 0) {
          return {
            type: "header",
            parameters:
              params.map<Whatsapp360DialogTemplateMessageComponentHeaderParameterType>(
                () => ({
                  text: "",
                  type: "text",
                })
              ),
          };
        }
      }
      break;

    case HeaderFormatEnum.DOCUMENT:
      return {
        type: "header",
        parameters: [
          {
            type: "document",
            document: {
              link: "",
              filename: "",
            },
          },
        ],
      };

    case HeaderFormatEnum.IMAGE:
      return {
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: "",
            },
          },
        ],
      };

    case HeaderFormatEnum.VIDEO:
      return {
        type: "header",
        parameters: [
          {
            type: "video",
            video: {
              link: "",
            },
          },
        ],
      };
  }
}
