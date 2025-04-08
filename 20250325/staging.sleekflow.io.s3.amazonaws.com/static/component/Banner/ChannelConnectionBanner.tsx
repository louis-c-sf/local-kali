import moment from "moment";
import { equals, last } from "ramda";
import React, { ReactNode, useState } from "react";
import {
  FacebookConfigType,
  WhatsAppChatAPIConfigType,
} from "../../types/CompanyType";
import Cookies from "js-cookie";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { Icon, Portal } from "semantic-ui-react";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import {
  BannerOrderAndClassNameList,
  getIsCurrentBannerShow,
} from "./helper/getIsCurrentBannerShow";
import { BannerEnum } from "./types/BannerEnum";

function checkWhatsappConnecting(whatsappChannel: WhatsAppChatAPIConfigType) {
  return (
    moment.utc(whatsappChannel.connectedDateTime).isBefore(moment.utc()) &&
    moment
      .utc()
      .isBefore(moment.utc(whatsappChannel.connectedDateTime).add(5, "minutes"))
  );
}

function checkWhatsappNotSync(whatsappChannel: WhatsAppChatAPIConfigType) {
  const connectedDateTime = whatsappChannel.connectedDateTime;
  return (
    !whatsappChannel.lastSyncedAt &&
    moment.utc(connectedDateTime).add(5, "minutes").isBefore(moment.utc()) &&
    moment.utc().isBefore(moment.utc(connectedDateTime).add(48, "hours"))
  );
}

function checkWhatsappSyncing(channel: WhatsAppChatAPIConfigType) {
  const lastSyncedAt = channel.lastSyncedAt;
  return (
    channel.lastSyncedAt !== undefined &&
    moment.utc().isBefore(moment.utc(lastSyncedAt).add(6, "hours")) &&
    !["Synced", "Authenticated", "Loading"].includes(channel.status)
  );
}

function checkFacebookConnecting(facebook: FacebookConfigType) {
  return (
    moment.utc(facebook.connectedDateTime).isBefore(moment.utc()) &&
    moment
      .utc()
      .isBefore(moment.utc(facebook.connectedDateTime).add(60, "minutes"))
  );
}

export function sortByConnectedDate(
  channelA: WhatsAppChatAPIConfigType | FacebookConfigType,
  channelB: WhatsAppChatAPIConfigType | FacebookConfigType
) {
  return moment
    .utc(channelA.connectedDateTime)
    .diff(channelB.connectedDateTime);
}

function sortByLastSyncAt(
  channelA: WhatsAppChatAPIConfigType,
  channelB: WhatsAppChatAPIConfigType
) {
  if (!channelA.lastSyncedAt || !channelB.lastSyncedAt) {
    return 1;
  }
  return moment.utc(channelA.lastSyncedAt).diff(channelB.lastSyncedAt);
}

interface ConnectionBannerType {
  [key: string]: {
    text: string;
    action?: ReactNode;
    className: string;
  };
}

export default function ChannelConnectionBanner() {
  const company = useAppSelector((s) => s.company, equals);
  const usage = useAppSelector((s) => s.usage, equals);
  const connectionBanner = useAppSelector((s) => s.connectionBanner, equals);

  const loginDispatch = useAppDispatch();
  const [isClose, setClose] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const currentBanner = BannerEnum.channelConnection;

  if (!company) {
    return null;
  }
  const firstConnectedWhatsapp =
    company.wsChatAPIConfigs?.sort(sortByConnectedDate)?.[0];
  const latestConnectedWhatsapp = last(
    company.wsChatAPIConfigs?.sort(sortByConnectedDate) ?? []
  );
  const latestSyncedWhatsapp = last(
    company.wsChatAPIConfigs?.sort(sortByLastSyncAt) ?? []
  );
  const latestFacebook = last(
    company.facebookConfigs?.sort(sortByConnectedDate) ?? []
  );
  let isWhatsappOfficialPromo = false;
  let isConnecting = false;
  let isSyncing = false;
  let isNotSynced = false;
  let isFacebookConnecting = false;
  let bannerStatus = "";
  const ref = document.body;
  const connectionBannerMapping: ConnectionBannerType = {
    syncing: {
      text: t("channels.whatsapp.connection.syncing.message"),
      className: "syncing-status",
    },
    whatsappNotSync: {
      text:
        usage.maximumContacts > 100000
          ? t("channels.whatsapp.connection.remindSync.unlimitedMessage")
          : t("channels.whatsapp.connection.remindSync.message", {
              numOfContact: usage.maximumContacts,
            }),
      action: (
        <div
          className="ui button"
          onClick={() => {
            history.push(routeTo("/channels"));
          }}
        >
          {t("channels.whatsapp.connection.button.goToChannels")}
        </div>
      ),
      className: "not-synced",
    },
    whatsappConnecting: {
      text: t("channels.whatsapp.connection.connecting.message"),
      action: (
        <div
          className="ui button"
          onClick={() => {
            loginDispatch({
              type: "SHOW_CHATAPI_GUIDE",
            });
          }}
        >
          {t("channels.whatsapp.connection.button.checkReminders")}
        </div>
      ),
      className: "connected-status",
    },
    whatsappOfficialPromo: {
      text: t("channels.whatsapp.connection.applyOfficial"),
      action: (
        <div
          className="ui button"
          onClick={() => {
            history.push(routeTo("/channels/official/whatsapp/video"));
          }}
        >
          {t("channels.whatsapp.connection.button.apply")}
        </div>
      ),
      className: "whatsapp-official-promo",
    },
    fbConnecting: {
      text: t("channels.facebook.connection.connecting.message"),
      className: "connected-status",
    },
  };

  if (firstConnectedWhatsapp) {
    const isNotOfficial =
      company.whatsAppConfigs && company.whatsAppConfigs?.length === 0;
    if (
      !isNotOfficial ||
      !moment(firstConnectedWhatsapp.connectedDateTime).isValid()
    ) {
      return null;
    }
    let promoDays = [30, 90, 180];
    const restPromoDays = Cookies.get("restPromoDays");
    try {
      if (restPromoDays) {
        promoDays = JSON.parse(restPromoDays);
      }
    } catch (e) {
      console.error(e);
    }
    const daysAfterConnected = moment().diff(
      moment(firstConnectedWhatsapp.connectedDateTime),
      "days"
    );
    if (daysAfterConnected >= 7) {
      isWhatsappOfficialPromo = true;
      if (
        Cookies.get("whatsappOfficialPromo") === "closed" &&
        promoDays.includes(daysAfterConnected)
      ) {
        Cookies.remove("whatsappOfficialPromo");
        Cookies.set(
          "restPromoDays",
          JSON.stringify(promoDays.filter((d) => d !== daysAfterConnected))
        );
      }
    }
  }

  if (latestConnectedWhatsapp) {
    isConnecting =
      checkWhatsappConnecting(latestConnectedWhatsapp) &&
      !latestSyncedWhatsapp?.isBeta;
    if (!isConnecting) {
      isNotSynced = checkWhatsappNotSync(latestConnectedWhatsapp);
    }
    if (latestSyncedWhatsapp) {
      isSyncing = checkWhatsappSyncing(latestSyncedWhatsapp);
    }
  }
  if (latestSyncedWhatsapp) {
    if (latestConnectedWhatsapp && (isConnecting || isNotSynced)) {
      if (
        moment
          .utc(latestSyncedWhatsapp.connectedDateTime)
          .isBefore(moment.utc(latestSyncedWhatsapp.connectedDateTime))
      ) {
        isSyncing = false;
      }
    }
  }
  if (latestFacebook) {
    isFacebookConnecting = checkFacebookConnecting(latestFacebook);
    if (isFacebookConnecting) {
      if (latestConnectedWhatsapp && (isConnecting || isNotSynced)) {
        if (
          moment
            .utc(latestFacebook.connectedDateTime)
            .isBefore(moment.utc(latestConnectedWhatsapp.connectedDateTime))
        ) {
          isFacebookConnecting = false;
        }
      } else if (latestSyncedWhatsapp && isSyncing) {
        if (
          moment
            .utc(latestFacebook.connectedDateTime)
            .isBefore(moment.utc(latestSyncedWhatsapp.connectedDateTime))
        ) {
          isFacebookConnecting = false;
        }
      }
    }
  }
  if (isSyncing) {
    bannerStatus = "syncing";
  } else if (isFacebookConnecting) {
    bannerStatus = "fbConnecting";
  } else if (isConnecting) {
    bannerStatus = "whatsappConnecting";
  } else if (isWhatsappOfficialPromo) {
    bannerStatus = "whatsappOfficialPromo";
  } else if (isNotSynced) {
    bannerStatus = "whatsappNotSync";
  }
  if (
    bannerStatus !== "" &&
    !isClose &&
    !Cookies.get(bannerStatus) &&
    !connectionBanner[bannerStatus]
  ) {
    loginDispatch({
      type: "SHOW_CONNECTION_BANNER",
      bannerType: bannerStatus,
    });
  }
  const bannerHiddenCondition =
    !getIsCurrentBannerShow(ref, currentBanner) ||
    bannerStatus === "" ||
    !connectionBanner[bannerStatus];
  if (bannerHiddenCondition) {
    delete ref.dataset[BannerOrderAndClassNameList.channelConnectionBanner];
    return null;
  }

  const closeButtonClick = () => {
    loginDispatch({
      type: "HIDE_CONNECTION_BANNER",
      bannerType: bannerStatus,
    });
    Cookies.set(bannerStatus, "closed");
    bannerStatus = "";
    delete ref.dataset[BannerOrderAndClassNameList.channelConnectionBanner];
    setClose(true);
  };
  if (!bannerHiddenCondition) {
    ref.dataset[BannerOrderAndClassNameList.channelConnectionBanner] = "true";
  }

  return (
    <Portal open={!bannerHiddenCondition} mountNode={ref}>
      <div
        className={`top-display-banner ${
          connectionBannerMapping[bannerStatus]?.className ?? ""
        }`}
      >
        <div className="content">
          {connectionBannerMapping[bannerStatus]?.text}
          {connectionBannerMapping[bannerStatus]?.action}
        </div>
        <CloseButton
          onClick={closeButtonClick}
          inverse={bannerStatus === "whatsappOfficialPromo"}
        />
      </div>
    </Portal>
  );
}

export function CloseButton(props: { onClick: Function; inverse?: Boolean }) {
  const { onClick, inverse } = props;
  return (
    <span className={"close-button"}>
      <Icon
        name={"close"}
        onClick={onClick}
        className={inverse ? "md-white" : ""}
      />
    </span>
  );
}
