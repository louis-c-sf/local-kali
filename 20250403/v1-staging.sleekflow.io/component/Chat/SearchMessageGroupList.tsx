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
  GET_CONVERSATIONS_MESSAGES,
  GET_SEARCH_MESSAGE_BY_ASSIGNEE_V2,
  GET_USERPROFILE_DETAIL,
} from "../../api/apiPath";
import { get } from "../../api/apiRequest";
import ConversationType, {
  SearchConversationMessageType,
  UserInfoType,
} from "../../types/ConversationType";
import { ProfileType } from "../../types/LoginType";
import MessageType from "../../types/MessageType";
import ChatGroup from "./ChatGroup";
import ProfileSearchType from "../../types/ProfileSearchType";
import SearchChatContext from "../../context/SearchChatContext";
import { normalizeApiMessage } from "./mutators/messageMutators";
import { byMessageCreateDate } from "./mutators/chatSelectors";
import { debounce } from "lodash-es";
import produce from "immer";
import { useParams } from "react-router";
import { convertMessageToGeneralFormat } from "./utils/denormalizeChat";
import { useCurrentMessageStaffName } from "./localizable/useCurrentMessageStaffName";
import { useProfileDisplayName } from "./utils/useProfileDisplayName";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals, pick } from "ramda";
import { useFetchAndSelectChat } from "./utils/useFetchAndSelectChat";
import { useTranslation } from "react-i18next";
import { denormalizeConversationCollaborators } from "../../types/Chat/denormalizeConversationCollaborators";
import { useChatsFilterBuilder } from "../../api/Chat/useChatsFilterBuilder";
import { InboxFilterParamsType } from "../../api/Chat/fetchAllSummaries";
import { htmlEntities } from "../../lib/utility/htmlEntities";
import { getSearchParts } from "../../utility/string";

export interface SearchMessageType extends ProfileType {
  message: string;
  matchResult: MessageType;
  assignee: UserInfoType | undefined;
}

interface SearchMessageRequestType extends InboxFilterParamsType {
  keywords: string;
  offset: number;
  limit: number;
}

interface SearchMessageGroupListProps {
  scrollParent?: HTMLDivElement;
}

const SearchMessageGroupList = (props: SearchMessageGroupListProps) => {
  const { scrollParent } = props;
  const { searchChatDispatch, searchMessage, targetMessageId } =
    useContext(SearchChatContext);
  const {
    profile,
    selectedInstanceId,
    user,
    selectedStatus,
    selectedChannel,
    staffList,
  } = useAppSelector(
    pick([
      "profile",
      "selectedInstanceId",
      "user",
      "selectedStatus",
      "selectedChannel",
      "staffList",
    ]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const [selectedItem, setSelectedItem] = useState<number>();
  const [hasMore, setHasMore] = useState(false);
  const [chats, setChats] = useState<SearchMessageType[]>([]);
  const { assigneeId } = useParams();
  const { t } = useTranslation();
  const cacheApiParam = useRef<string>();
  const LIMIT = 10;
  const { getCurrentMessageStaffName } = useCurrentMessageStaffName();
  const fetchAndSelectChat = useFetchAndSelectChat();
  const { currentFilter } = useChatsFilterBuilder();
  useEffect(() => {
    if (chats.length > 0) {
      const updatedChats = produce(chats, (draftState) => {
        for (let i = 0; i < draftState.length; i++) {
          const chat = draftState[i];
          if (profile.conversationId === chat.conversationId) {
            draftState[i] = {
              ...chat,
              lastName: profile.lastName,
              firstName: profile.firstName,
              customFields: profile.customFields,
            };
          }
        }
      });
      setChats([...updatedChats]);
    }
  }, [JSON.stringify(profile)]);

  const getProfileCustomFields = (
    selectedResult: SearchMessageType | ProfileType
  ) => {
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
  const highlightMessage = (
    keyword: string,
    messageContent: string
  ): ReactNode => {
    const content = messageContent.replace(/<br>/g, " ");
    const searchResult = getSearchParts(keyword, content);
    if (searchResult) {
      return (
        <>
          {searchResult[0]}
          <span className="matched-text">{searchResult[1]}</span>
          {searchResult[2]}
        </>
      );
    }
    return messageContent;
  };

  const fetchSearchMessage = async () => {
    try {
      if (!assigneeId) {
        return;
      }
      let param: SearchMessageRequestType = {
        keywords: searchMessage,
        offset: chats.length,
        limit: LIMIT,
        ...currentFilter,
      };

      if (cacheApiParam.current !== JSON.stringify(param)) {
        cacheApiParam.current = JSON.stringify(param);
        const result: SearchConversationMessageType[] = await get(
          GET_SEARCH_MESSAGE_BY_ASSIGNEE_V2.replace("{assigneeId}", assigneeId),
          {
            param: {
              ...param,
            },
          }
        );
        let conversationList: SearchMessageType[] = [];
        for (let i = 0; i < result.length; i++) {
          const conversationmessage = result[i];
          const profileMessageConversationProfile = {
            ...conversationmessage.userProfile,
            conversationId: conversationmessage.conversationId,
          };
          for (let n = 0; n < conversationmessage.messages.length; n++) {
            const searchedMessage = conversationmessage.messages[n];
            const matchResultFound = searchedMessage.messageContent
              .toUpperCase()
              .indexOf(searchMessage.toUpperCase());
            if (matchResultFound > -1) {
              const displayName = profileDisplayName(
                conversationmessage.userProfile
              );
              const conversation: SearchMessageType = {
                ...profileMessageConversationProfile,
                collaboratorIds:
                  denormalizeConversationCollaborators(conversationmessage),
                displayName,
                conversationStatus: conversationmessage.status,
                createdAt: searchedMessage.createdAt,
                updatedAt: searchedMessage.updatedAt || "",
                matchResult: searchedMessage,
                message:
                  searchedMessage.messageContent.trim() ||
                  searchedMessage.messageType,
                assignee: conversationmessage.assignee?.userInfo,
                conversationHashtags: conversationmessage.conversationHashtags,
              };
              conversationList = [...conversationList, conversation];
            }
          }
        }
        if (conversationList.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        const updatedChats = [...chats, ...conversationList];
        setChats([...updatedChats]);
        // isLoading(false)
        searchChatDispatch({
          type: "UPDATE_LOADING_MESSAGE_RESULT",
          isLoadingMessage: false,
        });
        searchChatDispatch({
          type: "UPDATE_SEARCH_RESULT_FOUND",
          result: updatedChats.length,
        });
      }
    } catch (e) {
      // isLoading(false)
      searchChatDispatch({
        type: "UPDATE_LOADING_MESSAGE_RESULT",
        isLoadingMessage: false,
      });
      console.error("e", e);
    }
  };

  useEffect(() => {
    if (chats.length === 0) {
      searchChatDispatch({
        type: "UPDATE_LOADING_MESSAGE_RESULT",
        isLoadingMessage: true,
      });
      if (searchMessage.length > 0) {
        fetchSearchMessage();
      }
    }
  }, [
    JSON.stringify([
      chats,
      searchMessage,
      selectedInstanceId,
      selectedChannel,
      selectedStatus,
    ]),
  ]);

  const convertMessagesFormat = (
    messages: MessageType[],
    profile: ProfileSearchType
  ) => {
    let messageList: MessageType[] = [];
    for (const i in messages) {
      const message = normalizeApiMessage(messages[i], profile);
      messageList = [message, ...messageList];
    }
    // profile.conversation = {...profile.conversation, list: [...messageList, ...chatRecords]}
    return messageList;
  };
  useEffect(() => {
    if (targetMessageId === 0) {
      setSelectedItem(undefined);
    }
  }, [targetMessageId]);

  const retrieveAfterSearchMessage = debounce(
    (searchMessageTimeStamp: number, selectedResultList: ProfileSearchType) => {
      if (selectedResultList.conversationId) {
        get(
          GET_CONVERSATIONS_MESSAGES.replace(
            "{id}",
            selectedResultList.conversationId
          ),
          { param: { afterTimestamp: searchMessageTimeStamp, limit: LIMIT } }
        )
          .then((res: MessageType[]) => {
            if (res.length > 0) {
              if (res[0].timestamp >= searchMessageTimeStamp) {
                const resultList = convertMessagesFormat(
                  [...res],
                  selectedResultList
                );
                loginDispatch({
                  type: "APPEND_MESSAGE_AFTER_SEARCH_MESSAGE",
                  selectedChat: resultList,
                  conversationId: selectedResultList.conversationId!,
                });
                if (res.length === LIMIT) {
                  const latestMessage = res[LIMIT - 1];
                  retrieveAfterSearchMessage(
                    latestMessage.timestamp,
                    selectedResultList
                  );
                }
              }
            }
          })
          .catch((e) => {
            console.error("retrieveAfterSearchMessage error", e);
          });
      }
    },
    1500
  );

  const handleSelectedItem = async (senderId: number) => {
    searchChatDispatch({
      type: "SELECTED_PROFILE",
      targetProfileId: "",
      targetMessageId: senderId,
    });

    const selectedResultList = chats.find(
      (chat) => chat.matchResult.id === senderId
    );
    if (selectedResultList) {
      const message = selectedResultList.matchResult;
      setSelectedItem(senderId);
      if (
        message &&
        message.messageContent &&
        selectedResultList.conversationId
      ) {
        const prevConversations: MessageType[] = await get(
          GET_CONVERSATIONS_MESSAGES.replace(
            "{id}",
            selectedResultList.conversationId
          ),
          {
            param: {
              beforeTimestamp: message.timestamp,
              limit: LIMIT,
            },
          }
        );
        const result: ConversationType = await get(
          GET_CONVERSATIONS_DETAIL.replace(
            "{id}",
            selectedResultList.conversationId
          ),
          { param: {} }
        );

        const resultList = convertMessagesFormat(
          [
            ...prevConversations,
            {
              ...message,
              isSelected: true,
            },
          ],
          selectedResultList
        );
        const updatedProfile = {
          ...selectedResultList,
          ...result.userProfile,
          conversationStatus: result.status,
          lastChannel: message.channel,
          conversation: {
            list: [...resultList],
            lastUpdated:
              resultList[resultList.length - 1].updatedAt ??
              resultList[resultList.length - 1].createdAt,
          },
        };
        loginDispatch({
          type: "CHAT_SELECTED",
          selectedUser: result.assignee?.userInfo,
          profile: { ...updatedProfile },
          selectedChat: resultList,
          fromConversationId: profile.conversationId,
        });
        retrieveAfterSearchMessage(message.timestamp, updatedProfile);
        getProfileCustomFields(updatedProfile);
      } else {
        if (selectedResultList.conversationId) {
          // selectedResultList has conversationId get the conversationId from the list
          const result: ConversationType = await get(
            GET_CONVERSATIONS_DETAIL.replace(
              "{id}",
              selectedResultList.conversationId
            ),
            { param: {} }
          );
          const lastMessage = result.lastMessage;
          const updatedProfile = {
            ...result.userProfile,
            conversationHashtags: result.conversationHashtags,
            unReadMsg: result.unreadMessageCount > 0,
            conversationStatus: result.status,
            numOfNewMessage: result.unreadMessageCount,
            messageGroupName: result.messageGroupName,
            conversationId: result.conversationId,
            updatedTime: result.updatedTime,
          };
          if (lastMessage.length > 0) {
            const message = convertMessageToGeneralFormat(
              lastMessage[0],
              result.userProfile
            );
            loginDispatch({
              type: "CHAT_SELECTED",
              selectedChat: [message],
              selectedUser: result.assignee && result.assignee.userInfo,
              profile: {
                ...updatedProfile,
                conversation: {
                  list: [message],
                  lastUpdated: result.updatedTime,
                },
              },
              fromConversationId: profile.conversationId,
            });
          } else {
            loginDispatch({
              type: "CHAT_SELECTED",
              selectedUser: undefined,
              profile: {
                ...updatedProfile,
                conversation: { list: [], lastUpdated: result.updatedTime },
              },
              fromConversationId: profile.conversationId,
            });
          }
          // history.push(`/inbox/all/${selectedResultList.conversationId}`);
        } else {
          fetchAndSelectChat(selectedResultList.conversationId);
        }
      }
    }
  };

  useEffect(() => {
    setChats([]);
  }, [searchMessage, selectedChannel, selectedStatus]);

  const loadMore = useCallback(async () => {
    fetchSearchMessage();
  }, [JSON.stringify([chats, searchMessage, hasMore])]);

  const { profileDisplayName } = useProfileDisplayName();

  return (
    (chats.length > 0 && (
      <Item.Group className="no-scrollbars">
        <Item.Header>{t("chat.search.header.message")}</Item.Header>
        <InfiniteScroll
          className="chatsScroll no-scrollbars"
          loadMore={loadMore}
          threshold={100}
          useWindow={false}
          getScrollParent={() => scrollParent ?? null}
          hasMore={hasMore}
          loader={
            <div className="loader" key={0}>
              <Loader />
            </div>
          }
        >
          {chats.sort(byMessageCreateDate()).map((chat, index) => {
            const message = chat.matchResult as MessageType;
            if (message && message.messageContent) {
              const messageContent = htmlEntities(message.messageContent ?? "");
              const staffName = message.isSentFromSleekflow
                ? getCurrentMessageStaffName(
                    message.sender?.id || "",
                    staffList,
                    user.id
                  )
                : "";
              return (
                <ChatGroup
                  searchMessage={searchMessage}
                  channel={message.channel}
                  key={`search_${chat.conversationId}#${index}_${message.id}`}
                  pic={chat.displayProfilePicture || ""}
                  name={profileDisplayName(chat)}
                  nameDisplay={profileDisplayName(chat)}
                  message={highlightMessage(searchMessage, messageContent)}
                  staffName={staffName}
                  createdAt={
                    message ? message.createdAt : Date.now().toString()
                  }
                  selected={selectedItem === message.id}
                  setSelectedItemHandle={() => handleSelectedItem(message.id)}
                  conversationId={chat.conversationId}
                  showContextMenu={false}
                  isBookmarked={chat.isBookmarked ?? false}
                  isOpened={chat.conversationStatus === "open"}
                  tags={chat.conversationHashtags}
                />
              );
            }
          })}
        </InfiniteScroll>
      </Item.Group>
    )) || <div></div>
  );
};

export default SearchMessageGroupList;
