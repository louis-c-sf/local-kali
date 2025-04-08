import React from "react";
import { Header } from "semantic-ui-react";
import { FieldValue } from "../component/Contact/NewContact/NewContact";
import { useChatChannelLocales } from "../component/Chat/localizable/useChatChannelLocales";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../AppRootContext";

const ChannelInfoContainer = (props: { customFieldValues: FieldValue }) => {
  const profile = useAppSelector((s) => s.profile);
  const lastChannel =
    profile.lastChannel || props.customFieldValues["LastChannel"];
  const { channelNameDisplay } = useChatChannelLocales();

  const { t } = useTranslation();
  const lastChannelName = channelNameDisplay[lastChannel] || "";

  return (
    <div className="container padded channel-info">
      <Header as="h4">{t("chat.sidebar.channel.header")}</Header>
      <div className="channel-info">
        {lastChannel && (
          <div className="detail" style={{ justifyContent: "space-between" }}>
            <span className="name">
              {t("chat.sidebar.channel.lastChannel")}
            </span>
            <span className="value">{lastChannelName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChannelInfoContainer;
