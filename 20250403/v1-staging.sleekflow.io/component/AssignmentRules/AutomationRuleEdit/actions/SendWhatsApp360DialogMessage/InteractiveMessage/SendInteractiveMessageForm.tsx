import { ButtonType } from "component/Chat/InteractiveMessage/InteractiveMessageSchema";
import produce from "immer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Form } from "semantic-ui-react";
import {
  AutomationActionType,
  SendMessageAutomationActionType,
} from "types/AutomationActionType";
import { denormalizeInteractiveMessageRule } from "./helpers";
import ListMessageField from "./ListMessageField";
import QuickReplyField from "./QuickReplyField";
import styles from "./SendInteractiveMessageForm.module.css";
import InteractiveMessagePreviewContent from "./InteractiveMessagePreviewContent";
import { mergeRight } from "ramda";
import { WhatsappInteractiveObjectType } from "types/MessageType";

export const initialInteractiveMessageValues = {
  buttonType: "none",
  quickReplies: [""],
  listMessage: {
    title: "",
    sections: [
      {
        title: "",
        options: [
          {
            name: "",
            description: "",
          },
        ],
      },
    ],
  },
};

export default function SendInteractiveMessageForm({
  action,
  setAction,
  wabaAccountId,
}: {
  action: SendMessageAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  wabaAccountId?: string;
}) {
  const { t } = useTranslation();

  React.useEffect(() => {
    // Initialize values with loaded action
    const cloudAPIInteractiveMessage =
      (action.extendedAutomationMessage?.messageType === "interactive" &&
        action.extendedAutomationMessage
          .whatsappCloudApiByWabaExtendedAutomationMessages &&
        action.extendedAutomationMessage
          .whatsappCloudApiByWabaExtendedAutomationMessages.length > 0 &&
        action.extendedAutomationMessage
          .whatsappCloudApiByWabaExtendedAutomationMessages[0]
          .extendedMessagePayloadDetail.whatsappCloudApiInteractiveObject) ||
      undefined;
    let interactiveObj: WhatsappInteractiveObjectType | undefined = undefined;
    if (
      action.whatsApp360DialogExtendedAutomationMessages &&
      action.whatsApp360DialogExtendedAutomationMessages?.length > 0 &&
      action.whatsApp360DialogExtendedAutomationMessages[0]
        .whatsapp360DialogInteractiveObject
    ) {
      interactiveObj =
        action.whatsApp360DialogExtendedAutomationMessages[0]
          .whatsapp360DialogInteractiveObject;
    } else if (cloudAPIInteractiveMessage) {
      interactiveObj = cloudAPIInteractiveMessage;
    }
    if (interactiveObj) {
      const interactiveMessageValues =
        denormalizeInteractiveMessageRule(interactiveObj);
      setAction(
        produce(action, (draft) => {
          draft.sendInteractiveMessageState = {
            wabaAccountId,
            ...interactiveMessageValues,
          };
        })
      );
    } else {
      setAction(
        produce(action, (draft) => {
          draft.sendInteractiveMessageState = {
            wabaAccountId,
            ...initialInteractiveMessageValues,
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    action.whatsApp360DialogExtendedAutomationMessages,
    action.extendedAutomationMessage
      ?.whatsappCloudApiByWabaExtendedAutomationMessages,
    wabaAccountId,
  ]);

  return (
    <div className={styles.formWrapper}>
      <Form className={styles.form}>
        <Form.Field className={styles.dropdownField}>
          <label>{t("form.interactiveMessage.field.buttonType.label")}</label>
          <Dropdown
            selection
            closeOnBlur
            options={[
              {
                value: "none",
                text: t("form.interactiveMessage.none"),
              },
              {
                value: ButtonType.QUICK_REPLY,
                text: t("form.interactiveMessage.field.quickReplies.text"),
              },
              {
                value: ButtonType.LIST_MESSAGE,
                text: t("form.interactiveMessage.field.listMessage.text"),
              },
            ]}
            value={action.sendInteractiveMessageState?.buttonType}
            onChange={(_, data) => {
              setAction(
                produce(action, (draft) => {
                  if (draft.sendInteractiveMessageState) {
                    draft.sendInteractiveMessageState = mergeRight(
                      draft.sendInteractiveMessageState,
                      {
                        ...initialInteractiveMessageValues,
                      }
                    );
                    draft.sendInteractiveMessageState.buttonType =
                      data.value as string;
                  } else {
                    draft.sendInteractiveMessageState =
                      data.value !== "value"
                        ? {
                            ...initialInteractiveMessageValues,
                            buttonType: data.value as string,
                          }
                        : undefined;
                  }
                })
              );
            }}
          />
        </Form.Field>

        {action.sendInteractiveMessageState?.buttonType ===
          ButtonType.QUICK_REPLY && (
          <QuickReplyField action={action} setAction={setAction} />
        )}

        {action.sendInteractiveMessageState?.buttonType ===
          ButtonType.LIST_MESSAGE && (
          <ListMessageField action={action} setAction={setAction} />
        )}
      </Form>
      <div className={styles.preview}>
        <InteractiveMessagePreviewContent
          formValues={action.sendInteractiveMessageState}
          draftText={action.messageContent}
        />
      </div>
    </div>
  );
}
