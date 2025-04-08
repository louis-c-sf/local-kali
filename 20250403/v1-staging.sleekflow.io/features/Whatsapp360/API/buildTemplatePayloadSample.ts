import { TemplateGridItemType } from "../components/TemplatesGrid/TemplatesGrid";
import { WhatsappWebhookPayloadType } from "../models/WhatsappWebhookPayloadType";
import {
  TemplateMessageComponentType,
  Whatsapp360DialogTemplateMessageComponentButtonType,
} from "../../../types/MessageType";
import { HeaderFormatEnum } from "../../../types/WhatsappTemplateResponseType";
import { walkWhatsappTemplateParts } from "../../../component/Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";
import { whereEq } from "ramda";

export function buildTemplatePayloadSample(
  item: TemplateGridItemType
): WhatsappWebhookPayloadType {
  return {
    channel: "whatsapp360dialog",
    from: "",
    to: "",
    messageType: "template",
    extendedMessage: {
      whatsapp360DialogTemplateMessage: {
        templateName: item.id,
        templateNamespace: item.template.namespace ?? "",
        language: item.language,
        components: buildComponents(item),
      },
    },
  };
}

function buildComponents(
  item: TemplateGridItemType
): TemplateMessageComponentType[] {
  const result: TemplateMessageComponentType[] = [];
  const template = item.template;

  if (template.header) {
    switch (template.header.format) {
      case HeaderFormatEnum.TEXT:
        const params = walkWhatsappTemplateParts(
          template.header.text ?? ""
        ).filter((p) => p.type === "var");
        if (params.length > 0) {
          result.push({
            type: "header",
            parameters: params.map(() => ({
              text: "",
              type: "text",
            })),
          });
        }
        break;

      case HeaderFormatEnum.DOCUMENT:
        result.push({
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
        });
        break;

      case HeaderFormatEnum.IMAGE:
        result.push({
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                link: "",
                filename: "",
              },
            },
          ],
        });
        break;

      case HeaderFormatEnum.VIDEO:
        result.push({
          type: "header",
          parameters: [
            {
              type: "video",
              video: {
                link: "",
              },
            },
          ],
        });
        break;
    }
  }

  const contentVars = walkWhatsappTemplateParts(
    template.body?.text ?? template.content ?? ""
  ).filter((p) => p.type === "var");
  if (contentVars.length > 0) {
    result.push({
      type: "body",
      parameters: contentVars.map((_, idx) => {
        return { text: `{{${idx + 1}}}`, type: "text" };
      }),
    });
  }

  if (template.buttons) {
    const subtype: Record<
      string,
      Whatsapp360DialogTemplateMessageComponentButtonType["sub_type"]
    > = {
      QUICK_REPLY: "quick_reply",
      PHONE_NUMBER: "phone",
      URL: "url",
    };

    for (let idx = 0; idx < template.buttons.length; idx++) {
      const btn = template.buttons[idx];
      if (btn.type === "URL" && btn.url) {
        const vars = walkWhatsappTemplateParts(btn.url).filter(
          whereEq({ type: "var" })
        );
        if (vars.length > 0) {
          result.push({
            type: "button",
            sub_type: subtype[btn.type],
            parameters: vars.map((v, idx) => ({
              type: "text",
              text: "",
              index: idx,
            })),
            index: result.length,
          });
        }
      }
    }
  }

  return result;
}
