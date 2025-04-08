import { Item, Loader } from "semantic-ui-react";
import InfiniteScroll from "react-infinite-scroller";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  GET_CONVERSATIONS_DETAIL,
  GET_USERPROFILE_DETAIL,
  POST_USER_PROFILE_SEARCH_V3,
} from "../../api/apiPath";
import { get, post } from "../../api/apiRequest";
import ConversationType, { UserInfoType } from "../../types/ConversationType";
import { ProfileType } from "../../types/LoginType";
import ChatGroup from "./ChatGroup";
import { useDebouncedCallback } from "use-debounce";
import SearchChatContext from "../../context/SearchChatContext";
import {
  byLatestMessageCreateDate,
  matchesConversationId,
} from "./mutators/chatSelectors";
import produce from "immer";
import { convertMessageToGeneralFormat } from "./utils/denormalizeChat";
import { useCurrentMessageStaffName } from "./localizable/useCurrentMessageStaffName";
import { useProfileDisplayName } from "./utils/useProfileDisplayName";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { adjust, equals, evolve, last, pick } from "ramda";
import { useTranslation } from "react-i18next";
import { denormalizeConversationCollaborators } from "../../types/Chat/denormalizeConversationCollaborators";
import checkMessageContent from "./utils/checkMessageContent";
import { updateSelectedChannel } from "./ChatGroupList";
import { getChannelInstanceId } from "./utils/useChatSelectors";
import { getSearchParts } from "../../utility/string";

interface SearchMessageType extends ProfileType {
  matchResult: ReactNode;
  assignee: UserInfoType | undefined;
}

interface ProfileSearchResultType {
  conversations: ConversationType[];
}
const SearchNameGroupList = React.memo(function SearchNameGroupList() {
  const {
    user,
    selectedChannel,
    selectedStatus,
    selectedInstanceId,
    profile,
    staffList,
    selectedAssigneeId,
  } = useAppSelector(
    pick([
      "user",
      "selectedChannel",
      "selectedStatus",
      "selectedInstanceId",
      "profile",
      "staffList",
      "selectedAssigneeId",
    ]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const { t } = useTranslation();
  const { searchChatDispatch, searchMessage, targetMessageId } =
    useContext(SearchChatContext);
  const [hasMore, setHasMore] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number>();
  const { conversations } = useAppSelector((s) => s.chatSearched, equals);
  const LIMIT = 20;
  const messagesFilter = useAppSelector((s) => s.inbox.messagesFilter, equals);
  const [debonceCallback] = useDebouncedCallback(() => {
    fetchSearchContact();
  }, 1500);
  const cacheApiParam = useRef<string>();
  const selectedChannelFromConversations = useAppSelector(
    (s) => s.selectedChannel
  );
  const selectedChannelIdFromConversations = useAppSelector(
    (s) => s.selectedInstanceId
  );
  const updateMatchResult = (profile: ProfileType): ReactNode => {
    const displayName = profileDisplayName(profile);
    const searchResult = getSearchParts(searchMessage, displayName);
    if (!searchResult) {
      return "";
    }
    return (
      <>
        {searchResult[0]}
        <span className="matched-text">{searchResult[1]}</span>
        {searchResult[2]}
      </>
    );
  };

  useEffect(() => {
    if (targetMessageId > 0) {
      setSelectedItem(undefined);
    }
  }, [targetMessageId]);

  useEffect(() => {
    const newConversations = (con: SearchMessageType[]) => {
      const foundIndex = conversations.findIndex(
        matchesConversationId(profile.conversationId)
      );
      if (foundIndex > -1) {
        return adjust(
          foundIndex,
          evolve({
            conversation: (c) =>
              profile.conversation ? { ...profile.conversation } : c,
          }),
          con
        );
      }
      return con;
    };
    loginDispatch({
      type: "UPDATE_SEARCHED_CHATS",
      conversations: newConversations(conversations),
    });
  }, [JSON.stringify(profile.conversation?.list)]);

  const getProfileCustomFields = (selectedResult: ProfileType) => {
    get(GET_USERPROFILE_DETAIL.replace("{id}", selectedResult.id), {
      param: {},
    }).then((profileResult) => {
      loginDispatch({
        type: "PROFILE_UPDATED",
        profile: {
          ...selectedResult,
          customFields: profileResult.customFields,
        },
      });
    });
  };

  useEffect(() => {
    if (conversations.length > 0) {
      const foundConversationIndex = conversations.findIndex(
        matchesConversationId(profile.conversationId)
      );
      if (foundConversationIndex > -1) {
        const updatedChat = produce(conversations, (draftState) => {
          draftState[foundConversationIndex].firstName = profile.firstName;
          draftState[foundConversationIndex].lastName = profile.lastName;
          draftState[foundConversationIndex].customFields =
            profile.customFields;
          draftState[foundConversationIndex].matchResult =
            updateMatchResult(profile);
        });
        loginDispatch({
          type: "UPDATE_SEARCHED_CHATS",
          conversations: [...updatedChat],
        });
      }
    }
  }, [JSON.stringify(profile)]);

  const fetchSearchContact = async () => {
    if (searchMessage) {
      let queryStr = `?limit=${LIMIT}&offset=${conversations.length}&status=${selectedStatus}&assignedTo=${selectedAssigneeId}`;
      if (selectedChannel !== "all") {
        if (["whatsapp", "facebook"].includes(selectedChannel)) {
          queryStr += `&channelIds=${selectedInstanceId}`;
        }
        queryStr += `&channel=${selectedChannel}`;
      }
      if (cacheApiParam.current !== JSON.stringify(queryStr)) {
        cacheApiParam.current = JSON.stringify(queryStr);
        try {
          const result: ProfileSearchResultType = await post(
            POST_USER_PROFILE_SEARCH_V3 + `${queryStr}`,
            {
              param: [
                {
                  fieldName: "displayname",
                  conditionOperator: "Contains",
                  values: [searchMessage],
                  nextOperator: "Or",
                },
                {
                  fieldName: "firstName",
                  ConditionOperator: "Contains",
                  values: [searchMessage],
                  nextOperator: "Or",
                },
                {
                  fieldName: "phonenumber",
                  ConditionOperator: "Contains",
                  values: [searchMessage],
                  nextOperator: "Or",
                },
                {
                  fieldName: "lastName",
                  ConditionOperator: "Contains",
                  values: [searchMessage],
                  nextOperator: "Or",
                },
              ],
            }
          );
          if (result.conversations.length < LIMIT) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
          let conversationList: SearchMessageType[] = [];
          if (result.conversations.length === 0 && conversations.length === 0) {
            loginDispatch({
              type: "UPDATE_SEARCHED_CHATS",
              conversations: [],
            });
            searchChatDispatch({
              type: "UPDATE_LOADING_CHAT_RESULT",
              isLoadingChat: false,
            });
          } else {
            for (let i = 0; i < result.conversations.length; i++) {
              const userProfile = result.conversations[i];
              const conversation = formatResult(userProfile);
              if (userProfile.conversationId) {
                conversationList = [...conversationList, conversation];
              }
            }
            const updatedConversation = [...conversations, ...conversationList];
            loginDispatch({
              type: "UPDATE_SEARCHED_CHATS",
              conversations: [...updatedConversation].sort(
                byLatestMessageCreateDate()
              ),
            });
            searchChatDispatch({
              type: "UPDATE_LOADING_CHAT_RESULT",
              isLoadingChat: false,
            });
            searchChatDispatch({
              type: "UPDATE_SEARCH_RESULT_FOUND",
              result: updatedConversation.length,
            });
          }
        } catch (e) {
          console.error(`fetchSearchContact ${e}`);
        }
      }
    }
  };
  const formatResult = (conversation: ConversationType): SearchMessageType => {
    const profile = conversation.userProfile;
    const assignee = conversation.assignee;
    const matchResult = updateMatchResult(profile);
    return {
      ...conversation.userProfile,
      ...profile,
      lastChannel:
        last(conversation.conversationChannels) || profile.lastChannel,
      matchResult,
      conversationStatus: conversation.status,
      conversation: {
        lastUpdated: conversation.updatedTime,
        list: [...conversation.lastMessage],
      },
      assignee: assignee && assignee.userInfo,
      conversationId: conversation.conversationId || "",
      displayName: profileDisplayName(profile),
      isBookmarked: conversation.isBookmarked,
      conversationHashtags: conversation.conversationHashtags,
      unReadMsg: conversation.unreadMessageCount > 0,
    };
  };

  useEffect(() => {
    loginDispatch({
      type: "UPDATE_SEARCHED_CHATS",
      conversations: [],
    });
  }, [searchMessage, selectedStatus, selectedChannel]);
  const loadMore = useCallback(async () => {
    return await fetchSearchContact();
  }, [JSON.stringify([conversations, searchMessage, hasMore])]);

  useEffect(() => {
    if (conversations.length === 0) {
      cacheApiParam.current = "";
      searchChatDispatch({
        type: "UPDATE_LOADING_CHAT_RESULT",
        isLoadingChat: true,
      });
      debonceCallback();
    }
  }, [JSON.stringify([conversations, searchMessage, selectedChannel, selectedStatus])]);

  const { getCurrentMessageStaffName } = useCurrentMessageStaffName();
  const { profileDisplayName } = useProfileDisplayName();

  const handleSelectedItem = async (senderId: number) => {
    setSelectedItem(senderId);
    const selectedResultList = conversations[senderId];
    if (selectedResultList.conversationId) {
      // selectedResultList has conversationId get the conversationId from the list
      const result: ConversationType = await get(
        GET_CONVERSATIONS_DETAIL.replace(
          "{id}",
          selectedResultList.conversationId
        ),
        { param: {} }
      );
      const updatedProfile: ProfileType = {
        ...result.userProfile,
        collaboratorIds: denormalizeConversationCollaborators(result),
        lastChannel: selectedResultList.lastChannel,
        conversationHashtags: result.conversationHashtags,
        unReadMsg: result.unreadMessageCount > 0,
        conversationStatus: result.status,
        numOfNewMessage: result.unreadMessageCount,
        messageGroupName: result.messageGroupName,
        conversationId: result.conversationId,
        updatedTime: result.createdAt,
      };

      const [lastMessage] = result.lastMessage;
      const profile = {
        ...updatedProfile,
        lastChannel: lastMessage?.channel ?? "",
        conversation: {
          list: lastMessage ? [lastMessage] : [],
          lastUpdated: lastMessage ? lastMessage.createdAt : result.createdAt,
        },
      };
      const selectChannel = profile.lastChannel;
      const selectChannelId = getChannelInstanceId(
        profile.lastChannel,
        profile
      );
      if (lastMessage) {
        const message = convertMessageToGeneralFormat(
          lastMessage,
          result.userProfile
        );
        loginDispatch({
          type: "CHAT_SELECTED",
          selectedChat: [message],
          selectedUser: result.assignee && result.assignee.userInfo,
          profile,
          ...updateSelectedChannel(
            profile,
            selectChannel,
            messagesFilter,
            selectedChannelFromConversations,
            loginDispatch,
            selectedChannelIdFromConversations,
            selectChannelId
          ),
          fromConversationId: profile.conversationId,
        });
        searchChatDispatch({
          type: "SELECTED_PROFILE",
          targetProfileId: result.userProfile.id,
          targetMessageId: 0,
        });
      } else {
        loginDispatch({
          type: "CHAT_SELECTED",
          selectedChat: [],
          selectedUser: result.assignee?.userInfo ?? undefined,
          profile,
          ...updateSelectedChannel(
            profile,
            selectChannel,
            messagesFilter,
            selectedChannelFromConversations,
            loginDispatch,
            selectedChannelIdFromConversations,
            selectChannelId
          ),
          fromConversationId: profile.conversationId,
        });
        searchChatDispatch({
          type: "SELECTED_PROFILE",
          targetProfileId: result.userProfile.id,
          targetMessageId: 0,
        });
      }
      getProfileCustomFields(result.userProfile);
      // history.push(`/inbox/all/${selectedResultList.conversationId}`);
    }
  };

  return conversations.length > 0 ? (
    <Item.Group className="no-scrollbars">
      <Item.Header>{t("chat.search.header.contact")}</Item.Header>
      <InfiniteScroll
        className="chatsScroll no-scrollbars"
        loadMore={loadMore}
        useWindow={false}
        hasMore={hasMore}
        threshold={300}
        loader={
          <div className="loader" key={0}>
            <Loader />
          </div>
        }
      >
        {conversations.map((chat, index) => {
          const messages = chat.conversation?.list;
          const [message] = messages ?? [];
          const messageContent = message?.messageContent
            ? checkMessageContent(message)
            : "";

          const staffName = message?.isSentFromSleekflow
            ? getCurrentMessageStaffName(
                message?.sender?.id,
                staffList,
                user.id
              )
            : "";
          return (
            <ChatGroup
              unReadMsg={chat.unReadMsg}
              searchMessage={searchMessage}
              key={`${chat.conversationId}_${index}`}
              staffName={staffName}
              channel={message?.channel || ""}
              pic={chat.displayProfilePicture || ""}
              name={profileDisplayName(chat)}
              nameDisplay={chat.matchResult || profileDisplayName(chat)}
              message={messageContent || ""}
              createdAt={message ? message.createdAt : chat.createdAt}
              selected={selectedItem === index}
              setSelectedItemHandle={() => handleSelectedItem(index)}
              conversationId={chat.conversationId}
              showContextMenu={true}
              isBookmarked={chat.isBookmarked}
              isOpened={chat.conversationStatus === "open"}
              tags={chat.conversationHashtags}
            />
          );
        })}
      </InfiniteScroll>
    </Item.Group>
  ) : (
    <div></div>
  );
});

export default SearchNameGroupList;
