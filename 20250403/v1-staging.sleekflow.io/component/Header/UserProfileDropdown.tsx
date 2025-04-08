import React, { useRef, useState } from "react";
import { Dropdown, Icon, Portal } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { AwayToggle, checkActiveStatus } from "./AwayToggle";
import { createPopper, Instance } from "@popperjs/core";
import { useTranslation } from "react-i18next";
import { AgentNameToggle } from "./AgentNameToggle";
import Cookie from "js-cookie";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import AccountPic from "./AccountPic";
import styles from "./UserProfileDropdown.module.css";
import iconStyles from "../shared/Icon/Icon.module.css";
import { useSignalRGroup } from "component/SignalR/useSignalRGroup";
import { StaffType } from "types/StaffType";
import {
  isAdminRole,
  isStaffRole,
  isTeamAdminRole,
} from "component/Settings/helpers/AccessRulesGuard";
import { useAuth0 } from "@auth0/auth0-react";
import { equals } from "ramda";
import { logoutWithLocale } from "auth/Auth0ProviderWithRedirect";
import { SleekflowBetaMenuItem } from "./SleekflowBetaMenuItem/SleekflowBetaMenuItem";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import mixpanel from "mixpanel-browser";
import { LOCATION_STORAGE_KEY } from "./PostLogin";
import { USER_PERMISSION_STORAGE_KEY } from "api/Setting/CompanyRBACContext";
export function logoutReturnTo(connectionStrategy?: string) {
  switch (connectionStrategy) {
    case "adfs":
      return {
        returnTo: "https://adfs.shkp.com/adfs/ls?wa=wsignoutcleanup1.0",
      };
    case "oidc":
      return {
        returnTo:
          "https://sso-uat1.hongyip.com/auth/realms/hy-sso-uat1/protocol/openid-connect/logout",
      };
    default:
      return {
        returnTo: window.location.origin,
      };
  }
}
interface UserProfileMenuProps {
  open: boolean;
  setMenuOpen: (status: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  fullName: string;
  profilePic: string;
}

export default function UserProfileDropdown(props: { fullName?: boolean }) {
  const [fullName, profilePic, displayName] = useAppSelector((s) => {
    const fullName =
      s.loggedInUserDetail?.userInfo.firstName &&
      s.loggedInUserDetail?.userInfo.lastName
        ? s.loggedInUserDetail?.userInfo.firstName +
          " " +
          s.loggedInUserDetail?.userInfo.lastName
        : s.loggedInUserDetail?.userInfo.userName ?? "";

    return [
      fullName,
      s.loggedInUserDetail?.profilePicture?.profilePictureId ?? "",
      s.loggedInUserDetail?.userInfo.displayName ?? "",
    ];
  }, equals);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={`ui dropdown ${styles.staffImage}`}
        onDoubleClick={() => setOpen(false)}
        onClick={() => setOpen(true)}
        ref={divRef}
      >
        <div className={styles.staffImgContainer}>
          <AccountPic
            userName={displayName ?? fullName}
            profilePic={profilePic}
          />
        </div>
        <label>{displayName ?? fullName}</label>
        <Icon name="chevron down" />
      </div>
      <UserProfileMenu
        open={open}
        setMenuOpen={setOpen}
        triggerRef={divRef}
        fullName={displayName ?? fullName}
        profilePic={profilePic}
      />
    </>
  );
}

const UserProfileMenu = React.memo(function UserProfileMenu(
  props: UserProfileMenuProps
) {
  const { open, setMenuOpen, triggerRef, fullName, profilePic } = props;
  const [popper, setPopper] = useState<Instance | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const accessRuleGuard = useAccessRulesGuard();
  const isResellerClient = accessRuleGuard.isResellerClient();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { logout, user } = useAuth0();
  const featureGuard = useFeaturesGuard();
  const loggedInUserDetail = useAppSelector((s) => s.loggedInUserDetail);
  const isAdmin = useAppSelector((s) =>
    s.loggedInUserDetail ? isAdminRole(s.loggedInUserDetail) : false
  );
  const isTeamAdmin = useAppSelector((s) =>
    s.loggedInUserDetail ? isTeamAdminRole(s.loggedInUserDetail) : false
  );
  const isStaff = useAppSelector((s) =>
    s.loggedInUserDetail ? isStaffRole(s.loggedInUserDetail) : false
  );
  const role = isAdmin
    ? t("system.user.role.admin.name")
    : isTeamAdmin
    ? t("system.user.role.teamAdmin.name")
    : isStaff && t("system.user.role.staff.name");
  const loginDispatch = useAppDispatch();
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);

  useSignalRGroup(
    signalRGroupName,
    {
      OnStaffInfoUpdated: [
        (state, user: StaffType) => {
          if (!state.loggedInUserDetail) {
            return;
          }
          loginDispatch({
            type: "UPDATE_LOGGEDIN_USER_DETAIL",
            loggedInUserDetail: {
              ...(state.loggedInUserDetail as StaffType),
              status: checkActiveStatus(user.status)
                ? t("chat.buttons.status.active")
                : t("chat.buttons.status.away"),
            },
          });
        },
      ],
    },
    "UserProfileMenu"
  );

  function handleOpen() {
    if (!triggerRef.current || !dropdownRef.current) {
      return;
    }

    const popper = createPopper(triggerRef.current, dropdownRef.current, {
      placement: "bottom-start",
    });
    setPopper(popper);
  }

  function handleClose() {
    if (popper) {
      popper.destroy();
      setPopper(null);
    }
    setMenuOpen(false);
  }

  return (
    <Portal
      mountNode={triggerRef.current}
      open={open}
      transition={{ duration: 0 }}
      onOpen={handleOpen}
      onClose={handleClose}
      closeOnDocumentClick
    >
      <div ref={dropdownRef}>
        <Dropdown.Menu open className={`${styles.mainMenu} ${styles.rounded}`}>
          <div className={styles.userProfile}>
            <div className={styles.title}>
              {t("nav.menu.settings.myAccount")}
            </div>
            <section className={styles.accountContainer}>
              <AccountPic userName={fullName} profilePic={profilePic} />
              <div className={styles.info}>
                <span className={styles.username}>{fullName}</span>
                <span className={styles.role}>{role}</span>
              </div>
            </section>

            <AgentNameToggle />
            <AwayToggle />
            <Dropdown.Item key="settings" value="settings">
              <Link
                onClick={() => Cookie.set("skipChannels", "true")}
                to="/settings/generalinfo"
              >
                {t("nav.menu.settings.settings")}
              </Link>
            </Dropdown.Item>
            <div className={styles.hr} />
            {!isResellerClient && (
              <Dropdown.Item value="helpCenter" key="helpCenter">
                <span className={`${iconStyles.icon} ${styles.questionIcon}`} />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.sleekflow.io/getting-started/start-exploring"
                >
                  {t("nav.menu.helpCenter")}
                </a>
              </Dropdown.Item>
            )}
            <Dropdown.Item key="video-tutorials" value="videoTutorials">
              <span
                className={`${iconStyles.icon} ${styles.videoTutorialsIcon}`}
              />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.youtube.com/playlist?list=PLgRKbBLqmfm6vZVOorm0f7uWaI28_y9kU"
              >
                {t("nav.buttons.videoTutorials")}
              </a>
            </Dropdown.Item>
            <Dropdown.Item key="sign-out" value="settings">
              <span className={`${iconStyles.icon} ${styles.logoutIcon}`} />
              <a
                onClick={() => {
                  mixpanel.reset();
                  localStorage.setItem(LOCATION_STORAGE_KEY, "");
                  localStorage.setItem(USER_PERMISSION_STORAGE_KEY, "");
                  logoutWithLocale(
                    logout,
                    language,
                    user?.["https://app.sleekflow.io/connection_strategy"]
                  );
                }}
                href="#"
              >
                {t("nav.buttons.signOut")}
              </a>
            </Dropdown.Item>
          </div>
          <SleekflowBetaMenuItem />
        </Dropdown.Menu>
      </div>
    </Portal>
  );
});
