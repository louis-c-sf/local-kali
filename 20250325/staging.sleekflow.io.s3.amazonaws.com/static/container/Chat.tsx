import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import NewContact from "../component/Contact/NewContact/NewContact";
import { useHistory, useLocation } from "react-router-dom";
import { Icon, Portal } from "semantic-ui-react";
import "../style/css/chat.css";
import Helmet from "react-helmet";
import ChatSidebar from "../component/Chat/ChatSidebar";
import SandboxQrCodeModal from "../component/Chat/SandboxQrCodeModal";
import ContactExceedPortal from "../component/Chat/ContactExceedPortal";
import { Trans, useTranslation } from "react-i18next";
import { useStatusSelectionChoices } from "../component/Chat/localizable/useStatusSelectionChoices";
import { useAssigneeFieldNameMapping } from "../component/Chat/localizable/useAssigneeFieldNameMapping";
import { isFreemiumPlan } from "../types/PlanSelectionType";
import { fetchCompanyQuickReplies } from "../api/Company/fetchCompanyQuickReplies";
import { useTeams } from "./Settings/useTeams";
import { ChatMainContent } from "./ChatMainContent";
import { useAppDispatch, useAppSelector } from "../AppRootContext";
import { useParams } from "react-router";
import { equals } from "ramda";
import useCompanyChannels from "../component/Chat/hooks/useCompanyChannels";
import useRouteConfig from "../config/useRouteConfig";
import { useChatReconnectionBehavior } from "../component/Chat/hooks/useChatReconnectionBehavior";
import SecondarySidebar from "../component/Chat/SecondarySidebar/SecondarySidebar";
import { StaffType } from "../types/StaffType";
import { InboxOrderDic, InboxOrderDictEnum } from "types/state/InboxStateType";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";

export interface FieldValue {
  [key: string]: string;
}

const Chat = () => {
  const { assigneeId, conversationId: conversationIdParam } = useParams<{
    assigneeId?: string;
    conversationId?: string;
  }>();

  const isNewContactVisible = useAppSelector(
    (s) => s.inbox.editContactForm.visible
  );
  const defaultInboxOrder = useAppSelector(
    (s) => s.company?.defaultInboxOrder ?? InboxOrderDic.oldest,
    equals
  );
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const staffList = useAppSelector((s) => s.staffList, equals);
  const userId = useAppSelector((s) => s.user?.id);
  const isEditContact = useAppSelector((s) => s.isEditContact);
  const selectedAssignee = useAppSelector((s) => s.selectedAssignee);
  const profileConversationId = useAppSelector((s) => s.profile.conversationId);
  const loginDispatch = useAppDispatch();
  const history = useHistory();
  // active conversation ID
  const [id, setId] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search.substring(1));
  const [queryInitialized, setQueryInitialized] = useState(false);
  const [querySelectedInstanceId, setQuerySelectedInstanceId] =
    useState<string>();
  const [querySelectedOrderBy, setQuerySelectedOrderBy] = useState<
    InboxOrderDictEnum | undefined
  >();
  const [querySelectedChannel, setQuerySelectedChannel] = useState<string>();
  const [querySelectedStatus, setQuerySelectedStatus] = useState<string>();
  const [fieldValue, setFieldValue] = useState<FieldValue>({});
  const { menuTitle } = useAssigneeFieldNameMapping();
  const { t, i18n } = useTranslation();
  const statusSelection = useStatusSelectionChoices();
  const { refreshTeams } = useTeams();
  const [isSandbox, setIsSandbox] = useState(false);
  const [isShowBanner, setIsShowBanner] = useState(false);
  const channels = useCompanyChannels();
  const [disconnectedChatapi, setDisconnectedChatapi] = useState<string[]>([]);
  const companyId = useAppSelector((s) => s.company?.id || "");
  const { routeTo } = useRouteConfig();
  const workspaceLocation = useAppSelector((s) => s.userWorkspaceLocation);
  const featureGuard = useFeaturesGuard();
  useEffect(() => {
    const instanceToReconnect: string[] = [];
    const disconnectState = ["queueIsFull".toLowerCase(), "invalid", "loading"];
    if (channels.length > 0) {
      const chatapi = channels.find((c) => c.type == "whatsapp");
      chatapi?.configs?.forEach((instance) => {
        if (disconnectState.includes(instance.status.toLowerCase())) {
          instanceToReconnect.push(instance.wsChatAPIInstance);
        }
      });
    }
    setDisconnectedChatapi(instanceToReconnect);
    if (instanceToReconnect.length > 0) {
      setIsShowBanner(true);
    }
  }, [channels.some((c) => c.type === "whatsapp")]);

  useEffect(() => {
    setQuerySelectedStatus(params.get("selectedStatus") ?? undefined);
    setQuerySelectedChannel(params.get("selectedChannel") ?? undefined);
    setQuerySelectedInstanceId(params.get("selectedInstanceId") ?? undefined);
    setQuerySelectedOrderBy(
      (params.get("selectedOrderBy") as InboxOrderDictEnum) ?? undefined
    );
    setQueryInitialized(true);
  }, []);

  const isStaffLoaded = staffList.length > 0;
  const isAllowedToUseSandbox = featureGuard.isRegionAllowedToUseSandbox(
    workspaceLocation ?? ""
  );
  useEffect(() => {
    if (
      !(assigneeId && queryInitialized && isStaffLoaded && defaultInboxOrder)
    ) {
      return;
    }
    // init filters state on chat init
    const nameList = ["mentions", "unassigned", "teamunassigned", "all"];
    const updatedParamValues = {
      selectedChannel: querySelectedChannel ?? "all",
      selectedInstanceId: querySelectedInstanceId,
      selectedStatus:
        statusSelection.find((status) => status.name === querySelectedStatus)
          ?.name ?? statusSelection[0].name,
      selectedOrderBy: querySelectedOrderBy ?? defaultInboxOrder,
    };

    if (nameList.includes(assigneeId.toLowerCase())) {
      loginDispatch({
        type: "INBOX.FILTER_UPDATE",
        ...updatedParamValues,
        assigneeName:
          assigneeId.charAt(0).toUpperCase() + assigneeId.substring(1),
        selectedAssigneeId: assigneeId,
      });
    } else if (assigneeId === userId) {
      loginDispatch({
        type: "INBOX.FILTER_UPDATE",
        ...updatedParamValues,
        assigneeName: "you",
        selectedAssigneeId: userId,
      });
    } else {
      const selectedStaff = staffList.find(
        (staff) => staff.userInfo.id === assigneeId
      );
      if (selectedStaff) {
        loginDispatch({
          type: "INBOX.FILTER_UPDATE",
          ...updatedParamValues,
          selectedAssigneeId: selectedStaff.userInfo.id,
          assigneeName:
            selectedStaff.userInfo.displayName || selectedStaff.userInfo.email,
        });
      }
    }
  }, [
    assigneeId,
    queryInitialized,
    querySelectedChannel,
    querySelectedInstanceId,
    querySelectedOrderBy,
    statusSelection.map((s) => s.name).join(),
    userId,
    isStaffLoaded,
    defaultInboxOrder,
    staffList.map((s) => s.staffId).join(),
  ]);

  useEffect(() => {
    if (
      isFreemiumPlan(currentPlan) &&
      Cookies.get("isDisplayedInboxGuide") === undefined
    ) {
      loginDispatch({
        type: "SHOW_INBOX_GUIDE",
      });
    }
  }, [currentPlan.id, Cookies.get("isDisplayedInboxGuide") === undefined]);

  useEffect(() => {
    if (
      conversationIdParam &&
      profileConversationId &&
      profileConversationId !== conversationIdParam
    ) {
      Cookies.remove("conversationId");
      setId(profileConversationId);
    } else {
      setId(conversationIdParam || "");
    }
  }, [conversationIdParam, profileConversationId]);

  useEffect(() => {
    fetchCompanyQuickReplies(i18n.language)
      .then((data) => {
        loginDispatch({ type: "QUICK_REPLY_UPDATE_TEMPLATES", items: data });
      })
      .catch((error) => {
        console.error("fetchCompanyQuickReplies", error);
      });
    refreshTeams();
  }, []);

  useChatReconnectionBehavior();

  const updateFieldContact = () => {
    loginDispatch({
      type: "EDIT_CONTACT",
      isEditContact: !isEditContact || false,
    });
  };
  return (
    <div
      className={`chat ${isSandbox ? "chat-sandbox" : ""} ${
        isNewContactVisible ? "blur" : ""
      }`}
    >
      <Helmet
        title={t("nav.chat.title", { name: menuTitle(selectedAssignee) })}
      />
      <ChatSidebar visibleSidebar={isNewContactVisible} id={id} />
      {profileConversationId && (
        <>
          <ChatMainContent />
          <SecondarySidebar
            fieldValue={fieldValue}
            setFieldValue={setFieldValue}
          />
        </>
      )}
      {isAllowedToUseSandbox && (
        <SandboxQrCodeModal setIsSandbox={setIsSandbox} />
      )}
      <ProfileEdit
        profileFields={fieldValue}
        contactCreate={updateFieldContact}
        visible={isNewContactVisible}
        staffList={staffList}
      />
      <ContactExceedPortal />
      <Portal open={isShowBanner} mountNode={document.body}>
        <div className={`top-display-banner alert-message troubleshoot`}>
          <div className="content">
            <Trans i18nKey="channels.troubleshootChatapi.reconnectChatapi">
              Your third party WhatsApp instance is disconnected.
            </Trans>
            <div
              className="ui button"
              onClick={() => {
                if (disconnectedChatapi.length > 0) {
                  setIsShowBanner(false);
                  history.push(routeTo("/troubleshoot-chatapi"), {
                    disconnectedChatapi,
                  });
                }
              }}
            >
              {t("channels.action.troubleshoot")}
            </div>
          </div>
          <span className={"close-button"}>
            <Icon name={"close"} onClick={() => setIsShowBanner(false)} />
          </span>
        </div>
      </Portal>
    </div>
  );
};

function ProfileEdit(props: {
  visible: boolean;
  contactCreate: () => void;
  staffList: StaffType[];
  profileFields?: FieldValue;
}) {
  let { contactCreate, profileFields, staffList, visible } = props;
  const profile = useAppSelector((s) => s.profile, equals);
  const fieldFocusedName = useAppSelector(
    (s) => s.inbox.editContactForm.focusField
  );
  const loginDispatch = useAppDispatch();

  return (
    <NewContact
      profileFields={profileFields}
      contactCreate={contactCreate}
      visible={visible}
      hideForm={() => {
        loginDispatch({ type: "INBOX.CONTACT_FORM.HIDE" });
      }}
      staffList={staffList}
      profile={profile}
      fieldFocusedName={fieldFocusedName}
    />
  );
}

Chat.displayName = "Chat";
export default Chat;
