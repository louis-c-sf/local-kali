import {
  TemplateMessageComponentType,
  Whatsapp360DialogTemplateMessageComponentHeaderType,
  Whatsapp360DialogTemplateMessageComponentBodyType,
  Whatsapp360DialogTemplateMessageComponentTextParameterType,
} from "../../../types/MessageType";
import {
  isHeaderType,
  isBodyType,
} from "../../../types/WhatsappTemplateResponseType";
import { transformToEditableContent } from "./transformToEditableContent";
import { Whatsapp360DialogFileUploadType } from "../../../App/reducers/Chat/whatsappTemplatesReducer";

export function denormalizeTemplateVariables(
  parameters: string[],
  components?: TemplateMessageComponentType[] | undefined
) {
  if (!components) {
    return {
      variables: {
        header: {},
        content: {},
        button: {},
      },
      file: undefined,
    };
  }
  const headerVariables = components.filter(isHeaderType);
  const bodyVariables = components.filter(isBodyType);
  const buttonUrlVariables = components.filter(
    (b) => b.type === "button" && b.sub_type === "url"
  );
  const headerText =
    headerVariables &&
    (
      headerVariables as Whatsapp360DialogTemplateMessageComponentHeaderType[]
    ).filter((variable) =>
      variable.parameters?.filter((p) => p.type === "text")
    );
  const headerFile =
    headerVariables &&
    (
      headerVariables as Whatsapp360DialogTemplateMessageComponentHeaderType[]
    ).filter((variable) =>
      variable.parameters?.filter((p) => p.type !== "text")
    );
  const bodyText =
    bodyVariables &&
    (bodyVariables as Whatsapp360DialogTemplateMessageComponentBodyType[]);
  const [headerTextElem] = headerText ?? [];
  const [bodyTextElem] = bodyText ?? [];
  const [urlTextElem] = buttonUrlVariables ?? [];
  return {
    variables: {
      button: urlTextElem
        ? (
            urlTextElem.parameters as Whatsapp360DialogTemplateMessageComponentTextParameterType[]
          ).reduce((acc, curr, index) => {
            if (!curr.text) {
              return acc;
            }
            return {
              ...acc,
              [`{{${index + 1}}}`]: transformToEditableContent(
                curr.text,
                parameters
              ),
            };
          }, {})
        : {},
      header: headerTextElem
        ? (
            headerTextElem?.parameters as Whatsapp360DialogTemplateMessageComponentTextParameterType[]
          ).reduce((acc, curr, index) => {
            if (!curr.text) {
              return acc;
            }
            return {
              ...acc,
              [`{{${index + 1}}}`]: transformToEditableContent(
                curr.text,
                parameters
              ),
            };
          }, {})
        : {},
      content: bodyTextElem
        ? (
            bodyTextElem?.parameters as Whatsapp360DialogTemplateMessageComponentTextParameterType[]
          ).reduce(
            (acc, curr, index) => ({
              ...acc,
              [`{{${index + 1}}}`]: transformToEditableContent(
                curr.text,
                parameters
              ),
            }),
            {}
          )
        : {},
    },
    file: convertHeaderFile(
      headerFile && headerFile.length > 0
        ? (headerFile
            .map((h) => h.parameters)
            .flat(1) as Whatsapp360DialogFileUploadType[])
        : undefined
    ),
  };
}

function convertHeaderFile(headerFile?: Whatsapp360DialogFileUploadType[]) {
  if (!headerFile) {
    return undefined;
  }
  const [file] = headerFile;
  return file;
}
