import { InboxFilterParamsType } from "./fetchAllSummaries";
import { equals, partition, pick, prop } from "ramda";
import { useCallback, useMemo } from "react";
import { matchesStaffId, TeamType } from "../../types/TeamType";
import {
  GET_CONVERSATIONS_BY_ASSIGNEE_ID,
  GET_CONVERSATIONS_BY_TEAM,
  GET_CONVERSATIONS_MENTIONED,
} from "../apiPath";
import { useAppSelector } from "../../AppRootContext";
import { SelectedAssigneeIdType } from "../../types/LoginType";
import {
  InboxOrderDictEnum,
  InboxStateType,
} from "../../types/state/InboxStateType";
import { HashTagCountedType } from "../../types/ConversationType";
import { useTeams } from "../../container/Settings/useTeams";

export function buildFilterFromState(
  selectedStatus: string,
  myTeams: TeamType[],
  assigneeId: SelectedAssigneeIdType | undefined,
  selectedChannel: string,
  selectedInstanceId: string | undefined,
  filterTags: HashTagCountedType[],
  inboxFilter: InboxStateType["filter"],
  orderBy: InboxOrderDictEnum | undefined
): InboxFilterParamsType {
  let param: InboxFilterParamsType = {};
  if (selectedStatus !== "all") {
    param.status = selectedStatus;
  }
  const [firstTeam] = myTeams;
  if (String(assigneeId).toLowerCase() === "teamunassigned" && firstTeam?.id) {
    param = {
      ...param,
      teamId: String(firstTeam.id),
      isTeamUnassigned: true,
    };
  }
  if (selectedChannel && selectedChannel.toLowerCase() !== "all") {
    param.channel = selectedChannel;
    if (
      selectedInstanceId &&
      [
        "whatsapp",
        "whatsapp360dialog",
        "whatsappcloudapi",
        "facebook",
        "instagram",
      ].includes(selectedChannel)
    ) {
      param.channelIds = selectedInstanceId;
    }
  }
  if (filterTags.length) {
    param.tags = encodeURIComponent(filterTags.map(prop("hashtag")).join(","));
  }
  if (inboxFilter.unreadStatus) {
    param.isUnread = "true";
  }
  param.orderBy = orderBy;
  return param;
}

export function useChatsFilterBuilder() {
  const staffList = useAppSelector((s) => s.staffList, equals);
  const userId = useAppSelector((s) => s.user.id, equals);
  const companyTags = useAppSelector(
    (s) => s.company?.companyHashtags ?? [],
    equals
  );
  const myTeams = useAppSelector(
    (s) =>
      s.settings.teamsSettings.teams.filter((t: TeamType) =>
        t.members.some(matchesStaffId(s.user.id))
      ),
    equals
  );

  const { booted: teamsBooted } = useTeams();
  const {
    selectedInstanceId,
    selectedChannel,
    selectedStatus,
    selectedAssigneeId: assigneeId,
  } = useAppSelector(
    pick([
      "selectedInstanceId",
      "selectedChannel",
      "selectedStatus",
      "selectedAssigneeId",
    ]),
    equals
  );
  const inboxFilter = useAppSelector((s) => s.inbox.filter, equals);
  const { orderBy } = inboxFilter;

  const [filterTags, availableTags] = useMemo(() => {
    return partition(
      (tag) => Boolean(tag.id) && inboxFilter.tagIds.includes(tag.id),
      companyTags
    );
  }, [companyTags, inboxFilter.tagIds.join()]);

  const isLoadMoreBlocked =
    !assigneeId ||
    !selectedChannel ||
    (String(assigneeId).toLowerCase() === "teamunassigned" &&
      myTeams.length === 0) ||
    !teamsBooted;
  const buildFilter = useCallback(
    () =>
      buildFilterFromState(
        selectedStatus,
        myTeams,
        assigneeId,
        selectedChannel,
        selectedInstanceId,
        filterTags,
        inboxFilter,
        orderBy
      ),
    [
      selectedStatus,
      selectedChannel,
      assigneeId,
      myTeams.map((t) => t.id).join(),
      selectedInstanceId,
      filterTags.map((t) => t.hashtag).join(),
      inboxFilter.unreadStatus,
      inboxFilter.orderBy,
    ]
  );

  const getChatsEndPoint = useCallback(
    (selectedAssignee: string | undefined) => {
      if (selectedAssignee?.toLowerCase() === "mentions") {
        return GET_CONVERSATIONS_MENTIONED;
      } else if (selectedAssignee?.toLowerCase() === "teamunassigned") {
        return GET_CONVERSATIONS_BY_TEAM;
      } else {
        const assigneeStaff = staffList.find(
          (s) => s.userInfo.id === selectedAssignee
        );
        const paramUserId =
          assigneeStaff?.userInfo?.id || selectedAssignee || userId;
        return GET_CONVERSATIONS_BY_ASSIGNEE_ID.replace(
          "{id}",
          paramUserId.toLowerCase()
        );
      }
    },
    [staffList]
  );

  const currentFilter = useMemo(buildFilter, [
    buildFilter,
    getChatsEndPoint(assigneeId),
    filterTags.map((t) => t.hashtag).join(),
    inboxFilter.unreadStatus,
  ]);

  const currentFilterStamp = `/${getChatsEndPoint(
    assigneeId
  )}/?${JSON.stringify(currentFilter)}`;

  return {
    assigneeId,
    currentFilter,
    buildFilter,
    currentFilterStamp,
    isLoadMoreBlocked,
    getChatsEndPoint,
    filterTags,
    availableTags,
  };
}
