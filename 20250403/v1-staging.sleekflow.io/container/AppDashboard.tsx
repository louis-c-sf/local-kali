import React, { useEffect } from "react";
import { PostLogin } from "../component/Header";
import Chat from "./Chat";
import { get } from "api/apiRequest";
import { GET_USERPROFILE_DETAIL } from "api/apiPath";
import MessageType from "../types/MessageType";
import ConversationType, {
  ConversationNormalizedType,
  UserInfoType,
} from "../types/ConversationType";
import { ProfileType, ConversationTypingType } from "types/LoginType";
import Cookies from "js-cookie";
import CompanyType, { CustomUserProfileFieldsType } from "../types/CompanyType";
import { normalizeApiMessage } from "component/Chat/mutators/messageMutators";
import { useSignalRGroup } from "component/SignalR/useSignalRGroup";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import lastChannelName from "../component/Chat/utils/lastChannelName";
import { staffDisplayName } from "component/Chat/utils/staffDisplayName";
import { equals, last, pick } from "ramda";
import { useTranslation } from "react-i18next";
import { denormalizeConversationCollaborators } from "types/Chat/denormalizeConversationCollaborators";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { useParams } from "react-router";
import { retryFetchConversationDetail } from "api/Chat/retryFetchConversationDetail";
import { denormalizeConversation } from "types/Chat/denormalizeConversation";
import getProfileMatchers from "../utility/getProfileMatchers";
import { useWhatsappTemplates } from "./Settings/OfficialWhatsApp/useWhatsappTemplates";
import { useCompanyStaff } from "api/User/useCompanyStaff";
import { AssigneesType } from "types/state/inbox/AssigneeType";
import { StaffType } from "types/StaffType";
import { useSelectMessageByLink } from "component/Chat/hooks/Labels/useSelectMessageByLink";
import useGetCurrentChannel from "component/Chat/useGetCurrentChannel";
import { PaymentUpdateSignalRType } from "core/models/Ecommerce/Payment/PaymentUpdateSignalRType";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { useWhatsapp360Chat } from "features/Whatsapp360/usecases/Inbox/useWhatsapp360Chat";
import { useWhatsappTwilioChat } from "features/WhatsappTwilio/usecases/Inbox/useWhatsappTwilioChat";
import { useWhatsappCloudApiChat } from "features/WhatsappCloudAPI/usecases/Inbox/useWhatsappCloudApiChat";
import { RefundDialogContext } from "../features/Stripe/usecases/Refund/contracts/RefundDialogContext";
import { ReadonlyDeep } from "Object/Readonly";
import { htmlEscape } from "../lib/utility/htmlEscape";

const fetchConversationDetail = async (conversationId: string) => {
  const conversationDetail: ConversationType | undefined =
    await retryFetchConversationDetail(conversationId);
  if (conversationDetail) {
    const updatedProfile = denormalizeConversation(conversationDetail);
    return updatedProfile;
  }
  return undefined;
};

const AppDashboard = () => {
  const { conversationId, assigneeId } = useParams<{
    conversationId: string;
    assigneeId?: string;
  }>();

  const { selectedMessageState = {} } = useSelectMessageByLink();
  const preselectedMessage = selectedMessageState?.selectMessage?.message;

  const flash = useFlashMessageChannel();
  const { user, profile, selectedChannel, selectedStatus, selectedInstanceId } =
    useAppSelector(
      pick([
        "user",
        "profile",
        "selectedChannel",
        "selectedStatus",
        "selectedInstanceId",
      ]),
      equals
    );
  const messagesFilter = useAppSelector((s) => s.inbox.messagesFilter, equals);
  const { currentChannel } = useGetCurrentChannel(messagesFilter);
  const selectedAssigneeId = useAppSelector((s) => s.selectedAssigneeId);
  const loginDispatch = useAppDispatch();

  const { t } = useTranslation();

  useEffect(() => {
    if (assigneeId && !selectedAssigneeId) {
      loginDispatch({
        type: "ASSIGNEE_ID_SELECTED",
        selectedAssigneeId: assigneeId,
      });
    }
  }, [assigneeId, selectedAssigneeId]);

  if (conversationId) {
    Cookies.set("conversationId", conversationId);
  }
  const { staffList, booted } = useCompanyStaff();

  useEffect(() => {
    async function loadInitStaff() {
      //TODO: staff list
      try {
        const initStaffList = staffList;
        //todo move to reducer
        let assignees: AssigneesType = {};
        for (let i = 0; i < initStaffList.length; i++) {
          const staff = initStaffList[i];
          assignees[staff.userInfo.id] = {
            assigneeName: staffDisplayName(staff),
            assigneeId: staff.userInfo.id,
            totalAssigned: 0,
            conversations: [],
            userInfo: staff.userInfo,
          };
        }
        assignees = {
          ...assignees,
          Unassigned: {
            assigneeName: "Unassigned",
            assigneeId: "",
            totalAssigned: 0,
            conversations: [],
          },
          Mentions: {
            assigneeName: "Mentions",
            assigneeId: "",
            totalAssigned: 0,
            conversations: [],
          },
        };
        loginDispatch({ type: "ASSIGNEES_CREATED", assignees, user });
      } catch (e) {
        console.error(e);
      }
    }

    if (booted) {
      loadInitStaff();
    }
  }, [booted, staffList.map((s) => s.staffId).join()]);

  useEffect(() => {
    async function initializeConversation() {
      const updatedProfile = await fetchConversationDetail(conversationId);

      if (updatedProfile) {
        const { checkChannelMatch } = getProfileMatchers(updatedProfile);
        if (checkChannelMatch(selectedChannel, selectedInstanceId ?? "")) {
          loginDispatch({
            type: "CREATE_PROFILE",
            profile: updatedProfile,
          });
          if (preselectedMessage) {
            loginDispatch({
              type: "INBOX.MESSAGE.PRESELECTED_MESSAGE_CLICK",
              message: preselectedMessage,
            });
          }
          loginDispatch({
            type: "UPDATE_SELECTED_USER",
            selectedUser: updatedProfile?.assignee,
            user,
          });
        }
      }
    }

    if (conversationId) {
      initializeConversation();
    }
  }, [
    assigneeId,
    conversationId,
    selectedChannel,
    selectedStatus,
    selectedInstanceId,
  ]);

  function isNeedToNotify(
    conversation: ConversationNormalizedType,
    profile: ReadonlyDeep<ProfileType>
  ) {
    if (conversation.userProfile.id !== profile.id) {
      return false;
    }
    return true;
  }

  async function handleAssigneeChanged(
    conversation: ConversationType,
    selectedUser: UserInfoType | undefined,
    company: ReadonlyDeep<CompanyType>
  ) {
    try {
      let profile = conversation.userProfile;
      profile.conversation = {
        list: [],
        lastUpdated: conversation.updatedTime,
      };
      get(GET_USERPROFILE_DETAIL.replace("{id}", conversation.userProfile.id), {
        param: {},
      }).then((fullProfile: ProfileType) => {
        let profile: ProfileType = {
          ...fullProfile,
          lastChannel: lastChannelName(fullProfile?.customFields, company),
          assignee: conversation.assignee?.userInfo,
          updatedTime: conversation.updatedTime,
          conversationHashtags: fullProfile?.conversationHashtags ?? [],
          conversationStatus: conversation.status,
          messageGroupName: conversation.messageGroupName,
          conversationId: conversation.conversationId,
          collaboratorIds: denormalizeConversationCollaborators(conversation),
        };
        let lastMessage: MessageType | undefined;
        if (conversation.lastMessage && conversation.lastMessage.length > 0) {
          lastMessage = conversation.lastMessage[0];
          const convertedMessage = normalizeApiMessage(lastMessage, profile);
          profile = {
            ...profile,
            conversation: {
              list: [convertedMessage],
              lastUpdated: convertedMessage.createdAt,
            },
          };
        }
        loginDispatch({
          type: "ASSIGNEE_UPDATED",
          selectedUser: selectedUser,
          conversationId: conversation.conversationId,
          profile,
        });
      });
    } catch (err) {
      console.error(`handleAssigneeChanged error${err}`);
    }
  }

  function updateSummaries() {
    loginDispatch({ type: "INBOX.API.LOAD_SUMMARY" });
  }

  const whatsapp360Chat = useWhatsapp360Chat(profile);
  const twilioChat = useWhatsappTwilioChat(profile);
  const cloudApi = useWhatsappCloudApiChat(profile);

  const { fetchWhatsappTemplates, fetch360Templates, fetchCloudApiTemplates } =
    useWhatsappTemplates();

  useEffect(() => {
    if (!twilioChat.accountSid || !isAnyWhatsappChannel(currentChannel ?? "")) {
      return;
    }
    fetchWhatsappTemplates({ accountSID: twilioChat.accountSid })
      .then((templates) =>
        loginDispatch({
          type: "INBOX.WHATSAPP_TEMPLATES.LOADED",
          templates,
        })
      )
      .catch((err) => console.error(err));
  }, [twilioChat.accountSid, currentChannel]);

  useEffect(() => {
    if (!whatsapp360Chat.configId || currentChannel !== "whatsapp360dialog") {
      return;
    }
    fetch360Templates(whatsapp360Chat.configId).then((templates) => {
      loginDispatch({
        type: "INBOX.WHATSAPP_360TEMPLATE.LOADED",
        templates: templates,
      });
    });
  }, [whatsapp360Chat.configId, currentChannel]);

  useEffect(() => {
    const wabaId = cloudApi.wabaId;
    const configId = cloudApi.configId;
    if (!(wabaId && configId)) {
      return;
    }
    fetchCloudApiTemplates(wabaId, true)
      .then((result) => {
        loginDispatch({
          type: "INBOX.WHATSAPP_CLOUDAPI.LOADED",
          channelId: configId,
          templates: result,
        });
      })
      .catch(console.error);
  }, [cloudApi.wabaId, cloudApi.configId]);

  useSignalRGroup(
    user?.signalRGroupName,
    {
      OnMessageStatusChanged: [
        async (state, message: MessageType) => {
          loginDispatch({
            type: "UPDATE_MESSAGE_STATUS",
            receivedMessage: normalizeApiMessage(message),
            messageStatus: message.status,
            messageCheckSum: message.messageChecksum ?? "",
            messageUniqueID: message.messageUniqueID,
            conversationId: message.conversationId,
          });
        },
      ],
      OnConversationAssigneeDeleted: [
        updateSummaries,
        async (state, message: ConversationType) => {
          if (message.assignee) {
            return;
          } else if (state.company) {
            handleAssigneeChanged(message, undefined, state.company);
          }
        },
      ],
      OnConversationAssigneeChanged: [
        updateSummaries,
        async (state, message: ConversationType) => {
          if (state.company) {
            handleAssigneeChanged(
              message,
              message?.assignee?.userInfo,
              state.company
            );
          }
        },
      ],
      OnConversationAdditionalAssigneeAdded: [
        updateSummaries,
        async (
          state,
          message: {
            staff: StaffType;
            conversationId: string;
            conversation: ConversationType;
          }
        ) => {
          if (state.company) {
            await handleAssigneeChanged(
              message.conversation,
              message.conversation.assignee?.userInfo,
              state.company
            );
          }
          if (isNeedToNotify(message.conversation, state.profile)) {
            flash(
              t("flash.chat.collaborator.added", {
                name: htmlEscape(staffDisplayName(message.staff)),
              })
            );
          }
        },
      ],
      OnConversationAdditionalAssigneeDeleted: [
        updateSummaries,

        async (
          state,
          message: {
            staff: StaffType;
            conversation: ConversationType;
            conversationId: string;
          }
        ) => {
          if (state.company) {
            await handleAssigneeChanged(
              message.conversation,
              message.conversation.assignee?.userInfo,
              state.company
            );
          }
          if (isNeedToNotify(message.conversation, state.profile)) {
            flash(
              t("flash.chat.collaborator.removed", {
                name: htmlEscape(staffDisplayName(message.staff)),
              })
            );
          }
        },
      ],

      OnUserProfileFieldFormatChanged: [
        (
          state,
          customUserProfileFields: Array<CustomUserProfileFieldsType>
        ) => {
          const sortedCustomUserProfileFields = customUserProfileFields.sort(
            (a, b) => {
              return a.order - b.order;
            }
          );
          loginDispatch({
            type: "UPDATE_COMPANY_CUSTOM_USER_PROFILE_FIELD",
            user,
            customUserProfileFields: sortedCustomUserProfileFields,
          });
        },
      ],

      // status change
      OnConversationStatusChanged: [
        updateSummaries,
        async (state, message: ConversationType) => {
          // execute when assignee change
          // execute once when conversation status change
          try {
            let profile = {
              ...message.userProfile,
            };
            if (message.userProfile) {
              if (
                state.company &&
                state.profile.conversationId ===
                  message.userProfile?.conversationId
              ) {
                const updatedLastChannel = lastChannelName(
                  message.userProfile.customFields,
                  state.company
                );
                if (
                  state.profile.lastChannel !== updatedLastChannel ||
                  state.profile.whatsAppAccount?.instanceId !==
                    message.userProfile.whatsAppAccount?.instanceId
                ) {
                  flash(t("flash.profile.channel.updated"));
                }
                profile = {
                  ...message.userProfile,
                };
                if (updatedLastChannel) {
                  profile.lastChannel = updatedLastChannel;
                }
              }
              loginDispatch({
                type: "STATUS_UPDATED",
                conversationId: message.conversationId,
                status: message.status,
                profile: {
                  ...profile,
                  conversationHashtags: message.conversationHashtags,
                  conversationStatus: message.status,
                  numOfNewMessage: message?.unreadMessageCount,
                  unReadMsg: message.unreadMessageCount > 0,
                  isBookmarked: message.isBookmarked,
                  createdAt: message?.updatedTime,
                  collaboratorIds:
                    denormalizeConversationCollaborators(message),
                },
                selectedUser: message?.assignee
                  ? message.assignee.userInfo
                  : undefined,
                isBookmarked: message.isBookmarked,
              });
            } else {
              if (message.assignee) {
                loginDispatch({
                  type: "STATUS_UPDATED",
                  selectedAssigneeId: message.assignee?.userInfo.id,
                  conversationId: message.conversationId,
                  status: message.status,
                  isBookmarked: message.isBookmarked,
                });
              } else {
                profile = {
                  ...profile,
                  lastChannel: last(message.conversationChannels) || "",
                  updatedTime: message.updatedTime,
                  conversationHashtags: message.conversationHashtags,
                  conversationStatus: message.status,
                  messageGroupName: message.messageGroupName,
                  conversationId: message.conversationId,
                  collaboratorIds:
                    denormalizeConversationCollaborators(message),
                };
                loginDispatch({
                  type: "STATUS_UPDATED",
                  conversationId: message.conversationId,
                  status: message.status,
                  selectedUser: profile.assignee ? profile.assignee : undefined,
                  profile,
                  isBookmarked: message.isBookmarked,
                });
              }
            }
          } catch (e) {
            console.error(`GET_CONVERSATIONS_DETAIL ${e}`);
          }
        },
      ],
      OnUserProfileDeleted: [
        (state, conversation: ProfileType) => {
          loginDispatch({
            type: "CHAT_REMOVED",
            conversationId: conversation.conversationId,
            user,
          });
        },
      ],
      OnConversationDeleted: [
        updateSummaries,
        (state, message: MessageType) => {
          try {
            loginDispatch({
              type: "CHAT_REMOVED",
              conversationId: message.conversationId,
              user,
            });
          } catch (e) {
            console.error("e", e);
          }
        },
      ],
      OnStripePaymentStatusUpdated: [
        (state, message: PaymentUpdateSignalRType) => {
          loginDispatch({
            type: "INBOX.PAYMENT_HISTORY.UPDATED",
            status: message.status,
            paymentIntentId: message.stripePaymentIntentId,
            paidAt: message.paidAt,
            payAmount: message.payAmount,
          });
        },
      ],
      OnConversationTyping: [
        (state, response: ConversationTypingType) => {
          if (state.profile.conversationId === response.conversationId) {
            loginDispatch({
              type: "TYPING_CONVERSATION",
              conversationTypingResponse: response,
            });
          }
        },
      ],
    },
    "AppDashboard"
  );

  return (
    <div className={`post-login`}>
      <PostLogin selectedItem={"Inbox"}>
        <div className={`main`}>
          <RefundDialogContext>
            <Chat />
          </RefundDialogContext>
        </div>
      </PostLogin>
    </div>
  );
};
AppDashboard.displayName = "AppDashboard";

export default AppDashboard;
