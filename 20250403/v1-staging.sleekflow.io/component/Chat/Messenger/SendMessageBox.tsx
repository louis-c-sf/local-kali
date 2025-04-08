import React, { ChangeEvent, useCallback, useEffect } from "react";
import MessageType, {
  Whatsapp360DialogExtendedMessagePayloadType,
} from "../../../types/MessageType";
import moment from "moment";
import { ProfileType, TypeStatusEnum } from "types/LoginType";
import { UploadedQuickReplyFileType } from "types/UploadedFileType";
import useSelectedChat from "../../../lib/effects/useSelectedChat";
import { useImageClipboard } from "lib/effects/useImageClipboard";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { AUDIO_TYPES } from "../Records/AudioRecord";
import { useFeaturesGuard } from "../../Settings/hooks/useFeaturesGuard";
import { useTranslation } from "react-i18next";
import { SendMessageBoxView } from "./SendMessageBoxView";
import { matchesMessageDraft } from "../mutators/chatSelectors";
import { useBrowserNotifications } from "lib/effects/useBrowserNotifications";
import { useMessengerMode } from "../hooks/Labels/useMessengerMode";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { useSendMessage } from "./useSendMessage";
import { StaffType } from "types/StaffType";
import { walkWhatsappTemplateParts } from "./SelectWhatsappTemplate/walkWhatsappTemplateParts";
import { useSelectWhatsappTemplateFlow } from "./SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { GET_ATTACHMENT_LINK } from "api/apiPath";
import { downloadAttachmentViaGet } from "api/apiRequest";
import { baseName } from "utility/baseName";
import { createMessageDraft } from "./createMessageDraft";
import { submitDemoTextMessageType } from "../../Onboarding/GetStarted/InboxDemo/MockInbox/MockChatMainContent";
import { getUploadedAttachment } from "api/Broadcast/getUploadedAttachment";
import { normalize360DialogComponents } from "api/Broadcast/normalize360DialogComponents";
import {
  ExtendedMessageType,
  WhatsappCloudAPIMessageType,
  WhatsappTwilioContentExtendMessageType,
  WhatsappTwilioContentTemplateMessageType,
} from "core/models/Message/WhatsappCloudAPIMessageType";
import { useSendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import { getAttachedFileSizeLimit, MEGABYTE } from "config/MessageConversion";
import { extractTemplateName } from "lib/utility/getTemplateResponseKey";

const MAXIMUM_FILES = 12;

interface QuickReplyType {
  id: string;
  previewUrl: string;
}

export default function SendMessageBox(props: {
  channel: string | undefined;
  profile: ProfileType;
  isDemo?: boolean;
  submitDemoTextMessage?: submitDemoTextMessageType;
  submitDemoTextNote?: submitDemoTextMessageType;
}) {
  const messageAssigneeCandidates = useAppSelector(
    (s) => s.staffList.filter((staff) => staff.userInfo.id !== s.user.id),
    equals
  );
  const quote = useAppSelector((s) => s.inbox.quote, equals);
  const usage = useAppSelector((s) => s.usage, equals);
  const sendAsMessage = useAppSelector((s) => s.inbox.sendAsMessage, equals);
  const loginDispatch = useAppDispatch();

  const {
    profile,
    isDemo = false,
    submitDemoTextMessage,
    submitDemoTextNote,
  } = props;
  const channel = props.channel ?? "";
  const sendMessageContext = useSendMessageContext();

  const { selectedChatMessages, latestCustomerMessage } = useSelectedChat(
    profile.conversationId
  );
  const state = useAppSelector((s) => s.inbox.messenger, equals);
  const featureGuard = useFeaturesGuard();

  const { t } = useTranslation();
  const { enableBrowserNotifications, browserNotificationsEnabled } =
    useBrowserNotifications();
  const { messengerMode = "reply", selectMode } = useMessengerMode();

  const {
    sendNoteFilesAttached,
    sendMessageNote,
    sendFilesAttached,
    sendMessageText,
    sendInteractiveMessage,
  } = useSendMessage();

  const { template, templateMode } = useSelectWhatsappTemplateFlow(
    profile.conversationId
  );

  const messageDraft =
    useAppSelector((s) => {
      if (!s.profile?.conversationId) {
        return;
      }
      return s.inbox.messageDrafts.find(
        matchesMessageDraft(s.profile.conversationId)
      );
    }) ?? createMessageDraft(profile.conversationId);

  const onDropAttach = useCallback(
    (acceptedFiles: File[]) => {
      if (featureGuard.canSendMessages()) {
        const files = [...state.attachedFiles, ...acceptedFiles].slice(
          0,
          MAXIMUM_FILES
        );
        loginDispatch({ type: "INBOX.MESSENGER.REPLACE_FILES", files });
      }
    },
    [featureGuard.canSendMessages(), state.attachedFiles, MAXIMUM_FILES]
  );

  const flash = useFlashMessageChannel();

  function canShowReplyQuote() {
    return messengerMode !== "note";
  }

  const replyMessage = quote.id
    ? selectedChatMessages.find(
        (m: MessageType) => m.messageUniqueID === quote.id
      )
    : undefined;

  useImageClipboard({
    elementRef: sendMessageContext.textInput,
    onPaste: (imageData) => {
      if (
        state.attachedFiles.length < MAXIMUM_FILES &&
        featureGuard.canSendMessages()
      ) {
        loginDispatch({
          type: "INBOX.MESSENGER.ATTACH_FILES",
          files: [imageData],
        });
      }
    },
  });

  const flushText = useCallback(
    (text: string, markupText: string) => {
      if (messengerMode === "reply") {
        loginDispatch({
          type: "INBOX.MESSENGER.UPDATE_REPLY_TEXT",
          text: text,
        });
      } else if (messengerMode === "note") {
        loginDispatch({
          type: "INBOX.MESSENGER.UPDATE_NOTE_TEXT",
          text: text,
          markupText: markupText,
        });
      }
    },
    [loginDispatch, messengerMode]
  );

  useEffect(() => {
    if (!sendAsMessage) {
      return;
    }
    const { messageType, messageContent, uploadedFiles } = sendAsMessage;

    let interrupt = false;

    if (messageType === "file") {
      const operations = uploadedFiles.map(async (f) => {
        if (interrupt) {
          return;
        }
        const { fileId, filename } = f;
        const basename = baseName(filename).replace(/\#/gi, "");
        const blob = await downloadAttachmentViaGet(
          GET_ATTACHMENT_LINK.replace("{attachmentType}", "message").replace(
            "{fileId}",
            fileId
          ),
          basename
        );
        if (blob) {
          const file = new File([blob.content], basename, {
            type: blob.mimeType,
          });
          loginDispatch({
            type: "INBOX.MESSENGER.ATTACH_FILES",
            files: [file],
          });
        }
      });

      (async () => {
        try {
          await Promise.all(operations);
        } catch (error) {
          console.error("batch download attachments error:", error);
        }
      })();
    }

    if (channel === "note") {
      sendMessageContext.setNote(messageContent, messageContent);
    } else {
      sendMessageContext.setReply(messageContent);
    }
    loginDispatch({
      type: "INBOX.MESSAGE.CLEAR_SEND_AS_MESSAGE",
    });
    return () => {
      interrupt = true;
    };
  }, [sendAsMessage]);

  const handleSelectedMode = useCallback(
    (messageType: TypeStatusEnum) => {
      selectMode(messageType);
      if (sendMessageContext.textInput && featureGuard.canSendMessages()) {
        sendMessageContext.textInput.focus();
      }
    },
    [messengerMode, profile.conversationId]
  );

  const deleteFile = useCallback((deleteFile: File) => {
    loginDispatch({ type: "INBOX.MESSENGER.REMOVE_FILE", file: deleteFile });
  }, []);

  const deleteQuickAttachment = useCallback(
    (file: UploadedQuickReplyFileType) => {
      loginDispatch({ type: "INBOX.MESSENGER.REMOVE_QUICK_FILE", file });
    },
    []
  );

  const handleAttach = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    loginDispatch({
      type: "INBOX.MESSENGER.REPLACE_FILES",
      files: [...(event.target.files ?? [])].slice(0, MAXIMUM_FILES),
    });
  }, []);

  const handleAudioRecordStart = useCallback(() => {
    loginDispatch({ type: "CHAT_SWITCH_LOCKED" });
  }, []);

  const handleAudioRecordEnd = (data: Blob, mimeType: string) => {
    loginDispatch({ type: "CHAT_SWITCH_UNLOCKED" });
    handleAudioSubmit(data, mimeType);
  };

  const sendMessage = async function sendMessage() {
    if (!featureGuard.canSendMessages()) {
      return;
    }
    if (!profile) {
      return;
    }
    if (!channel) {
      flash("Please select a channel before sending the message");
    }
    if (!browserNotificationsEnabled) {
      enableBrowserNotifications();
    }

    const attachesToSend = [...state.attachedFiles];
    if (attachesToSend.length > 0) {
      const fileLimit = getAttachedFileSizeLimit(channel.toLocaleLowerCase());
      const totalFileSizeToSend = attachesToSend.reduce(
        (prevAttach, currentAttach) => prevAttach + currentAttach.size,
        0
      );
      const filterFileSizeExceedLimit =
        totalFileSizeToSend > fileLimit * MEGABYTE;
      if (filterFileSizeExceedLimit) {
        flash(
          t("flash.inbox.error.attach.fileMax", { size: `${fileLimit}MB` })
        );
        return;
      }
    }
    loginDispatch({ type: "INBOX.MESSENGER.SUBMIT" });
    try {
      sendMessageContext.setMessageDraft({
        text: "",
        markupText: "",
        conversationId: profile.conversationId,
      });
      const messageDraft = sendMessageContext.messageDraft;
      const textTyped = messageDraft.text.trim();
      let messageContent = textTyped;
      let whatsapp360DialogPayload:
        | Whatsapp360DialogExtendedMessagePayloadType
        | undefined = undefined;
      let whatsappCloudApiPayload: WhatsappCloudAPIMessageType | undefined =
        undefined;
      let whatsappContentTemplatePayload:
        | WhatsappTwilioContentExtendMessageType
        | undefined = undefined;
      if (templateMode === "template" && template) {
        const nodes = walkWhatsappTemplateParts(template.content);
        const varValues = state.sendWhatsappTemplate.variables;
        if (channel.toLowerCase() === "whatsapp360dialog") {
          const components = normalize360DialogComponents(
            template,
            state.sendWhatsappTemplate
          );
          whatsapp360DialogPayload = {
            whatsapp360DialogTemplateMessage: {
              templateName: state.sendWhatsappTemplate.templateId ?? "",
              templateNamespace: template.namespace ?? "",
              language: state.sendWhatsappTemplate.language ?? "",
              components: components ?? undefined,
            },
          };
        } else if (channel === "whatsappcloudapi") {
          const language = state.sendWhatsappTemplate.language ?? "";
          whatsappCloudApiPayload = {
            extendedMessagePayload: {
              channel: "whatsappcloudapi",
              extendedMessageType:
                ExtendedMessageType.WhatsappCloudApiTemplateMessage,
              extendedMessagePayloadDetail: {
                whatsappCloudApiTemplateMessageObject: {
                  language,
                  templateName: extractTemplateName({
                    channel,
                    templateName: state.sendWhatsappTemplate.templateId ?? "",
                    language,
                  }),
                  components: normalize360DialogComponents(
                    template,
                    state.sendWhatsappTemplate
                  ),
                },
              },
            },
          };
        } else if (
          channel === "twilio_whatsapp" &&
          template.isContentTemplate
        ) {
          const variables = Object.keys(varValues.content).reduce(
            (prev, curr, index) => ({
              ...prev,
              [`${index + 1}`]: varValues.content[curr],
            }),
            {}
          );
          let whatsappObjects: WhatsappTwilioContentTemplateMessageType = {
            contentSid: template.contentSid ?? "",
            contentVariables: {},
          };
          if (Object.keys(variables).length > 0) {
            whatsappObjects = {
              ...whatsappObjects,
              contentVariables: variables,
            };
          }
          whatsappContentTemplatePayload = {
            extendedMessagePayload: {
              extendedMessageType:
                ExtendedMessageType.WhatsappTwilioContentTemplateMessage,
              extendedMessagePayloadDetail: {
                whatsappTwilioContentApiObject: whatsappObjects,
              },
            },
          };
        }

        messageContent = nodes.reduce((prev, next) => {
          const nextPart =
            next.type === "string" ? next.value : varValues.content[next.name];
          return `${prev}${nextPart}`;
        }, "");
      }
      if (messengerMode === "note") {
        if (isDemo && submitDemoTextNote) {
          return submitDemoTextNote("note", Number(profile.id), messageContent);
        } else if (attachesToSend.length > 0) {
          return await sendNoteFilesAttached(messageContent, attachesToSend);
        } else {
          return await sendMessageNote(messageContent);
        }
      } else {
        if (isDemo && submitDemoTextMessage) {
          return submitDemoTextMessage(
            channel,
            Number(profile.id),
            messageContent
          );
        } else if (attachesToSend.length > 0) {
          return await sendFilesAttached(messageContent, attachesToSend);
        } else if (state.interactiveMessage) {
          return await sendInteractiveMessage(
            messageContent,
            state.interactiveMessage
          );
        } else if (state.paymentLink.transaction.linkGenerated) {
          return await sendMessageText(messageContent, {
            transaction: state.paymentLink.transaction,
          });
        } else {
          return await sendMessageText(messageContent, {
            whatsapp360Dialog: whatsapp360DialogPayload,
            whatsappCloudApi: whatsappCloudApiPayload,
            twilioContentObject: whatsappContentTemplatePayload,
          });
        }
      }
    } catch (e) {
      // todo display error status in box somehow
      console.error(`handleSubmit ${e}`);
    }
  };

  const startSchedule = useCallback(() => {
    loginDispatch({ type: "INBOX.SCHEDULE.SCHEDULE_START" });
  }, []);

  async function handleAudioSubmit(audioData: Blob, mime: string) {
    try {
      const fileExtension = AUDIO_TYPES[mime]?.extension ?? "bin";
      const files = [new File([audioData], `voice.${fileExtension}`)];
      if (messengerMode === "note") {
        await sendNoteFilesAttached("", files, "audio");
      } else {
        await sendFilesAttached("", files, "audio");
      }
    } catch (e) {
      console.error("handleAudioSubmit", e, mime, audioData);
    }
  }

  const changeAssignee = useCallback(
    (assignee: StaffType | undefined) =>
      loginDispatch({
        type: "INBOX.MESSENGER.UPDATE_MESSAGE_ASSIGNEE",
        assignee,
      }),
    []
  );

  const updateQuickReplyAttach = useCallback(
    async (files: UploadedQuickReplyFileType[], templateId: number) => {
      const result: QuickReplyType[] = await Promise.all(
        files.map(async (file) => {
          const attachmentLink = await getUploadedAttachment(
            file.quickReplyFileId,
            "quickreply",
            file.filename
          );
          return { id: file.quickReplyFileId, previewUrl: attachmentLink };
        })
      );
      loginDispatch({
        type: "INBOX.MESSENGER.ATTACH_QUICK_FILES",
        files: files.map((f) => {
          return {
            ...f,
            previewUrl:
              result.find((file) => file.id === f.quickReplyFileId)
                ?.previewUrl ?? "",
          };
        }),
        quickReplyId: templateId,
      });
    },
    []
  );

  const resetMessagePicking = useCallback(
    () => loginDispatch({ type: "INBOX.MESSAGE.PICK_RESET" }),
    []
  );

  const resetQuoting = useCallback(
    () => loginDispatch({ type: "INBOX.MESSAGE.REPLY_DESELECTED" }),
    []
  );

  const hideMessagePicking = useCallback(
    () => loginDispatch({ type: "INBOX.MESSAGE.PICK_HIDDEN" }),
    []
  );

  const hideQuoting = useCallback(
    () => loginDispatch({ type: "INBOX.MESSAGE.REPLY_HIDDEN" }),
    []
  );

  return (
    <SendMessageBoxView
      isDemo={isDemo}
      channel={channel}
      deleteFile={deleteFile}
      deleteQuickAttachment={deleteQuickAttachment}
      messageAssigneeCandidates={messageAssigneeCandidates}
      onAttach={handleAttach}
      onAudioRecord={handleAudioRecordStart}
      onAudioRecorded={handleAudioRecordEnd}
      onChangeMode={handleSelectedMode}
      onQuoteHidden={hideQuoting}
      onPickingMessagesHidden={hideMessagePicking}
      onQuoteReset={resetQuoting}
      onPickedMessagesReset={resetMessagePicking}
      onSubmit={sendMessage}
      onStartSchedule={startSchedule}
      replyMessage={canShowReplyQuote() ? replyMessage : undefined}
      onAssigneeChanged={changeAssignee}
      onQuickReplyAttach={updateQuickReplyAttach}
      handleAttachDropped={onDropAttach}
      messageMode={messengerMode}
      latestCustomerMessage={latestCustomerMessage}
    />
  );
}
