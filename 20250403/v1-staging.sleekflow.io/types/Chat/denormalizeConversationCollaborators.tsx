import {
  ConversationNormalizedType,
  SearchConversationMessageType,
} from "../ConversationType";
import { AssignStaffResponse } from "../../api/Chat/submitAssignStaff";

export function denormalizeConversationCollaborators(
  conversation: ConversationNormalizedType | AssignStaffResponse
): string[] {
  return conversation.additionalAssignees.reduce<string[]>((acc, a) => {
    const userInfo = a.assignee.userInfo;
    return userInfo ? [...acc, userInfo.id] : acc;
  }, []);
}
