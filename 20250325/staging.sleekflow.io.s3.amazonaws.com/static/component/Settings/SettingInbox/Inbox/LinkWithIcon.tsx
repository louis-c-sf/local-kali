import React from "react";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../../config/useRouteConfig";
import { Image } from "semantic-ui-react";
import LinkToIcon from "./assets/link-to.svg";
import styles from "./linkWithIcon.module.css";

export default function LinkWithIcon() {
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  return (
    <a
      target="_blank"
      className={`link ${styles.linkWithIcon}`}
      href={routeTo("/settings/teams", true)}
    >
      <span>
        {t("settings.inbox.channels.viewMessagesFromDefaultChannelsOnly.teams")}
      </span>
      <Image src={LinkToIcon} />
    </a>
  );
}
