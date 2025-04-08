import { useCompanyStaff } from "api/User/useCompanyStaff";
import { useAppSelector } from "AppRootContext";
import { AddUserFeature } from "component/Settings/AddUserModal/AddUserFeature";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import { Button } from "component/shared/Button/Button";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import useRouteConfig from "config/useRouteConfig";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

export default function InviteUserButton({
  isAllowedToInvite,
  locked,
  isShowUpgradePlan,
}: {
  isAllowedToInvite: boolean;
  isShowUpgradePlan: boolean;
  locked?: boolean;
}) {
  const [inviteUsersVisible, setInviteUsersVisible] = useState(false);
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const companyStaff = useCompanyStaff();
  const { t } = useTranslation();
  const featureGuard = useFeaturesGuard();
  const isAllowedRegion = useAppSelector((s) =>
    featureGuard.isRegionAllowedToInviteUser(s.userWorkspaceLocation || "")
  );
  const isCompanyAllowedToInviteUser =
    featureGuard.isCompanyAllowedToInviteUser();
  function goToInviteUser() {
    if (locked) {
      setInviteUsersVisible(true);
    } else {
      return history.push({
        pathname: routeTo("/settings/usermanagement"),
        state: {
          openInviteUserModal: true,
        },
      });
    }
  }
  if (!isAllowedToInvite) {
    return null;
  }
  return (
    <div className="info-section">
      {process.env.REACT_APP_ENABLE_NEW_SIGNUP === "false" ? (
        isAllowedRegion && isCompanyAllowedToInviteUser ? (
          <Button
            className={"feedback-button"}
            primary={!isShowUpgradePlan}
            onClick={goToInviteUser}
          >
            {t("account.inviteUser.button")}
          </Button>
        ) : (
          <DisabledInviteUserButtonWithToolTip>
            {!isCompanyAllowedToInviteUser
              ? t("account.inviteUser.companyNotAllowToInviteTooltip")
              : t("account.inviteUser.notAllowToInviteTooltip")}
          </DisabledInviteUserButtonWithToolTip>
        )
      ) : (
        <Button
          className={"feedback-button"}
          primary={!isShowUpgradePlan}
          onClick={goToInviteUser}
        >
          {t("account.inviteUser.button")}
        </Button>
      )}
      {locked && inviteUsersVisible && (
        <AddUserFeature
          hide={() => setInviteUsersVisible(false)}
          refreshStaff={companyStaff.refresh}
        />
      )}
    </div>
  );
}
export function DisabledInviteUserButtonWithToolTip(props: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <InfoTooltip
      placement="bottom"
      hoverable
      trigger={
        <div className="ui button disabled" onClick={undefined}>
          {t("account.inviteUser.button")}
        </div>
      }
    >
      {props.children}
    </InfoTooltip>
  );
}
