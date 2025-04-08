import React from "react";
import { DropzoneInputProps } from "react-dropzone";
import { TypeStatusEnum } from "types/LoginType";
import { QuickReplyType } from "types/QuickReplies/QuickReplyType";
import { UploadedQuickReplyFileType } from "types/UploadedFileType";
import moment from "moment";
import { StaffType } from "types/StaffType";
import EmojiButton from "../../EmojiButton";
import { getInputId } from "./SelectWhatsappTemplate/EditTemplateInline";
import { AttachButton } from "./AttachButton";
import { AudioNote } from "./AudioNote";
import { MentionToggle } from "./MentionToggle";
import InteractiveMessageButton from "../InteractiveMessage/InteractiveMessageButton";
import { QuickReplyToggle } from "./QuickReplyToggle";
import { useFeaturesGuard } from "../../Settings/hooks/useFeaturesGuard";
import { PaymentLinkButton } from "./EditorTools/PaymentLinkButton";
import ShareProductButton from "features/Ecommerce/usecases/Inbox/Share/ShareProductButton";
import { useEcommerceStores } from "features/Ecommerce/components/EcommerceStoresContext";
import { useSendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import { usePaymentsPolicy } from "../../../core/policies/Ecommerce/Payments/usePaymentsPolicy";

export function EditorTools(props: {
  textOnly: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
  messageMode: TypeStatusEnum;
  quickReplyTemplates: QuickReplyType[];
  setAttachments: (
    files: UploadedQuickReplyFileType[],
    templateId: number
  ) => void;
  channelAllowedToSendVoice: boolean;
  onAudioRecord: () => void;
  onAudioRecorded: (
    data: Blob,
    mimeType: string,
    duration: moment.Duration
  ) => void;
  messageAssignee: StaffType | undefined;
  messageAssignee1: (assignee: StaffType | undefined) => void;
  lastVarInputId?: string;
  hasInteractiveMessage?: boolean;
  canSendInteractiveMessage?: boolean;
}) {
  const isOutBoundMessage = ["reply", "schedule"].includes(props.messageMode);
  const featuresGuard = useFeaturesGuard();
  const ecommerceStores = useEcommerceStores();
  const sendMessage = useSendMessageContext();
  const paymentsPolicy = usePaymentsPolicy();

  return (
    <div className="ui buttons big">
      <EmojiButton
        handleEmojiInput={(emoji) => {
          sendMessage.insertEmoji(
            emoji,
            document.getElementById(
              getInputId(props.lastVarInputId ?? "")
            ) as HTMLInputElement
          );
        }}
      />
      {!props.textOnly && !props.hasInteractiveMessage && (
        <AttachButton
          onChange={props.onChange}
          getFileInputProps={props.fileInputProps}
        />
      )}
      {!props.textOnly && isOutBoundMessage && !props.hasInteractiveMessage && (
        <QuickReplyToggle
          quickReplyTemplates={props.quickReplyTemplates}
          setAttachments={props.setAttachments}
          setText={sendMessage.setQuickReply}
        />
      )}
      {!props.textOnly &&
        (props.channelAllowedToSendVoice || props.messageMode === "note") &&
        !props.hasInteractiveMessage && (
          <AudioNote
            onAudioRecord={props.onAudioRecord}
            onAudioRecorded={props.onAudioRecorded}
          />
        )}
      {!props.textOnly &&
        isOutBoundMessage &&
        props.canSendInteractiveMessage && <InteractiveMessageButton />}
      {!props.textOnly &&
        isOutBoundMessage &&
        ecommerceStores.storeChoices.length > 0 && (
          <ShareProductButton
            standalone={false}
            storeChoices={ecommerceStores.storeChoices}
          />
        )}
      {!props.textOnly && props.messageMode === "note" && (
        <MentionToggle
          messageAssignee={props.messageAssignee}
          setMessageAssignee={props.messageAssignee1}
        />
      )}
      {!props.textOnly &&
        featuresGuard.canUseStripePayments() &&
        paymentsPolicy.canUseCommercePayments && <PaymentLinkButton />}
    </div>
  );
}
