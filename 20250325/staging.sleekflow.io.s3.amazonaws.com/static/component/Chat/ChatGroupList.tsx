import React, {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Item, Loader } from "semantic-ui-react";
import MessageType from "../../types/MessageType";
import { Action, ProfileType } from "../../types/LoginType";
import {
  GET_CONVERSATIONS_DETAIL,
  POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE,
} from "../../api/apiPath";
import { get, postWithExceptions } from "../../api/apiRequest";
import ConversationType, { HashTagType } from "../../types/ConversationType";
import InfiniteScroll from "react-infinite-scroller";
import moment from "moment";
import ChatGroup from "./ChatGroup";
import { matchesConversationId } from "./mutators/chatSelectors";
import { clone, equals, last, update } from "ramda";
import ChatGroupListDummy from "./ChatGroupListDummy";
import { CONNECT_STATE, SignalRContext } from "../SignalR/SignalRObservable";
import { normalizeApiMessage } from "./mutators/messageMutators";
import { defaultMessageValues } from "./mutators/test/factories";
import {
  getChannelInstanceId,
  useChatSelectors,
} from "./utils/useChatSelectors";
import { convertMessageToGeneralFormat } from "./utils/denormalizeChat";
import { useCurrentMessageStaffName } from "./localizable/useCurrentMessageStaffName";
import { useProfileDisplayName } from "./utils/useProfileDisplayName";
import { useCompanyHashTags } from "../Settings/hooks/useCompanyHashTags";
import { useConversationParams } from "../../api/Chat/useConversationParams";
import { useLoadMoreChats } from "../../api/Chat/useLoadMoreChats";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { denormalizeConversation } from "../../types/Chat/denormalizeConversation";
import { denormalizeConversationCollaborators } from "../../types/Chat/denormalizeConversationCollaborators";
import checkMessageContent from "./utils/checkMessageContent";
import { MessagesFilterType } from "types/state/InboxStateType";
import styles from "./ChatGroupList.module.css";
import { isWhatsappCartMessage } from "core/models/Ecommerce/Inbox/CartMessageType";
import { useTranslation } from "react-i18next";

export const START_LIMIT = 20;
export const NEXT_LIMIT = 10;

export function updateSelectedChannel(
  profile: ProfileType,
  channel: string,
  messagesFilter: MessagesFilterType,
  selectedChannelFromConversations: string,
  loginDispatch: Dispatch<Action>,
  selectedChannelIdFromConversations?: string,
  channelId?: string
) {
  const profileId = profile.id;
  if (selectedChannelFromConversations === "all") {
    if (messagesFilter.selectedFrom === "filter") {
      return {
        selectedChannelFromConversation: messagesFilter.channelName ?? channel,
        selectedChannelIdFromConversation: messagesFilter.channelName
          ? messagesFilter.channelId ?? undefined
          : channelId,
      };
    }
    return {
      selectedChannelFromConversation: channel,
      selectedChannelIdFromConversation: channelId,
    };
  } else {
    if (
      selectedChannelFromConversations === "whatsapp" &&
      selectedChannelIdFromConversations !== profile.whatsAppAccount?.instanceId
    ) {
      postWithExceptions(
        POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE.replace(
          "{id}",
          profileId
        ),
        { param: { instanceId: selectedChannelIdFromConversations } }
      )
        .then(() => {
          loginDispatch({
            type: "INBOX.MESSAGE_FILTER.UPDATED",
            channelName: selectedChannelFromConversations,
            channelId: selectedChannelIdFromConversations,
            mode: "filter",
          });
          return {
            selectedChannelFromConversation: selectedChannelFromConversations,
            selectedChannelIdFromConversation:
              selectedChannelIdFromConversations,
          };
        })
        .catch((e) => {
          console.error(`POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE ${e}`);
        });
    } else {
      return {
        selectedChannelFromConversation: channel,
        selectedChannelIdFromConversation: channelId,
      };
    }
  }
}

export default function ChatGroupList(props: {
  id: string;
  tags: HashTagType[];
  chatsSorted: ProfileType[];
  disabledMenu?: boolean;
}) {
  const { chatsSorted, disabledMenu = false } = props;
  const [selectedItem, setSelectedItem] = useState<number[]>([]);
  const { assigneeId } = useConversationParams();
  const { signalRDispatch, apiConnection } = useContext(SignalRContext);
  const staffList = useAppSelector((s) => s.staffList, equals);
  const user = useAppSelector((s) => s.user, equals);
  const chats = useAppSelector((s) => s.chats, equals);
  const profile = useAppSelector((s) => s.profile, equals);
  const selectedAssigneeId = useAppSelector((s) => s.selectedAssigneeId);
  const messagesFilter = useAppSelector((s) => s.inbox.messagesFilter, equals);
  const loginDispatch = useAppDispatch();
  const { getActualTagsOnly } = useCompanyHashTags();
  const { t } = useTranslation();
  const selectedChannelFromConversations = useAppSelector(
    (s) => s.selectedChannel
  );
  const selectedChannelIdFromConversations = useAppSelector(
    (s) => s.selectedInstanceId
  );
  const {
    loadMore,
    pageLoaded,
    hasMore,
    isLoadMoreBlocked,
    buildPageParams,
    getChatsEndPoint,
    loading,
    currentFilterStamp,
  } = useLoadMoreChats({
    id: props.id,
    nextLimit: NEXT_LIMIT,
    startLimit: START_LIMIT,
    tags: props.tags,
  });

  const { getLastChannel } = useChatSelectors();
  const { getCurrentMessageStaffName } = useCurrentMessageStaffName();
  const { profileDisplayName } = useProfileDisplayName();

  useEffect(() => {
    if (currentFilterStamp && pageLoaded === 0 && !isLoadMoreBlocked) {
      loadMore();
    }
  }, [currentFilterStamp, pageLoaded === 0, isLoadMoreBlocked]);

  const setSelectedItemHandle = useCallback(
    (index: number) => {
      if ((chatsSorted ?? []).length > 0 && chatsSorted[index]) {
        const chatUpdated = clone(chatsSorted[index]);
        if (chatUpdated.id === profile.id) {
          return;
        }
        if (chatUpdated.isNeedToFetch) {
          loginDispatch({
            type: "CLEAR_CURRENT_CHAT_MESSAGE",
            conversationId: chatUpdated.conversationId,
          });
        }
        const selectChannel = chatUpdated.lastChannel;
        const selectChannelId = getChannelInstanceId(
          chatUpdated.lastChannel,
          chatUpdated
        );
        loginDispatch({
          type: "CHAT_SELECTED",
          profile: { ...chatUpdated, unReadMsg: false },
          selectedUser: chatUpdated.assignee,
          selectedChat: chatUpdated.conversation?.list ?? [],
          isScrollToEnd: true,
          fromConversationId: profile.conversationId,
          ...updateSelectedChannel(
            chatUpdated,
            selectChannel,
            messagesFilter,
            selectedChannelFromConversations,
            loginDispatch,
            selectedChannelIdFromConversations,
            selectChannelId
          ),
        });
        loginDispatch({
          type: "INBOX.WHATSAPP_TEMPLATE.RESET",
        });
      }
    },
    [
      JSON.stringify(chatsSorted),
      profile.id,
      loginDispatch,
      messagesFilter,
      selectedChannelFromConversations,
      selectedChannelIdFromConversations,
    ]
  );

  const fetchConversationDetail = async (conversationId: string) => {
    if (!chatsSorted) {
      return;
    }
    // we selected a chat never loaded before
    try {
      const result: ConversationType = await get(
        GET_CONVERSATIONS_DETAIL.replace("{id}", conversationId),
        { param: {} }
      );
      if (profile.conversationId === conversationId) {
        return;
      }
      if (result && result.conversationId === conversationId) {
        let formatedLastMessage: MessageType = defaultMessageValues();
        const lastMessage = last(result.lastMessage);
        const { customFields: _, ...otherFields } = result.userProfile;
        let updatedProfile: ProfileType = {
          ...profile,
          ...otherFields,
          assignee: result.assignee?.userInfo,
          collaboratorIds: denormalizeConversationCollaborators(result),
          conversationId: result.conversationId,
          lastChannel: last(result.conversationChannels) || profile.lastChannel,
          conversationStatus: result.status,
          unReadMsg: false,
          conversationHashtags: result.conversationHashtags,
          firstMessageId: result.firstMessageId,
        };
        if (lastMessage) {
          formatedLastMessage = convertMessageToGeneralFormat(
            normalizeApiMessage(lastMessage, profile),
            profile
          );
          updatedProfile = {
            ...updatedProfile,
            conversation: {
              list: [formatedLastMessage],
              lastUpdated: result.updatedTime,
            },
          };
        }
        let selectChannel = updatedProfile.lastChannel;
        let selectChannelId = getChannelInstanceId(
          updatedProfile.lastChannel,
          updatedProfile
        );

        loginDispatch({
          type: "CHAT_SELECTED",
          profile: { ...updatedProfile },
          selectedUser: result.assignee?.userInfo,
          isScrollToEnd: true,
          ...updateSelectedChannel(
            updatedProfile,
            selectChannel,
            messagesFilter,
            selectedChannelFromConversations,
            loginDispatch,
            selectedChannelIdFromConversations,
            selectChannelId
          ),
          fromConversationId: profile.conversationId,
        });
      }
    } catch (e) {
      console.error(`fetchConversationDetail error: ${e}`);
    }
  };

  useEffect(() => {
    if (
      apiConnection.chats === CONNECT_STATE.UNSYNC &&
      apiConnection.lastConnectedTime
    ) {
      if (chats && assigneeId) {
        const endpoint = getChatsEndPoint(assigneeId);
        let param = buildPageParams(1000, 0);
        param.afterModifiedAt = moment
          .utc(apiConnection.lastConnectedTime)
          .toDate()
          .toISOString();

        get(endpoint, { param })
          .then((resultList: ConversationType[]) => {
            // compare chats different between res
            let updatedChats: ProfileType[] = [];
            if (resultList) {
              for (let i = 0; i < resultList.length; i++) {
                const updatedConversation = resultList[i];
                const formattedConversationMessage =
                  denormalizeConversation(updatedConversation);
                const foundIndex = updatedChats.findIndex(
                  matchesConversationId(updatedConversation.conversationId)
                );
                if (foundIndex > -1) {
                  updatedChats = update(
                    foundIndex,
                    formattedConversationMessage,
                    updatedChats
                  );
                } else {
                  updatedChats = [
                    ...updatedChats,
                    formattedConversationMessage,
                  ];
                }
              }
              loginDispatch({
                type: "UPDATE_SELECTED_ASSIGNEE_CONVERSATIONS",
                updatedConversations: updatedChats,
              });
              loginDispatch({
                type: "CHATS_UPDATED",
                conversationId: props.id,
                chats: updatedChats,
                selectedAssigneeId: selectedAssigneeId!,
              });
              signalRDispatch({
                type: "UPDATE_CHATS_SIGNALR_CONNECTION_STATE",
                status: CONNECT_STATE.SYNC,
              });
            }
          })
          .catch((e) => {
            console.error("reconnect effect", e);
          });
      }
    }
  }, [apiConnection.chats]);

  useEffect(() => {
    if (profile.id === "") {
      setSelectedItem([-1]);
    }

    if (chatsSorted && chatsSorted.length > 0) {
      const conversationId = props.id;
      const list = [...chatsSorted];
      if (conversationId) {
        const chatFoundIndex = list.findIndex(
          (chat) => chat.conversationId === conversationId
        );
        if (chatFoundIndex > -1) {
          setSelectedItemHandle(chatFoundIndex);
        } else {
          fetchConversationDetail(conversationId);
        }
      }
    }
  }, [chats && JSON.stringify([chats.map((chat: ProfileType) => chat.id)])]);

  useEffect(() => {
    if (chatsSorted) {
      const foundProfile = chatsSorted.findIndex(
        matchesConversationId(profile.conversationId)
      );
      if (foundProfile > -1) {
        chatsSorted[foundProfile] = {
          ...chatsSorted[foundProfile],
          firstName: profile.firstName,
          lastName: profile.lastName,
          unReadMsg: profile.unReadMsg,
        };
      }
    }
  }, [profile.lastName, profile.firstName, profile.unReadMsg]);

  return loading && pageLoaded === 0 ? (
    <ChatGroupListDummy />
  ) : (
    <>
      <InfiniteScroll
        loadMore={loadMore}
        hasMore={hasMore}
        initialLoad={true}
        threshold={100}
        useWindow={false}
        className="chatsScroll"
        loader={
          <div key={0} className={styles.chatLoader}>
            <Loader inverted />
          </div>
        }
      >
        <Item.Group>
          {chatsSorted.map((chat: ProfileType, index: number) => {
            if (chat && chat.conversation) {
              const records = chat.conversation;
              const lastMessage =
                records?.list[records.list.length - 1] || undefined;
              const displayName = profileDisplayName(chat);
              const staffName = lastMessage?.isSentFromSleekflow
                ? getCurrentMessageStaffName(
                    lastMessage.sender?.id || "",
                    staffList,
                    user.id
                  )
                : "";
              let message = "";
              if (lastMessage) {
                if (isWhatsappCartMessage(lastMessage)) {
                  message = t("chat.conversation.lastMessage.whatsappCart");
                } else if (lastMessage.messageContent) {
                  message = checkMessageContent(lastMessage);
                } else {
                  message = lastMessage.messageType;
                }
              }
              return (
                <ChatGroup
                  key={chat.conversationId}
                  disabledMenu={disabledMenu}
                  conversationId={chat.conversationId}
                  showContextMenu={true}
                  channel={getLastChannel(chat) || getLastChannel(profile)}
                  messageAssignee={
                    lastMessage?.messageAssignee?.userInfo?.displayName ?? ""
                  }
                  staffName={staffName}
                  unReadMsg={chat.unReadMsg}
                  createdAt={
                    lastMessage?.scheduleSentAt ??
                    chat.updatedTime ??
                    chat.createdAt
                  }
                  message={message}
                  name={displayName}
                  nameDisplay={displayName}
                  pic={chat.displayProfilePicture || ""}
                  setSelectedItemHandle={() => setSelectedItemHandle(index)}
                  selected={Boolean(
                    profile && chat.conversationId === profile.conversationId
                  )}
                  isBookmarked={chat.isBookmarked ?? false}
                  isOpened={chat.conversationStatus === "open"}
                  tags={getActualTagsOnly(chat.conversationHashtags ?? [])}
                />
              );
            }
          })}
        </Item.Group>
      </InfiniteScroll>
    </>
  );
}
