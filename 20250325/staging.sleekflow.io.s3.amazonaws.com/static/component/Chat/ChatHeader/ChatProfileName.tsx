import React from "react";
import { Header } from "semantic-ui-react";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import RedirectIcon from "../../../assets/tsx/icons/RedirectIcon";
import redirectIconStyles from "../../shared/RedirectIcon.module.css";
import { useProfileDisplayName } from "../utils/useProfileDisplayName";
import { equals } from "ramda";
import useRouteConfig from "config/useRouteConfig";

export default ChatProfileName;

function ChatProfileName() {
  const { profileDisplayName } = useProfileDisplayName();
  const profile = useAppSelector((s) => s.profile, equals);
  const { t } = useTranslation();

  return (
    <InfoTooltip
      children={t("chat.tooltip.contact.view")}
      placement={"top"}
      offset={[50, 10]}
      trigger={
        <ProfileClickableName
          hasIcon={true}
          profileId={profile.id}
          profileName={profileDisplayName(profile)}
        />
      }
    />
  );
}

export function ProfileClickableName(props: {
  profileId: string;
  profileName: string;
  hasIcon: boolean;
}) {
  const { profileId, profileName, hasIcon } = props;
  const { routeTo } = useRouteConfig();
  return (
    <a
      target="_blank"
      rel="noreferrer noopener"
      href={routeTo(`/profile/${profileId}`, true)}
      className={redirectIconStyles.headerClickArea}
    >
      <Header as="h4" content={profileName} className="name" />
      {hasIcon && <RedirectIcon className={redirectIconStyles.redirectIcon} />}
    </a>
  );
}
