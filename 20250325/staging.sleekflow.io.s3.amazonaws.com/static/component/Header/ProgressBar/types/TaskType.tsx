export enum TaskTypeEnum {
  ImportContacts = 10,
  ImportWhatsAppHistoryOmnichat = 32,
  AddContactsToList = 11,
  BulkUpdateContactsCustomFields = 12,
  BulkImportContacts = 13,
  ExportContactsListToCsv = 21,
  ExportBroadcastStatusListToCsv = 22,
  ExportAnalyticToCsv = 23,
  ImportWhatsAppHistory = 31,
  ConvertCampaignLeadsToContactList = 40,
  LoopThroughSleekflowContact = 50,
  exportFlowUsageCsv = 60,
}

export enum BackgroundTaskTargetType {
  None = 0,
  Contact = 1,
  List = 2,
  Campaign = 3,
  Analytic = 4,
  WhatsApp = 5,
}

export enum TaskStatusEnum {
  Queued = 0,
  Started = 1,
  Processing = 2,
  Completed = 3,
  Error = 500,
}

interface CommonTargetFieldType {
  targetType: TargetTypeEnum;
}

export interface NormalTargetFieldType extends CommonTargetFieldType {
  importName: string;
  listId: number;
  targetType:
    | TargetTypeEnum.None
    | TargetTypeEnum.Contact
    | TargetTypeEnum.List
    | TargetTypeEnum.Analytic;
}
interface CampaignTargetFieldType extends CommonTargetFieldType {
  broadcastTemplateId: string;
  templateName: string;
  targetType: TargetTypeEnum.Campaign;
}

export interface NewContactListTargetFieldType extends CommonTargetFieldType {
  newContactListName: string;
  targetType: TargetTypeEnum.List;
}

export enum TargetTypeEnum {
  None = 0,
  Contact = 1,
  List = 2,
  Campaign = 3,
  Analytic = 4,
}

type ResultType = {
  fileName: string;
  filePath: string;
  mimeType: string;
  url: string;
  fileSize: 0;
  resultPayloadType: string;
};

export type TaskResponseType = {
  id: number;
  companyId: string;
  staffId: number;
  userId: string;
  total: number;
  progress: number;
  isCompleted: true;
  isDismissed: true;
  startedAt: string;
  completedAt: string;
  taskType: number;
  updatedAt: string;
  createdAt: string;
  errorMessage: string;
  taskStatus: number;
  target:
    | NormalTargetFieldType
    | CampaignTargetFieldType
    | NewContactListTargetFieldType;
  result?: ResultType;
};
