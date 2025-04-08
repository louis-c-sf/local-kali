import { Image } from "semantic-ui-react";
import React from "react";
import SentImg from "../../../assets/images/message-status/check.svg";
import ClockImg from "../../../assets/images/message-status/clock.svg";
import ReadImg from "../../../assets/images/message-status/read.svg";
import UnreadImg from "../../../assets/images/message-status/unread.svg";
import ErrorImg from "../../../assets/images/message-status/error.svg";
import { Trans } from "react-i18next";
import { TFunction } from "i18next";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { ChannelType } from "../Messenger/types";
import {
  getFbErrorCodeMap,
  getTwilioErrorCodeMap,
} from "../../../config/MessageErrorCodeMapping";
import useRouteConfig from "config/useRouteConfig";

const EXCEED_TWILIO_MESSAGE_LIMIT = "63018";

function ErrorMessage({
  channel,
  status,
  statusCode,
  t,
  channelStatusMessage,
}: {
  t: TFunction;
  channel: ChannelType;
  status: string;
  statusCode?: string;
  channelStatusMessage?: string;
}) {
  const twilioErrorCodeMap = getTwilioErrorCodeMap(t);
  const { routeTo } = useRouteConfig();
  const outside7dElement = (
    <Trans i18nKey="chat.facebookOTN.message.error.outside7d">
      This message is sent outside of allowed window. Learn more about the new
      policy here:
      <a
        target="_blank"
        rel="noreferrer"
        href="https://developers.facebook.com/docs/messenger-platform/policy-overview"
      >
        https://developers.facebook.com/docs/messenger-platform/policy-overview
      </a>
    </Trans>
  );
  const fbErrorCodeMap = getFbErrorCodeMap(t, outside7dElement);
  const getChannelStatusMessageMap = () => {
    if (!channelStatusMessage) {
      return;
    }
    if (
      channelStatusMessage.includes(
        "(#100) Invalid parameter - Param text cannot have new-line/tab characters or more than 4 consecutive spaces"
      )
    ) {
      return t("chat.cloudApi.errorMessage.paramIncludeTabSpace");
    } else if (
      channelStatusMessage.includes(
        "(#100) Invalid parameter - Parameter Invalid"
      )
    ) {
      return t("chat.cloudApi.errorMessage.paramInvalid");
    } else if (
      channelStatusMessage.includes(
        "(#100) The parameter interactive['body']['text'] is required."
      )
    ) {
      return t("chat.cloudApi.errorMessage.paramRequired");
    } else if (
      channelStatusMessage.includes(
        "(#131009) Parameter value is not valid - Body text length invalid. Min length: 1, Max length: 1024"
      )
    ) {
      return t("chat.cloudApi.errorMessage.paramLengthInvalid");
    } else if (
      channelStatusMessage.includes(
        "(#131009) Parameter value is not valid - Invalid buttons count. Min allowed buttons: 1, Max allowed buttons: 3"
      )
    ) {
      return t("chat.cloudApi.errorMessage.buttonCountInvalid");
    } else if (
      channelStatusMessage.includes(
        "(#100) Param template['components'][0]['parameters'][0]['image']['id'] is not a valid whatsapp business account media attachment ID"
      )
    ) {
      return t("chat.cloudApi.errorMessage.mediaIdInvalid");
    } else if (
      channelStatusMessage.includes(
        "(#132000) Number of parameters does not match the expected number of params"
      )
    ) {
      return t("chat.cloudApi.errorMessage.paramCountInvalid");
    } else if (channelStatusMessage.includes("131053 - Image is invalid.")) {
      return t("chat.cloudApi.errorMessage.imageInvalid");
    } else if (
      channelStatusMessage.includes(
        "131047 - Message failed to send because more than 24 hours have passed since the customer last replied to this number."
      )
    ) {
      return t("chat.cloudApi.errorMessage.outside24h");
    } else if (
      channelStatusMessage.includes("131026 - Message Undeliverable.") ||
      channelStatusMessage.includes(
        "131026 - Receiver is incapable of receiving this message"
      )
    ) {
      return t("chat.cloudApi.errorMessage.undeliverable");
    } else if (
      channelStatusMessage.includes(
        "(#132001) Template name does not exist in the translation"
      )
    ) {
      return t("chat.cloudApi.errorMessage.templateNameNotExist");
    } else if (
      channelStatusMessage.includes(
        "1013-Recipient is not a valid WhatsApp user"
      )
    ) {
      return t("chat.cloudApi.errorMessage.recipientInvalid");
    }
  };

  if (status === "failed") {
    if (channel === "facebook") {
      let errorMessage;
      if (statusCode) {
        const errorCode = statusCode.split("-")[0];
        errorMessage =
          fbErrorCodeMap[errorCode] ??
          t("chat.facebookOTN.message.error.unknown");
      }

      return (
        <>
          {statusCode ? (
            <Trans
              i18nKey="chat.alert.facebook.otherError"
              values={{ errorMessage }}
            >
              Your message failed to send. It may be due to one of the
              following:
              <ol>
                <li>
                  The Channel is disconnected. Please re-connect under the
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={routeTo("/channels", true)}
                  >
                    Channels
                  </a>
                  page.
                </li>
                <li>
                  It does not comply with
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags/"
                  >
                    Facebook Messenger Platform Policy
                  </a>
                  .
                </li>
                <li>{errorMessage}</li>
              </ol>
            </Trans>
          ) : (
            <Trans i18nKey="chat.alert.facebook.undelivered">
              Your message failed to send. It may be due to one of the
              following:
              <ol>
                <li>
                  The Channel is disconnected. Please re-connect under the
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={routeTo("/channels", true)}
                  >
                    Channels
                  </a>
                  page.
                </li>
                <li>
                  It does not comply with
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags/"
                  >
                    Facebook Messenger Platform Policy
                  </a>
                  .
                </li>
              </ol>
            </Trans>
          )}
        </>
      );
    }

    if (channel === "twilio_whatsapp") {
      if (statusCode && twilioErrorCodeMap[statusCode]) {
        return <>{twilioErrorCodeMap[statusCode]}</>;
      }

      if (statusCode === EXCEED_TWILIO_MESSAGE_LIMIT) {
        return (
          <Trans i18nKey="chat.alert.whatsapp.twilioMessageLimitError">
            You have reached the daily rate limit of sending template messages.
            We recommend you to send twice the amount of messages within 7 days.
            <br />
            Please refer to
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://support.twilio.com/hc/en-us/articles/360024008153-WhatsApp-Rate-Limiting"
            >
              WhatsApp Rate Limiting
            </a>
            on Twilio for more details.
          </Trans>
        );
      }
    }

    // TODO: translate status when writings are ready
    if (channel === "whatsapp360dialog") {
      return <>{statusCode}</>;
    }

    if (channel === "whatsappcloudapi") {
      return <>{getChannelStatusMessageMap() ?? statusCode}</>;
    }

    return (
      <Trans i18nKey="chat.alert.whatsapp.deviceUnregistered">
        Message failed to send. Possible reasons are:
        <ol>
          <li>The contact is not registered on this channel</li>
          <li>The contact has blocked you on this channel</li>
          <li>You are not following the platform’s policy</li>
          <li>You have not connected to this channel properly</li>
        </ol>
      </Trans>
    );
  }

  if (status === "undelivered") {
    if (channel === "twilio_whatsapp") {
      return (
        <Trans i18nKey="chat.alert.whatsapp.twilio.undelivered">
          A registered template should be used to send messages after the
          24-hour window. Please also check our
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={"/settings/opt-in"}
          >
            Opt-in Button
          </a>
          feature to easily send free form messages.
        </Trans>
      );
    } else if (channel === "whatsappcloudapi") {
      return <>{getChannelStatusMessageMap() ?? statusCode}</>;
    }

    return <>{t("chat.alert.whatsapp.undelivered")}</>;
  }

  if (status === "outofcredit") {
    return <>{t("chat.alert.whatsapp.outofcredit")}</>;
  }

  return null;
}

const getTooltipOffset = (
  status: string,
  channel: string
): [number, number] | undefined => {
  switch (status) {
    case "failed": {
      return channel.toLowerCase().includes("facebook") ? [30, 15] : [82, 15];
    }
    case "undelivered":
    case "outofcredit":
    default:
      return undefined;
  }
};

function StatusImage({ status }: { status: string }) {
  const image = {
    sending: ClockImg,
    sent: SentImg,
    received: UnreadImg,
    read: ReadImg,
    failed: ErrorImg,
    undelivered: ErrorImg,
    outofcredit: ErrorImg,
  }[status];

  return <Image src={image} />;
}

function ChatStatusImage(props: {
  status: string;
  channel: ChannelType;
  statusCode?: string;
  t: TFunction;
  channelStatusMessage?: string;
}) {
  const { t } = props;
  const statusNormalized = props.status.toLowerCase();
  const isErrorStatus = ["failed", "undelivered", "outofcredit"].includes(
    statusNormalized
  );

  return isErrorStatus ? (
    <InfoTooltip
      placement={"right-end"}
      hoverable
      offset={getTooltipOffset(statusNormalized, props.channel)}
      trigger={
        <div className="error-display">
          <div className="text">
            {t("chat.alert.whatsapp.error.failedToSend")}
          </div>
          <div className={`tick ${statusNormalized}`}>
            <StatusImage status={statusNormalized} />
          </div>
        </div>
      }
    >
      <ErrorMessage {...props} status={statusNormalized} t={t} />
    </InfoTooltip>
  ) : (
    <div className={`tick ${statusNormalized}`}>
      <StatusImage status={statusNormalized} />
    </div>
  );
}

export default ChatStatusImage;
