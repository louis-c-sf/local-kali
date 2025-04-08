import { SendMediaUploadProxyType } from "../../../types/AutomationActionType";

export enum StepsEnum {
  Main = "main",
  New = "newTicket",
  Submission = "submission",
}
type StepsType = StepsEnum.Main | StepsEnum.New | StepsEnum.Submission;

export type HelpCenterStateType = {
  helpCenterWidgetVisible: boolean;
  step: StepsType;
  search: string;
  form: HelpCenterFormType;
  ticketNo: string;
};
export interface HelpCenterFormType {
  email: string;
  subject: string;
  issueType: string;
  issueLevel: string;
  detail: string;
  files: SendMediaUploadProxyType[];
}

export type HelpCenterActionType =
  | { type: "SHOW_HELP_CENTER_WIDGET"; step?: StepsEnum }
  | { type: "HIDE_HELP_CENTER_WIDGET" }
  | { type: "UPDATE_STEP"; step: StepsType }
  | { type: "RESET_STATE" }
  | { type: "UPDATE_SEARCH"; search: string }
  | { type: "UPDATE_FORM"; form: HelpCenterFormType }
  | { type: "UPDATE_TICKET_NO"; ticketNo: string }
  | { type: "RESET_FORM" };

export function getDefaultFormValue(): HelpCenterFormType {
  return {
    email: "",
    subject: "",
    issueType: "",
    issueLevel: "",
    detail: "",
    files: [],
  };
}
export function getDefaultStateValue(): HelpCenterStateType {
  return {
    helpCenterWidgetVisible: false,
    step: StepsEnum.Main,
    search: "",
    form: getDefaultFormValue(),
    ticketNo: "",
  };
}
