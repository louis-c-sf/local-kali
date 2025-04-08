import { AutomationTypeDict } from "../../../../types/AssignmentRuleType";

export enum MainTabEnum {
  team,
  user,
}
export enum SubTabEnum {
  first = "first",
  auto = "auto",
}

export interface MsgType {
  top: string;
  bottom: string;
}
export enum QRCodeAutomationTriggerType {
  team = "QRCodeAssignTeamMapping",
  user = "QRCodeAssigneeMapping",
}
const AutomationTriggerTypeDict = [
  QRCodeAutomationTriggerType.team,
  QRCodeAutomationTriggerType.user,
] as const;

export type AutomationTriggerTypeEnum = typeof AutomationTriggerTypeDict[number];
