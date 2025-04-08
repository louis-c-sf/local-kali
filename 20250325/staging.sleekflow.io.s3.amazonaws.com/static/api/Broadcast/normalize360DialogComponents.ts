import {
  GenericSendWhatsappTemplate,
  isURLButton,
} from "../../App/reducers/Chat/whatsappTemplatesReducer";
import {
  TemplateMessageComponentType,
  Whatsapp360DialogTemplateMessageComponentHeaderType,
  Whatsapp360DialogTemplateMessageComponentBodyType,
  Whatsapp360DialogTemplateMessageComponentImageParameterType,
  Whatsapp360DialogTemplateMessageComponentDocumentParameterType,
  Whatsapp360DialogTemplateMessageComponentVideoParameterType,
} from "../../types/MessageType";
import { OptInContentType } from "../../features/Whatsapp360/models/OptInType";

export function normalize360DialogComponents(
  whatsappTemplate: OptInContentType,
  templateContent: GenericSendWhatsappTemplate
): Array<TemplateMessageComponentType> | undefined {
  let header: Whatsapp360DialogTemplateMessageComponentHeaderType | undefined =
    undefined;
  let bodyParameter:
    | Whatsapp360DialogTemplateMessageComponentBodyType
    | undefined = undefined;
  let components: Array<TemplateMessageComponentType> = [];
  const templateHeader = whatsappTemplate.header;
  if (templateHeader) {
    if (templateHeader.format === "TEXT") {
      const textParameters = Object.keys(templateContent.variables.header);
      if (textParameters.length > 0) {
        header = {
          type: "header",
          parameters: textParameters.map((param) => ({
            type: "text",
            text: templateContent.variables.header[param],
          })),
        };
      }
    } else if (templateContent.file) {
      if (templateHeader.format === "IMAGE") {
        const image =
          templateContent.file as Whatsapp360DialogTemplateMessageComponentImageParameterType;
        header = {
          type: "header",
          parameters: [
            {
              ...image,
            },
          ],
        };
      } else if (templateHeader.format === "DOCUMENT") {
        const document =
          templateContent.file as Whatsapp360DialogTemplateMessageComponentDocumentParameterType;
        header = {
          type: "header",
          parameters: [
            {
              ...document,
            },
          ],
        };
      } else if (templateHeader.format === "VIDEO") {
        const video =
          templateContent.file as Whatsapp360DialogTemplateMessageComponentVideoParameterType;
        header = {
          type: "header",
          parameters: [
            {
              ...video,
            },
          ],
        };
      }
    }
    if (header) {
      components = [header];
    }
  }
  const contentParameters = Object.values(templateContent.variables.content);
  if (contentParameters.length > 0) {
    bodyParameter = {
      type: "body",
      parameters: contentParameters.map((value) => ({
        type: "text",
        text: value,
      })),
    };
    components = [...components, bodyParameter];
  }
  const urlButtonIndex = whatsappTemplate.buttons?.findIndex(isURLButton);
  const urlParameters = Object.values(templateContent.variables.button);
  if (urlParameters.length && urlButtonIndex !== undefined) {
    components = [
      ...components,
      {
        type: "button",
        sub_type: "url",
        index: urlButtonIndex,
        parameters: urlParameters.map((value) => ({
          type: "text",
          text: value,
        })),
      },
    ];
  }
  return components.length > 0 ? components : undefined;
}
