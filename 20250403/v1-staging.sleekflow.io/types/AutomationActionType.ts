import { isObject } from "lodash-es";
import { ConversationStatusType } from "./LoginType";
import {
  SendWhatsappTemplateState,
  TargetedChannelType,
} from "./BroadcastCampaignType";
import { StaffType } from "./StaffType";
import {
  FacebookActionTypes,
  InstagramActionTypes,
  FacebookReplyCommentActionType,
  FacebookInitiateDmActionType,
  InstagramReplyCommentActionType,
  InstagramInitiateDmActionType,
} from "../component/AssignmentRules/AutomationRuleEdit/CreateRule/FbIg/PostCommentTypes";
import { FormikHelpers, FormikState } from "formik";
import { AssignmentRuleFormType } from "./AssignmentRuleType";
import {
  WhatsappInteractiveObjectType,
  Whatsapp360DialogTemplateMessageType,
} from "./MessageType";
import { InteractiveMessageValues } from "component/Chat/InteractiveMessage/InteractiveMessageSchema";
import { ChannelType } from "component/Chat/Messenger/types";

const AUTOMATED_TRIGGER_TYPES = [
  "SendMessage",
  "SendMedia",
  "AddConversationNote",
  "AddToList",
  "RemoveFromList",
  "UpdateCustomFields",
  "AddActivityLogs",
  "AddTags",
  "RemoveTags",
  "Assignment",
  "ChangeConversationStatus",
  "AddAdditionalAssignee",
  "SendWebhook",
  ...FacebookActionTypes,
  ...InstagramActionTypes,
] as const;

export type AutomationActionTypeEnum = typeof AUTOMATED_TRIGGER_TYPES[number];

export interface SendWhatsAppAutomationTemplateState
  extends SendWhatsappTemplateState {
  wabaAccountId?: string;
  templateLanguage: string;
  templateName: string;
}

export interface SendWhatsApp360DialogExtendedAutomationMessages {
  wabaAccountId: string;
  messageType: string;
  whatsapp360DialogTemplateMessage?: Whatsapp360DialogTemplateMessageType;
  whatsapp360DialogInteractiveObject?: WhatsappInteractiveObjectType;
}

export interface SendWhatsAppCloudAPIExtendedAutomationMessages {
  channel: ChannelType;
  messageType: string;
  whatsappCloudApiByWabaExtendedAutomationMessages?: Array<WhatsappCloudApiByWabaExtendedAutomationMessagesType>;
}

export interface WhatsappCloudApiByWabaExtendedAutomationMessagesType {
  messagingHubWabaId: string;
  extendedMessagePayloadDetail: {
    whatsappCloudApiTemplateMessageObject?: Whatsapp360DialogTemplateMessageType;
    whatsappCloudApiInteractiveObject?: WhatsappInteractiveObjectType;
  };
}

export interface SendMessageAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "SendMessage";
  messageContent: string;
  messageParams: string[];
  whatsApp360DialogExtendedAutomationMessages?: Array<SendWhatsApp360DialogExtendedAutomationMessages>;
  sendWhatsappTemplate?: SendWhatsAppAutomationTemplateState;
  channelType?: string;
  extendedAutomationMessage?: SendWhatsAppCloudAPIExtendedAutomationMessages;
  sendInteractiveMessageState?: {
    wabaAccountId?: string;
  } & InteractiveMessageValues;
  targetedChannelWithIds?: TargetedChannelType[];
}

export interface SendMediaAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  id: number;
  automatedTriggerType: "SendMedia";
  uploadedFiles: SendMediaFileNormalized[];
  targetedChannelWithIds?: TargetedChannelType[];
}

export const SEND_MESSAGE_DEFAULT_CHANNEL_ID = "@default";

export interface AddConversationNoteAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "AddConversationNote";
  messageContent: string;
  messageParams: string[];
}

export interface AddToListAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "AddToList";
  actionAddedToGroupIds: number[];
}

export interface AddCollaboratorActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "AddAdditionalAssignee";
  addAdditionalAssigneeIds: string[];
}

export interface RemoveFromListAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "RemoveFromList";
  actionRemoveFromGroupIds: number[];
}

export interface UpdateCustomFieldsAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "UpdateCustomFields";
  actionUpdateCustomFields: Array<{
    customFieldName: string;
    customValue: string | string[];
  }>;
}

export interface AddActivityLogsAutomationActionType
  extends AutomationActionBaseType {
  automatedTriggerType: "AddActivityLogs";
  actionAddConversationRemarks: Array<{
    Remarks: string;
  }>;
}

export interface ActionHashTag {
  hashtag: string;
}

export interface AddHashtagsAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "AddTags";
  actionAddConversationHashtags: Array<ActionHashTag>;
}

export interface RemoveHashtagsAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "RemoveTags";
  actionAddConversationHashtags: Array<ActionHashTag>;
}

export interface AssignmentAutomationActionType
  extends AutomationActionWaitableType {
  automatedTriggerType: "Assignment";
  assignmentType: string;
  staffId: string;
  teamId?: number | undefined | null;
  teamAssignmentType?: string | null;
  readonly assignedTeam?: { id: number };
  readonly assignedStaff?: StaffType;
}

export interface AutomationSendWebhookActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "SendWebhook";
  webhookURL: string;
}

export interface ChangeConversationStatusAutomationActionType
  extends AutomationActionBaseType,
    AutomationActionWaitableType {
  automatedTriggerType: "ChangeConversationStatus";
  changeConversationStatus: {
    status: ConversationStatusType;
  };
  snoozeOptions?: SnoozeTimeType;
}

export type SnoozeTimeType =
  | "OneHour"
  | "ThreeHour"
  | "OneDay"
  | "OneWeek"
  | "OneMonth";

export type WaitTimeUnitType = "DAY" | "HOUR" | "MINUTE" | "SECOND";

export type WaitActionType = {
  units: WaitTimeUnitType;
  amount: number;
};

export interface WaitableNormalized {
  actionWaitDays?: number | null;
  actionWait?: string | null;
}

interface Waitable extends WaitableNormalized, WaitableDenormalized {}

export interface AutomationActionWaitableType
  extends AutomationActionBaseType,
    Waitable {}

export type WaitableDenormalized = {
  actionWaitDenormalized?: WaitActionType | null;
};

export function isWaitable(
  x: AutomationActionType | any
): x is AutomationActionWaitableType {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  return x.actionWait !== undefined || x.actionWaitDays !== undefined;
}

export function isWaitableDenormalized(
  x: AutomationActionType | any
): x is WaitableDenormalized {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  return x.actionWaitDenormalized !== undefined;
}

export type AutomationActionType =
  | SendMessageAutomationActionType
  | SendMediaAutomationActionType
  | AddConversationNoteAutomationActionType
  | AddToListAutomationActionType
  | AddCollaboratorActionType
  | RemoveFromListAutomationActionType
  | UpdateCustomFieldsAutomationActionType
  | AddActivityLogsAutomationActionType
  | AssignmentAutomationActionType
  | ChangeConversationStatusAutomationActionType
  | AddHashtagsAutomationActionType
  | RemoveHashtagsAutomationActionType
  | AutomationSendWebhookActionType
  | FacebookReplyCommentActionType
  | InstagramReplyCommentActionType
  | FacebookInitiateDmActionType
  | InstagramInitiateDmActionType;

export interface AutomationActionBaseType {
  componentId?: string;
  order: number;
}

export function isValidAutomationAction(
  x: AutomationActionType
): x is AutomationActionType {
  if (!isObject(x)) {
    return false;
  }
  return AUTOMATED_TRIGGER_TYPES.includes(x.automatedTriggerType);
}

export function isSendMessageAction(
  x: AutomationActionType
): x is SendMessageAutomationActionType {
  return x.automatedTriggerType === "SendMessage";
}

export function isSendMediaAction(
  x: AutomationActionType
): x is SendMediaAutomationActionType {
  return x.automatedTriggerType === "SendMedia";
}

export function isAddConversationNoteAction(
  x: AutomationActionType
): x is AddConversationNoteAutomationActionType {
  return x.automatedTriggerType === "AddConversationNote";
}

export function isAssignAction(
  x: AutomationActionType
): x is AssignmentAutomationActionType {
  return x.automatedTriggerType === "Assignment";
}

export function isAddToListAction(
  x: AutomationActionType
): x is AddToListAutomationActionType {
  return x.automatedTriggerType === "AddToList";
}

export function isRemoveFromListAction(
  x: AutomationActionType
): x is RemoveFromListAutomationActionType {
  return x.automatedTriggerType === "RemoveFromList";
}

export function isChangeStatusAction(
  x: AutomationActionType
): x is ChangeConversationStatusAutomationActionType {
  return x.automatedTriggerType === "ChangeConversationStatus";
}

export function isWebhookAction(
  x: AutomationActionType
): x is AutomationSendWebhookActionType {
  return x.automatedTriggerType === "SendWebhook";
}

export function isFacebookReplyCommentAction(
  x: AutomationActionType
): x is FacebookReplyCommentActionType {
  return x.automatedTriggerType === "FacebookReplyComment";
}

export function isInstagramReplyCommentAction(
  x: AutomationActionType
): x is InstagramReplyCommentActionType {
  return x.automatedTriggerType === "InstagramReplyComment";
}

export function isFacebookInitiateDmAction(
  x: AutomationActionType
): x is FacebookInitiateDmActionType {
  return x.automatedTriggerType === "FacebookInitiateDm";
}

export function isInstagramInitiateDmAction(
  x: AutomationActionType
): x is InstagramInitiateDmActionType {
  return x.automatedTriggerType === "InstagramInitiateDm";
}

export type SendMediaFileNormalized = {
  assignmentUploadedFileId: string;
  automationActionId: number | string;
  blobContainer?: string;
  mimeType?: string;
  id: number;
  url: string;
  filename: string;
};

export type DMMediaFileNormalized = {
  fbIgAutoReplyId: string;
  fbIgAutoReplyFileId: string;
  mimeType: string;
  filename: string;
  url: string;
};

export interface SendMediaUploadable {
  id?: string;
  isUploading: boolean;
  blobContainer?: string;
  mimeType?: string;
  isDeleting: boolean;
  error: string | null;
  fileName?: string;
  file: File | undefined;
  fileUrl?: string;
}

export interface SendMediaUploadType extends SendMediaUploadable {
  automationActionId: number | string | null;
  uuid: string;
}

export interface SendMediaUploadProxyType extends SendMediaUploadable {
  file: File;
}

export interface DMMediaUploadType extends SendMediaUploadable {
  fbIgAutoReplyId: string;
  uuid: string;
}

export function isSendMediaUpload(x: any): x is SendMediaUploadType {
  if (!isObject(x)) {
    return false;
  }
  return Reflect.has(x, "automationActionId");
}

export function isSendMediaUploadProxy(x: any): x is SendMediaUploadProxyType {
  if (!isObject(x)) {
    return false;
  }
  return Reflect.has(x, "file");
}

export function isDMMediaUpload(x: any): x is DMMediaUploadType {
  if (!isObject(x)) {
    return false;
  }
  return Reflect.has(x, "fbIgAutoReplyId");
}

export function assignActionDefaults(): AssignmentAutomationActionType {
  return {
    automatedTriggerType: "Assignment",
    assignmentType: "",
    staffId: "",
    actionWaitDays: null,
    actionWait: null,
    teamId: null,
    ...orderableActionDefaults(),
  };
}

export function sendMessageActionDefaults(): SendMessageAutomationActionType {
  return {
    automatedTriggerType: "SendMessage",
    messageContent: "",
    messageParams: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function sendMediaActionDefaults(
  actionBlank: any
): SendMediaAutomationActionType {
  return {
    automatedTriggerType: "SendMedia",
    uploadedFiles: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
    id: actionBlank.id,
  };
}

export function addConversationNoteActionDefaults(): AddConversationNoteAutomationActionType {
  return {
    automatedTriggerType: "AddConversationNote",
    messageContent: "",
    messageParams: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function addCollaboratorActionDefaults(): AddCollaboratorActionType {
  return {
    automatedTriggerType: "AddAdditionalAssignee",
    addAdditionalAssigneeIds: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function addToListActionDefaults(): AddToListAutomationActionType {
  return {
    automatedTriggerType: "AddToList",
    actionAddedToGroupIds: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function removeFromListActionDefaults(): RemoveFromListAutomationActionType {
  return {
    automatedTriggerType: "RemoveFromList",
    actionRemoveFromGroupIds: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function sendWebhookActionDefaults(): AutomationSendWebhookActionType {
  return {
    automatedTriggerType: "SendWebhook",
    webhookURL: "",
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function updateCustomFieldsActionDefaults(): UpdateCustomFieldsAutomationActionType {
  return {
    automatedTriggerType: "UpdateCustomFields",
    actionUpdateCustomFields: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function changeConversationStatusActionDefaults(): ChangeConversationStatusAutomationActionType {
  return {
    automatedTriggerType: "ChangeConversationStatus",
    changeConversationStatus: {
      status: "open",
    },
    snoozeOptions: "OneHour",
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function addHashtagsActionDefaults(): AddHashtagsAutomationActionType {
  return {
    automatedTriggerType: "AddTags",
    actionAddConversationHashtags: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function removeHashtagsActionDefaults(): RemoveHashtagsAutomationActionType {
  return {
    automatedTriggerType: "RemoveTags",
    actionAddConversationHashtags: [],
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function orderableActionDefaults(): AutomationActionBaseType {
  return { order: 0 };
}

export function waitableActionDefaults(): Waitable {
  return {
    actionWait: null,
    actionWaitDays: null,
  };
}

export type AutomationFormType = FormikState<AssignmentRuleFormType> &
  FormikHelpers<AssignmentRuleFormType>;
