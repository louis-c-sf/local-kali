import {
  walkWhatsappTemplateParts,
  isVarNode,
} from "./walkWhatsappTemplateParts";
import { prop, assoc } from "ramda";
import {
  isURLButton,
  TemplateVariableState,
} from "../../../../App/reducers/Chat/whatsappTemplatesReducer";
import { OptInContentType } from "../../../../features/Whatsapp360/models/OptInType";

export function getDefaultVariableValues(
  templateText?: OptInContentType
): TemplateVariableState {
  if (!templateText) {
    return {
      header: {},
      content: {},
      button: {},
    };
  }
  let variables = {
    header: {},
    content: {},
    button: {},
  };
  if (templateText.header?.format === "TEXT" && templateText.header.text) {
    variables = {
      ...variables,
      header: { ...formatVariable(templateText.header.text) },
    };
  }
  const urlButton = templateText.buttons?.find(isURLButton);
  if (urlButton) {
    variables = {
      ...variables,
      button: {
        ...formatVariable(urlButton.url ?? ""),
      },
    };
  }

  return {
    ...variables,
    content: { ...formatVariable(templateText.content) },
  };
}
function formatVariable(content: string) {
  const fragments = walkWhatsappTemplateParts(content);
  const templateVars = fragments.filter(isVarNode).map(prop("name"));
  const newVar = templateVars.reduce((prev, next) => assoc(next, "", prev), {});
  return { ...newVar };
}
