import React, { ReactNode, useEffect, useState } from "react";
import { Image, Popup } from "semantic-ui-react";
import { ChannelInfoConfiguredType } from "../../types/ChannelInfoType";
import { getChannelLabels, getConfigId } from "./selectors";
import { get } from "../../api/apiRequest";
import {
  GET_FACEBOOK_API_STATUS,
  GET_WHATSAPP_STATUS,
} from "../../api/apiPath";
import {
  FacebookStatusType,
  WhatsAppChatAPIConfigType,
} from "../../types/CompanyType";
import { useChatChannelLocales } from "../Chat/localizable/useChatChannelLocales";
import { useAppSelector } from "../../AppRootContext";
import {
  WhatsappAccessLabel,
  WhatsappAccessLevel,
} from "../CreateWhatsappFlow/WhatsappAccessLabel";
import styles from "./ChannelActive.module.css";
import { ChannelActions } from "./ChannelActive/ChannelActions";
import { ChannelsAction } from "./channelsReducer";
import MessageLimitLabel from "./Whatsapp/MessageLimitLabel";
import { equals } from "ramda";
import { useTranslation } from "react-i18next";
import { isExpired } from "api/Channel/useFetchShopifyStatus";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";

type ChannelActiveProps =
  | {
      channel: ChannelInfoConfiguredType<any>;
      dispatch: (action: ChannelsAction) => void;
      noMargin?: boolean;
      hideActions: false;
      shopifyPlanId?: string;
      stripePublicKey?: string;
    }
  | {
      channel: ChannelInfoConfiguredType<any>;
      noMargin?: boolean;
      hideActions: true;
    };

export function ChannelActive(props: ChannelActiveProps) {
  const { channel, noMargin = false } = props;
  const { title: channelName, image } = channel;
  const company = useAppSelector((s) => s.company, equals);
  const [status, setStatus] = useState("");
  const featureGuard = useFeaturesGuard();
  const channelLabelsFound = company ? getChannelLabels(channel) : [];
  const { t } = useTranslation();
  useEffect(() => {
    if (channel.name === "whatsapp") {
      const channelId = getConfigId(channel);
      if (!channelId) {
        return;
      }
      get(GET_WHATSAPP_STATUS.replace("{instanceId}", channelId), { param: {} })
        .then((statusResp: WhatsAppChatAPIConfigType) => {
          setStatus(statusResp.status);
        })
        .catch((e) => {
          console.error(`Fetch chatapi status error ${e}`);
        });
    } else if (channel.name === "facebook") {
      const channelId = getConfigId(channel);
      if (!channelId) {
        return;
      }
      get(GET_FACEBOOK_API_STATUS.replace("{pageId}", channelId), {
        param: {},
      })
        .then((status: FacebookStatusType) => {
          setStatus(status.status);
        })
        .catch((e) => {
          console.error("unable to connect", e);
        });
    }
  }, [channel.name, getConfigId(channel)]);

  const { channelNameDisplay, statusTooltips } = useChatChannelLocales();

  function getChannelDisplayTitle() {
    if (
      channel.name === "whatsappcloudapi" ||
      channel.name === "whatsappCatalog"
    ) {
      return channelNameDisplay[channel.name];
    }
    if (channel.name.includes("whatsapp")) {
      return `${channelNameDisplay[channel.name]} - ${channelName}`;
    }
    return channelName;
  }

  const isWhatsapp360DialogChannel = channel.name === "whatsapp360dialog";

  function getChannelAbilities(accessLevel: WhatsappAccessLevel) {
    return statusTooltips["whatsapp360dialog"][accessLevel] as ReactNode[];
  }
  return (
    <div className={`${styles.channel} ${noMargin ? styles.noMargin : ""}`}>
      <div className={styles.image}>
        <Image src={image} />
      </div>
      <div className={styles.description}>
        <div className={styles.name}>{getChannelDisplayTitle()}</div>
        <div className={styles.params}>
          {channelLabelsFound.map((l, i) => (
            <span key={i}>
              <span className={"param-label"}>{l}</span>
              <span className={styles.divider}>
                {i + 1 < channelLabelsFound.length ? " | " : ""}
              </span>
            </span>
          ))}
        </div>
        <div className={styles.labels}>
          {channel.name === "whatsapp" && (
            <span className={`${styles.label} ${styles.vendor}`}>ChatAPI</span>
          )}
          {isWhatsapp360DialogChannel && (
            <span className={`${styles.label} ${styles.vendor}`}>
              360 Dialog
            </span>
          )}
          {channel.name === "twilio_whatsapp" && (
            <span className={`${styles.label} ${styles.vendor}`}>Twilio</span>
          )}
          {channel.name === "whatsapp" && (
            <StatusTooltip status={status} channel={"whatsapp"} />
          )}
          {!featureGuard.isShopifyAccount() &&
            channel.name === "shopify" &&
            isExpired(channel.config.billRecord?.periodEnd) && (
              <span className={`${styles.label} ${styles.discontinued}`}>
                {t("channels.subscriptionEnded")}
              </span>
            )}
          {channel.name === "whatsappcloudapi" && (
            <MessageLimitLabel
              messageLimit={
                channel.config.facebookPhoneNumberMessagingLimitTier
              }
            />
          )}
          {isWhatsapp360DialogChannel && channel.accessLevel !== undefined && (
            <WhatsappAccessLabel
              level={channel.accessLevel}
              size={"small"}
              abilities={getChannelAbilities(channel.accessLevel)}
            />
          )}
          {channel.name === "facebook" && (
            <StatusTooltip status={status} channel={"facebook"} />
          )}
        </div>
      </div>
      <div className={styles.buttons}>
        {props.hideActions === false && (
          <ChannelActions
            channel={channel}
            dispatch={props.dispatch}
            status={status}
            shopifyPlanId={props.shopifyPlanId}
            stripePublicKey={props.stripePublicKey}
          />
        )}
      </div>
    </div>
  );
}

function StatusTooltip(props: { status: string; channel: string }) {
  const { status, channel } = props;
  const { channelStatusMapping, statusTooltips } = useChatChannelLocales();
  const statusContent = (
    <span
      className={`${styles.label} ${
        styles[status?.toLowerCase()] || styles.connecting
      }`}
    >
      {channelStatusMapping[status]}
    </span>
  );

  return statusTooltips[channel][status] ? (
    <Popup
      position="top center"
      className={`${styles.statusTooltip} info-tooltip`}
      content={statusTooltips[channel][status]}
      trigger={statusContent}
    />
  ) : (
    statusContent
  );
}
