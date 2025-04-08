import ChatsSummaryResponseType, {
  AssigneeNameAssignedNumber,
} from "../../types/ChatsSummaryResponseType";
import { fetchChatsSummary$ } from "./fetchChatsSummary";
import { fetchChatsAssigneeSummary$ } from "./fetchChatsAssigneeSummary";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";
import { InboxOrderDictEnum } from "types/state/InboxStateType";

export type AssigneeModeType =
  | "all"
  | "you"
  | "mentions"
  | "mentioned"
  | "teamunassigned"
  | "unassigned"
  | "user";

export type InboxFilterParamsType = {
  status?: string;
  tags?: string;
  channel?: string;
  channelIds?: string;
  isUnread?: "true";
  afterModifiedAt?: string;
  teamId?: string;
  isTeamUnassigned?: boolean;
  orderBy?: InboxOrderDictEnum;
};
export type InboxPaginationParamsType = {
  limit: number;
  offset: number;
};

export function fetchAllSummaries$(
  userId: string,
  assigneeId: string,
  filter: InboxFilterParamsType
) {
  const mode = getAssigneeMode(userId, assigneeId);
  const filterNames = Object.keys(filter);
  const hasNoFilters = filterNames.length === 0;
  const filtersAreDefault =
    filterNames.length === 1 && filter.status === "open";
  const { status: _, ...filterForStatus } = filter;

  if (hasNoFilters || filtersAreDefault) {
    return forkJoin([
      fetchChatsAssigneeSummary$(assigneeId, mode, filterForStatus),
      fetchChatsSummary$(filter),
    ]).pipe(
      map(([assignees, summary]) => ({
        assignees,
        summary: denormalizeResponse(summary),
      }))
    );
  } else {
    return forkJoin([
      fetchChatsAssigneeSummary$(assigneeId, mode, filterForStatus),
      fetchChatsAssigneeSummary$(assigneeId, mode, filter),
      fetchChatsSummary$(filter),
    ]).pipe(
      map(([statusAssignees, assignees, summary]) => ({
        assignees: {
          ...assignees,
          conversationSummaries: statusAssignees.conversationSummaries,
        },
        summary: denormalizeResponse(summary),
      }))
    );
  }
}

function denormalizeResponse(
  response: ChatsSummaryResponseType[]
): AssigneeNameAssignedNumber {
  let assigneeAssignedNumber: AssigneeNameAssignedNumber = {};
  for (const assigneeSummary of response) {
    if (assigneeSummary.teamId) {
      assigneeAssignedNumber = {
        ...assigneeAssignedNumber,
        [`${assigneeSummary.type}:${assigneeSummary.teamId}`]:
          assigneeSummary.count,
      };
    } else if (assigneeSummary.assigneeId) {
      assigneeAssignedNumber = {
        ...assigneeAssignedNumber,
        [`${assigneeSummary.assigneeId}`]: assigneeSummary.count,
      };
    } else if (
      ["all", "mentioned"].includes(assigneeSummary.type.toLowerCase())
    ) {
      assigneeAssignedNumber = {
        ...assigneeAssignedNumber,
        [`${assigneeSummary.type}`]: assigneeSummary.count,
      };
    } else {
      const assigneeTypeCapitalize =
        assigneeSummary.type.charAt(0).toUpperCase() +
        assigneeSummary.type.substring(1).toLowerCase();
      assigneeAssignedNumber = {
        ...assigneeAssignedNumber,
        [`${assigneeTypeCapitalize}`]: assigneeSummary.count,
      };
    }
  }
  return assigneeAssignedNumber;
}

function getAssigneeMode(
  userId: string,
  selectedAssigneeId: string | undefined
): AssigneeModeType {
  if (!selectedAssigneeId) {
    return "user";
  }
  if (selectedAssigneeId === userId) {
    return "you";
  }
  const modeMap = {
    you: "you",
    all: "all",
    mentions: "mentioned",
    unassigned: "unassigned",
    teamunassigned: "teamunassigned",
  };
  return modeMap[selectedAssigneeId] ?? "user";
}
