import React, { useEffect, useMemo, useState } from "react";
import useSelectedChat from "../../../../lib/effects/useSelectedChat";
import MessageType from "../../../../types/MessageType";
import moment, { Moment } from "moment";
import { equals, pick } from "ramda";
import { isFreePlan, PlanType } from "../../../../types/PlanSelectionType";
import { Trans, useTranslation } from "react-i18next";
import { GET_CONVERSATIONS_MESSAGES } from "../../../../api/apiPath";
import { get } from "../../../../api/apiRequest";
import { Placeholder } from "semantic-ui-react";
import { ChannelType } from "../types";
import { getChannelInstanceId } from "../../utils/useChatSelectors";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { aliasChannelName } from "../../../Channel/selectors";
import { TFunction } from "i18next";
import { useOfficialWhatsappWindow } from "../../hooks/Labels/useOfficialWhatsappWindow";
import { getLatestMessage } from "../../mutators/chatSelectors";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { useCurrentUtcOffset } from "component/Chat/hooks/useCurrentUtcOffset";

export default function ReplyMessageBox(props: { conversationId: string }) {
  const {
    currentPlan,
    selectedChannelFromConversation,
    profile,
    selectedChannelIdFromConversation,
  } = useAppSelector(
    pick([
      "currentPlan",
      "selectedChannelFromConversation",
      "profile",
      "selectedChannelIdFromConversation",
    ]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const { conversationId } = props;
  const [isWithTimeRange, setIsWithinTimeRange] = useState(false);
  const { latestCustomerMessage } = useSelectedChat(conversationId);
  const [foundMessageExist, setLatestMessageExist] = useState<MessageType>();
  const [loading, setLoading] = useState(false);
  const {
    getIsConversationWithinOfficialWindow,
    getConversationOfficialWindow,
  } = useOfficialWhatsappWindow({
    selectedChannel: selectedChannelFromConversation,
  });
  const utcOffset = useCurrentUtcOffset();
  const { t } = useTranslation();

  const isOfficialWhatsappChannelSelected = useMemo(() => {
    return (
      selectedChannelFromConversation &&
      ((isAnyWhatsappChannel(selectedChannelFromConversation) &&
        profile.whatsAppAccount?.is_twilio) ||
        (selectedChannelFromConversation === "whatsapp360dialog" &&
          profile.whatsApp360DialogUser !== undefined) ||
        (selectedChannelFromConversation === "whatsappcloudapi" &&
          profile.whatsappCloudApiUser !== undefined))
    );
  }, [
    selectedChannelFromConversation,
    profile.whatsappCloudApiUser?.whatsappId,
    profile.whatsApp360DialogUser?.id,
    profile.whatsAppAccount?.is_twilio,
  ]);

  const isChannelForDisplayBanner =
    isOfficialWhatsappChannelSelected ||
    selectedChannelFromConversation === "facebook" ||
    selectedChannelFromConversation === "wechat";

  useEffect(() => {
    let timer1: NodeJS.Timeout | undefined = undefined;

    function fetchMessageFromUser(selectedChannelFromConversation: string) {
      setLoading(true);
      get(GET_CONVERSATIONS_MESSAGES.replace("{id}", conversationId), {
        param: {
          channel: aliasChannelName(
            selectedChannelFromConversation as ChannelType
          ),
          channelIds:
            selectedChannelIdFromConversation ||
            getChannelInstanceId(selectedChannelFromConversation, profile),
          limit: 1,
          isFromUser: true,
          isFromImport: false,
          beforeTimeStamp: moment.utc().utcOffset(utcOffset).unix(),
        },
      })
        .then((twilioCustomerMessages: MessageType[]) => {
          const lastMessageFromCustomer = getLatestMessage(
            twilioCustomerMessages
          );
          if (lastMessageFromCustomer) {
            setLatestMessageExist(lastMessageFromCustomer);
            const isConversationWithinOfficialWindow =
              getIsConversationWithinOfficialWindow(lastMessageFromCustomer);
            setIsWithinTimeRange(isConversationWithinOfficialWindow);
          } else {
            setIsWithinTimeRange(false);
          }
        })
        .catch((error) => {
          console.error(
            `fetch latest customer message from twilio error ${error}`
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }

    if (isChannelForDisplayBanner && selectedChannelFromConversation) {
      if (
        !foundMessageExist ||
        !isSameChannel(
          foundMessageExist,
          profile.conversationId,
          selectedChannelFromConversation,
          selectedChannelIdFromConversation
        )
      ) {
        const latestMessageTime = latestCustomerMessage
          ? getIsConversationWithinOfficialWindow(latestCustomerMessage)
          : undefined;

        if (
          !latestMessageTime ||
          !(
            latestCustomerMessage &&
            isSameChannel(
              latestCustomerMessage,
              profile.conversationId,
              selectedChannelFromConversation,
              selectedChannelIdFromConversation
            )
          )
        ) {
          fetchMessageFromUser(selectedChannelFromConversation);
        } else {
          setIsWithinTimeRange(true);
          setLatestMessageExist(latestCustomerMessage);
        }
      }
    } else {
      setLatestMessageExist(undefined);
    }
    return () => {
      timer1 && clearTimeout(timer1);
    };
  }, [
    latestCustomerMessage?.id,
    selectedChannelIdFromConversation,
    profile.conversationId,
    isChannelForDisplayBanner,
  ]);
  useEffect(() => {
    loginDispatch({
      type: isWithTimeRange
        ? "HIDE_TWILIO_TEMPLATE_MESSAGE"
        : "SHOW_TWILIO_TEMPLATE_MESSAGE",
    });
  }, [isWithTimeRange]);
  const [_, foundMessageTimestampAddOneDay] = foundMessageExist
    ? getConversationOfficialWindow(foundMessageExist)
    : [undefined, undefined];

  return foundMessageExist || isChannelForDisplayBanner ? (
    <div
      className={`twilio-info-message ${
        selectedChannelFromConversation === "wechat" ? "wechat" : ""
      }`}
    >
      {loading ? (
        <div className="loader">
          <Placeholder>
            <Placeholder.Line />
          </Placeholder>
        </div>
      ) : (
        getDisplayMessageContent(
          t,
          currentPlan,
          selectedChannelFromConversation as ChannelType,
          foundMessageTimestampAddOneDay ?? moment.utc(),
          isWithTimeRange
        )
      )}
    </div>
  ) : (
    <div></div>
  );
}

function isSameChannel(
  message: MessageType,
  conversationId: string,
  selectedChannel: string,
  selectedChannelId?: string
) {
  if (message.conversationId !== conversationId) {
    return false;
  }
  if (selectedChannel === "whatsapp360dialog") {
    return (
      String(message.whatsapp360DialogSender?.channelId) === selectedChannelId
    );
  } else if (selectedChannel === "twilio_whatsapp") {
    return message.whatsappSender?.instanceId === selectedChannelId;
  } else if (selectedChannel === "facebook") {
    return message.facebookSender?.pageId === selectedChannelId;
  }
  return false;
}

function getDisplayMessageContent(
  t: TFunction,
  currentPlan: PlanType,
  channel: ChannelType,
  foundMessageTimestampAddOneDay: Moment,
  isWithTimeRange: boolean
) {
  if (!isWithTimeRange) {
    return channel === "facebook" ? (
      t("chat.facebook.reply.useTemplate.outOfTimeRange")
    ) : channel === "wechat" ? (
      <Trans i18nKey="chat.wechat.reply.useTemplate.outOfTimeRange">
        Unable to send message via WeChat since the 48-hour conversation window
        is over.
        <br />
        You can only send messages after the customer reactivates the chat.
      </Trans>
    ) : isFreePlan(currentPlan) ? (
      t("chat.twilio.reply.useTemplate.free")
    ) : (
      t("chat.twilio.reply.useTemplate.paid")
    );
  }
  const now = moment.utc();
  const diffInHour = foundMessageTimestampAddOneDay.diff(now, "hours");
  const diffInMinute = foundMessageTimestampAddOneDay.diff(now, "minutes");
  const diffInDay = foundMessageTimestampAddOneDay.diff(now, "days");

  if (channel === "facebook") {
    const remainingHourForDay = diffInHour % 24;
    return diffInDay > 0
      ? t("chat.facebook.reply.timeRemains.day", {
          count: diffInDay,
          remaningDay: remainingHourForDay,
        })
      : diffInHour > 0
      ? t("chat.facebook.reply.timeRemains.hour", { count: diffInHour })
      : t("chat.facebook.reply.timeRemains.min", { count: diffInMinute });
  } else if (channel === "wechat") {
    return diffInHour > 0
      ? t("chat.wechat.reply.timeRemains.hour", { count: diffInHour })
      : t("chat.wechat.reply.timeRemains.min", { count: diffInMinute });
  } else {
    return diffInHour > 0
      ? t("chat.twilio.reply.timeRemains.hour", { count: diffInHour })
      : t("chat.twilio.reply.timeRemains.min", { count: diffInMinute });
  }
}
