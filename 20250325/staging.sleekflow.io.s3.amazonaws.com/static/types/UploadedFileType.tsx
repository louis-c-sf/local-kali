import SenderType from "../types/SenderType";
import { isObject } from "lodash-es";

export function isUploadedBroadcastFileType(
  x: any
): x is UploadedBroadcastFileType {
  return typeof x.campaignUploadedFileId === "string";
}

interface UploadedFileGeneralType {
  id: Number | undefined;
  filename: string;
  url: string;
  mimeType: string;
  blobContainer: string;
}

export default interface UploadedFileType extends UploadedFileGeneralType {
  channel: string;
  fileId: string;
  id: Number;
  messageTopic: string;
  sender: SenderType;
  senderDevice?: string;
  senderDeviceUUID?: string;
  senderId?: string;
  previewUrl?: string;
  fileSize?: number;
}

export interface UploadedFileProxyType extends UploadedFileType {
  proxyFile: File;
  proxyType: string;
}

export function isUploadedProxy(file: unknown): file is UploadedFileProxyType {
  if (!isObject(file) || file === null) {
    return false;
  }
  return !!(file as UploadedFileProxyType).proxyFile;
}

export interface UploadedFileGeneralProxyType extends UploadedFileGeneralType {
  fileProxy?: File;
}

export interface UploadedBroadcastFileType
  extends UploadedFileGeneralProxyType {
  campaignUploadedFileId: string;
}

export interface UploadedQuickReplyFileType
  extends UploadedFileGeneralProxyType {
  quickReplyFileId: string;
  previewUrl?: string;
}
