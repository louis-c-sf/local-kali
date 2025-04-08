import React from "react";
import { useParams } from "react-router";
import { AssigneeModeType } from "./fetchAllSummaries";

export function useConversationParams() {
  return useParams<{
    assigneeId: string | AssigneeModeType;
    conversationId?: string;
    channelName?: string;
  }>();
}
