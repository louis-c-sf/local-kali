import { post } from "../apiRequest";
import { UPDATE_CONVERSATIONS_STATUS } from "../apiPath";

export async function submitChatStatus(
  conversationId: string,
  status: "open" | "closed" | "pending",
  dateUntil?: Date
) {
  const param: any = {
    param: {
      status,
    },
  };
  if (dateUntil) {
    param.param.SnoozeUntil = dateUntil.toISOString();
  }
  return await post(
    UPDATE_CONVERSATIONS_STATUS.replace("{id}", conversationId),
    param
  );
}
