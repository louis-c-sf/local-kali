import produce from "immer";
import insertTextAtCursor from "insert-text-at-cursor";
import { mergeDeepRight } from "ramda";
import React, { useCallback } from "react";
import {
  UPDATED_PART_ENUM,
  Whatsapp360DialogFileUploadType,
} from "../../../../../App/reducers/Chat/whatsappTemplatesReducer";
import {
  AutomationActionType,
  SendMessageAutomationActionType,
} from "../../../../../types/AutomationActionType";
import { BroadcastOptInTemplateDisplay } from "../../../../Broadcast/shared/BroadcastTemplateDisplay/BroadcastOptInTemplateDisplay";
import EmojiButton from "../../../../EmojiButton";
import templateStyles from "../../../../Broadcast/shared/BroadcastTemplateDisplay/BroadcastTemplateDisplay.module.css";
import { useTranslation } from "react-i18next";
import { HeaderFormatEnum } from "../../../../../types/WhatsappTemplateResponseType";
import UploadHeaderFile from "./SendMessageHeaderFile";
import sendStyles from "../SendMessageAction.module.css";
import styles from "./SendWhatsApp360DialogMessage.module.css";
import { getIsVarsSetValid } from "../../../../Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { BroadcastOptInContextProvider } from "../../../../Broadcast/shared/BroadcastTemplateDisplay/BroadcastOptInContext";
import {
  DynamicURLButton,
  isDynamicUrlButtonExist,
} from "component/Broadcast/shared/BroadcastTemplateDisplay/DynamicURLButton";

export default function SendMessageTemplateDisplay(props: {
  mode: string;
  configId: number;
  setAction: (action: AutomationActionType) => void;
  textareaId: string;
  action: SendMessageAutomationActionType;
  readonly?: boolean;
  channelType: string;
}) {
  const { mode, action, setAction, configId } = props;
  if (mode === "template" && !action.sendWhatsappTemplate) {
    return <div></div>;
  }
  return mode === "type" ? (
    <>
      <textarea
        id={props.textareaId}
        className={`ui input ${sendStyles.textContent}`}
        value={action.messageContent ?? ""}
        disabled={props.readonly ?? false}
        onChange={(ev) => {
          setAction(
            produce(action, (actionDraft) => {
              actionDraft.messageContent = ev.target.value;
            })
          );
        }}
      />
      <div className={sendStyles.textControls}>
        {!props.readonly && (
          <EmojiButton
            handleEmojiInput={(emoji) => {
              let textarea = document.getElementById(
                props.textareaId
              ) as HTMLTextAreaElement;
              if (textarea) {
                insertTextAtCursor(textarea, emoji);
              }
            }}
          />
        )}
      </div>
    </>
  ) : (
    <SendMessageTemplate
      setAction={props.setAction}
      action={action}
      configId={configId}
      readonly={props.readonly}
      channelType={props.channelType}
    />
  );
}

function SendMessageTemplate(props: {
  configId: number;
  setAction: (action: AutomationActionType) => void;
  action: SendMessageAutomationActionType;
  readonly?: boolean;
  channelType: string;
}) {
  const { setAction, action, configId, channelType } = props;
  const { sendWhatsappTemplate } = action;
  const { t } = useTranslation();
  const updateVarChanged = useCallback(
    (updatedPart: UPDATED_PART_ENUM, name: string, value: string) => {
      if (!sendWhatsappTemplate) {
        return;
      }
      setAction(
        produce(action, (draft) => {
          if (!draft.sendWhatsappTemplate) {
            return;
          }
          draft.sendWhatsappTemplate.variables = mergeDeepRight(
            draft.sendWhatsappTemplate.variables,
            {
              [updatedPart]: {
                [name]: value,
              },
            }
          );
        })
      );
    },
    [JSON.stringify(sendWhatsappTemplate)]
  );
  const updateLastVarInputId = useCallback(
    (name: string) => {
      if (!sendWhatsappTemplate) {
        return;
      }
      setAction(
        produce(action, (draft) => {
          if (!draft.sendWhatsappTemplate) {
            return;
          }
          draft.sendWhatsappTemplate.lastVarInputId = name;
        })
      );
    },
    [
      sendWhatsappTemplate?.lastVarInputId,
      JSON.stringify(sendWhatsappTemplate?.variables),
    ]
  );
  if (!sendWhatsappTemplate) {
    return null;
  }

  function uploadFileContent(
    uploadedFile: Whatsapp360DialogFileUploadType | undefined
  ) {
    setAction(
      produce(action, (draft) => {
        if (!draft.sendWhatsappTemplate) {
          return;
        }
        draft.sendWhatsappTemplate.file = uploadedFile;
      })
    );
  }

  return (
    <div
      className={`${styles.templateContainer} ${templateStyles.templateContainer}`}
    >
      <div className={templateStyles.container}>
        <BroadcastOptInContextProvider
          getIsVarValid={(name, variables, varsTouched) =>
            getIsVarsSetValid("content", name, variables, varsTouched)
          }
        >
          <BroadcastOptInTemplateDisplay
            selectedChannelIndex={0}
            updateVarChanged={updateVarChanged}
            updateLastVarInputId={updateLastVarInputId}
            sendWhatsappTemplate={sendWhatsappTemplate}
            disabled={props.readonly ?? false}
          />
        </BroadcastOptInContextProvider>
      </div>
      <div className={styles.note}>
        {t("automation.action.sendMessage.templateNote")}
      </div>
      {sendWhatsappTemplate?.templateContent?.header?.format &&
        sendWhatsappTemplate.templateContent.header.format !==
          HeaderFormatEnum.TEXT &&
        configId && (
          <UploadHeaderFile
            uploadFileContent={uploadFileContent}
            header={sendWhatsappTemplate.templateContent.header}
            file={sendWhatsappTemplate.file}
            configId={configId}
            channelType={channelType}
          />
        )}
      {isDynamicUrlButtonExist(channelType, sendWhatsappTemplate) && (
        <DynamicURLButton
          selectedChannelIndex={0}
          updateVarChanged={updateVarChanged}
          updateLastVarInputId={updateLastVarInputId}
          disabled={props.readonly ?? false}
          button={sendWhatsappTemplate?.variables?.button ?? {}}
          template={sendWhatsappTemplate?.templateContent}
        />
      )}
    </div>
  );
}
