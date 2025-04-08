import AppDashboard from "../container/AppDashboard";
import Contact from "../container/Contact";
import IndividualProfile from "../component/Contact/Individual/IndividualProfile";
import ChannelSelection from "../component/Channel/ChannelSelection";
import Broadcast from "../container/Broadcast";
import NewBroadcast from "../container/NewBroadcast";
import Task from "../container/Task";
import Tutorial from "../container/Tutorial";
import FacebookRedirection from "../component/FacebookRedirection";
import EarlyCreateAccount from "../container/EarlyCreateAccount";
import Settings from "../container/Settings";
import VerifyEmail from "../container/VerifyEmail";
import ResetPasswordSuccess from "../container/ResetPasswordSuccess";
import InvitationAccept from "../container/InvitationAccept";
import Success from "../container/Success";
import ContactImport from "../container/Contact/Import/ContactImport";
import ListsDashboard from "../container/Contact/Imported/ListsDashboard";
import AssignmentRulesContainer from "../container/AssignmentRulesContainer";
import PaymentSuccess from "../container/PaymentSuccess";
import AutomationRuleEdit from "../container/AutomationRuleEdit";
import AutomationHistory from "../container/AutomationHistory";
import IndividualList from "../container/Contact/Imported/IndividualList";
import StripePaymentContainer from "../container/StripePaymentContainer";
import StripePaymentOneoffContainer from "../container/StripePaymentOneoffContainer";
import CreateWhatsappFormContainer from "../container/CreateWhatsappFormContainer";
import FacebookAdsRedirection from "../component/FacebookAdsRedirection";
import PaymentFailure from "../container/PaymentFailure";
import ShopifyRedirect from "../container/ShopifyRedirect";
import { useTranslation } from "react-i18next";
import SurveyContainer from "../container/SurveyContainer";
import OfficialWhatsappGuideContainer from "../container/OfficialWhatsappGuideContainer";
import RedirectFeedback from "../container/RedirectFeedback";
import AnalyticsDashboard from "../features/Analytics/usecases/AnalyticsDashboard/AnalyticsDashboard";
import WhatsappTopupSuccess from "../container/WhatsappTopupSuccess";
import AttachmentContainer from "../container/AttachmentContainer";
import { useCallback } from "react";
import InstagramRedirection from "../component/InstagramRedirect";
import OnboardingContainer from "../container/Onboarding/OnboardingContainer";
import LivechatOnboarding from "../container/LivechatOnboarding/LivechatOnboarding";
import GetStarted from "../container/Onboarding/GetStartedContainer";
import WhatsappComparison from "../container/Onboarding/WhatsappComparisonContainer";
import UpdatePayment from "../container/UpdatePayment";
import RedirectDefaultAssignment from "../container/RedirectDefaultAssignment";
import InstagramOnboarding from "../component/Channel/Onboarding/Instagram";
import TroubleshootChatapiPage from "../component/Channel/TroubleshootChatapi";
import TwilioVerificationContainer from "../container/TwilioVerificationContainer";
import InviteUser from "../component/Channel/Onboarding/InviteUser";
import AssignUser from "../component/Channel/Onboarding/AssignUser";
import ShopifyOnboarding from "../component/Channel/Onboarding/Shopify";
import SyncShopify from "../component/Channel/Onboarding/SyncShopify";
import DemoContactContainer from "../container/DemoContactContainer";
import ScheduleDemoSuccessContainer from "../container/ScheduleDemoSuccessContainer";
import ShopifyUpgradeContainer from "../container/ShopifyUpgradeContainer";
import SyncShopifyContainer from "../container/SyncShopifyContainer";
import ConsultationPaymentSuccessContainer from "../container/ConsultationPaymentSuccessContainer";
import CampaignDetails from "../component/Broadcast/CampaignDetails/CampaignDetails";
import Check360DialogAccess from "../container/Onboarding/360Dialog/Check360DialogAccess";
import Activate360DialogHelp from "../container/Onboarding/360Dialog/Activate360DialogHelp";
import Activate360Dialog from "../container/Onboarding/360Dialog/Activate360Dialog";
import ShopifySubscriptionSuccessContainer from "../container/ShopifySubscriptionSuccessContainer";
import ViberOnboardingScreen from "../container/Onboarding/viber/ViberOnboardingScreen";
import TelegramOnboardingScreen from "../container/Onboarding/telegram/TelegramOnboardingScreen";
import PaymentLinkSuccess from "../container/StripePayment/PaymentLinkSuccess";
import PaymentLinkCancel from "../container/StripePayment/PaymentLinkCancel";
import StripeOnboardingScreen from "container/Onboarding/stripe/StripeOnboardingScreen";
import SalesforceOnboarding from "features/Salesforce/usecases/Onboarding/SalesforceOnboarding";
import InboxDemo from "../container/Onboarding/InboxDemo";
import Performance from "features/Analytics/usecases/Performance/Performance";
import BlastCampaignsContainer from "../container/BlastCampaignsContainer";
import BlastCampaignDetailContainer from "../container/BlastCampaignDetailContainer";
import SettingsSalesforceSyncData from "features/Salesforce/usecases/Settings/SyncData";
import SettingsSalesforceTwoWaysSync from "features/Salesforce/usecases/Settings/TwoWaysSync";
import LeadsScreen from "../features/Salesforce/usecases/Leads/LeadsScreen";
import OpportunitiesScreen from "../features/Salesforce/usecases/Opportunities/OpportunitiesScreen";
import AdditionalContactsAddOnContainer from "../container/AdditionalContactsAddOnContainer";
import AdditionalStaffLoginAddOnContainer from "../container/AdditionalStaffLoginAddOnContainer";
import Redirect360DialogLoggedIn from "component/CreateWhatsappFlow/Redirect360DialogLoggedIn";
import HubspotOnboarding from "features/Hubspot/usecases/Onboarding/HubspotOnboarding";
import SettingHubspotSyncData from "features/Hubspot/usecases/Settings/SyncData";
import SettingHubspotTwoWaysSync from "features/Hubspot/usecases/Settings/TwoWaysSync";
import FreeTrialIntro from "../features/FreeTrial/usecases/Intro/FreeTrialIntro";
import ConnectIntegrate from "../features/FreeTrial/usecases/Connect/ConnectIntegrate";
import { UnexpectedError } from "features/FreeTrial/UnexpectedError";
import CheckCloudAPIAccess from "container/Onboarding/cloudAPI/CheckCloudAPIAccess";
import CampaignsScreen from "../features/Salesforce/usecases/Campaigns/CampaignsScreen";
import { EditStore } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore";
import { EditProduct } from "features/Ecommerce/usecases/Settings/CustomStore/EditProduct";
import { EditShopifyStore } from "features/Ecommerce/usecases/Settings/Shopify/EditShopifyStore";
import MigrateFlow from "container/Onboarding/migrateNumber/MigrateFlow";
import Signup from "../container/Signup/Signup";
import WhatsappCatalogOnboarding from "container/Onboarding/whatsappCatalog/WhatsappCatalogOnboarding";
import { matchPath, useHistory, useLocation } from "react-router";
import WhatsappCatalogSetting from "container/Onboarding/whatsappCatalog/WhatsappCatalogSetting";
import { ShopifyEmailAuth } from "container/ShopifyEmailAuth";
import { AccessDeniedNonIPWhiteList } from "container/Settings/AccessDeniedNonIPWhiteList";

const BACK_FROM_V2 = "back_from_v2=true";

export interface routeToType {
  (path: string, backFromV2?: boolean): string;
}

function useRouteConfig() {
  const { i18n } = useTranslation();
  const location = useLocation();

  const routeTo: routeToType = useCallback(
    (path: string, backFromV2?: boolean) => {
      const backFromV2FormSession =
        sessionStorage.getItem("backFromV2") === "true";
      const redirectParam =
        backFromV2 && backFromV2FormSession ? `?${BACK_FROM_V2}` : "";
      return `/${i18n.language}${path}${redirectParam}`;
    },
    [i18n.language]
  );

  const history = useHistory();

  const goTo = useCallback(
    (path: string, state?: null | undefined | {}) =>
      history.push(routeTo(path), state),
    [history, routeTo]
  );

  const matchesCurrentPath = useCallback(
    (path: string) => {
      const nonLocaleMatch = matchPath(location.pathname, {
        exact: true,
        path: path,
      });
      const localeMatch = matchPath(location.pathname, {
        exact: true,
        path: routeTo(path),
      });
      return (nonLocaleMatch ?? localeMatch) !== null;
    },
    [location.pathname, routeTo]
  );

  return {
    routeTo,
    goTo,
    matchesCurrentRoute: matchesCurrentPath,
    authenticatedRoutes: {
      noLangRoute: [
        {
          path: "/success", //confirm the invitation
          component: Success,
        },
        {
          path: "/reset/password/success", //confirm the invitation
          component: ResetPasswordSuccess,
        },
        {
          path: "/automations/default-rule",
          component: RedirectDefaultAssignment,
        },
        {
          path: `/stripe/success`,
          component: PaymentSuccess,
        },
        {
          path: `/stripe/twilio/topup/success`,
          component: PaymentSuccess,
        },
        {
          path: `/stripe/whatsapp/topup/success`,
          component: PaymentSuccess,
        },
        {
          path: `/twilio/whatsapp/verification`,
          component: TwilioVerificationContainer,
        },
      ],
      langRoute: [
        {
          path: `/inbox/:assigneeId`,
          component: AppDashboard,
        },
        {
          path: `/inbox/:assigneeId/:conversationId`,
          component: AppDashboard,
        },
        {
          path: `/inbox/:assigneeId/:conversationId/:channelName`,
          component: AppDashboard,
        },
        {
          path: `/stripe/cancel`,
          component: PaymentFailure,
        },
        {
          path: `/stripe/success`,
          component: PaymentSuccess,
        },
        {
          path: "/stripe/update/success",
          component: UpdatePayment,
        },
        {
          path: "/stripe/update/cancel",
          component: UpdatePayment,
        },
        {
          path: `/stripe/twilio/topup/success`,
          component: PaymentSuccess,
        },
        {
          path: `/automations/history/:id`,
          component: AutomationHistory,
        },
        {
          path: `/automations/edit/:id`,
          component: AutomationRuleEdit,
        },
        {
          path: `/automations/create`,
          component: AutomationRuleEdit,
        },
        {
          path: `/(automations|assignmentRule)`,
          component: AssignmentRulesContainer,
        },
        {
          path: `/contacts/salesforce/leads`,
          component: LeadsScreen,
        },
        {
          path: `/contacts/salesforce/opportunities`,
          component: OpportunitiesScreen,
        },
        {
          path: `/contacts/salesforce/campaigns`,
          component: CampaignsScreen,
        },
        {
          path: `/contacts/lists/:id`,
          component: IndividualList,
        },
        {
          path: `/contacts/lists`,
          component: ListsDashboard,
        },
        {
          path: `/contacts/import`,
          component: ContactImport,
        },
        {
          path: `/contacts`,
          component: Contact,
        },
        {
          path: `/campaigns/:campaignId/recipients`,
          component: CampaignDetails,
        },
        {
          path: `/(campaigns|broadcast)`,
          component: Broadcast,
        },
        {
          path: `/campaigns/create`,
          component: NewBroadcast,
        },
        {
          path: `/campaigns/blast/create`,
          component: BlastCampaignDetailContainer,
        },
        {
          path: `/campaigns/blast/:id`,
          component: BlastCampaignDetailContainer,
        },
        {
          path: `/campaigns/blast`,
          component: BlastCampaignsContainer,
        },
        {
          path: `/campaigns/:id`,
          component: NewBroadcast,
        },
        {
          path: `/profile/:id`,
          component: IndividualProfile,
        },
        {
          path: `/getting-started/channels`,
          component: ChannelSelection,
        },
        {
          path: `/(channels|channel-selection)`,
          component: ChannelSelection,
        },
        {
          path: `/facebook/connect`,
          component: FacebookRedirection,
        },
        {
          path: `/instagram/connect`,
          component: InstagramRedirection,
        },
        {
          path: `/facebook/ads/connect`,
          component: FacebookAdsRedirection,
        },
        {
          path: `/task`,
          component: Task,
        },
        {
          path: `/getting-started`,
          component: Tutorial,
        },
        {
          path: `/preview/:planId`,
          component: EarlyCreateAccount,
        },
        {
          path: `/preview`,
          component: EarlyCreateAccount,
        },
        {
          path: `/settings/teams/:teamId`,
          component: Settings,
        },
        {
          path: `/settings/usermanagement/:staffId`,
          component: Settings,
        },
        {
          path: `/settings/templates/:templateId`,
          component: Settings,
        },
        {
          path: `/settings/generalinfo`,
          component: Settings,
        },
        {
          path: "/settings/salesforce/syncData",
          component: SettingsSalesforceSyncData,
        },
        {
          path: "/settings/salesforce/twoWaysSync",
          component: SettingsSalesforceTwoWaysSync,
        },
        {
          path: "/settings/hubspot/syncData",
          component: SettingHubspotSyncData,
        },
        {
          path: "/settings/hubspot/twoWaysSync",
          component: SettingHubspotTwoWaysSync,
        },
        {
          path: "/settings/commerce/store/:storeId/products/add",
          component: EditProduct,
        },
        {
          path: "/settings/commerce/store/:storeId/products/:id",
          component: EditProduct,
        },
        {
          path: "/settings/commerce/store/:id/:tab",
          component: EditStore,
        },
        {
          path: "/settings/commerce/store/:id",
          component: EditStore,
        },
        {
          path: "/settings/commerce/shopify/:storeId",
          component: EditShopifyStore,
        },
        {
          path: `/settings/:path/:subPath`,
          component: Settings,
        },
        {
          path: `/settings/:path`,
          component: Settings,
        },
        {
          path: `/settings`,
          component: Settings,
        },
        {
          path: `/payment/oneoff/:paymentMethod/:currency/:amount`,
          component: StripePaymentOneoffContainer,
        },
        {
          path: "/stripe/twilio/topup/cancel",
          component: PaymentFailure,
        },
        {
          path: `/payment/:paymentId/:trial`,
          component: StripePaymentContainer,
        },
        {
          path: `/payment/:paymentId`,
          component: StripePaymentContainer,
        },
        {
          path: `/verifyEmail`, //create account verify email registration
          component: VerifyEmail,
        },
        {
          path: `/request-whatsapp`,
          component: CreateWhatsappFormContainer,
        },
        {
          path: "/whatsapp-topup-success",
          component: WhatsappTopupSuccess,
        },
        {
          path: "/getstarted",
          component: SurveyContainer,
        },
        {
          path: "/channels/official/whatsapp/360dialog/activate/help",
          component: Activate360DialogHelp,
        },
        {
          path: "/channels/official/whatsapp/360dialog/activate",
          component: Activate360Dialog,
        },
        {
          path: "/channels/official/whatsapp/360dialog/check-access",
          component: Check360DialogAccess,
        },
        {
          path: "/channels/official/whatsapp/cloudapi/:phoneNumber/check-access",
          component: CheckCloudAPIAccess,
        },
        {
          path: "/channels/official/whatsapp/guide",
          component: OfficialWhatsappGuideContainer,
        },
        {
          path: "/analytics/conversations",
          component: AnalyticsDashboard,
        },
        {
          path: "/analytics/sales",
          component: Performance,
        },
        {
          path: "/feedback",
          component: RedirectFeedback,
        },
        {
          path: "/attachment/file/:attachmentType/:fileId/:fileName",
          component: AttachmentContainer,
        },
        {
          path: "/onboarding-flow",
          component: OnboardingContainer,
        },
        {
          path: "/guide/livechat",
          component: LivechatOnboarding,
        },
        {
          path: "/guide/get-started",
          component: GetStarted,
        },
        {
          path: "/guide/inbox-demo",
          component: InboxDemo,
        },
        {
          path: "/guide/whatsapp-comparison",
          component: WhatsappComparison,
        },
        {
          path: "/guide/whatsapp-comparison/:channel",
          component: WhatsappComparison,
        },
        {
          path: "/onboarding/viber",
          component: ViberOnboardingScreen,
        },
        {
          path: "/onboarding/telegram",
          component: TelegramOnboardingScreen,
        },
        {
          path: "/onboarding/stripe",
          component: StripeOnboardingScreen,
        },
        {
          path: "/onboarding/whatsappCatalog",
          component: WhatsappCatalogOnboarding,
        },
        {
          path: "/onboarding/whatsappCatalog/setting",
          component: WhatsappCatalogSetting,
        },
        {
          path: "/onboarding/salesforce",
          component: SalesforceOnboarding,
        },
        {
          path: "/onboarding/hubspot",
          component: HubspotOnboarding,
        },
        {
          path: "/onboarding/instagram",
          component: InstagramOnboarding,
        },
        {
          path: "/onboarding/invite-user",
          component: InviteUser,
        },
        {
          path: "/onboarding/assign-user",
          component: AssignUser,
        },
        {
          path: "/troubleshoot-chatapi",
          component: TroubleshootChatapiPage,
        },
        {
          path: "/onboarding/shopify",
          component: ShopifyOnboarding,
        },
        {
          path: "/onboarding/sync-shopify",
          component: SyncShopify,
        },
        {
          path: "/onboarding/contact-first",
          component: DemoContactContainer,
        },
        {
          path: "/free-trial/intro/:commerceHub",
          component: FreeTrialIntro,
        },
        {
          path: "/free-trial/connect/:commerceHub",
          component: ConnectIntegrate,
        },
        {
          path: "/shopify-upgrade-plan",
          component: ShopifyUpgradeContainer,
        },
        {
          path: "/sync-shopify/:shopifyId",
          component: SyncShopifyContainer,
        },
        {
          path: "/schedule-demo-success",
          component: ScheduleDemoSuccessContainer,
        },
        {
          path: "/shopify/subscription/chargeResult",
          component: ShopifySubscriptionSuccessContainer,
        },
        {
          path: "/subscriptions/add-ons/additional-staff",
          component: AdditionalStaffLoginAddOnContainer,
        },
        {
          path: "/subscriptions/add-ons/additional-contacts",
          component: AdditionalContactsAddOnContainer,
        },
        {
          path: "/consultation-payment-success",
          component: ConsultationPaymentSuccessContainer,
        },
        {
          path: "/redirect-360dialog",
          component: Redirect360DialogLoggedIn,
        },

        {
          path: "/cloudapi/phone-number",
          component: CreateWhatsappFormContainer,
        },
        {
          path: "/setup-company",
          component: Signup,
        },
        {
          path: "/guide/migrate-phone-number",
          component: MigrateFlow,
        },
      ],
    },
    publicRoutes: {
      langRoute: [
        {
          path: `/company/Invitation/Accept`, //confirm the invitation
          component: InvitationAccept,
        },
        {
          path: "/error/unexpected",
          component: UnexpectedError,
        },
        {
          path: "/payment-result/success",
          component: PaymentLinkSuccess,
        },
        {
          path: "/payment-result/cancel",
          component: PaymentLinkCancel,
        },
        {
          path: "/company/shopify/install",
          component: ShopifyRedirect,
        },
        {
          path: `/company/shopify/redirect/url`,
          component: ShopifyRedirect,
        },
        {
          path: `/company/shopify/email/auth`,
          component: ShopifyEmailAuth,
        },
        {
          path: "/access-denied",
          component: AccessDeniedNonIPWhiteList,
        },
      ],
    },
  };
}

export default useRouteConfig;
