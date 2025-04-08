import { TFunction } from "i18next";
import * as yup from "yup";

export type ListMessageSectionOption = {
  name: string;
  description?: string;
};

export type ListMessageSection = {
  title: string;
  options: ListMessageSectionOption[];
};

type ListMessage = {
  title: string;
  sections: ListMessageSection[];
};

export enum ButtonType {
  QUICK_REPLY = "quickReplies",
  LIST_MESSAGE = "listMessage",
  CALL_TO_ACTION = "callToAction",
  NOTIFY_ME = "notifyMe",
}

export type InteractiveMessageValues = {
  buttonType: ButtonType | string;
  quickReplies?: string[];
  listMessage?: ListMessage;
};

export const BUTTON_MAX_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 1024;

export function getButtonTypeSettings(t: TFunction) {
  const descriptions = {
    [ButtonType.QUICK_REPLY]: t(
      "form.interactiveMessage.field.quickReplies.description"
    ),
    [ButtonType.LIST_MESSAGE]: t(
      "form.interactiveMessage.field.listMessage.description"
    ),
  };

  const options = [
    {
      value: ButtonType.QUICK_REPLY,
      text: t("form.interactiveMessage.field.quickReplies.text"),
    },
    {
      value: ButtonType.LIST_MESSAGE,
      text: t("form.interactiveMessage.field.listMessage.text"),
    },
  ];

  return {
    options,
    descriptions,
  };
}

export const initialValues: InteractiveMessageValues = {
  buttonType: "quickReplies",
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

export function generateSchema(t: TFunction) {
  const quickRepliesSchema = yup.mixed().when("buttonType", {
    is: (buttonType) => buttonType === ButtonType.QUICK_REPLY,
    then: yup
      .array()
      .of(
        yup
          .string()
          .max(BUTTON_MAX_LENGTH)
          .required(
            t("form.interactiveMessage.field.quickReplies.error.required")
          )
      ),
  });

  const listMessageSchema = yup.mixed().when("buttonType", {
    is: (buttonType) => buttonType === ButtonType.LIST_MESSAGE,
    then: yup.object().shape({
      title: yup.string().max(BUTTON_MAX_LENGTH).required(),
      sections: yup.array().of(
        yup.object().shape({
          title: yup.string().notRequired(),
          options: yup
            .array()
            .of(
              yup.object().shape({
                name: yup.string().required(),
                description: yup.string().notRequired(),
              })
            )
            .required(),
        })
      ),
    }),
  });

  return yup.object().shape({
    buttonType: yup.string().required(),
    quickReplies: quickRepliesSchema,
    listMessage: listMessageSchema,
  });
}
