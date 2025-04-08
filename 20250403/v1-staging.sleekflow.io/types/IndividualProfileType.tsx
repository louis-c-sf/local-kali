import { ProfileRemarkGroupType } from "./LoginType";
export interface IndividualProfileActionType {
  type: "UPDATE_REMARKS";
  isDisplayMessage: boolean;
}
interface IndividualProfileType {
  isDisplayMessage: boolean;
}
export default IndividualProfileType;

export interface ProfileRemarkFilterDataType {
  [key: string]: ProfileRemarkGroupType;
}

export interface ProfileMediaFileType {
  messageId: number;
  filename: string;
  sender: string;
  date: string;
  fileId: string;
  fileSize: number | string;
  mimeType: string;
  url?: string;
}

export enum mainTabEnum {
  "activity",
  "media",
}
export enum subTabEnum {
  "user",
  "system",
  "all",
}
