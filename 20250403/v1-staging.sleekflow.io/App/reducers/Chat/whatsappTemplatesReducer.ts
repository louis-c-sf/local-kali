import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import { getDefaultVariableValues } from "../../../component/Chat/Messenger/SelectWhatsappTemplate/getDefaultVariableValues";
import {
  Whatsapp360DialogTemplateMessageComponentHeaderParameterType,
  Whatsapp360DialogTemplateMessageComponentTextParameterType,
} from "../../../types/MessageType";
import { getLocalTemplateLocale } from "../../../features/Whatsapp360/API/getLocalTemplateLocale";
import { getLocalTemplate } from "../../../features/Whatsapp360/API/getLocalTemplate";
import { matchesMessageDraft } from "component/Chat/mutators/chatSelectors";
import { reject } from "ramda";
import { defaultTemplateState } from "component/Chat/Messenger/messengerReducer";
import {
  NormalizedWhatsAppTemplateType,
  OptInType,
  NormalizedWhatsAppTemplateLanguageType,
} from "../../../features/Whatsapp360/models/OptInType";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { WhatsappTemplateComponentButtonType } from "types/WhatsappTemplateResponseType";

export type WhatsappTemplateType = {
  booted: boolean;
  data: NormalizedWhatsAppTemplateType;
};
export type WhatsappTemplatesStateType = {
  templates: {
    booted: boolean;
    data: NormalizedWhatsAppTemplateType;
  };
  whatsapp360Templates: {
    booted: boolean;
    data: NormalizedWhatsAppTemplateType;
  };
  whatsappCloudApiTemplates: Array<{
    data: NormalizedWhatsAppTemplateType;
    channelId: number;
  }>;
  optIn: {
    booted: boolean;
    data: OptInType;
  };
};

export type UPDATED_PART_ENUM = "header" | "content" | "button";
export type Whatsapp360DialogFileUploadType = Exclude<
  Whatsapp360DialogTemplateMessageComponentHeaderParameterType,
  Whatsapp360DialogTemplateMessageComponentTextParameterType
>;
export type WhatsappTemplatesActionType =
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.VAR_UPDATED";
      updatedPart: UPDATED_PART_ENUM;
      name: string;
      value: string;
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.HAS_ERROR";
      hasError: boolean;
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.FILE_UPLOADED";
      file: Whatsapp360DialogFileUploadType;
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.FILE_REMOVED";
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.VAR_FOCUS";
      name: string;
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.SELECTED";
      templateId: string;
      language: string;
      contentSid?: string;
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.RESET";
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.MODAL.CANCEL";
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.MODAL.OPEN";
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATE.MODE_CHANGED";
      mode: "type" | "template";
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATES.LOADED";
      templates: NormalizedWhatsAppTemplateType;
    }
  | {
      type: "INBOX.WHATSAPP_TEMPLATES.OPTIN_LOADED";
      optIn: OptInType;
    }
  | {
      type: "INBOX.WHATSAPP_360TEMPLATE.LOADED";
      templates: NormalizedWhatsAppTemplateType;
    }
  | {
      type: "INBOX.WHATSAPP_360TEMPLATE.RESET";
    }
  | {
      type: "INBOX.WHATSAPP_CLOUDAPI.LOADED";
      templates: NormalizedWhatsAppTemplateType;
      channelId: number;
    };
export type TemplateVariableState = {
  header: Record<string, string>;
  content: Record<string, string>;
  button: Record<string, string>;
};

export interface GenericSendWhatsappTemplate {
  variables: TemplateVariableState;
  lastVarInputId?: string;
  file?: Whatsapp360DialogFileUploadType;
}

export type SendWhatsappTemplateModeType = "type" | "template" | "off";

export interface SendWhatsappTemplateState extends GenericSendWhatsappTemplate {
  mode: SendWhatsappTemplateModeType;
  templateId?: string;
  language?: string;
  isTemplatesSelectionVisible: boolean;
  isHeaderFileRequired: boolean;
  contnentSid?: string;
  hasError: boolean;
}

export function defaultSendTemplateState(
  mode?: SendWhatsappTemplateModeType
): SendWhatsappTemplateState {
  return {
    mode: mode ?? "off",
    language: undefined,
    variables: {
      header: {},
      content: {},
      button: {},
    },
    isTemplatesSelectionVisible: false,
    templateId: undefined,
    isHeaderFileRequired: false,
    lastVarInputId: undefined,
    file: undefined,
    hasError: false,
  };
}
export function isURLButton(button: WhatsappTemplateComponentButtonType) {
  return button.type === "URL" && button.text && button.url;
}
export const whatsappTemplatesReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const whatsappDraft = draft.inbox.whatsAppTemplates;
    const sendTemplateDraft = draft.inbox.messenger.sendWhatsappTemplate;
    const messengerDraft = draft.inbox.messenger;
    const defaultMode = draft.isDisplayTwilioDefaultoMessage ? "off" : "type";
    switch (action.type) {
      case "INBOX.WHATSAPP_TEMPLATES.LOADED":
        whatsappDraft.templates = {
          booted: true,
          data: action.templates,
        };
        break;

      case "INBOX.WHATSAPP_TEMPLATES.OPTIN_LOADED":
        whatsappDraft.optIn = {
          booted: true,
          data: action.optIn,
        };
        break;

      case "INBOX.WHATSAPP_360TEMPLATE.RESET":
        whatsappDraft.whatsapp360Templates = defaultTemplateState();
        break;
      case "INBOX.WHATSAPP_360TEMPLATE.LOADED":
        whatsappDraft.whatsapp360Templates = {
          booted: true,
          data: action.templates,
        };
        break;
      case "INBOX.WHATSAPP_TEMPLATE.MODE_CHANGED":
        messengerDraft.sendWhatsappTemplate = {
          ...defaultSendTemplateState(),
          isTemplatesSelectionVisible: action.mode === "template",
          mode: action.mode,
        };
        break;
      case "INBOX.WHATSAPP_TEMPLATE.FILE_UPLOADED":
        sendTemplateDraft.file = action.file;
        break;
      case "INBOX.WHATSAPP_TEMPLATE.SELECTED":
        sendTemplateDraft.templateId = action.templateId;

        const template =
          whatsappDraft.templates.data[action.templateId] ||
          whatsappDraft.whatsapp360Templates.data[action.templateId] ||
          whatsappDraft.whatsappCloudApiTemplates.reduce<
            NormalizedWhatsAppTemplateLanguageType | undefined
          >((acc, next) => {
            if (acc) {
              return acc;
            }
            return next.data[action.templateId];
          }, undefined);

        if (!template) {
          console.warn(`No template for id ${action.templateId}`);
          return;
        }

        const templateText = getLocalTemplate(
          template,
          action.language,
          action.contentSid
        );
        if (!templateText) {
          console.warn(`No template locale for ${action.language}`, {
            template,
          });
          return;
        }
        sendTemplateDraft.isHeaderFileRequired = templateText.header
          ? templateText.header?.format !== "TEXT"
          : false;
        sendTemplateDraft.language = getLocalTemplateLocale(
          template,
          action.language
        );
        sendTemplateDraft.isTemplatesSelectionVisible = false;
        sendTemplateDraft.contnentSid = action.contentSid;
        const newVar = getDefaultVariableValues(templateText);
        sendTemplateDraft.mode = "template";
        sendTemplateDraft.variables = newVar;
        break;

      case "INBOX.WHATSAPP_TEMPLATE.RESET":
        messengerDraft.sendWhatsappTemplate = {
          ...defaultSendTemplateState(defaultMode),
        };
        draft.inbox.messageDrafts = reject(
          matchesMessageDraft(draft.profile.conversationId),
          draft.inbox.messageDrafts
        );
        break;

      case "INBOX.WHATSAPP_TEMPLATE.FILE_REMOVED":
        sendTemplateDraft.file = undefined;
        break;
      case "INBOX.WHATSAPP_TEMPLATE.HAS_ERROR":
        sendTemplateDraft.hasError = action.hasError;
        break;
      case "INBOX.WHATSAPP_TEMPLATE.VAR_UPDATED":
        const valueSanitized = action.value
          .replace(/[\r\n]+/im, "")
          .substring(0, 1024);
        sendTemplateDraft.variables[action.updatedPart][action.name] =
          valueSanitized;
        break;

      case "INBOX.WHATSAPP_TEMPLATE.VAR_FOCUS":
        sendTemplateDraft.lastVarInputId = action.name;
        break;
      case "INBOX.WHATSAPP_TEMPLATE.MODAL.OPEN":
        sendTemplateDraft.isTemplatesSelectionVisible = true;
        break;
      case "INBOX.WHATSAPP_TEMPLATE.MODAL.CANCEL":
        sendTemplateDraft.isTemplatesSelectionVisible = false;
        break;

      case "INBOX.WHATSAPP_CLOUDAPI.LOADED":
        const updateIndex = whatsappDraft.whatsappCloudApiTemplates.findIndex(
          (tplSet) => tplSet.channelId === action.channelId
        );
        const updateData = {
          data: action.templates,
          channelId: action.channelId,
        };
        if (updateIndex > -1) {
          whatsappDraft.whatsappCloudApiTemplates[updateIndex] = updateData;
        } else {
          whatsappDraft.whatsappCloudApiTemplates.push(updateData);
        }
        break;

      case "CHAT_SELECTED":
        if (isAnyWhatsappChannel(draft.selectedChannelFromConversation ?? "")) {
          break;
        }
        messengerDraft.sendWhatsappTemplate = {
          ...defaultSendTemplateState(defaultMode),
        };
        break;

      case "UPDATE_CHAT_CHANNEL":
        if (!isAnyWhatsappChannel(action.selectedChannelFromConversation)) {
          messengerDraft.sendWhatsappTemplate = defaultSendTemplateState("off");
        }
        break;

      case "INBOX.MESSENGER.SUBMIT":
        messengerDraft.sendWhatsappTemplate = {
          ...defaultSendTemplateState(defaultMode),
        };
        break;

      case "INBOX.PAYMENT_LINK.COMPLETE":
        draft.inbox.messenger.sendWhatsappTemplate =
          defaultSendTemplateState("type");
        break;
    }
  }
);
