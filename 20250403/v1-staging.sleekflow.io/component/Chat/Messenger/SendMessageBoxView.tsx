import { Dimmer, Icon, Loader } from "semantic-ui-react";
import SendMessageTextArea from "./SendMessageTextArea";
import AttachedFiles from "../AttachedFiles";
import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDropzone } from "react-dropzone";
import { useFeaturesGuard } from "../../Settings/hooks/useFeaturesGuard";
import { useTranslation } from "react-i18next";
import { TypeStatusEnum } from "../../../types/LoginType";
import { QuickReplyType } from "../../../types/QuickReplies/QuickReplyType";
import moment from "moment";
import MessageType from "../../../types/MessageType";
import { MessageQuoteSelected } from "./MessageQuoteSelected";
import { PickedMessageActions } from "./PickedMessageActions";
import { SlideShort } from "../../shared/grid/transition/SlideShort";
import { SCROLL_STRIP_ID } from "../ChatRecords";
import { UploadedQuickReplyFileType } from "../../../types/UploadedFileType";
import { fetchCompanyQuickRepliesText } from "../../../api/Company/fetchCompanyQuickRepliesText";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import useRouteConfig from "../../../config/useRouteConfig";
import styles from "./SendMessageBox.module.css";
import toolsStyles from "./SendMessageTools.module.css";
import inputStyles from "../../shared/input/Input.module.css";
import { StaffType } from "../../../types/StaffType";
import { SendMessageTools } from "./SendMessageTools";
import { SendOverlay } from "./SelectWhatsappTemplate/SendOverlay";
import { MessengerMenu } from "./MessengerMenu";
import { DisabledToSendMessage } from "./DisabledToSendMessage";
import { EditTemplateInline } from "./SelectWhatsappTemplate/EditTemplateInline";
import { equals } from "ramda";
import { useSelectWhatsappTemplateFlow } from "./SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { useScheduleMessageFlow } from "./Schedule/useScheduleMessageFlow";
import { ScheduleInput } from "./Schedule/ScheduleInput";
import ChatChannelDropdown from "../ChatChannelDropdown";
import { SelectMode } from "./SelectWhatsappTemplate/SelectMode/SelectMode";
import EditInteractiveMessageButton from "../InteractiveMessage/EditInteractiveMessageButton";
import InteractiveMessageBoxView from "../InteractiveMessage/InteractiveMessageBoxView";
import { useChatGuard } from "../hooks/Labels/useChatGuard";
import MessageTypeSendOverlay from "../../../features/Facebook/usecases/Inbox/components/MessageType/SendOverlay";
import MessageTypeModal from "../../../features/Facebook/usecases/Inbox/components/MessageType/MessageTypeModal";
import { WhatsappChannelType } from "component/Chat/Messenger/types";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { DropdownSelectionOptionType } from "../ChannelFilterDropdown";
import { isCloudApiBalanceNegativeSelector } from "component/Chat/Messenger/Warning/BalanceNegativeBox";
import { useSendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import { getTemplateResponseKey } from "lib/utility/getTemplateResponseKey";
import { matchesStaffId } from "types/TeamType";
import { staffDisplayName } from "../utils/staffDisplayName";
import MessageTyping from "./MessageTyping";

export function SendMessageBoxView(props: {
  channel: string;
  deleteFile: (deleteFile: File) => void;
  deleteQuickAttachment: (file: UploadedQuickReplyFileType) => void;
  handleAttachDropped: (files: File[]) => void;
  messageAssigneeCandidates: StaffType[];
  messageMode: TypeStatusEnum;
  onAssigneeChanged: (assignee: StaffType | undefined) => void;
  onAttach: (event: ChangeEvent<HTMLInputElement>) => void;
  onAudioRecord: () => void;
  onAudioRecorded: (
    data: Blob,
    mimeType: string,
    duration: moment.Duration
  ) => void;
  onChangeMode: (mode: TypeStatusEnum) => void;
  onQuickReplyAttach: (
    files: UploadedQuickReplyFileType[],
    templateId: number
  ) => void;
  onSubmit: () => void;
  onStartSchedule: () => void;
  replyMessage?: MessageType;
  onQuoteHidden: () => void;
  onQuoteReset: () => void;
  onPickedMessagesReset: () => void;
  onPickingMessagesHidden: () => void;
  isDemo?: boolean;
  latestCustomerMessage: MessageType | undefined;
}) {
  const {
    onChangeMode,
    messageMode,
    replyMessage,
    onQuoteReset,
    onPickedMessagesReset,
    handleAttachDropped,
    deleteFile,
    deleteQuickAttachment,
    onQuickReplyAttach,
    onAttach,
    messageAssigneeCandidates,
    onAssigneeChanged,
    onPickingMessagesHidden,
    onQuoteHidden,
    onAudioRecord,
    onAudioRecorded,
    channel,
    onSubmit,
    onStartSchedule,
    isDemo = false,
    latestCustomerMessage,
  } = props;
  const [selectedChannelItem, setSelectedChannelItem] =
    useState<DropdownSelectionOptionType>();
  const featureGuard = useFeaturesGuard();
  const { t, i18n } = useTranslation();
  const { routeTo } = useRouteConfig();
  const loginDispatch = useAppDispatch();
  const chatGuard = useChatGuard();

  const state = useAppSelector((s) => s.inbox.messenger, equals);
  const profileId = useAppSelector((s) => s.profile.conversationId);
  const profile = useAppSelector((s) => s.profile, equals);

  const facebookReceiverId = useAppSelector(
    (s) => s.profile.facebookAccount?.id
  );
  const whatsAppAccount = useAppSelector(
    (s) => s.profile.whatsAppAccount,
    equals
  );
  const pickingMessagesCount = useAppSelector(
    (s) => s.inbox.pickingMessages.pickedIds.length
  );
  const anyPickedMessage = useAppSelector(
    (s) =>
      s.messagesMemoized.find((m) =>
        s.inbox.pickingMessages.pickedIds.includes(m.id)
      ),
    equals
  );
  const isPickingMessagesActive = useAppSelector(
    (s) => s.inbox.pickingMessages.active
  );

  const quote = useAppSelector((s) => s.inbox.quote, equals);
  const whatsappTemplate = useSelectWhatsappTemplateFlow(profileId);
  const sendMessage = useSendMessageContext();
  const companyId = useAppSelector((s) => s.company?.id || "");
  const uploadZone = useDropzone({
    onDrop: handleAttachDropped,
    disabled:
      whatsappTemplate.editTemplateActive || whatsappTemplate.sendOverlayActive,
    noClick: true,
    multiple: true,
  });

  const isChannelAllowedToSendVoice =
    isAnyWhatsappChannel(channel) || channel.toLowerCase() === "facebook";

  const isChannelCanSendInteractiveMessage =
    chatGuard.canSendInteractiveMessage(channel);

  const { scheduleMode } = useScheduleMessageFlow();

  const hasContent =
    (sendMessage.messageDraft?.text?.trim() ?? "") !== "" ||
    state.attachedFiles.length > 0 ||
    whatsappTemplate.hasActiveContent;
  const isNoteMode = messageMode === "note";
  const isDisplayTwilioDefaultMessage = useAppSelector(
    (s) => s.isDisplayTwilioDefaultoMessage
  );
  const sendDisabled =
    !hasContent ||
    scheduleMode === "schedule" ||
    whatsappTemplate.submitBlocked ||
    (selectedChannelItem === undefined && !isNoteMode) ||
    (channel === "wechat" && isDisplayTwilioDefaultMessage);

  const disableAll = isPickingMessagesActive;

  const isQuoteChat = replyMessage && replyMessage.conversationId === profileId;
  const isPickedChat = anyPickedMessage?.conversationId === profileId;

  const strip = document.getElementById(SCROLL_STRIP_ID);
  const initStripScroll = useRef<number>(0);

  const [quickReplyTemplates, setQuickReplyTemplates] = useState<
    QuickReplyType[]
  >([]);

  const [sendButtonNode, setSendButtonNode] = useState<HTMLElement | null>(
    null
  );

  const isCloudApiBalanceNegative = useAppSelector(
    isCloudApiBalanceNegativeSelector,
    equals
  );

  useEffect(() => {
    let unmounted = false;
    if (!isDemo) {
      fetchCompanyQuickRepliesText(i18n.language, profileId)
        .then((data) => {
          if (!unmounted) {
            setQuickReplyTemplates(data);
          }
        })
        .catch((e) => {
          console.error("fetchCompanyQuickRepliesText", e);
        });
    }
    return () => {
      unmounted = true;
    };
  }, [profileId, isDemo]);

  function rememberScrollStart() {
    strip && (initStripScroll.current = strip.scrollTop);
  }

  function syncScrollWithAnimation(
    element: HTMLElement,
    direction: "show" | "hide"
  ) {
    const height = element.getBoundingClientRect().height;
    if (direction === "show") {
      strip!.scrollTop = initStripScroll.current + height;
    }
  }

  function isDisabledToSendOfficialMessage() {
    if (
      ["whatsapp", "sms"].includes(channel.toLowerCase()) &&
      whatsAppAccount?.is_twilio &&
      featureGuard.isOutOfTwilioUsage()
    ) {
      return true;
    }
    return false;
  }

  const disabledSendMessageText = {
    official: {
      content: t("chat.alert.topUpLimitExceed"),
      link: {
        text: t("account.button.topUp"),
        route: routeTo("/settings/topup"),
      },
    },
    all: {
      content: t("chat.alert.upgradePlanCustomerLimit"),
      link: {
        text: featureGuard.hasUserPaidBills()
          ? t("account.upgrade.button")
          : t("account.trial.start.button"),
        route: routeTo("/settings/plansubscription"),
      },
    },
  };

  function getModeStyles(mode: TypeStatusEnum) {
    const map: Record<TypeStatusEnum, string> = {
      note: styles.note,
      reply: styles.reply,
      schedule: styles.reply,
    };
    const classes = [map[mode]];
    if (whatsappTemplate.isTemplateModeRequired) {
      classes.push(styles.outOfTimeWindow);
    }
    if (whatsappTemplate.editTemplateActive) {
      classes.push(styles.whatsAppTemplate);
    }

    return classes.join(" ");
  }

  const {
    showOverlay: showFbOverlay,
    showModal: showFbModal,
    loading: facebookOTNStateLoading,
  } = useAppSelector((s) => s.inbox.facebook.messageType, equals);
  const fbPageId = latestCustomerMessage?.facebookSender?.pageId;
  const isTextDisabled = whatsappTemplate.editTemplateActive;

  useEffect(() => {
    if (sendMessage.textInput) {
      if (whatsappTemplate.templateMode === "type") {
        sendMessage.textInput.focus();
      } else {
        sendMessage.textInput.blur();
      }
    }
  }, [whatsappTemplate.templateMode, sendMessage.textInput]);

  const isSendMessageToolsVisible =
    messageMode === "note" ||
    (!isCloudApiBalanceNegative &&
      (!whatsappTemplate.isTemplateModeRequired ||
        whatsappTemplate.editTemplateActive ||
        whatsappTemplate.templateMode === "type"));

  const emptyFunctionStub = useCallback(() => {}, []);
  const onSendFunction =
    hasContent && !sendDisabled && !whatsappTemplate.hasError
      ? messageMode === "schedule"
        ? onStartSchedule
        : onSubmit
      : emptyFunctionStub;

  const selectTemplate = (
    templateId: string,
    language: string,
    contentSid?: string
  ) => {
    loginDispatch({
      type: "INBOX.WHATSAPP_TEMPLATE.SELECTED",
      templateId: getTemplateResponseKey({
        templateName: templateId,
        language: language ?? i18n.language,
        channel: channel as WhatsappChannelType,
        sid: contentSid,
      }),
      language: language ?? i18n.language,
      contentSid: contentSid,
    });
  };

  const cancelTemplateSelection = () => {
    loginDispatch({ type: "INBOX.WHATSAPP_TEMPLATE.MODAL.CANCEL" });
  };

  return (
    <>
      {isQuoteChat && (
        <SlideShort
          visible={quote.show}
          onHidden={onQuoteHidden}
          onShowStart={rememberScrollStart}
          onTransitionFrame={syncScrollWithAnimation}
        >
          {
            <div className={`${styles.context}`}>
              <MessageQuoteSelected message={replyMessage ?? ""} />
              <Icon name={"close"} className={"md"} onClick={onQuoteReset} />
            </div>
          }
        </SlideShort>
      )}
      {isPickedChat && (
        <SlideShort
          visible={isPickingMessagesActive}
          onHidden={onPickingMessagesHidden}
          onShowStart={rememberScrollStart}
          onTransitionFrame={syncScrollWithAnimation}
        >
          {
            <div className={styles.context}>
              <Icon
                name={"close"}
                className={"md"}
                onClick={onPickedMessagesReset}
              />
              <span className={styles.selectedCount}>
                {t("chat.message.selected", { count: pickingMessagesCount })}
              </span>
              <PickedMessageActions />
            </div>
          }
        </SlideShort>
      )}
      <div
        className={`send-message
          ${styles.box}
          ${getModeStyles(messageMode)}
          ${inputStyles.outlineOnHover}
          ${inputStyles.outlineOnFocus}
          ${uploadZone.isDragActive ? inputStyles.outline : ""}`}
        {...uploadZone.getRootProps()}
      >
        {disableAll && <Dimmer active inverted />}
        {featureGuard.canSendMessages() &&
          isDisabledToSendOfficialMessage() && (
            <DisabledToSendMessage message={disabledSendMessageText.official} />
          )}
        {!featureGuard.canSendMessages() && (
          <DisabledToSendMessage message={disabledSendMessageText.all} />
        )}
        <div className={styles.tabs}>
          <MessengerMenu
            disabledSchedule={isDemo}
            onChangeMode={onChangeMode}
            messageMode={messageMode}
            conversationId={profileId}
          />
        </div>
        <div className={styles.text}>
          <div
            className={`${styles.textareaWrap} ${
              isTextDisabled ? styles.hidden : ""
            }`}
          >
            <SendMessageTextArea
              handleSubmit={onSendFunction}
              messageType={messageMode}
              onQuickReplyAttach={onQuickReplyAttach}
              messageAssigneeCandidates={messageAssigneeCandidates}
              messageAssignee={state.messageAssignee}
              quickReplyTemplates={quickReplyTemplates}
              conversationId={profileId}
              autoFocus={featureGuard.canSendMessages()}
              disabled={isTextDisabled}
            />
          </div>
        </div>
        <div className={styles.attaches}>
          {(state.attachedFiles.length > 0 ||
            state.quickReplyFiles.length > 0) &&
            !(
              whatsappTemplate.editTemplateActive ||
              whatsappTemplate.sendOverlayActive
            ) && (
              <AttachedFiles
                files={state.attachedFiles}
                deleteFile={deleteFile}
                deleteQuickAttachment={deleteQuickAttachment}
                quickAttachments={state.quickReplyFiles}
              />
            )}
        </div>
        {state.interactiveMessage && (
          <div className={styles.interactiveMessageBox}>
            <InteractiveMessageBoxView
              type={state.interactiveMessage.buttonType}
              quickReplies={state.interactiveMessage.quickReplies}
              listMessageTitle={state.interactiveMessage.listMessage?.title}
            />
            <EditInteractiveMessageButton
              interactiveMessageValues={state.interactiveMessage}
            />
          </div>
        )}
        {whatsappTemplate.sendOverlayActive && !isCloudApiBalanceNegative && (
          <SendOverlay
            editorNode={uploadZone.rootRef.current}
            conversationId={profileId}
          />
        )}
        {facebookOTNStateLoading ? (
          <Loader className="facebookOTNLoader" />
        ) : (
          <>
            {messageMode !== "note" && showFbOverlay && (
              <MessageTypeSendOverlay
                pageId={fbPageId}
                fbReceiverId={facebookReceiverId}
              />
            )}
          </>
        )}
        <div className={styles.tools}>
          {isSendMessageToolsVisible && (
            <SendMessageTools
              onFileAttach={onAttach}
              fileInputProps={uploadZone.getInputProps}
              messageMode={messageMode}
              quickReplyTemplates={quickReplyTemplates}
              setAttachments={onQuickReplyAttach}
              channelAllowedToSendVoice={isChannelAllowedToSendVoice}
              canSendInteractiveMessage={isChannelCanSendInteractiveMessage}
              onAudioRecord={onAudioRecord}
              onAudioRecorded={onAudioRecorded}
              messageAssignee={state.messageAssignee}
              setMessageAssignee={onAssigneeChanged}
              onSend={onSendFunction}
              sendDisabled={sendDisabled}
              disableAll={disableAll}
              sendOnly={
                !isNoteMode &&
                whatsappTemplate.templateMode === "template" &&
                !whatsappTemplate.isTemplateContentsEditable
              }
              textOnly={
                isDemo ||
                (!isNoteMode && whatsappTemplate.isTemplateContentsEditable)
              }
              setSelectedChannelItem={setSelectedChannelItem}
              selectedChannelItem={selectedChannelItem}
              lastVarInputId={whatsappTemplate.lastVarInputId}
              setButtonNode={setSendButtonNode}
            />
          )}
          {!isSendMessageToolsVisible && (
            <div className={styles.toolsLite}>
              <div className={toolsStyles.channelSelector}>
                <span className={toolsStyles.label}>
                  {t("chat.send.sendAs")}
                </span>
                <ChatChannelDropdown
                  setSelectedChannelItem={setSelectedChannelItem}
                  selectedChannelItem={selectedChannelItem}
                />
              </div>
            </div>
          )}
        </div>
        {whatsappTemplate.editTemplateActive && whatsappTemplate.template && (
          <div className={styles.textareaWrap}>
            <EditTemplateInline
              onSubmit={onSendFunction}
              whatsappTemplate={whatsappTemplate.template}
              variables={whatsappTemplate.variables}
              channel={channel as WhatsappChannelType}
            />
          </div>
        )}
        {messageMode === "schedule" && scheduleMode === "schedule" && (
          <ScheduleInput
            onSubmit={hasContent ? onSubmit : emptyFunctionStub}
            anchor={sendButtonNode}
            closePopup={() =>
              loginDispatch({ type: "INBOX.SCHEDULE.SCHEDULE_CANCEL" })
            }
          />
        )}
        {whatsappTemplate.selectTemplateModalVisible && (
          <SelectMode
            templatesList={whatsappTemplate.templates}
            refresh={{ profile }}
            conversationId={profileId}
            anchor={uploadZone.rootRef.current}
            onSelect={selectTemplate}
            channelType={channel as WhatsappChannelType}
            onClose={cancelTemplateSelection}
          />
        )}
      </div>
      <MessageTyping />
      {showFbModal && (
        <MessageTypeModal
          onClose={() =>
            loginDispatch({ type: "INBOX.FACEBOOK.MESSAGE_TYPE.HIDE_MODAL" })
          }
          pageId={fbPageId}
          fbReceiverId={facebookReceiverId}
        />
      )}
    </>
  );
}
