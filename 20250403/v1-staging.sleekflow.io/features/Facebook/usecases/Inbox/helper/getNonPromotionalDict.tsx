import { TFunction } from "i18next";
import { OptionType } from "../../../models/FacebookOTNTypes";

export const getNonPromotionalDict = (
  t: TFunction,
  hasHumanAgent: boolean | undefined
) => {
  const nonPromotionalDict: OptionType[] = [
    {
      name: t(
        "chat.facebookOTN.modal.messageType.options.confirmedEventUpdate.title"
      ),
      description: t(
        "chat.facebookOTN.modal.messageType.options.confirmedEventUpdate.description"
      ),
      example: [
        t(
          "chat.facebookOTN.modal.messageType.options.confirmedEventUpdate.example.confirm"
        ),
        t(
          "chat.facebookOTN.modal.messageType.options.confirmedEventUpdate.example.remind"
        ),
        t(
          "chat.facebookOTN.modal.messageType.options.confirmedEventUpdate.example.notify"
        ),
      ],
      value: "CONFIRMED_EVENT_UPDATE",
    },
    {
      name: t(
        "chat.facebookOTN.modal.messageType.options.postPurchaseUpdate.title"
      ),
      description: t(
        "chat.facebookOTN.modal.messageType.options.postPurchaseUpdate.description"
      ),
      example: [
        t(
          "chat.facebookOTN.modal.messageType.options.postPurchaseUpdate.example.receipt"
        ),
        t(
          "chat.facebookOTN.modal.messageType.options.postPurchaseUpdate.example.paymentStatus"
        ),
        t(
          "chat.facebookOTN.modal.messageType.options.postPurchaseUpdate.example.shippingStatus"
        ),
        t(
          "chat.facebookOTN.modal.messageType.options.postPurchaseUpdate.example.emergency"
        ),
      ],
      value: "POST_PURCHASE_UPDATE",
    },
    {
      name: t("chat.facebookOTN.modal.messageType.options.accountUpdate.title"),
      description: t(
        "chat.facebookOTN.modal.messageType.options.accountUpdate.description"
      ),
      example: [
        t(
          "chat.facebookOTN.modal.messageType.options.accountUpdate.example.update"
        ),
        t(
          "chat.facebookOTN.modal.messageType.options.accountUpdate.example.suspiciousAct"
        ),
      ],
      value: "ACCOUNT_UPDATE",
    },
  ];
  if (hasHumanAgent) {
    const humanAgentOption = [
      {
        name: t("chat.facebookOTN.modal.messageType.options.humanAgent.title"),
        description: t(
          "chat.facebookOTN.modal.messageType.options.humanAgent.description"
        ),
        example: [
          t(
            "chat.facebookOTN.modal.messageType.options.humanAgent.example.24hr"
          ),
        ],
        value: "HUMAN_AGENT",
      },
    ];
    nonPromotionalDict.unshift(...humanAgentOption);
  }
  return nonPromotionalDict;
};

export const convertNonPromotionalValueToName = (
  promotionalDic: OptionType[],
  findValue: string | undefined
) => {
  return promotionalDic.find((row) => row.value === findValue)?.name;
};
