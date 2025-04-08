import React, { useContext, useEffect, useState } from "react";
import SecondarySidebar from "../../../Chat/SecondarySidebar/SecondarySidebar";
import MockChatMainContent from "./MockInbox/MockChatMainContent";
import MockChatSidebar from "./MockInbox/MockChatSidebar";
import styles from "./MockInbox.module.css";
import InboxDemoContext from "./inboxDemoContext";
import { MessageChannelType } from "types/MessageType";
import { StatusType } from "types/ChatsSummaryResponseType";
import { equals } from "ramda";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { useTeams } from "container/Settings/useTeams";
import { FieldValue } from "container/Chat";
import { useLoadMoreChats } from "api/Chat/useLoadMoreChats";
import postCompleteInboxDemo from "api/Onboarding/postCompleteInboxDemo";
import { START_LIMIT, NEXT_LIMIT } from "../../../Chat/ChatGroupList";
import { InboxDemoConversationType } from "./inboxDemoReducer";
import { ProfileType } from "types/LoginType";

const defaultFilter = {
  selectedChannel: "all",
  selectedInstanceId: undefined,
  selectedStatus: "open",
  selectedAssigneeId: "All",
  assigneeName: "All",
};

const defaultSummary = [
  {
    assigneeId: "All",
    status: "open" as StatusType,
    count: 0,
  },
  {
    assigneeId: "All",
    status: "pending" as StatusType,
    count: 0,
  },
  {
    assigneeId: "All",
    status: "closed" as StatusType,
    count: 0,
  },
];

const generateChatData = (
  chats: InboxDemoConversationType[],
  userName: string
): ProfileType[] => {
  return chats
    .filter((chat) => chat.status === "open")
    .map((chat) => ({
      ...chat.demoUserProfile,
      address: "",
      conversationHashtags: [],
      firstMessageId: 0,
      conversationId: chat.demoConversationId,
      conversationStatus: chat.status,
      customFields: [],
      details: [],
      displayName: "",
      displayProfilePicture: "",
      lastChannel: "",
      id: chat.demoConversationId,
      messageGroupName: "",
      numOfNewMessage: 0,
      pic: "",
      remarks: [],
      selectedChannel: "",
      unReadMsg: chat.demoUserProfile.firstName === "Jennifer",
      updatedTime: "",
      isBookmarked: false,
      isSandbox: false,
      isShopifyProfile: true,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      assignee: {
        displayName: chat.assignee !== "Unassigned" ? chat.assignee : userName,
        email: "",
        id: "",
        userName: chat.assignee !== "Unassigned" ? chat.assignee : userName,
        userRole: "",
        firstName: chat.assignee !== "Unassigned" ? chat.assignee : userName,
        lastName: chat.assignee !== "Unassigned" ? chat.assignee : userName,
        createdAt: "",
      },
      conversation: {
        list: chat.chatHistory
          .sort((prev, next) => prev.id - next.id)
          .map((t) => ({
            ...t,
            channel: t.channel as MessageChannelType,
            conversationId: String(t.id),
            messageUniqueID: String(t.id),
            messageTopic: "",
            receiver: {},
            messageType: "",
            messageContent: t.messageContent,
            translationResults: [],
            createdAt: t.updatedAt,
            sender: {},
            uploadedFiles: [],
            emailTo: "",
            from: "",
            to: "",
            status: "received",
            deliveryType: "Normal",
            channelName: "",
            isSentFromSleekflow: t.isFromUser,
            isSandbox: false,
            timestamp: 0,
            emailFrom: {
              id: "",
              email: "",
              name: "",
              locale: "",
            },
            isFromImport: false,
            webClientReceiver: null,
            webClientSender: null,
            facebookSender: null,
            facebookReceiver: null,
            whatsappReceiver: null,
            whatsappSender: null,
            weChatReceiver: null,
            weChatSender: null,
            messageAssignee: null,
            lineReceiver: null,
            lineSender: null,
            instagramReceiver: null,
            instagramSender: null,
            telegramSender: null,
            telegramReceiver: null,
            viberSender: null,
            viberReceiver: null,
            subject: null,
            whatsapp360DialogSender: null,
          })),
        lastUpdated: "",
      },
    }));
};

export default function MockInbox() {
  const { conversations } = useContext(InboxDemoContext);
  const staffList = useAppSelector((s) => s.staffList, equals);
  const userId = useAppSelector((s) => s.user.id);
  const profileConversationId = useAppSelector((s) => s.profile.conversationId);
  const profileId = useAppSelector((s) => s.profile.id);
  const { firstName, lastName } = useAppSelector((s) => s.user, equals);
  const loginDispatch = useAppDispatch();
  const { refreshTeams } = useTeams();
  const isStaffLoaded = staffList.length > 0;
  const [fieldValue, setFieldValue] = useState<FieldValue>({});

  useEffect(() => {
    async function handleCompleteDemo() {
      try {
        await postCompleteInboxDemo(userId);
      } catch (error) {
        console.error("postCompleteInboxDemo", error);
      }
    }
    refreshTeams();
    handleCompleteDemo();
  }, []);

  useEffect(() => {
    if (!isStaffLoaded) {
      return;
    }
    loginDispatch({
      type: "INBOX.FILTER_UPDATE",
      ...defaultFilter,
    });
  }, [isStaffLoaded, loginDispatch]);

  const { isLoadMoreBlocked, currentFilterStamp } = useLoadMoreChats({
    id: "",
    nextLimit: NEXT_LIMIT,
    startLimit: START_LIMIT,
    tags: [],
  });

  useEffect(() => {
    if (isLoadMoreBlocked) {
      return;
    }
    const demoChats = generateChatData(
      conversations,
      `${firstName} ${lastName}`
    );
    const summary = defaultSummary.map((item) => {
      const count = conversations.filter(
        (chat) => chat.status === item.status
      ).length;
      return { ...item, count };
    });
    loginDispatch({
      type: "INBOX.FILTER.UPDATE_SUMMARY",
      assigneeSummary: {
        conversationSummaries: summary,
        hashtagSummaries: [],
        unreadCount: 0,
      },
      assigneeAssignedNumber: {
        all: 0,
      },
    });

    loginDispatch({ type: "CHATS_RESET" });
    loginDispatch({
      type: "CHATS_UPDATED",
      chats: demoChats,
      selectedAssigneeId: "All",
    });

    if (profileId) {
      const newProfile = demoChats.find((chat) => chat.id === profileId);
      if (!newProfile) {
        return;
      }
      loginDispatch({ type: "PROFILE_UPDATED", profile: newProfile });
    }
  }, [
    conversations,
    loginDispatch,
    profileId,
    isLoadMoreBlocked,
    currentFilterStamp,
    firstName,
    lastName,
  ]);

  return (
    <div className={`post-login ${styles.postLogin}`}>
      <div className="main">
        <div className="chat">
          <MockChatSidebar />
          {profileConversationId && (
            <>
              <MockChatMainContent />
              <SecondarySidebar
                fieldValue={fieldValue}
                setFieldValue={setFieldValue}
                isDemo
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
