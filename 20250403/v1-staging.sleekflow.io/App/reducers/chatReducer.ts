import {
  Action,
  ChatSelectedAction,
  LoginType,
  NumNewMessageCountType,
  ProfileType,
} from "../../types/LoginType";
import { mergeChatList } from "../../component/Chat/mutators/mergeChatsList";
import { initialUser } from "../../context/LoginContext";
import produce from "immer";
import {
  adjust,
  assoc,
  clone,
  equals,
  evolve,
  last,
  mergeLeft,
  pipe,
  reject,
  remove,
  update,
  when,
  without,
} from "ramda";

import {
  isUserInvolvedInChat,
  matchesConversationId,
} from "component/Chat/mutators/chatSelectors";
import lastChannelName from "../../component/Chat/utils/lastChannelName";
import {
  clearIsSelected,
  mergeMessages,
} from "../../component/Chat/mutators/mergeMessages";
import { reduceReducersWithDefaults } from "../../utility/reduce-reducers";
import { normalizeApiMessage } from "../../component/Chat/mutators/messageMutators";
import assigneeFieldNameMapping from "../../config/AssigneeFieldNameMapping";
import { dedupeChats } from "../../component/Chat/mutators/dedupeChats";
import { sortByDisplayPriority } from "../../component/Chat/mutators/sortByDisplayPriotity";
import { matchesStaffId } from "../../types/TeamType";
import { messengerReducer } from "../../component/Chat/Messenger/messengerReducer";
import getProfileMatchers from "../../utility/getProfileMatchers";
import { messageSearchReducer } from "./Chat/messageSearchReducer";
import ChatsSummaryResponseType from "types/ChatsSummaryResponseType";
import {
  AssigneesType,
  AssigneeType,
  defaultAssigee,
} from "types/state/inbox/AssigneeType";
import { currentProfileReducer } from "./Chat/currentProfileReducer";
import { chatUIReducer } from "./Chat/chatUIReducer";
import { takeoverReducer } from "./Chat/takeoverReducer";
import { analyticsReducer } from "./Chat/analyticsReducer";
import { preselectedMessagesReducer } from "./Chat/preselectedMessagesReducer";
import { productReducer } from "./Chat/productReducer";
import { DefaultOrderBy, MessagesFilterType } from "types/state/InboxStateType";
import { paymentHistoryReducer } from "./Chat/paymentHistoryReducer";
import { defaultMessageTypeState } from "features/Facebook/models/facebookReducer";
import { getChannelInstanceId } from "component/Chat/utils/useChatSelectors";
import {
  chatSearchedReducer,
  defaultChatSearchedState,
  SearchMessageType,
} from "App/reducers/chatSearchedReducer";
import moment from "moment";

export function rearrangeCollaborators(
  profile: ProfileType,
  newAssigneeId: string
) {
  let collaboratorsUpdated = [...(profile.collaboratorIds ?? [])];
  if (collaboratorsUpdated.includes(newAssigneeId)) {
    collaboratorsUpdated = without([newAssigneeId], collaboratorsUpdated);
  }

  return collaboratorsUpdated;
}

function updateChatCollaboratorsAt(
  index: number,
  action: Extract<Action, { type: "ASSIGNEE_UPDATED" }>,
  state: LoginType
): LoginType {
  const chats = adjust(
    index,
    (chat) => ({
      ...chat,
      collaboratorIds: rearrangeCollaborators(
        action.profile,
        action.selectedUser?.id ?? ""
      ),
      assignee: action.selectedUser,
    }),
    state.chats ?? []
  );
  return {
    ...state,
    chats: sortByDisplayPriority(chats, state.inbox.filter.orderBy),
    selectedUser: action.selectedUser,
  };
}

function removeChatAndJumpToNextOne(
  visibleChatAssignedIndex: number,
  action: Extract<Action, { type: "ASSIGNEE_UPDATED" }>,
  state: LoginType
) {
  if (!state.chats) {
    return state;
  }
  const assignees = { ...state.assignees };
  const selectedStaffId = action.selectedUser?.id ?? "Unassigned";
  // delete the chat that is not in the scope anymore
  const newConversations = remove(visibleChatAssignedIndex, 1, state.chats);
  const nextSelectedIndex = Math.min(
    visibleChatAssignedIndex,
    newConversations.length - 1
  );
  const updatedSelectedUser =
    state.selectedAssigneeId ?? state.selectedAssignee;
  const nextChatSelected = newConversations[nextSelectedIndex];
  return {
    ...state,
    profile: nextChatSelected
      ? { ...nextChatSelected }
      : { ...defaultAssigee.conversations[0] }, // todo replace with an empty conversations factory
    chats: sortByDisplayPriority(
      dedupeChats(newConversations),
      state.inbox.filter.orderBy
    ),
    assignees: {
      ...assignees,
      [updatedSelectedUser]: {
        ...assignees[updatedSelectedUser],
        conversations: dedupeChats(newConversations),
      },
      [selectedStaffId]: {
        ...assignees[selectedStaffId],
        conversations: dedupeChats([
          { ...newConversations[visibleChatAssignedIndex] },
          ...assignees[selectedStaffId].conversations,
        ]),
      },
    },
    selectedUser: state.selectedUser,
  };
}

function chatReducerBase(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  switch (action.type) {
    case "CLEAR_PROFILE":
      return {
        ...state,
        profile: defaultAssigee.conversations[0], /// todo replace with an empty conversations factory
      };
    case "MESSAGE_UPDATED":
      let updatedMessage = normalizeApiMessage(action.message);
      if (action.conversationId) {
        const message = updatedMessage;
        let messageMemorized = mergeMessages(state.messagesMemoized, [
          updatedMessage,
        ]);
        let updatedChats = state.chatSearched.conversations.length
          ? (clone(state.chatSearched.conversations) as SearchMessageType[])
          : (clone(state.chats) as ProfileType[]);
        const foundProfileIndex = updatedChats.findIndex(
          matchesConversationId(action.conversationId)
        );
        const conversationMessageTime =
          message.scheduleSentAt ?? message.updatedAt ?? message.createdAt;
        if (foundProfileIndex > -1) {
          const chats = produce(updatedChats, (draftState) => {
            const isUnReadMsg =
              state.profile.conversationId !== action.conversationId &&
              !message.isSentFromSleekflow;
            draftState[foundProfileIndex].updatedTime = conversationMessageTime;
            draftState[foundProfileIndex].conversation = {
              ...(draftState[foundProfileIndex].conversation ?? {}),
              list: [message],
              unReadMsg: isUnReadMsg,
              lastUpdated: conversationMessageTime,
            };
            draftState[foundProfileIndex].unReadMsg = isUnReadMsg;
            draftState[foundProfileIndex].lastChannel = message.channel;
          });
          if (state.profile.conversationId === action.conversationId) {
            return {
              ...state,
              chats,
              profile: {
                ...state.profile,
                lastChannel: message.channel,
              },
              messagesMemoized: messageMemorized,
              isScrollToEnd: true,
            };
          }
          return {
            ...state,
            chats,
            messagesMemoized: messageMemorized,
            newMessage: !message.isSentFromSleekflow,
          };
        } else if (action.conversation) {
          if (
            state.chatSearched.conversations.some(
              matchesConversationId(action.conversationId)
            ) ||
            action.conversation.conversationStatus !== state.selectedStatus
          ) {
            return {
              ...state,
              messagesMemoized: messageMemorized,
            };
          }
          return {
            ...state,
            messagesMemoized: messageMemorized,
            chats: clone([
              ...(state.chats ?? []),
              {
                ...action.conversation,
                updatedTime: conversationMessageTime,
                conversation: {
                  list: [message],
                  unReadMsg: action.conversation.unReadMsg,
                  lastUpdated: conversationMessageTime,
                },
              },
            ]),
            newMessage: !message.isSentFromSleekflow,
          };
        }
        return {
          ...state,
          messagesMemoized: messageMemorized,
        };
      }
      return {
        ...state,
      };
    case "RESET_PROFILE":
      return {
        ...state,
        profile: defaultAssigee.conversations[0], /// todo replace with an empty conversations factory
      };
    case "UPDATE_SELECTED_ASSIGNEE_CONVERSATIONS":
      return produce(state, (draftState) => {
        draftState.numOfNewMessages = draftState.numOfNewMessages ?? {};
        if (!draftState.assignees) {
          return;
        }
        action.updatedConversations.forEach(
          (updatedConversation: ProfileType) => {
            const name = updatedConversation.assignee?.id || "Unassigned";
            if (!draftState.assignees[name]) {
              return;
            }
            if (draftState.assignees[name].conversations) {
              let updatedConversations =
                draftState.assignees[name].conversations;
              const foundConversationIndex = updatedConversations.findIndex(
                matchesConversationId(updatedConversation.conversationId)
              );
              if (foundConversationIndex === -1) {
                updatedConversations.push(updatedConversation);
              } else {
                updatedConversations[foundConversationIndex] =
                  updatedConversation;
              }
            }
            draftState.numOfNewMessages![updatedConversation.conversationId] =
              updatedConversation.numOfNewMessage;
          }
        );
      });

    case "INBOX.FILTER.UPDATE_TEAM_SUMMARY":
      return produce(state, (draft) => {
        action.summary.forEach((sum: ChatsSummaryResponseType) => {
          if (draft.inbox.summary.teams[action.teamId] === undefined) {
            draft.inbox.summary.teams[action.teamId] = {};
          }
          if (sum.assigneeId) {
            draft.inbox.summary.teams[action.teamId][sum.assigneeId] =
              sum.count;
          }
        });
      });

    case "INBOX.FILTER.UPDATE_SUMMARY_START":
      return produce(state, (draft) => {
        draft.inbox.summary.loading = true;
      });
    case "INBOX.FILTER.UPDATE_SUMMARY":
      return produce(state, (draft) => {
        draft.inbox.summary.loading = false;
        draft.inbox.summary.filters = action.assigneeSummary;
        for (const assigneeId of Object.keys(action.assigneeAssignedNumber)) {
          const assigneeKey =
            assigneeFieldNameMapping[assigneeId.toLowerCase()] ?? assigneeId;
          if (!draft.assignees[assigneeKey]) {
            const newAssignee: AssigneeType = {
              conversations: [],
              totalAssigned: 0,
            };
            draft.assignees[assigneeKey] = newAssignee;
          }
          let assigneeUpdated = draft.assignees[assigneeKey];
          if (!assigneeUpdated.conversations) {
            assigneeUpdated.conversations = [];
          }
          assigneeUpdated.totalAssigned =
            action.assigneeAssignedNumber[assigneeId];
        }
      });

    case "CHATS_RESET":
      return {
        ...state,
        chats: [],
        chatSearched: defaultChatSearchedState(),
        numOfNewMessages: {},
      };

    case "CHATS_UPDATED": {
      const numOfNewMessages = action.chats.reduce(
        (acc: NumNewMessageCountType, chat: ProfileType) => ({
          ...acc,
          [chat.conversationId]: chat.numOfNewMessage,
        }),
        state.numOfNewMessages ?? {}
      );
      const updatedChats =
        action.selectedAssigneeId === state.selectedAssigneeId
          ? mergeChatList(state.chats ?? [], action.chats)
          : [...(state.chats ?? [])];
      return {
        ...state,
        chats: dedupeChats(updatedChats),
        selectedStatus: action.selectedStatus || state.selectedStatus,
        numOfNewMessages,
      };
    }
    case "UPDATE_SELECTED_CHAT": {
      // Sent a message to the conversation
      const chatUpdated: ProfileType = {
        ...state.profile,
        lastChannel: action.channel.toLowerCase(),
        updatedTime: action.createdAt,
      };
      if (state.profile.conversation) {
        chatUpdated.conversation = {
          ...state.profile.conversation,
          list: mergeMessages(state.profile.conversation.list, [
            action.newMessage,
          ]),
          lastUpdated: action.createdAt,
        };
      }
      const chats = state.chats ?? [];
      const chatIndex = chats.findIndex(
        matchesConversationId(chatUpdated.conversationId)
      );
      const messagesMemoized = mergeMessages(state.messagesMemoized, [
        action.newMessage,
      ]);
      if (chatIndex === -1) {
        return {
          ...state,
          isScrollToEnd: true,
          messagesMemoized,
        };
      }
      return {
        ...state,
        chats: dedupeChats(
          update(
            chatIndex,
            mergeLeft(
              {
                chatUpdated,
              },
              chats[chatIndex]
            ),
            chats
          )
        ),
        isScrollToEnd: true,
        messagesMemoized,
      };
    }
    case "UPDATE_SELECTED_CHAT_WITH_PROFILE":
      const lastCurrentMessage = [...action.currentMessages].reverse().shift();
      if (!lastCurrentMessage || !state.chats) {
        return { ...state };
      }
      const updatedChats = produce(state.chats, (draftState) => {
        const chatFound = draftState.find(
          matchesConversationId(lastCurrentMessage.conversationId)
        );
        if (chatFound) {
          if (!chatFound.conversation) {
            chatFound.conversation = { list: [], lastUpdated: "" };
          }
          const lastMessageFromChat = [...(chatFound.conversation?.list ?? [])]
            .reverse()
            .shift();
          if (
            lastMessageFromChat &&
            lastMessageFromChat.id !== lastCurrentMessage.id
          ) {
            chatFound.conversation.list.push(lastCurrentMessage);
            chatFound.conversation.lastUpdated = lastCurrentMessage.createdAt;
            chatFound.updatedTime =
              lastCurrentMessage.updatedAt ?? lastCurrentMessage.createdAt;
          }
        }
      });
      return {
        ...state,
        chats: dedupeChats(updatedChats),
      };

    case "UPDATE_TYPING_MESSAGE":
      return produce(state, (draftState) => {
        draftState.typingMessage = action.typingMessage;
      });

    case "CHAT_UPDATE_TAGS":
      const updatedState = { ...state };
      if (state.profile?.conversationId === action.conversationId) {
        updatedState.profile = {
          ...state.profile,
          conversationHashtags: [...action.tags],
        };
      }

      if (state.chats) {
        const updateChatIndex = state.chats.findIndex(
          matchesConversationId(action.conversationId)
        );
        if (updateChatIndex > -1) {
          const chatsUpdated = update(
            updateChatIndex,
            {
              ...state.chats[updateChatIndex],
              conversationHashtags: [...action.tags],
            },
            state.chats
          );
          updatedState.chats = dedupeChats(chatsUpdated);
        }
      }
      return updatedState;

    case "CHAT_ADD_TAG_FILTER": {
      return produce(state, (draft) => {
        draft.chats = [];
        draft.inbox.filter.tagIds.push(action.id);
      });
    }

    case "CHAT_ADD_UNREAD_FILTER": {
      return produce(state, (draft) => {
        draft.inbox.filter.unreadStatus = "UnreadOnly";
        draft.chats = [];
      });
    }

    case "CHAT_REMOVE_UNREAD_FILTER": {
      return produce(state, (draft) => {
        draft.inbox.filter.unreadStatus = undefined;
        draft.chats = [];
      });
    }

    case "CHAT_REMOVE_TAG_FILTER": {
      return produce(state, (draft) => {
        draft.chats = [];
        draft.inbox.filter.tagIds = reject(
          equals(action.id),
          draft.inbox.filter.tagIds
        );
      });
    }

    case "CHAT_UPDATE_ORDERBY": {
      return produce(state, (draft) => {
        draft.inbox.filter.orderBy = action.orderBy;
      });
    }

    case "ASSIGNEE_UPDATED":
      let assignees = { ...state.assignees };
      const user = state.user;

      const visibleChatAssignedIndex =
        state.chats?.findIndex(matchesConversationId(action.conversationId)) ??
        -1;
      const visibleChat =
        state.chats && (state.chats[visibleChatAssignedIndex] ?? undefined);

      const chatBelongsToSelectedCurrentAssignee =
        visibleChat &&
        state.selectedAssigneeId &&
        isUserInvolvedInChat(state.selectedAssigneeId, visibleChat);

      if (state.selectedAssignee.toLowerCase() === "unassigned") {
        return updateUnassignedChats(action, state);
      }
      if (
        state.selectedAssignee.toLowerCase() === "all" ||
        state.selectedAssignee.toLowerCase() === "mentions"
      ) {
        return updateAssigneeByName(action, state);
      }
      if (visibleChat && chatBelongsToSelectedCurrentAssignee) {
        const isActionUserSelected =
          (user && state.selectedAssignee.toLowerCase() === "you") ||
          state.selectedAssigneeId === user.id;
        // chat is now assigned to someone not in the visible list
        const isYouSelected =
          (user && state.selectedAssignee.toLowerCase() === "you") ||
          state.selectedAssigneeId === user.id;
        if (isYouSelected) {
          if (
            !isUserInvolvedInChat(user.id, {
              ...action.profile,
              assignee: action.selectedUser,
            })
          ) {
            return popFromMyConversations(action, state);
          }
          if (visibleChatAssignedIndex > -1) {
            const chats = adjust(
              visibleChatAssignedIndex,
              (chat) => ({
                ...chat,
                ...action.profile,
                collaboratorIds: rearrangeCollaborators(
                  action.profile,
                  action.selectedUser?.id ?? ""
                ),
                assignee: action.selectedUser,
              }),
              state.chats ?? []
            );
            return {
              ...state,
              profile:
                action.conversationId === state.profile.conversationId
                  ? { ...state.profile, ...action.profile }
                  : state.profile,
              chats: sortByDisplayPriority(chats, state.inbox.filter.orderBy),
              selectedUser: action.selectedUser,
            };
          } else {
            if (state.chats) {
              return {
                ...state,
                chats: sortByDisplayPriority(
                  state.chats,
                  state.inbox.filter.orderBy
                ),
                selectedUser: action.selectedUser,
              };
            }
          }
        } else {
          // update one of not mine chats listed
          if (state.chats) {
            if (
              state.selectedAssigneeId &&
              isUserInvolvedInChat(state.selectedAssigneeId, action.profile)
            ) {
              return updateChatCollaboratorsAt(
                visibleChatAssignedIndex,
                action,
                state
              );
            }
            return removeChatAndJumpToNextOne(
              visibleChatAssignedIndex,
              action,
              state
            );
          }
        }
      } else {
        // append to current chat list
        const destinationAssigneeId = action.selectedUser
          ? action.selectedUser.id
          : "Unassigned";
        if (state.selectedAssigneeId) {
          // some assignee is active
          if (action.selectedUser) {
            const { checkChannelMatch } = getProfileMatchers(action.profile);
            const channelMatch = checkChannelMatch(
              state.selectedChannel,
              state.selectedInstanceId ?? ""
            );
            const statusMatch =
              action.profile?.conversationStatus === state.selectedStatus;
            // the chat updated is currently opened
            if (statusMatch && channelMatch) {
              // rearrange collaborators
              let collaboratorsUpdated = rearrangeCollaborators(
                action.profile,
                destinationAssigneeId
              );
              const currentChat = {
                ...action.profile,
                collaboratorIds: collaboratorsUpdated,
                assignee: action.selectedUser,
                lastChannel: lastChannelName(
                  action.profile.customFields,
                  state.company
                ),
              };
              let sortedChat: ProfileType[];
              if (visibleChat) {
                if (destinationAssigneeId === state.selectedAssigneeId) {
                  const chats = adjust(
                    visibleChatAssignedIndex,
                    (chat) => ({
                      ...chat,
                      ...currentChat,
                    }),
                    state.chats ?? []
                  );
                  sortedChat = sortByDisplayPriority(
                    chats,
                    state.inbox.filter.orderBy
                  );
                } else {
                  sortedChat = sortByDisplayPriority(
                    remove(visibleChatAssignedIndex, 1, state.chats ?? []),
                    state.inbox.filter.orderBy
                  );
                }
              } else {
                let chatsInput: ProfileType[] = state.chats ?? [];
                if (
                  destinationAssigneeId === state.selectedAssigneeId ||
                  isUserInvolvedInChat(state.selectedAssigneeId, currentChat)
                ) {
                  chatsInput = [...chatsInput, currentChat];
                }
                sortedChat = sortByDisplayPriority(
                  chatsInput,
                  state.inbox.filter.orderBy
                );
              }
              if (state.profile.conversationId === action.conversationId) {
                return {
                  ...state,
                  chats: sortedChat,
                  selectedUser: action.selectedUser,
                  profile: {
                    ...state.profile,
                    ...action.profile,
                  },
                  assignees,
                };
              } else {
                return {
                  ...state,
                  chats: sortedChat,
                  assignees,
                };
              }
            }
            return updateSelectedUser(action, state);
          } else {
            // no assignee specified, put into current list
            if (
              state.selectedAssigneeId &&
              state.chats &&
              action.conversationId
            ) {
              const foundSelectedChatIndex = state.chats.findIndex(
                matchesConversationId(action.conversationId)
              );
              if (foundSelectedChatIndex > -1) {
                const updatedChat = produce(state.chats, (draftState) => {
                  draftState.splice(foundSelectedChatIndex, 1);
                });
                const nextIndex =
                  foundSelectedChatIndex > updatedChat.length
                    ? foundSelectedChatIndex
                    : updatedChat.length - 1;
                const nextChat = updatedChat[nextIndex];

                return {
                  ...state,
                  profile:
                    updatedChat.length > 0
                      ? nextChat
                      : defaultAssigee.conversations[0], // todo replace with an empty conversations factory or switch to All
                  chats: dedupeChats(updatedChat),
                  assignees: {
                    ...assignees,
                    [destinationAssigneeId]: {
                      ...assignees[destinationAssigneeId],
                      conversations: dedupeChats([
                        ...assignees[destinationAssigneeId].conversations,
                        state.chats[foundSelectedChatIndex],
                      ]),
                    },
                    [state.selectedAssigneeId]: {
                      ...assignees[state.selectedAssigneeId],
                      conversations: dedupeChats(updatedChat),
                    },
                  },
                };
              }
            }
          }
        } else {
          const selectedAssigneeState = assignees[destinationAssigneeId];
          if (selectedAssigneeState) {
            if (
              selectedAssigneeState.conversations.length > 0 &&
              !selectedAssigneeState.conversations.find(
                (conversation) =>
                  conversation.conversationId === action.conversationId
              )
            ) {
              assignees = {
                ...assignees,
                [destinationAssigneeId]: {
                  ...selectedAssigneeState,
                  conversations: dedupeChats([
                    ...selectedAssigneeState.conversations,
                    action.profile,
                  ]),
                },
              };
            }
          }
          return { ...state, assignees };
        }
      }
      return { ...state };

    case "ASSIGNEE_COLLABORATORS_UPDATED":
      return produce(state, (draft: LoginType) => {
        if (!draft.chats) {
          draft.chats = [];
        }
        const isCommonListOpened = [
          "all",
          "mentions",
          "unassigned",
          "teamunassigned",
        ].includes(draft.selectedAssignee.toLowerCase());
        const chatVisible = draft.chats?.find(
          matchesConversationId(action.profile.conversationId)
        );
        if (action.profile.id === draft.profile.id) {
          draft.profile.collaboratorIds = action.profile.collaboratorIds;
        }
        const {
          checkChannelMatch,
          checkStatusMatch,
          checkTagMatch,
          checkUnreadMatch,
        } = getProfileMatchers(action.profile);
        let checkAllMatch =
          checkChannelMatch(
            state.selectedChannel,
            state.selectedInstanceId ?? ""
          ) &&
          checkStatusMatch(state.selectedStatus) &&
          checkTagMatch(state.inbox.filter.tagIds) &&
          checkUnreadMatch(state.inbox.filter.unreadStatus);
        if (!checkAllMatch) {
          return;
        }
        if (!chatVisible) {
          if (
            isCommonListOpened ||
            isUserInvolvedInChat(draft.selectedAssigneeId!, action.profile)
          ) {
            draft.chats = sortByDisplayPriority(
              [...draft.chats, action.profile],
              state.inbox.filter.orderBy
            );
          } else {
            const foundIndex = draft.chatSearched.conversations.findIndex(
              matchesConversationId(action.profile.conversationId)
            );
            if (foundIndex > -1) {
              draft.chatSearched.conversations = update(
                foundIndex,
                {
                  ...action.profile,
                  assignee: action.profile.assignee,
                  matchResult:
                    draft.chatSearched.conversations[foundIndex].matchResult,
                },
                draft.chatSearched.conversations
              );
              draft.selectedUser =
                action.profile.conversationId === state.profile.conversationId
                  ? action.profile.assignee
                  : state.selectedUser;
            }
          }
        } else {
          if (
            !isCommonListOpened &&
            !isUserInvolvedInChat(draft.selectedAssigneeId!, action.profile)
          ) {
            draft.chats = reject(
              matchesConversationId(action.profile.conversationId),
              draft.chats
            );
          } else {
            if (chatVisible) {
              chatVisible.collaboratorIds = action.profile.collaboratorIds;
              chatVisible.assignee = action.profile.assignee;
              const foundIndex = draft.chats.findIndex(
                matchesConversationId(action.profile.conversationId)
              );
              if (foundIndex > -1) {
                draft.chats[foundIndex] = { ...chatVisible };
                if (
                  draft.profile.conversationId === action.profile.conversationId
                ) {
                  draft.selectedUser = action.profile.assignee;
                }
              }
            }
          }
        }
      });
    case "CLEAR_CURRENT_CHAT_MESSAGE":
      return produce(state, (draft) => {
        draft.messagesMemoized = reject(
          matchesConversationId(action.conversationId),
          draft.messagesMemoized
        );
      });
    case "CURRENT_CHAT_FETCHED":
      return produce(state, (draft) => {
        const foundIndex =
          draft.chats?.findIndex(
            matchesConversationId(action.conversationId)
          ) ?? -1;
        if (foundIndex > -1 && draft.chats) {
          draft.chats[foundIndex].isNeedToFetch = false;
        }
      });
    case "CONVERSATION_NEED_REFETCH":
      return produce(state, (draft) => {
        draft.chats = draft.chats?.map((chat) =>
          chat.conversationId === state.profile.conversationId
            ? chat
            : {
                ...chat,
                isNeedToFetch: true,
              }
        );
      });
    case "CURRENT_CHAT_PAGE_LOADED": {
      const messages = action.chatsDataUpdate.messages;

      let messagesMemoized = mergeMessages(
        state.messagesMemoized,
        messages ?? []
      );
      if (state.chats) {
        const lastMessageFromConversation = messagesMemoized
          .filter(matchesConversationId(action.conversationId))
          .reverse()
          .shift();

        const updatedChat = produce(state.chats, (draftState) => {
          const foundIndex = draftState.findIndex(
            matchesConversationId(action.conversationId)
          );
          if (foundIndex > -1 && lastMessageFromConversation) {
            draftState[foundIndex].conversation = {
              list: [lastMessageFromConversation],
              lastUpdated: lastMessageFromConversation.createdAt,
            };
          }
        });

        return {
          ...state,
          messagesMemoized,
          isScrollToEnd: false,
          chats: dedupeChats(updatedChat),
        };
      }

      return {
        ...state,
        messagesMemoized,
        isScrollToEnd: false,
      };
    }

    case "CHAT_SELECTED": {
      return updateOnChatSelected(state, action);
    }

    case "APPEND_MESSAGE_AFTER_SEARCH_MESSAGE": {
      let messagesMemoized = mergeMessages(
        state.messagesMemoized,
        action.selectedChat
      );
      return {
        ...state,
        messagesMemoized,
      };
    }

    case "UPDATE_SOUND_STATUS":
      return {
        ...state,
        newMessage: false,
      };
    case "UPDATE_SCROLL_END":
      return { ...state, isScrollToEnd: action.isScrollToEnd };
    case "BOOKMARK_STATUS_UPDATED":
      return produce(state, (draftState) => {
        if (draftState.chats) {
          const chatIndex = draftState.chats.findIndex(
            matchesConversationId(action.conversationId)
          );
          if (chatIndex > -1) {
            draftState.chats[chatIndex].isBookmarked = action.isBookmarked;
          }
        }
      });
    case "UNREAD_STATUS_UPDATED":
      return produce(state, (draftState) => {
        const chats = draftState.chatSearched.conversations.length
          ? draftState.chatSearched.conversations
          : draftState.chats;
        if (!chats) {
          return;
        }
        const chat = chats.find(matchesConversationId(action.conversationId));
        if (!chat) {
          return;
        }
        chat.unReadMsg = action.unReadStatus;
        if (action.unReadStatus) {
          if (!draftState.numOfNewMessages) {
            draftState.numOfNewMessages = { [chat.conversationId]: 1 };
          } else {
            const updatingAssignee =
              draftState.numOfNewMessages[chat.conversationId];
            draftState.numOfNewMessages[chat.conversationId] =
              updatingAssignee !== undefined ? updatingAssignee + 1 : 1;
          }
        }
      });
    case "STATUS_UPDATED": {
      let assignees = { ...state.assignees };
      const assigneeId = action.selectedUser
        ? action.selectedUser.id
        : "Unassigned";
      if (action.selectedUser && state.selectedAssignee === "Unassigned") {
      }
      if (assigneeId && assignees[assigneeId]) {
        const assigneeChatIndex = assignees[
          assigneeId
        ]?.conversations?.findIndex(
          matchesConversationId(action.conversationId)
        );
        if (assigneeChatIndex > -1) {
          if (action.profile) {
            assignees[assigneeId].conversations[assigneeChatIndex] = {
              ...assignees[assigneeId].conversations[assigneeChatIndex],
              ...action.profile,
              conversationStatus:
                action.status || action.profile.conversationStatus,
            };
          } else {
            if (action.status) {
              assignees[assigneeId].conversations[assigneeChatIndex] = {
                ...assignees[assigneeId].conversations[assigneeChatIndex],
                conversationStatus: action.status,
              };
            }
          }
        } else {
          if (action.profile) {
            assignees[assigneeId].conversations = dedupeChats([
              ...assignees[assigneeId].conversations,
              {
                ...action.profile,
                conversationStatus: action.status ?? "",
              },
            ]);
          }
        }
      } else {
        if (action.selectedUser) {
          const selectedUserId = action.selectedUser.id;
          if (action.profile) {
            assignees = {
              ...assignees,
              [selectedUserId]: {
                ...assignees[selectedUserId],
                conversations: dedupeChats([
                  ...(assignees[selectedUserId]?.conversations ?? []),
                  action.profile,
                ]),
              },
            };
          }
        }
      }
      let updatedChatList = sortByDisplayPriority(
        [...state.chats] ?? [],
        state.inbox.filter.orderBy
      );
      if (!updatedChatList) {
        return {
          ...state,
          assignees,
        };
      }
      const foundChatIndex = updatedChatList.findIndex(
        matchesConversationId(action.conversationId)
      );
      if (foundChatIndex > -1) {
        updatedChatList[foundChatIndex].isBookmarked = action.isBookmarked;
        if (state.selectedStatus !== action.status) {
          updatedChatList = produce(updatedChatList, (draftState) => {
            draftState.splice(foundChatIndex, 1);
          });
        } else {
          const updatedProfile = action.profile;
          let lastChannel = updatedChatList[foundChatIndex].lastChannel;
          if (updatedProfile?.customFields && state.company) {
            const lastChannelFromCustomField = lastChannelName(
              updatedProfile.customFields,
              state.company
            );
            lastChannel = lastChannelFromCustomField
              ? lastChannelFromCustomField
              : lastChannel;
          }

          updatedChatList = produce(updatedChatList, (draftState) => {
            draftState[foundChatIndex] = {
              ...draftState[foundChatIndex],
              ...(updatedProfile ?? {}),
              conversationStatus: action.status,
              lastChannel,
            };
          });
        }
        updatedChatList = dedupeChats(updatedChatList);

        if (state.profile.conversationId === action.conversationId) {
          const chatResult = dedupeChats(updatedChatList);
          const chatFound = chatResult.find(
            matchesConversationId(action.conversationId)
          );
          return {
            ...state,
            assignees,
            selectedUser: action.selectedUser,
            profile: chatFound ?? {
              ...state.profile,
              ...action.profile,
              conversationStatus: action.status,
            },
            chats: chatResult,
          };
        } else {
          // if not equal to selected profile
          return {
            ...state,
            assignees,
            chats: dedupeChats(updatedChatList),
          };
        }
      } else {
        if (state.selectedStatus === action.status) {
          let updatedProfile =
            action.profile ||
            assignees[assigneeId].conversations.find(
              matchesConversationId(action.conversationId)
            );
          if (!updatedProfile) {
            return {
              ...state,
              assignees,
            };
          }
          const allAssignmentsSelected =
            state.selectedAssignee.toLowerCase() === "all";
          const currentUserAssignmentsSelected =
            assigneeId && state.selectedAssigneeId === assigneeId;
          const isOpenedChatProcessing =
            action.selectedUser &&
            action.selectedUser.id === state.selectedAssigneeId;
          if (
            allAssignmentsSelected ||
            currentUserAssignmentsSelected ||
            isOpenedChatProcessing
          ) {
            const conversationMessages = state.messagesMemoized.filter(
              matchesConversationId(action.conversationId)
            );
            if (conversationMessages.length > 0) {
              updatedProfile = {
                ...updatedProfile,
                conversationStatus: action.status,
                conversation: {
                  list: conversationMessages,
                  lastUpdated:
                    [...conversationMessages].reverse().shift()?.createdAt ||
                    "",
                },
              };
            }
            if (state.company) {
              updatedProfile = {
                ...updatedProfile,
                conversationStatus: action.status,
                assignee: action.selectedUser,
                lastChannel: lastChannelName(
                  updatedProfile.customFields,
                  state.company
                ),
              };
            }
            const {
              checkChannelMatch,
              checkStatusMatch,
              checkTagMatch,
              checkUnreadMatch,
            } = getProfileMatchers(updatedProfile);

            let checkAllMatch =
              checkChannelMatch(
                state.selectedChannel,
                state.selectedInstanceId ?? ""
              ) &&
              checkStatusMatch(state.selectedStatus) &&
              checkTagMatch(state.inbox.filter.tagIds) &&
              checkUnreadMatch(state.inbox.filter.unreadStatus);
            updatedChatList = checkAllMatch
              ? sortByDisplayPriority(
                  [...updatedChatList, updatedProfile],
                  state.inbox.filter.orderBy ?? DefaultOrderBy
                )
              : updatedChatList;
            if (state.profile?.id === updatedProfile.id) {
              return {
                ...state,
                assignees,
                chats: dedupeChats(updatedChatList),
                profile: updatedProfile,
              };
            }
            return {
              ...state,
              assignees,
              chats: dedupeChats(updatedChatList),
            };
          } else {
            // unassigned cases handling
            const conversationMessages = state.messagesMemoized.filter(
              matchesConversationId(action.conversationId)
            );
            updatedProfile = {
              ...updatedProfile,
              conversationStatus: action.status,
              conversation: {
                list: conversationMessages,
                lastUpdated:
                  [...conversationMessages].reverse().shift()?.createdAt || "",
              },
            };
            if (state.company) {
              updatedProfile = {
                ...updatedProfile,
                conversationStatus: action.status,
                lastChannel: lastChannelName(
                  updatedProfile.customFields,
                  state.company
                ),
              };
            }
            const {
              checkChannelMatch,
              checkStatusMatch,
              checkTagMatch,
              checkUnreadMatch,
            } = getProfileMatchers(updatedProfile);
            const checkAllMatch =
              checkChannelMatch(
                state.selectedChannel,
                state.selectedInstanceId ?? ""
              ) &&
              checkStatusMatch(state.selectedStatus) &&
              checkTagMatch(state.inbox.filter.tagIds) &&
              checkUnreadMatch(state.inbox.filter.unreadStatus);
            if (!checkAllMatch) {
              return {
                ...state,
                assignees,
              };
            }
            if (
              state.selectedAssignee.toLowerCase() === "mentions" &&
              assigneeId === state.user.id
            ) {
              updatedChatList = sortByDisplayPriority(
                [...updatedChatList, updatedProfile],
                state.inbox.filter.orderBy
              );
              return {
                ...state,
                assignees,
                chats: dedupeChats(updatedChatList),
              };
            } else if (state.selectedAssignee.toLowerCase() === "unassigned") {
              if (action.selectedUser === undefined) {
                updatedChatList = sortByDisplayPriority(
                  [...updatedChatList, updatedProfile],
                  state.inbox.filter.orderBy
                );
              } else {
                updatedChatList = reject(
                  matchesConversationId(action.conversationId),
                  updatedChatList
                );
              }
              return {
                ...state,
                assignees,
                chats: dedupeChats(updatedChatList),
              };
            } else if (action.profile?.id === state.profile?.id) {
              return {
                ...state,
                assignees,
                profile: updatedProfile,
              };
            }
          }
        } else {
          // if conversation status is not match then check if conversation exist in current chats
          if (state.profile?.conversationId === action.conversationId) {
            return {
              ...state,
              assignees,
              profile: {
                ...state.profile,
                ...action.profile,
                conversationStatus:
                  action.status || state.profile?.conversationStatus,
              },
            };
          }
        }
      }
      return {
        ...state,
        assignees,
      };
    }
    case "INBOX.RESET_FILTER":
      return produce(state, (draft) => {
        draft.selectedChannel = "all";
        draft.selectedInstanceId = undefined;
        draft.inbox.filter.tagIds = [];
        draft.inbox.filter.unreadStatus = undefined;
        draft.inbox.filter.channel = undefined;
        if (action.resetStatus) {
          draft.selectedStatus = "open";
        }
      });
  }
  return state;
}

function updateAssigneeByName(
  action: Extract<Action, { type: "ASSIGNEE_UPDATED" }>,
  state: LoginType
): LoginType {
  let assignees = { ...state.assignees };
  const foundIndex = state.chats
    ? state.chats.findIndex(matchesConversationId(action.conversationId))
    : -1;
  const assigneeName = state.selectedAssignee;
  const selectedUser = action.profile.assignee ?? action.selectedUser;
  const conversationAssigneeId = Object.keys(assignees).find((assigneeId) =>
    assignees[assigneeId].conversations.find(
      matchesConversationId(action.conversationId)
    )
  );
  if (conversationAssigneeId) {
    const selectedNameConversation =
      assignees[conversationAssigneeId].conversations;
    const foundConversationIndex = selectedNameConversation.findIndex(
      matchesConversationId(action.conversationId)
    );
    const selectedUserId = selectedUser ? selectedUser.id : "Unassigned";

    assignees[selectedUserId] = {
      ...assignees[selectedUserId],
      conversations: dedupeChats([
        ...assignees[selectedUserId].conversations,
        selectedNameConversation[foundConversationIndex],
      ]),
    };
    if (foundConversationIndex > -1) {
      assignees[selectedUserId] = {
        ...assignees[selectedUserId],
        conversations: dedupeChats([
          ...assignees[selectedUserId].conversations,
          selectedNameConversation[foundConversationIndex],
        ]),
      };

      assignees[conversationAssigneeId] = {
        ...assignees[conversationAssigneeId],
        conversations: dedupeChats(
          remove(
            foundConversationIndex,
            1,
            assignees[conversationAssigneeId].conversations
          )
        ),
      };
    }
    assignees = {
      ...assignees,
      [conversationAssigneeId]: {
        ...assignees[conversationAssigneeId],
        conversations: dedupeChats(
          assignees[conversationAssigneeId].conversations
        ),
      },
    };
  }
  if (state.chats?.some(matchesConversationId(action.conversationId))) {
    // update conversation
    const selectedUserId = selectedUser ? selectedUser.id : "Unassigned";

    if (foundIndex > -1 && state.chats) {
      const chatsUpdated = produce(state.chats, (draft) => {
        if (draft[foundIndex] && action.selectedUser) {
          const newAssigneeId = action.selectedUser.id;
          draft[foundIndex].collaboratorIds = rearrangeCollaborators(
            draft[foundIndex],
            newAssigneeId
          );
          draft[foundIndex].assignee = action.selectedUser;
        }
      });

      const stateUpdated = {
        ...state,
        chats: chatsUpdated,
        assignees: {
          ...assignees,
          [selectedUserId]: { ...assignees[selectedUserId] },
        },
      };

      if (
        chatsUpdated[foundIndex].conversationId === state.profile.conversationId
      ) {
        return {
          ...stateUpdated,
          selectedUser,
          profile: {
            ...chatsUpdated[foundIndex],
            ...action.profile,
          },
        };
      } else {
        return stateUpdated;
      }
    }
    return {
      ...state,
      assignees: {
        ...assignees,
        [selectedUserId]: { ...assignees[selectedUserId] },
      },
    };
  } else {
    // insert conversation to the visible list
    const selectedUserId = selectedUser ? selectedUser.id : "Unassigned";
    if (
      assigneeName.toLowerCase() === "all" ||
      state.user.id === selectedUserId
    ) {
      if (state.chats?.some(matchesConversationId(action.conversationId))) {
        return {
          ...state,
          assignees: {
            ...assignees,
            [selectedUserId]: {
              ...assignees[selectedUserId],
              conversations: dedupeChats([
                ...(assignees[selectedUserId]?.conversations ?? []),
                action.profile,
              ]),
            },
          },
        };
      } else {
        if (
          state.chatSearched.conversations.some(
            matchesConversationId(action.profile.conversationId)
          ) ||
          action.profile.conversationStatus !== state.selectedStatus
        ) {
          return {
            ...state,
          };
        }
        const chats = sortByDisplayPriority(
          [...(state.chats ?? [])],
          state.inbox.filter.orderBy
        );
        const actionProfileUpdated =
          action?.profile.conversation?.lastUpdated ?? action.profile.createdAt;
        const lastConversationUpdated =
          last(chats)?.conversation?.lastUpdated ?? last(chats)?.createdAt;
        const isBeforeLastChatTime = moment
          .utc(actionProfileUpdated)
          .isSameOrBefore(moment.utc(lastConversationUpdated));
        return {
          ...state,
          chats: isBeforeLastChatTime
            ? sortByDisplayPriority([action.profile, ...chats])
            : chats,
          assignees: {
            ...assignees,
            [selectedUserId]: {
              ...assignees[selectedUserId],
              conversations: dedupeChats([
                ...(assignees[selectedUserId]?.conversations ?? []),
                action.profile,
              ]),
            },
          },
        };
      }
    }
  }
  if (action.profile.conversationId === state.profile.conversationId) {
    return { ...state, selectedUser, assignees, profile: action.profile };
  }
  return { ...state, assignees };
}

function updateUnassignedChats(
  action: Extract<Action, { type: "ASSIGNEE_UPDATED" }>,
  state: LoginType
): LoginType {
  if (!state.chats) {
    return state;
  }
  const presenceIdx = state.chats?.findIndex(
    matchesConversationId(action.conversationId)
  );
  if (presenceIdx !== -1 && action.selectedUser) {
    const deselectProfile =
      action.conversationId === state.profile.conversationId;
    return {
      ...state,
      profile: deselectProfile
        ? { ...initialUser.profile }
        : { ...state.profile },
      chats: remove(presenceIdx, 1, state.chats),
    };
  }
  if (presenceIdx === -1 && !action.selectedUser) {
    return { ...state, chats: [...state.chats, action.profile] };
  }
  return state;
}

function updateSelectedUser(action: Action, state: LoginType): LoginType {
  if (action.type !== "ASSIGNEE_UPDATED") {
    return state;
  }
  const foundIndex = state.chatSearched.conversations.findIndex(
    matchesConversationId(action.conversationId)
  );
  const selectedUser =
    action.conversationId === state.profile.conversationId
      ? action.selectedUser
      : state.selectedUser;
  if (foundIndex > -1) {
    return {
      ...state,
      chatSearched: {
        conversations: adjust(
          foundIndex,
          (chat) => ({
            ...chat,
            assignee: action.selectedUser,
          }),
          state.chatSearched.conversations
        ),
      },
      selectedUser,
    };
  } else {
    return {
      ...state,
      selectedUser,
    };
  }
}

function popFromMyConversations(
  action: Extract<Action, { type: "ASSIGNEE_UPDATED" }>,
  state: LoginType
): LoginType {
  let assignees = { ...state.assignees };
  const foundIndex = state.chats
    ? state.chats.findIndex(matchesConversationId(action.conversationId))
    : -1;
  const user = state.user;

  const updatedSelectedUserId = action.selectedUser?.id ?? "Unassigned";
  if (!(updatedSelectedUserId && state.chats)) {
    return state;
  }
  if (foundIndex === -1) {
    return state;
  }
  const newConversations = remove(foundIndex, 1, state.chats);
  const removedConversation = state.chats[foundIndex];

  assignees[user.id] = {
    ...assignees[user.id],
    userInfo: assignees[user.id].userInfo,
    conversations: dedupeChats(newConversations),
  };
  const nextSelectedIndex = Math.min(foundIndex, newConversations.length - 1);
  if (nextSelectedIndex > -1) {
    const updatedProfile = newConversations[nextSelectedIndex];

    return {
      ...state,
      profile: updatedProfile || defaultAssigee.conversations[0],
      assignees: evolve(
        {
          [user.id]: assoc("conversations", newConversations),
          [updatedSelectedUserId]: evolve({
            conversations: (c: ProfileType[]) =>
              dedupeChats([...c, removedConversation]),
          }),
        },
        assignees
      ) as AssigneesType,
      chats: dedupeChats(newConversations),
      selectedUser: state.staffList.find(matchesStaffId(user.id))?.userInfo,
    };
  } else {
    const targetAssignee = assignees[updatedSelectedUserId];
    if (!targetAssignee) {
      return {
        ...state,
        profile: defaultAssigee.conversations[0],
        assignees: {
          ...assignees,
          [user.id]: { ...assignees[user.id], conversations: [] },
        },
        chats: [],
      };
    }
    return {
      ...state,
      profile: defaultAssigee.conversations[0], // todo replace with an empty conversations factory
      assignees: {
        ...assignees,
        [user.id]: { ...assignees[user.id], conversations: [] },
        [updatedSelectedUserId]: {
          ...targetAssignee,
          conversations: dedupeChats([
            ...targetAssignee.conversations,
            state.chats[foundIndex],
          ]),
        },
      },
      chats: [],
    };
  }
}

function updateAllConversationsReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  const result = produce(state, (draft) => {
    switch (action.type) {
      case "ASSIGNEE_UPDATED":
        const updateChatsTeam = (chats: ProfileType[]) => {
          return chats.map(
            when(
              matchesConversationId(action.conversationId),
              pipe(
                assoc("assignedTeam", action.profile.assignedTeam),
                assoc("collaboratorIds", action.profile.collaboratorIds)
              )
            )
          );
        };
        if (draft.chats) {
          draft.chats = updateChatsTeam(draft.chats);
        }
        Object.values(draft.assignees).forEach((assignee) => {
          assignee.conversations = updateChatsTeam(
            dedupeChats(assignee.conversations ?? [[]])
          );
        });
        draft.profile.assignedTeam = action.profile.assignedTeam;
        break;
    }
  });
  return result;
}

function updateOnChatSelected(
  state: LoginType,
  action: ChatSelectedAction
): LoginType {
  // another chat is selected, or chats search results are revealed
  const profile = action.profile || state.profile;

  let selectedChat = [...(action.selectedChat || [])];
  let chats = state.chatSearched.conversations.length
    ? [...state.chatSearched.conversations]
    : [...state.chats];
  let messagesMemoized = mergeMessages(state.messagesMemoized, selectedChat);
  let updatedNumOfNewMessages = { ...state.numOfNewMessages };
  //fixme sometimes index could not be found
  let newProfile = { ...profile };
  if (state.profile.id === action.profile.id) {
    newProfile = { ...profile, customFields: state.profile.customFields };
  }
  const chatIndex = chats.findIndex(
    matchesConversationId(profile.conversationId)
  );
  const currentChatIndex = chats.findIndex(
    matchesConversationId(state.profile.conversationId)
  );
  if (currentChatIndex > -1 && state.typingMessage) {
    chats = update(
      currentChatIndex,
      {
        ...chats[currentChatIndex],
        typingMessage: state.typingMessage,
      },
      chats
    );
  }
  if (chatIndex > -1) {
    if (
      updatedNumOfNewMessages &&
      updatedNumOfNewMessages[profile.conversationId] > 0
    ) {
      updatedNumOfNewMessages = {
        ...updatedNumOfNewMessages,
        [profile.conversationId]: 0,
      };
    }
    newProfile = {
      ...chats[chatIndex],
      ...profile,
      unReadMsg: false,
      numOfNewMessage: 0,
    };
    if (newProfile.id === state.profile?.id) {
      newProfile = {
        ...profile,
        ...newProfile,
        customFields: state.profile.customFields,
      };
    }
    chats = produce(chats ?? [], (draftState) => {
      draftState.splice(chatIndex, 1, {
        ...draftState[chatIndex],
        ...newProfile,
      });
    });
  }
  const isSelectedChatExist = action.selectedChat?.some((chat) =>
    Boolean(chat.isSelected)
  );
  messagesMemoized = clearIsSelected(messagesMemoized);
  if (action.selectedChat && isSelectedChatExist) {
    // we got a search result
    messagesMemoized = mergeMessages(messagesMemoized, [
      ...action.selectedChat,
    ]);
  }
  const isPreselectedMessageActive =
    state.inbox.preselectedMessage.contextMessages.active;

  let selectedChannel: string | undefined;
  let selectedChannelId: string | undefined;
  if (action.selectedChannelFromConversation) {
    selectedChannel = action.selectedChannelFromConversation;
    selectedChannelId = action.selectedChannelIdFromConversation;
  } else {
    selectedChannel = lastChannelName(newProfile.customFields, state.company);
    selectedChannelId = getChannelInstanceId(selectedChannel, newProfile);
  }

  const messagesFilterUpdate: MessagesFilterType =
    state.inbox.messagesFilter.selectedFrom === "filter"
      ? { ...state.inbox.messagesFilter }
      : {
          channelName: null,
          channelId: null,
          selectedFrom: "reply",
        };

  return {
    ...state,
    inbox: {
      ...state.inbox,
      messagesFilter: messagesFilterUpdate,
      facebook: {
        ...state.inbox.facebook,
        messageType: defaultMessageTypeState(),
      },
    },
    ...(state.chatSearched.conversations.length
      ? {
          chatSearched: {
            conversations: dedupeChats(chats) as SearchMessageType[],
          },
        }
      : { chats: dedupeChats(chats) }),
    typingMessage: undefined,
    messagesMemoized,
    typeMessage: action.profile.conversation?.typeMessage || "",
    selectedUser: action.selectedUser,
    numOfNewMessages: updatedNumOfNewMessages,
    profile: newProfile,
    isScrollToEnd: !isSelectedChatExist && !isPreselectedMessageActive,
    selectedChannelFromConversation: selectedChannel,
    selectedChannelIdFromConversation: selectedChannelId,
    currentChatState: {
      ...state.currentChatState,
      hasMore: true,
      firstLoad: true,
    },
  };
}

export const chatReducer = reduceReducersWithDefaults(
  updateAllConversationsReducer,
  chatReducerBase,
  currentProfileReducer,
  chatUIReducer,
  messengerReducer,
  takeoverReducer,
  messageSearchReducer,
  preselectedMessagesReducer,
  productReducer,
  analyticsReducer,
  paymentHistoryReducer,
  chatSearchedReducer
);
