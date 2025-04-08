import { wrapCreateBrowserRouterV6 } from '@sentry/react';
import { useTranslation } from 'react-i18next';
import {
  createBrowserRouter,
  Navigate,
  NavigateProps,
  Outlet,
  RouteObject,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { useLocalStorage, useSessionStorage } from 'react-use';

import App from '@/App';
import { SUPPORTED_BROWSER } from '@/constants/supportedBrowser';
import { CHANNEL } from '@/pages/Broadcasts/constants';
import { checkIsDeviceMobile, getBrowserInfo } from '@/utils/device';

import UnderConstruction from './components/UnderConstruction';
import { AVAILABLE_LANGUAGES } from './constants/i18n';
import { ROUTES } from './constants/navigation';
import AuthenticationRequiredLayout from './layouts/AuthenticationRequiredLayout';
import UnAuthenticatedLayout from './layouts/UnAuthenticatedLayout';
import MobileAppLanding from './pages/MobileAppLanding';
import InvitationLink from './pages/Onboarding/InvitationLink';
import SettingsConversionLogging from './pages/Settings/SettingsConversionLogging';
import UnsupportedBrowserLanding from './pages/UnsupportedBrowserLanding';
import { lazyWithRetries } from './utils/lazy-loading';
import InboxLayout from './pages/InboxRXJS';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import AuthenticatedSetupLayout from './layouts/AuthenticatedSetupLayout';

const FlowBuilderV3IdLayout = lazyWithRetries(
  () => import('./pages/NextFlowBuilder/FlowBuilderV3IdLayout'),
);
const FlowBuilderV3IdEditor = lazyWithRetries(
  () => import('./pages/NextFlowBuilder/FlowBuilderV3IdEditor'),
);
const FlowBuilderAccessControlContainer = lazyWithRetries(
  () => import('./pages/NextFlowBuilder/FlowBuilderAccessControlContainer'),
);
const AuditLog = lazyWithRetries(
  () => import('./pages/Settings/SettingsAuditLog'),
);
const ConnectionUserMapping = lazyWithRetries(
  () => import('./pages/Integrations/ConnectionDashboard/UserMapping'),
);
const SettingsDeletedContacts = lazyWithRetries(
  () => import('./pages/Settings/SettingsDeletedContacts'),
);
const ExceedDeviceLimit = lazyWithRetries(
  () => import('./components/ExceedDeviceLimit'),
);
const ContactsIdError = lazyWithRetries(
  () => import('./pages/Contacts/ContactsId/ContactsIdError'),
);
const SettingsAccessDeniedErrorElement = lazyWithRetries(
  () => import('./pages/Settings/shared/SettingsAccessDeniedErrorElement'),
);
const ChannelsErrorElement = lazyWithRetries(
  () => import('./pages/Channels/ChannelsErrorElement'),
);
const Inbox = lazyWithRetries(() => import('./pages/InboxRXJS/Inbox'));
const AppErrorElement = lazyWithRetries(() => import('./AppErrorElement'));
const FlowBuilderErrorElement = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderErrorElement'),
);
const FlowBuilderLayout = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderLayout'),
);

const FlowBuilderListing = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderListing'),
);

const FlowBuilderUsage = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderUsage'),
);

const FlowBuilderIdEditor = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderIdEditor'),
);
const FlowBuilderIdLayout = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderIdLayout'),
);
const FlowBuilderIdLog = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderIdLog'),
);
const FlowBuilderIdSettings = lazyWithRetries(
  () => import('./pages/FlowBuilder/FlowBuilderIdSettings'),
);
const Contacts = lazyWithRetries(() => import('./pages/Contacts'));
const CreateContact = lazyWithRetries(
  () => import('./pages/Contacts/ContactsCreate'),
);
const ContactsLayout = lazyWithRetries(
  () => import('./pages/Contacts/shared/ContactsLayout'),
);
const ContactList = lazyWithRetries(
  () => import('./pages/Contacts/ContactsList'),
);
const ContactsListId = lazyWithRetries(
  () => import('./pages/Contacts/ContactsListId'),
);
const ContactsImport = lazyWithRetries(
  () => import('./pages/Contacts/ContactsImport'),
);
const ContactsId = lazyWithRetries(() => import('./pages/Contacts/ContactsId'));
const BroadcastAccessControlContainer = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastAccessControlContainer'),
);
const BroadcastErrorElement = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastErrorElement'),
);
const Broadcasts = lazyWithRetries(() => import('./pages/Broadcasts'));

const BroadcastCreateLine = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateLine'),
);
const BroadcastCreateTwilio = lazyWithRetries(
  () =>
    import('./pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateTwilio'),
);
const BroadcastCreateWeChat = lazyWithRetries(
  () =>
    import('./pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateWeChat'),
);
const BroadcastCreateMessenger = lazyWithRetries(
  () =>
    import(
      './pages/Broadcasts/BroadcastCreateChannel/BroadcastFacebookMessenger'
    ),
);
const BroadcastCreateSMS = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateSMS'),
);
const BroadcastCreateTelegram = lazyWithRetries(
  () =>
    import('./pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateTelegram'),
);
const BroadcastCreateWhatsApp360Dialog = lazyWithRetries(
  () =>
    import(
      './pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateWhatsApp360Dialog'
    ),
);
const BroadcastCreateWhatsAppCloud = lazyWithRetries(
  () =>
    import(
      './pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateWhatsappCloud'
    ),
);
const BroadcastCreateNote = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateNote'),
);
const BroadcastCreateViber = lazyWithRetries(
  () =>
    import('./pages/Broadcasts/BroadcastCreateChannel/BroadcastCreateViber'),
);
const BroadcastReviewLine = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewLine'),
);
const BroadcastReviewFacebookMessenger = lazyWithRetries(
  () =>
    import(
      './pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewFacebookMessenger'
    ),
);
const BroadcastReviewTelegram = lazyWithRetries(
  () =>
    import('./pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewTelegram'),
);

const BroadcastReviewWeChat = lazyWithRetries(
  () =>
    import('./pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewWeChat'),
);

const BroadcastReviewViber = lazyWithRetries(
  () =>
    import('./pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewViber'),
);
const BroadcastReviewWhatsAppTwilio = lazyWithRetries(
  () =>
    import(
      './pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewWhatsAppTwilio'
    ),
);
const BroadcastReviewNote = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewNote'),
);
const BroadcastReviewSMS = lazyWithRetries(
  () => import('./pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewSMS'),
);
const BroadcastReviewWhatsApp360Dialog = lazyWithRetries(
  () =>
    import(
      './pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewWhatsApp360Dialog'
    ),
);
const BroadcastReviewWhatsAppCloudApi = lazyWithRetries(
  () =>
    import(
      './pages/Broadcasts/BroadcastReviewChannel/BroadcastReviewWhatsAppCloudApi'
    ),
);
const ChannelLayout = lazyWithRetries(
  () => import('./pages/Channels/ChannelLayout'),
);
const ConnectChannelLayout = lazyWithRetries(
  () => import('./pages/Channels/ConnectChannelLayout'),
);
const Channels = lazyWithRetries(() => import('./pages/Channels'));
const WhatsappCloud = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud'),
);
const AccountSettings = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/AccountSettings'),
);
const QrcodeSetting = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/QrcodeSetting'),
);
const TemplateSetting = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/TemplateSetting'),
);
const TemplateCreate = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/TemplateSetting/TemplateCreate'),
);
const OptinSetting = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/OptinSetting'),
);
const BillingList = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/BillSetting/BillingList'),
);
const BillingDetail = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/BillSetting/BillingDetail'),
);
const ConversationalComponentSetting = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/ConversationalComponentSetting'),
);
const WhatsApp360Dialog = lazyWithRetries(
  () => import('./pages/Channels/Whatsapp360dialog'),
);
const WhatsAppTwilio = lazyWithRetries(
  () => import('./pages/Channels/WhatsappTwilio'),
);
const Messenger = lazyWithRetries(() => import('./pages/Channels/Messenger'));
const SMS = lazyWithRetries(() => import('./pages/Channels/SMS'));
const WeChat = lazyWithRetries(() => import('./pages/Channels/WeChat'));
const Line = lazyWithRetries(() => import('./pages/Channels/Line'));
const Telegram = lazyWithRetries(() => import('./pages/Channels/Telegram'));
const Viber = lazyWithRetries(() => import('./pages/Channels/Viber'));
const Instagram = lazyWithRetries(() => import('./pages/Channels/Instagram'));
const LiveChatWidget = lazyWithRetries(
  () => import('./pages/Channels/LiveChatWidget'),
);
const GeneralSegment = lazyWithRetries(
  () => import('./pages/Channels/LiveChatWidget/GeneralSegment'),
);
const AdvancedSegment = lazyWithRetries(
  () => import('./pages/Channels/LiveChatWidget/AdvancedSegment'),
);
const LanguageSegment = lazyWithRetries(
  () => import('./pages/Channels/LiveChatWidget/LanguageSegment'),
);
const PopupMessageSegment = lazyWithRetries(
  () => import('./pages/Channels/LiveChatWidget/PopupMessageSegment'),
);
const ChannelSegment = lazyWithRetries(
  () => import('./pages/Channels/LiveChatWidget/ChannelSegment'),
);

const ConnectWeChat = lazyWithRetries(
  () => import('./pages/Channels/WeChat/ConnectWeChat'),
);
const ConnectInstagram = lazyWithRetries(
  () => import('./pages/Channels/Instagram/ConnectInstagram'),
);
const ConnectLine = lazyWithRetries(
  () => import('./pages/Channels/Line/ConnectLine'),
);
const ConnectTelegram = lazyWithRetries(
  () => import('./pages/Channels/Telegram/ConnectTelegram'),
);
const ConnectSMS = lazyWithRetries(
  () => import('./pages/Channels/SMS/ConnectSMS'),
);
const ConnectViber = lazyWithRetries(
  () => import('./pages/Channels/Viber/ConnectViber'),
);
const ConnectWhatsappCloudApi = lazyWithRetries(
  () => import('./pages/Channels/WhatsappCloud/ConnectChannel'),
);

const ConnectMessenger = lazyWithRetries(
  () => import('./pages/Channels/Messenger/ConnectMessenger'),
);

// TODO remove once finished testing with clients
const FacebookLoginExperimental = lazyWithRetries(
  () => import('./pages/Channels/FacebookLoginExperimental'),
);

const ContactsShopify = lazyWithRetries(
  () => import('./pages/Contacts/ContactsShopify'),
);

const ContactsMyContacts = lazyWithRetries(
  () => import('./pages/Contacts/ContactsMyContacts'),
);

const ContactsTeam = lazyWithRetries(
  () => import('./pages/Contacts/ContactsTeam'),
);
const NotFound = lazyWithRetries(() => import('./pages/NotFound'));

const SettingsLayout = lazyWithRetries(
  () => import('./pages/Settings/shared/SettingsLayout'),
);
const SettingsGeneral = lazyWithRetries(
  () => import('./pages/Settings/SettingsGeneral'),
);
const SettingsCompanyDetail = lazyWithRetries(
  () => import('./pages/Settings/SettingsCompanyDetail'),
);
const SettingsCompanyDetail2FA = lazyWithRetries(
  () => import('./pages/Settings/SettingsCompanyDetail/SecurityTab/2FA'),
);
const SettingsCustomObject = lazyWithRetries(
  () => import('./pages/Settings/SettingsCustomObject'),
);
const SettingsCustomObjectCreate = lazyWithRetries(
  () => import('./pages/Settings/SettingsCustomObject/CreateCustomObject'),
);
const SettingsContactProperties = lazyWithRetries(
  () => import('./pages/Settings/SettingsContactProperties'),
);
const SettingsCompanyDetailIpWhiteList = lazyWithRetries(
  () =>
    import('./pages/Settings/SettingsCompanyDetail/SecurityTab/IpWhiteList'),
);
const EditCustomObject = lazyWithRetries(
  () => import('./pages/Settings/SettingsCustomObject/EditCustomObject'),
);
const CustomObjectNotFound = lazyWithRetries(
  () =>
    import(
      './pages/Settings/SettingsCustomObject/EditCustomObject/CustomObjectNotFound'
    ),
);
const SettingsLabels = lazyWithRetries(
  () => import('./pages/Settings/SettingsLabels/SettingsLabels'),
);
const SettingsDataPrivacy = lazyWithRetries(
  () => import('./pages/Settings/SettingsDataPrivacy/SettingsDataPrivacy'),
);

const SettingsSleekFlowLab = lazyWithRetries(
  () => import('./pages/Settings/SettingsSleekFlowLab'),
);

const SettingsUserManagement = lazyWithRetries(
  () => import('./pages/Settings/SettingsUserManagement'),
);
const SettingsUserManagementEditUser = lazyWithRetries(
  () => import('./pages/Settings/SettingsUserManagement/EditUser'),
);
const SettingsInvoices = lazyWithRetries(
  () => import('./pages/Settings/SettingsInvoices'),
);
const SettingsSubscriptions = lazyWithRetries(
  () => import('./pages/Settings/SettingsSubscriptions'),
);
const SettingsSupportServices = lazyWithRetries(
  () => import('./pages/Settings/SettingsSupportServices'),
);
const SettingsManagePlan = lazyWithRetries(
  () => import('./pages/Settings/SettingsManagePlan'),
);
const SettingsManagePlanSubscribePlan = lazyWithRetries(
  () => import('./pages/Settings/SettingsManagePlan/SubscribePlan'),
);
const SettingsAddOns = lazyWithRetries(
  () => import('./pages/Settings/SettingsAddOns'),
);
const SettingsAddOnsAdding = lazyWithRetries(
  () => import('./pages/Settings/SettingsAddOns/AddOnsAdding'),
);
const SettingsTicketing = lazyWithRetries(
  () => import('./pages/Settings/SettingsTicketing'),
);
const AiSettings = lazyWithRetries(() => import('./pages/AiSettings'));
const AiSettingsAccessControlContainer = lazyWithRetries(
  () => import('./pages/AiSettings/AiSettingsAccessControlContainer'),
);
const AiSettingsErrorElement = lazyWithRetries(
  () => import('./pages/AiSettings/AiSettingsErrorElement'),
);
const AISettingsUploadNewSource = lazyWithRetries(
  () => import('./pages/AiSettings/AISettingsUploadNewSource'),
);
const AiSettingsManageAgent = lazyWithRetries(
  () => import('./pages/AiSettings/AiSettingsManageAgent'),
);
const AiSettingsManageAgentPersona = lazyWithRetries(
  () => import('./pages/AiSettings/AiSettingsManageAgent/Persona'),
);
const AiSettingsTabLibrary = lazyWithRetries(
  () => import('./pages/AiSettings/AiSettingsTabLibrary'),
);
const CustomObjectDataLayout = lazyWithRetries(
  () => import('./pages/CustomObjectData/shared/CustomObjectDataLayout'),
);
const CustomObjectData = lazyWithRetries(
  () => import('./pages/CustomObjectData'),
);
const CustomObjectDataIndex = lazyWithRetries(
  () => import('./pages/CustomObjectData/Root'),
);

const IntegrationsDashboard = lazyWithRetries(
  () => import('./pages/Integrations/IntegrationDashboard'),
);
const IntegrationErrorElement = lazyWithRetries(
  () => import('./pages/Integrations/IntegrationErrorElement'),
);
const SettingsIntegrationDisconnectionAlerts = lazyWithRetries(
  () => import('./pages/Settings/SettingsIntegrationDisconnectionAlerts'),
);
const IntegrationConnectionDashboard = lazyWithRetries(
  () => import('./pages/Integrations/ConnectionDashboard'),
);
const SetupConnection = lazyWithRetries(
  () => import('./pages/Integrations/ConnectionSetup'),
);
const FacebookLeadAdSetupDashboard = lazyWithRetries(
  () => import('./pages/Integrations/vendors/Facebook/FacebookLeadAdDashboard'),
);

const FacebookLeadAdMappingSetup = lazyWithRetries(
  () =>
    import('./pages/Integrations/vendors/Facebook/FacebookLeadAdMappingSetup'),
);
const TicketingLayout = lazyWithRetries(() => import('./pages/Ticketing'));
const TicketList = lazyWithRetries(
  () => import('./pages/Ticketing/TicketList'),
);

const Analytics = lazyWithRetries(() => import('./pages/Analytics'));
const AnalyticsInnerLayout = lazyWithRetries(
  () => import('./pages/Analytics/share/analytics_inner_layout'),
);

const SettingsRoles = lazyWithRetries(
  () => import('./pages/Settings/SettingsRoles'),
);
const SettingsRoleEdit = lazyWithRetries(
  () => import('./pages/Settings/SettingsRoles/EditRole'),
);

const isMobile = checkIsDeviceMobile();

const sentryCreateBrowserRouter =
  wrapCreateBrowserRouterV6(createBrowserRouter);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}

const CheckIsMobileLayout = () => {
  const [viewAsMobile] = useSessionStorage('viewAsMobile', false);

  return !isMobile || viewAsMobile ? <Outlet /> : <MobileAppLanding />;
};

const CheckIsSupportedBrowserLayout = () => {
  const [viewInUnsupportedBrowser] = useSessionStorage(
    'viewInUnsupportedBrowser',
    false,
  );
  const [hiddenUnsupportedBrowserLayout] = useLocalStorage(
    'hiddenUnsupportedBrowserLayout',
    false,
  );
  const { name, version } = getBrowserInfo();
  const isSupportedBrowser = SUPPORTED_BROWSER.some((browser) => {
    return browser.name === name && Number(browser.version) <= Number(version);
  });

  return isSupportedBrowser ||
    viewInUnsupportedBrowser ||
    hiddenUnsupportedBrowserLayout ? (
    <Outlet />
  ) : (
    <UnsupportedBrowserLanding />
  );
};

// Example: /en -> /en/inbox
const LocalisedBaseRedirect = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  return (
    <Navigate
      to={{ ...location, pathname: `/${i18n.language}/inbox` }}
      replace
    />
  );
};

// Example: /inbox -> /en/inbox
function BaseRedirect() {
  const { i18n } = useTranslation();
  const location = useLocation();

  return (
    <Navigate
      to={{ ...location, pathname: `/${i18n.language}${location.pathname}` }}
      replace
    />
  );
}

function PreserveParamsNavigate({ to, ...props }: NavigateProps) {
  const location = useLocation();

  return (
    <Navigate
      to={{
        ...location,
        ...(typeof to === 'string' ? { pathname: to } : to),
      }}
      replace
      {...props}
    />
  );
}

// Example: / -> /en/inbox
function Root() {
  const { i18n } = useTranslation();

  return <Navigate to={{ pathname: `/${i18n.language}/inbox` }} replace />;
}

const AUTHENTICATED_ROUTES_CONFIG: RouteObject[] = [
  {
    element: <InboxLayout />,
    children: [
      {
        path: ROUTES.inbox,
        element: <Inbox />,
      },
    ],
  },
  {
    path: ROUTES.tickets,
    children: [
      {
        element: <TicketingLayout />,
        children: [
          {
            index: true,
            element: <PreserveParamsNavigate to="all" replace />,
          },
          {
            path: '*',
            element: <TicketList />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.broadcasts,
    errorElement: <BroadcastErrorElement />,
    element: <BroadcastAccessControlContainer />,
    children: [
      {
        element: <Broadcasts />,
        index: true,
      },
      {
        children: [
          {
            path: CHANNEL.whatsappTwilio,
            children: [
              {
                index: true,
                element: <BroadcastCreateTwilio />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateTwilio />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewWhatsAppTwilio />,
              },
            ],
          },
          {
            path: CHANNEL.whatsapp360Dialog,
            children: [
              {
                index: true,
                element: <BroadcastCreateWhatsApp360Dialog />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateWhatsApp360Dialog />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewWhatsApp360Dialog />,
              },
            ],
          },
          {
            path: CHANNEL.whatsappCloudApi,
            children: [
              {
                index: true,
                element: <BroadcastCreateWhatsAppCloud />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateWhatsAppCloud />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewWhatsAppCloudApi />,
              },
            ],
          },
          {
            path: CHANNEL.facebook,
            children: [
              {
                index: true,
                element: <BroadcastCreateMessenger />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateMessenger />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewFacebookMessenger />,
              },
            ],
          },
          {
            path: CHANNEL.wechat,
            children: [
              {
                index: true,
                element: <BroadcastCreateWeChat />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateWeChat />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewWeChat />,
              },
            ],
          },
          {
            path: CHANNEL.sms,
            children: [
              {
                index: true,
                element: <BroadcastCreateSMS />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateSMS />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewSMS />,
              },
            ],
          },
          {
            path: CHANNEL.line,
            children: [
              {
                index: true,
                element: <BroadcastCreateLine />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateLine />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewLine />,
              },
            ],
          },
          {
            path: CHANNEL.note,
            children: [
              {
                index: true,
                element: <BroadcastCreateNote />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateNote />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewNote />,
              },
            ],
          },
          {
            path: CHANNEL.viber,
            children: [
              {
                index: true,
                element: <BroadcastCreateViber />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateViber />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewViber />,
              },
            ],
          },
          {
            path: CHANNEL.telegram,
            children: [
              {
                index: true,
                element: <BroadcastCreateTelegram />,
              },
              {
                path: ':templateId/edit',
                element: <BroadcastCreateTelegram />,
              },
              {
                path: ':templateId/review',
                element: <BroadcastReviewTelegram />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.contacts,
    children: [
      {
        element: <ContactsLayout />,
        children: [
          {
            index: true,
            element: <Contacts />,
          },
          {
            path: 'shopify',
            element: <ContactsShopify />,
          },
          {
            path: 'my-contacts',
            element: <ContactsMyContacts />,
          },
          {
            path: 'team',
            element: <ContactsTeam />,
          },
          {
            path: 'list/:id',
            element: <ContactsListId />,
          },
        ],
      },
      {
        path: ':id',
        errorElement: <ContactsIdError />,
        children: [
          {
            index: true,
            element: <ContactsId />,
          },
          {
            path: ':tab',
            element: <ContactsId />,
          },
        ],
      },
      {
        path: 'list',
        element: <ContactList />,
      },
      {
        path: 'create',
        element: <CreateContact />,
      },
      {
        path: 'import',
        element: <ContactsImport />,
      },
    ],
  },
  {
    path: 'next-flow-builder',
    errorElement: <FlowBuilderErrorElement />,
    element: <FlowBuilderAccessControlContainer />,
    children: [
      {
        path: ':id',
        element: <FlowBuilderV3IdLayout />,
        children: [
          {
            path: 'editor',
            element: <FlowBuilderV3IdEditor />,
          },
          {
            path: 'log',
            element: <FlowBuilderIdLog />,
          },
          {
            path: 'settings',
            element: <FlowBuilderIdSettings />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.flowBuilder,
    errorElement: <FlowBuilderErrorElement />,
    children: [
      {
        index: true,
        element: <Navigate to="listing" relative="path" replace />,
      },
      {
        element: <FlowBuilderLayout />,
        children: [
          {
            path: 'listing',
            element: <FlowBuilderListing />,
          },
          {
            path: 'usage',
            element: <FlowBuilderUsage />,
          },
        ],
      },
      {
        path: ':id',
        element: <FlowBuilderIdLayout />,
        errorElement: <FlowBuilderErrorElement />,
        children: [
          {
            path: 'editor',
            element: <FlowBuilderIdEditor />,
          },
          {
            path: 'log',
            element: <FlowBuilderIdLog />,
          },
          {
            path: 'settings',
            element: <FlowBuilderIdSettings />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.analytics,
    children: [
      {
        element: <Analytics />,
        children: [
          {
            path: 'conversations',
            element: <AnalyticsInnerLayout />,
          },
          {
            path: 'sales',
            element: <AnalyticsInnerLayout />,
          },
          {
            path: 'events',
            element: <AnalyticsInnerLayout />,
          },
          {
            path: 'topics',
            element: <AnalyticsInnerLayout />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.channels,
    errorElement: <ChannelsErrorElement />,
    children: [
      {
        element: <ChannelLayout />,
        children: [
          {
            index: true,
            element: <Channels />,
          },
          {
            path: 'whatsapp',
            element: <WhatsappCloud />,
            children: [
              {
                index: true,
                element: <Navigate to={{ pathname: 'account' }} replace />,
              },
              {
                path: 'account',
                element: <AccountSettings />,
              },
              {
                path: 'qr-code',
                element: <QrcodeSetting />,
              },
              {
                path: 'template',
                element: <TemplateSetting />,
              },
              {
                path: 'opt-in',
                element: <OptinSetting />,
              },
              {
                path: 'billing',
                element: <BillingList />,
              },
              ...(import.meta.env.VITE_USER_NODE_ENV === 'uat'
                ? [
                    {
                      path: 'conversational-component',
                      element: <ConversationalComponentSetting />,
                    },
                  ]
                : []),
            ],
          },
          {
            path: 'whatsapp/billing/:fbbaId',
            element: <BillingDetail />,
          },
          {
            path: 'twilio',
            element: <WhatsAppTwilio />,
          },
          {
            path: '360dialog',
            element: <WhatsApp360Dialog />,
          },
          {
            path: 'messenger',
            element: <Messenger />,
          },
          {
            path: 'sms',
            element: <SMS />,
          },
          {
            path: 'wechat',
            element: <WeChat />,
          },
          {
            path: 'line',
            element: <Line />,
          },
          {
            path: 'telegram',
            element: <Telegram />,
          },
          {
            path: 'viber',
            element: <Viber />,
          },
          {
            path: 'instagram',
            element: <Instagram />,
          },
          {
            path: 'live-chat-widget',
            element: <LiveChatWidget />,
            children: [
              {
                index: true,
                element: <GeneralSegment />,
              },
              {
                path: 'general',
                element: <GeneralSegment />,
              },
              {
                path: 'advanced',
                element: <AdvancedSegment />,
              },
              {
                path: 'languages',
                element: <LanguageSegment />,
              },
              {
                path: 'popup',
                element: <PopupMessageSegment />,
              },
              {
                path: 'channels',
                element: <ChannelSegment />,
              },
            ],
          },
        ],
      },
      {
        element: <ConnectChannelLayout />,
        children: [
          {
            path: 'wechat/connect',
            element: <ConnectWeChat />,
          },
          {
            path: 'messenger/connect',
            element: <ConnectMessenger />,
          },
          // TODO remove once finished testing with clients
          {
            path: 'facebook-login/experimental',
            element: <FacebookLoginExperimental />,
          },
          {
            path: 'instagram/connect',
            element: <ConnectInstagram />,
          },
          { path: 'line/connect', element: <ConnectLine /> },
          {
            path: 'telegram/connect',
            element: <ConnectTelegram />,
          },
          {
            path: 'sms/connect',
            element: <ConnectSMS />,
          },
          {
            path: 'viber/connect',
            element: <ConnectViber />,
          },
          {
            path: 'whatsapp/whatsapp-cloud-api/connect',
            element: <ConnectWhatsappCloudApi />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.templateCreate,
    element: <TemplateCreate />,
  },
  {
    path: ROUTES.integrations.index,
    errorElement: <IntegrationErrorElement />,
    children: [
      {
        element: <IntegrationsDashboard />,
        index: true,
      },
      {
        path: ':integrationCategory/:integrationKey',

        children: [
          {
            element: <IntegrationConnectionDashboard />,
            index: true,
          },
          {
            path: 'setup',
            element: <SetupConnection />,
          },
          {
            path: ':id/user-mapping',
            element: <ConnectionUserMapping />,
          },
        ],
      },
      {
        path: 'facebook-lead-ad',
        children: [
          {
            index: true,
            element: <FacebookLeadAdSetupDashboard />,
          },
          {
            path: 'mapping/:formId/init',
            element: <FacebookLeadAdMappingSetup mode="init" />,
          },
          {
            path: 'mapping/:formId/manage',
            element: <FacebookLeadAdMappingSetup mode="revisit" />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.commerceHub,
    element: <UnderConstruction title="commerce-hub" />,
  },
  {
    path: ROUTES.invite,
    element: <UnderConstruction title="invite-users" />,
  },
  {
    path: ROUTES.gettingStarted,
    element: <h1>Getting Started</h1>,
  },
  {
    path: ROUTES.settings,
    errorElement: <SettingsAccessDeniedErrorElement />,
    children: [
      {
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <SettingsGeneral />,
          },
          {
            path: 'company-details',
            element: <SettingsCompanyDetail />,
          },
          {
            path: 'user-management',
            element: <SettingsUserManagement />,
          },
          {
            path: 'team-management',
            element: <UnderConstruction title="team-management" hiddenHeader />,
          },
          {
            path: 'subscriptions',
            element: <SettingsSubscriptions />,
          },
          {
            path: 'add-ons',
            element: <SettingsAddOns />,
          },
          {
            path: 'inbox-settings',
            element: <UnderConstruction title="inbox-settings" hiddenHeader />,
          },
          {
            path: 'custom-objects',
            element: <SettingsCustomObject />,
          },
          {
            path: 'contact-properties/:scope',
            element: <SettingsContactProperties />,
          },
          {
            path: 'conversion-logging',
            element: <SettingsConversionLogging />,
          },
          {
            path: 'deleted-contacts',
            element: <SettingsDeletedContacts />,
          },
          {
            path: 'support-services',
            element: <SettingsSupportServices />,
          },
          {
            path: 'invoices',
            element: <SettingsInvoices />,
          },
          {
            path: 'labels',
            element: <SettingsLabels />,
          },
          {
            path: 'data-privacy',
            element: <SettingsDataPrivacy />, //todo
          },
          {
            path: 'audit-log',
            element:
              import.meta.env.VITE_USER_NODE_ENV !== 'production' ? (
                <AuditLog />
              ) : (
                <UnderConstruction title="settings" hiddenHeader={true} />
              ),
          },
          {
            path: 'ticketing',
            element: <SettingsTicketing />,
          },
          {
            path: 'sleekflow-lab',
            element: <SettingsSleekFlowLab />,
          },
          {
            path: 'integration-disconnection-alerts',
            element: <SettingsIntegrationDisconnectionAlerts />,
          },
          {
            path: 'roles-and-permissions',
            element: <SettingsRoles />,
          },
        ],
      },
      {
        path: 'custom-objects/create',
        element: <SettingsCustomObjectCreate />,
      },
      {
        path: 'custom-objects/:id',
        errorElement: <CustomObjectNotFound />,
        element: <EditCustomObject />,
      },
      {
        path: 'company-details/2fa',
        element: <SettingsCompanyDetail2FA />,
      },
      {
        path: 'company-details/ip-whiteList',
        element: <SettingsCompanyDetailIpWhiteList />,
      },
      {
        path: 'add-ons/adding',
        element: <SettingsAddOnsAdding />,
      },
      {
        path: 'manage-plan',
        element: <SettingsManagePlan />,
      },
      {
        path: 'manage-plan/subscribe-plan',
        element: <SettingsManagePlanSubscribePlan />,
      },
      {
        path: 'user-management/:id',
        element: <SettingsUserManagementEditUser />,
      },
      {
        path: 'roles-and-permissions/create',
        element: <SettingsRoleEdit />,
      },
      {
        path: 'roles-and-permissions/:id',
        element: <SettingsRoleEdit />,
      },
    ],
  },
  {
    path: ROUTES.aiSettings,
    errorElement: <AiSettingsErrorElement />,
    element: <AiSettingsAccessControlContainer />,
    children: [
      {
        index: true,
        element: <AiSettings />,
      },
      {
        path: 'upload',
        element: <AISettingsUploadNewSource />,
      },
      {
        path: 'agents/:id',
        element: <AiSettingsManageAgent />,
        children: [
          {
            index: true,
            element: <PreserveParamsNavigate to="persona" replace />,
          },
          {
            path: 'persona',
            element: <AiSettingsManageAgentPersona />,
          },
          {
            path: 'library',
            element: <AiSettingsTabLibrary />,
          },
        ],
      },
    ],
  },

  {
    path: ROUTES.customObjectData,
    errorElement: <CustomObjectNotFound />,
    children: [
      {
        element: <CustomObjectDataLayout />,
        children: [
          {
            index: true,
            element: <CustomObjectData />,
          },
        ],
      },
    ],
  },

  {
    path: ROUTES.customObjectDataIndex,
    errorElement: <CustomObjectNotFound />,
    children: [
      {
        element: <CustomObjectDataLayout />,
        children: [
          {
            index: true,
            element: <CustomObjectDataIndex />,
          },
        ],
      },
    ],
  },
];

const PUBLIC_ROUTES_CONFIG: RouteObject[] = [
  {
    path: ROUTES.invitationLink,
    element: <InvitationLink />,
  },
];

/**
 * The route structure is as follows:
 * 1. Check if user device is mobile, blocks the app entirely if so
 * 2. Check if user is using a supported browser
 * 4. Check path and handle redirects, for example:
 *  - / -> /en/inbox
 *  - /inbox -> /en/inbox
 *  - /en -> /en/inbox
 * 5. If accessing authenticated routes, check if user is authenticated
 * 6. Exact authenticated and public routes with locale
 * 7. 404
 * 8. invalid locales will redirect to 404 as well
 */

const ROUTER_SETUP: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <CheckIsMobileLayout />,
        children: [
          {
            element: <CheckIsSupportedBrowserLayout />,
            children: [
              ...[...PUBLIC_ROUTES_CONFIG, ...AUTHENTICATED_ROUTES_CONFIG].map(
                (route) => ({
                  element: <BaseRedirect />,
                  children: [route],
                }),
              ),
              ...AVAILABLE_LANGUAGES.map((locale) => ({
                element: <LocalisedBaseRedirect />,
                path: locale,
              })),
              // Public routes
              {
                element: <UnAuthenticatedLayout />,
                errorElement: <AppErrorElement />,
                children: AVAILABLE_LANGUAGES.map((locale) => ({
                  path: locale,
                  children: PUBLIC_ROUTES_CONFIG,
                })),
              },
              // Authenticated routes
              {
                element: <AuthenticationRequiredLayout />,
                children: [
                  {
                    element: <AuthenticatedSetupLayout />,
                    children: [
                      {
                        element:
                          import.meta.env.VITE_ENABLE_DEVICE_LIMIT ===
                          'true' ? (
                            <ExceedDeviceLimit />
                          ) : (
                            <Outlet />
                          ),
                        children: [
                          {
                            index: true,
                            element: <Root />,
                          },
                          {
                            element: <AuthenticatedLayout />,
                            errorElement: <AppErrorElement />,
                            children: AVAILABLE_LANGUAGES.map((locale) => ({
                              path: locale,
                              children: AUTHENTICATED_ROUTES_CONFIG,
                            })),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                path: '*',
                element: <NotFound />,
              },
            ],
          },
        ],
      },
    ],
  },
];

const router = sentryCreateBrowserRouter(ROUTER_SETUP);
