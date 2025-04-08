import React from "react";
import { TFunction } from "i18next";
import { SubTabEnum } from "../WhatsAppQrCode/types/WhatsAppQrCodeTypes";

export const serializedMessage = (props: {
  msgType: SubTabEnum;
  topMsg: string;
  bottomMsg: string;
}) => {
  const { msgType, topMsg, bottomMsg } = props;
  return `${topMsg}${msgType === "first" ? "(.*)" : "{0}"}${bottomMsg}`;
};

export const messageUnserialized = (props: {
  msgType: SubTabEnum;
  msg: any;
  enableAutoReplyMsg?: boolean;
  currentTabIndex?: number;
  t?: TFunction;
}) => {
  const {
    msgType,
    msg,
    enableAutoReplyMsg = false,
    currentTabIndex = 0,
    t = () => {},
  } = props;
  if (msgType === "first") {
    return {
      top: msg[0].conditions[0].values[0].split("(.*)")[0],
      bottom: msg[0].conditions[0].values[0].split("(.*)")[1],
    };
  } else {
    return {
      top: enableAutoReplyMsg
        ? msg[0].automationActions[currentTabIndex].messageContent?.split(
            "{0}"
          )[0]
        : t(
            "settings.whatsappQrCode.activated.content.common.autoReplyMsg.msg"
          ),
      bottom: enableAutoReplyMsg
        ? msg[0].automationActions[currentTabIndex].messageContent?.split(
            "{0}"
          )[1]
        : t(
            "settings.whatsappQrCode.activated.content.common.autoReplyMsg.msgAfterContactName"
          ),
    };
  }
};
