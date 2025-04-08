import React, { useEffect, useState } from "react";
import { Menu, MenuItemProps } from "semantic-ui-react";
import { useHistory } from "react-router";
import { useAccessRulesGuard } from "./hooks/useAccessRulesGuard";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { useFeaturesGuard } from "./hooks/useFeaturesGuard";
import styles from "./SettingSidebar.module.css";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

interface SidebarPropsType {
  updateMenuItem: Function;
  menuItem: string;
}

const MenuSubHeader = (props: {
  children: React.ReactNode;
  newSection?: boolean;
}) => {
  const { children, newSection } = props;
  return (
    <div
      className={`${styles.subHeader} ${newSection ? styles.newSection : ""}`}
    >
      {children}
    </div>
  );
};

export default function SettingSidebar(props: SidebarPropsType) {
  const { updateMenuItem, menuItem } = props;
  const isRequestedTwilio = useAppSelector((s) =>
    s.company?.twilioUsageRecords
      ? s.company.twilioUsageRecords.length > 0
      : false
  );
  const isRequested360dialog = useAppSelector((s) =>
    s.company?.whatsApp360DialogUsageRecords
      ? s.company.whatsApp360DialogUsageRecords.length > 0
      : false
  );
  const permission = usePermission();
  const accessGuard = useAccessRulesGuard();
  const featureGuard = useFeaturesGuard();
  const isResellerClient = accessGuard.isResellerClient();

  const loginDispatch = useAppDispatch();
  let history = useHistory();
  const [activeItem, setActiveItem] = useState("");
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const ableToUseOfficial = accessGuard.canUseOfficialWhatsapp();
  const ableToOptIn = accessGuard.canShowOptIn();
  const ableToTopUp =
    (isRequestedTwilio && accessGuard.isTwilioSubaccount()) ||
    accessGuard.isCloudAPIUsageRecordExist() ||
    (isRequested360dialog && accessGuard.is360DialogAccount());
  const { isAdmin } = permission;

  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const canAccessSettings = isRbacEnabled
    ? true
    : accessGuard.canAccessSettings();

  const [
    canManagePlansAndBillings,
    canViewUserManagement,
    canViewTeamManagement,
    canManageWhatsappQrCode,
    canManageInboxSettings,
    canViewSavedReplies,
    canViewChannels,
    canViewOfficialWhatsAppTemplates,
    canManageOptIn,
    canManageChannelBilling,
    canEditChannels,
  ] = permission.check(
    [
      PERMISSION_KEY.plansAndBillingsPlanAndSubscriptionManage,
      PERMISSION_KEY.companySettingsUserView,
      PERMISSION_KEY.companySettingsTeamView,
      PERMISSION_KEY.channelQRCodeManage,
      PERMISSION_KEY.inboxSettingsManage,
      PERMISSION_KEY.inboxSavedRepliesView,
      PERMISSION_KEY.channelView,
      PERMISSION_KEY.channelTemplateView,
      PERMISSION_KEY.channelOptInManage,
      PERMISSION_KEY.channelBillingManage,
      PERMISSION_KEY.channelEdit,
    ],
    [
      (accessGuard.canAccessPlanAndSubscription() ||
        featureGuard.isShopifyAccount()) &&
        featureGuard.canShowPlanSubscription() &&
        !isResellerClient,
      canAccessSettings,
      canAccessSettings,
      isAdmin && !isResellerClient,
      canAccessSettings,
      true,
      true,
      true,
      true,
      featureGuard.canShowTopUp(),
      canAccessSettings,
    ]
  );

  const handleItemClick = (e: React.MouseEvent, data: MenuItemProps) => {
    e.stopPropagation();

    const { name } = data;

    if (name === "requestaccess") {
      return;
    }

    if (name === "officialWhatsapp") {
      if (ableToUseOfficial) {
        history.push(routeTo("/settings/templates"));
        return;
      }
      if (ableToTopUp) {
        history.push(routeTo("/settings/topup"));
        return;
      }
    }

    if (name === "teams" && !featureGuard.canUseTeams()) {
      loginDispatch({
        type: "IS_DISPLAY_UPGRADE_PLAN_MODAL",
        isDisplayUpgradePlanModal: true,
      });
      return;
    }

    if (name === "messagemanagement") {
      history.push(routeTo("/settings/inbox"));
      return;
    }

    const menuName = name || "";
    setActiveItem(menuName);
    updateMenuItem(menuName);

    if (menuName === "messagemanagement") {
      setActiveItem("labels");
      updateMenuItem("labels");
      history.push(routeTo(`/settings/inbox/labels`));
      return;
    }

    if (["labels", "quickreplies"].includes(menuName)) {
      history.push(routeTo(`/settings/inbox/${menuName}`));
      return;
    }

    history.push(routeTo(`/settings/${menuName}`));
  };

  useEffect(() => {
    setActiveItem(menuItem);
  }, [menuItem]);

  const requestWhatsappLink = accessGuard.isPaid()
    ? routeTo("/request-whatsapp")
    : routeTo("/onboarding/contact-first");

  return (
    <Menu vertical className="sidebar">
      <Menu.Header as="h4">{t("nav.menu.settings.settings")}</Menu.Header>
      <Menu.Menu>
        <MenuSubHeader>{t("nav.menu.settings.general")}</MenuSubHeader>
        <Menu.Item
          as="a"
          name={"generalinfo"}
          active={activeItem === "generalinfo"}
          onClick={handleItemClick}
        >
          <span>{t("nav.menu.settings.profile")}</span>
        </Menu.Item>
        {canViewUserManagement && (
          <Menu.Item
            as="a"
            name={"usermanagement"}
            active={activeItem === "usermanagement"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.users")}</span>
          </Menu.Item>
        )}
        {canViewTeamManagement && (
          <Menu.Item
            as="a"
            name={"teams"}
            active={activeItem === "teams"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.teams")}</span>
          </Menu.Item>
        )}
        {canManageWhatsappQrCode && (
          <Menu.Item
            as="a"
            name={"whatsappQrCode"}
            active={activeItem === "whatsappQrCode"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.whatsappQrCode")}</span>
          </Menu.Item>
        )}
        {canEditChannels && (
          <Menu.Item
            as="a"
            name={"whatsappBackupChats"}
            active={activeItem === "whatsappBackupChats"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.whatsappBackupChats")}</span>
          </Menu.Item>
        )}
        {(canManageInboxSettings || canViewSavedReplies) && (
          <>
            <Menu.Item
              as="div"
              name="messagemanagement"
              active={[
                "messagemanagement",
                "inbox",
                "labels",
                "quickreplies",
              ].includes(activeItem)}
              onClick={handleItemClick}
            >
              <span>{t("nav.menu.settings.messageManagement")}</span>
              <Menu.Menu className="secondary">
                {canManageInboxSettings && (
                  <Menu.Item
                    as="a"
                    name="inbox"
                    active={activeItem === "inbox"}
                    onClick={handleItemClick}
                  >
                    <span className="text">{t("nav.menu.settings.inbox")}</span>
                  </Menu.Item>
                )}
                <Menu.Item
                  as="a"
                  name="labels"
                  active={activeItem === "labels"}
                  onClick={handleItemClick}
                >
                  <span className="text">{t("nav.menu.settings.labels")}</span>
                </Menu.Item>
                {canViewSavedReplies && (
                  <Menu.Item
                    as="a"
                    name="quickreplies"
                    active={activeItem === "quickreplies"}
                    onClick={handleItemClick}
                  >
                    <span className="text">
                      {t("nav.menu.settings.quickReply")}
                    </span>
                  </Menu.Item>
                )}
              </Menu.Menu>
            </Menu.Item>
          </>
        )}
        {canManagePlansAndBillings && (
          <Menu.Item
            as="a"
            name="plansubscription"
            active={activeItem === "plansubscription"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.plan")}</span>
          </Menu.Item>
        )}
        {isAdmin && (
          <Menu.Item
            as="a"
            name="partnership"
            active={activeItem === "partnership"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.partnership")}</span>
          </Menu.Item>
        )}
        {(canViewOfficialWhatsAppTemplates ||
          canManageOptIn ||
          canManageChannelBilling ||
          canViewChannels) && (
          <>
            <MenuSubHeader newSection>
              {t("nav.menu.settings.channels")}
            </MenuSubHeader>
            <Menu.Item
              className="official-whatsapp"
              as="div"
              name="officialWhatsapp"
              active={[
                "officialWhatsapp",
                "templates",
                "opt-in",
                "topup",
              ].includes(activeItem)}
              onClick={handleItemClick}
            >
              <span>{t("nav.menu.settings.officialWhatsapp")}</span>
              <Menu.Menu className="secondary">
                {ableToUseOfficial && (
                  <>
                    {canViewOfficialWhatsAppTemplates && (
                      <Menu.Item
                        as="a"
                        name={"templates"}
                        active={activeItem === "templates"}
                        onClick={
                          !ableToUseOfficial ? undefined : handleItemClick
                        }
                      >
                        <span className={!ableToUseOfficial ? "lock" : ""}>
                          <span className="text">
                            {t("nav.menu.settings.templateManager")}
                          </span>
                        </span>
                      </Menu.Item>
                    )}
                    {ableToOptIn && canManageOptIn && (
                      <Menu.Item
                        as="a"
                        name={"opt-in"}
                        active={activeItem === "opt-in"}
                        onClick={handleItemClick}
                      >
                        <span className={!ableToUseOfficial ? "lock" : ""}>
                          <span className="text">
                            {t("nav.menu.settings.optInButton")}
                          </span>
                        </span>
                      </Menu.Item>
                    )}
                  </>
                )}
                {ableToTopUp && canManageChannelBilling && (
                  <Menu.Item
                    as="a"
                    name={"topup"}
                    active={activeItem === "topup"}
                    onClick={ableToTopUp ? handleItemClick : undefined}
                  >
                    <span className={ableToTopUp ? "" : "lock"}>
                      <span className="text">
                        {t("nav.menu.settings.billing")}
                      </span>
                    </span>
                  </Menu.Item>
                )}
                {!accessGuard.canUseOfficialWhatsapp() && (
                  <Menu.Item
                    as="div"
                    name={"requestaccess"}
                    active={activeItem === "requestaccess"}
                    onClick={handleItemClick}
                  >
                    <a
                      href={requestWhatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text"
                    >
                      {t("nav.menu.settings.requestAccess")}
                    </a>
                  </Menu.Item>
                )}
              </Menu.Menu>
            </Menu.Item>
          </>
        )}
        {canViewChannels && (
          <Menu.Item
            as="a"
            name={"livechatwidget"}
            active={activeItem === "livechatwidget"}
            onClick={handleItemClick}
          >
            <span>{t("livechat.liveChatWidget")}</span>
          </Menu.Item>
        )}
      </Menu.Menu>
      <Menu.Menu>
        <MenuSubHeader newSection>
          {t("nav.menu.settings.extensions")}
        </MenuSubHeader>
        {featureGuard.canUseStripePayments() && (
          <Menu.Item
            as="a"
            name={"paymentlink"}
            active={activeItem === "paymentlink"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.paymentLink")}</span>
          </Menu.Item>
        )}
        {featureGuard.canUseSalesforceCrm() && isAdmin && (
          <Menu.Item
            as="a"
            name={"salesforce"}
            active={activeItem === "salesforce"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.salesforce")}</span>
          </Menu.Item>
        )}
        {featureGuard.canUseHubspotCrm() && isAdmin && (
          <Menu.Item
            as="a"
            name={"hubspot"}
            active={activeItem === "hubspot"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.hubspot")}</span>
          </Menu.Item>
        )}
        {isAdmin && (
          <Menu.Item
            as="a"
            name={"commerce"}
            active={activeItem === "commerce"}
            onClick={handleItemClick}
          >
            <span>{t("nav.menu.settings.commerce")}</span>
          </Menu.Item>
        )}
      </Menu.Menu>
    </Menu>
  );
}
