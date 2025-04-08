import { UploadedQuickReplyFileType } from "../UploadedFileType";
import { getCompanyCustomFieldNames } from "../../container/Contact/hooks/useCustomProfileFields";
import CompanyType from "../CompanyType";
import { StaffType } from "../StaffType";
import { replaceParamTokens } from "../../component/Broadcast/NewBroadcastHeader/replaceParamTokens";
import { transformToEditableContent } from "../../component/Broadcast/BroadcastContent/transformToEditableContent";

export const QUICK_REPLY_ENTRIES_LIMIT = 300;
export const QUICK_REPLY_ENTRIES_INCREASED_LIMIT = 500;

export interface QuickReplyType {
  id?: number;
  name: string;
  text: string;
  user?: StaffType;
  updatedAt?: string;
  files: UploadedQuickReplyFileType[];
}

type QuickReplyLingual = {
  id?: number;
  language: string;
  value: string;
  params: string[];
};

interface QuickReplyNormalizedBase {
  id?: number;
  value: string;
  companyQuickReplyLinguals: Array<QuickReplyLingual>;
}

export interface QuickReplyNormalizedType extends QuickReplyNormalizedBase {
  id: number;
  savedBy: StaffType;
  savedById: number;
  updatedAt?: string;
  quickReplyFile?: UploadedQuickReplyFileType;
}

export interface QuickReplyRequestType extends QuickReplyNormalizedBase {}

interface QuickReplyResponseBase {
  list: QuickReplyNormalizedType[];
}

export interface QuickReplyResponseType extends QuickReplyResponseBase {
  created: QuickReplyNormalizedType;
}

export interface QuickReplyDeleteResponseType extends QuickReplyResponseBase {}

export function normalizeQuickReplyRequest(
  data: QuickReplyType,
  company?: CompanyType
): QuickReplyRequestType {
  const profileFieldNames = company ? getCompanyCustomFieldNames(company) : [];
  const { submitContent, checkParams } = replaceParamTokens(
    data.text,
    profileFieldNames
  );
  let normalized: QuickReplyRequestType = {
    companyQuickReplyLinguals: [
      {
        language: "en",
        value: submitContent,
        params: checkParams,
      },
    ],
    value: data.name,
  };
  if (data.id) {
    normalized.id = data.id;
  }
  return normalized;
}

export function denormalizeQuickReplyResponse(
  data: QuickReplyNormalizedType,
  language: string
): QuickReplyType {
  const lingualTextMatch = data.companyQuickReplyLinguals.find(
    (l) => l.language.toLowerCase() === language
  );
  const [anyLangTextMatch] = data.companyQuickReplyLinguals;
  const files = data.quickReplyFile ? [data.quickReplyFile] : [];

  const text = lingualTextMatch?.value ?? anyLangTextMatch?.value ?? "";
  const textParams = lingualTextMatch?.params ?? anyLangTextMatch?.params ?? [];
  return {
    id: data.id,
    text: transformToEditableContent(text, textParams),
    name: data.value,
    user: data.savedBy,
    updatedAt: data.updatedAt,
    files: files.map<UploadedQuickReplyFileType>((f) => ({
      filename: f.filename,
      id: f.id,
      mimeType: f.mimeType,
      url: f.url,
      blobContainer: f.blobContainer,
      quickReplyFileId: f.quickReplyFileId,
    })),
  };
}

export type QuickReplyFileResponseType = {
  id: number;
  quickReplyFileId: string;
  mimeType: string;
  url: string;
  filename: string;
  blobContainer: string;
};
