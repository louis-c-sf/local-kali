import React, { useEffect, useState } from "react";
import { PostLogin } from "../component/Header";
import { RouteComponentProps, useHistory, useLocation } from "react-router-dom";
import Helmet from "react-helmet";
import SettingSidebar from "../component/Settings/SettingSidebar";
import SettingAccount from "./Settings/Profile/SettingAccount";
import SettingWhatsappQrCode from "./Settings/WhatsAppQrCode/SettingWhatsappQrCode";
import SettingWebsiteManager from "../component/Settings/SettingWebsiteManager";
import SettingUserManagment from "../component/Settings/SettingUser/SettingUserManagment";
import SettingPlanSubscription from "./SettingPlanSubscription";
import SettingPartnership from "./Settings/SettingPartnership";
import { Dimmer, Loader } from "semantic-ui-react";
import SettingQuickReplies from "./Settings/SettingQuickReplies";
import { SettingTeams } from "./Settings/SettingTeams";
import { useTeams } from "./Settings/useTeams";
import useRouteConfig from "../config/useRouteConfig";
import SettingLiveChatWidget from "../component/Settings/SettingLiveChatWidget";
import { useTranslation } from "react-i18next";
import SettingTemplateMessage from "./Settings/OfficialWhatsApp/SettingTemplateMessage";
import SettingWhatsappBilling from "./Settings/OfficialWhatsApp/SettingBilling";
import SettingOptIn from "./Settings/OfficialWhatsApp/SettingOptIn";
import InboxManagement from "../component/Settings/SettingInbox/Inbox/InboxManagement";
import { useAppSelector } from "../AppRootContext";
import { isAdminRole } from "../component/Settings/helpers/AccessRulesGuard";
import BackupWhatsappChats from "./Settings/BackupWhatsappChats";
import { LabelsManagement } from "../component/Settings/SettingInbox/Labels/LabelsManagement";
import SettingPaymentLink from "features/Ecommerce/Payment/usecases/Settings/SettingPaymentLink";
import SettingSalesforce from "features/Salesforce/usecases/Settings/SettingSalesforce";
import SettingHubspot from "features/Hubspot/usecases/Settings/SettingHubspot";
import { useAccessRulesGuard } from "../component/Settings/hooks/useAccessRulesGuard";
import { equals } from "ramda";
import { CommerceSettings } from "../features/Ecommerce/usecases/Settings/Commerce/CommerceSettings";
import { CompanyPoliciesProvider } from "component/Settings/SettingInbox/Inbox/CompanyPoliciesContext";

const Settings = ({ match }: RouteComponentProps<any>) => {
  const history = useHistory();
  const { path, staffId, subPath } = match.params;
  const { pathname } = useLocation();
  const { company, loggedInUserDetail, isShopifyAccount } = useAppSelector(
    (s) => ({
      company: s.company,
      loggedInUserDetail: s.loggedInUserDetail,
      isShopifyAccount: s.company?.isShopifyAccount,
    }),
    equals
  );
  const accessRuleGuard = useAccessRulesGuard();

  const isResellerClient = accessRuleGuard.isResellerClient();
  const { refreshTeams, booted } = useTeams();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const isAdmin = loggedInUserDetail && isAdminRole(loggedInUserDetail);
  let initMenuItem: string;
  switch (true) {
    case pathname.startsWith(routeTo("/settings/whatsappQrCode")):
      initMenuItem = "whatsappQrCode";
      break;
    case typeof subPath === "string":
      initMenuItem = `${subPath}`;
      break;
    case typeof path === "string":
      initMenuItem = path;
      break;
    case typeof staffId === "string":
      initMenuItem = "usermanagement";
      break;
    case pathname.startsWith(routeTo("/settings/teams")):
      initMenuItem = "teams";
      break;
    case pathname.startsWith(routeTo("/settings/templates")):
      initMenuItem = "templates";
      break;
    default:
      initMenuItem = "generalinfo";
      break;
  }

  useEffect(() => {
    if (!path && initMenuItem === "generalinfo") {
      history.push(routeTo("/settings/generalinfo"));
    }
  }, [path, initMenuItem, history, routeTo]);

  const [menuItem, updateMenuItem] = useState(initMenuItem);
  const [loading, isLoading] = useState(false);

  useEffect(() => {
    updateMenuItem(initMenuItem);
  }, [initMenuItem]);

  useEffect(() => {
    if (!booted) {
      refreshTeams();
    }
  }, [booted]);

  useEffect(() => {
    if (staffId) {
      history.push(routeTo(`/settings/usermanagement/${staffId}`));
    }
  }, [staffId]);

  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const canViewWhatsappQrCode = isRbacEnabled || (isAdmin && !isResellerClient);

  const pageTitle = t("nav.menu.settings.settings");
  return loading ? (
    <Dimmer inverted active>
      <Loader />
    </Dimmer>
  ) : (
    <div className="post-login">
      <PostLogin selectedItem={""}>
        <Helmet title={t("nav.common.title", { page: pageTitle })} />
        <div className="settings main">
          <SettingSidebar menuItem={menuItem} updateMenuItem={updateMenuItem} />
          {menuItem === "generalinfo" && <SettingAccount />}
          {menuItem === "quickreplies" && <SettingQuickReplies />}
          {menuItem === "teams" && <SettingTeams />}
          {menuItem === "inbox" && (
            <CompanyPoliciesProvider>
              <InboxManagement />
            </CompanyPoliciesProvider>
          )}
          {menuItem === "whatsappQrCode" && canViewWhatsappQrCode && (
            <SettingWhatsappQrCode />
          )}
          {menuItem === "whatsappBackupChats" && <BackupWhatsappChats />}
          {menuItem === "websitemessenger" && (
            <SettingWebsiteManager loadingCompany={loading} />
          )}
          {menuItem.includes("templates") && <SettingTemplateMessage />}
          {menuItem === "topup" && <SettingWhatsappBilling />}
          {menuItem === "opt-in" && <SettingOptIn />}
          {menuItem === "labels" && <LabelsManagement />}
          {menuItem.includes("usermanagement") && (
            <SettingUserManagment
              userId={staffId}
              updateMenuItem={updateMenuItem}
              company={company}
            />
          )}
          {menuItem === "plansubscription" && !isResellerClient && (
            <SettingPlanSubscription />
          )}
          {menuItem === "partnership" && <SettingPartnership />}
          {menuItem === "livechatwidget" && (
            <SettingLiveChatWidget loadingCompany={loading} />
          )}
          {menuItem === "paymentlink" && <SettingPaymentLink />}
          {menuItem === "salesforce" && <SettingSalesforce />}
          {menuItem === "hubspot" && <SettingHubspot />}
          {menuItem === "commerce" && <CommerceSettings />}
        </div>
      </PostLogin>
    </div>
  );
};

export default Settings;
