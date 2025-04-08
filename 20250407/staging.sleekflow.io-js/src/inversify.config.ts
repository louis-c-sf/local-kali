import {
  AccountApi,
  AnalyticsApi,
  AttachmentApi,
  AuditHubApi,
  Auth0AccountApi,
  Auth0ActionEventApi,
  Auth0CompanyApi,
  AutomationApi,
  BackgroundTaskApi,
  BroadcastMessageApi,
  CommerceHubApi,
  CommonApi,
  CompanyApi,
  CompanyTeamApi,
  Configuration,
  ConversationApi,
  ConversationMessageApi,
  CrmHubApi,
  DemoApi,
  ErrorApi,
  ExtendedMessageFilesApi,
  FbIgAutoReplyApi,
  FbOtnApi,
  FlowHubApi,
  ImportWhatsappHistoryApi,
  IntelligentHubApi,
  JourneyBuilderCustomActivityApi,
  LiveWebhookApi,
  MessageApi,
  MessagingChannelApi,
  PublicApiApi,
  PushNotificationsApi,
  QrcodeGeneratorApi,
  QuickReplyApi,
  RegisterWhatsappApi,
  SandboxApi,
  ShareableInvitationApi,
  ShopifyApi,
  ShopifyDraftOrderApi,
  ShopifyMandatoryWebhookApi,
  ShopifyProductApi,
  ShopifySubscriptionApi,
  StripeApi,
  StripePaymentApi,
  StripePaymentLinkApi,
  SupportTicketApi,
  SuzukiClientCustomApi,
  TagsApi,
  TenantHubApi,
  TicketingHubApi,
  TwilioTemplateApi,
  UserProfileApi,
  UserRoleApi,
  WebClientApi,
  WebhookApi,
  WebsiteApi,
  WhatsApp360DialogApi,
  WhatsApp360DialogFileApi,
  WhatsApp360DialogOptinApi,
  WhatsApp360DialogTemplateApi,
  WhatsappCloudApiApi,
  WhatsappCloudApiMigrationApi,
  WhatsappCloudApiOptinApi,
  WhatsappCloudApiProductCatalogApi,
  WhatsappCloudApiTemplateApi,
  WhatsAppTemplateQuickReplyCallbackApi,
  ZapierApiApi,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { Container } from 'inversify';
import { filter, lastValueFrom, take } from 'rxjs';
import { AjaxConfig } from 'rxjs/ajax';

import { Contacts } from '@/services/contacts';
import { ConversationInputs } from '@/services/conversation-inputs';
import { i18n } from '@/services/i18n';
import { LogService } from '@/services/logs/log.service';
import { OnlineManager } from '@/services/online-manager';
import { PushNotifications } from '@/services/push-notifications';

import { Analytics } from './services/analytics';
import { AuthService } from './services/auth.service';
import { Commerces } from './services/commerces';
import { Companies } from './services/companies';
import { SavedReplies } from './services/companies/saved-replies';
import { ConversationMessages } from './services/conversation-messages';
import { Conversations } from './services/conversations';
import { Features } from './services/features';
import { Labels } from './services/labels';
import { Persistences } from './services/persistences';
import { SignalR } from './services/signal-r';
import { ClassicRealTimeService } from './services/signal-r/classic-real-time.service';
import { Sleekpay } from './services/sleekpay';
import { Ticketing } from './services/ticketing';
import { ToastMessages } from './services/toast-messages';
import { UserProfileAuditLogs } from './services/user-profile-audit-logs';
import { UserProfiles } from './services/user-profiles';
import { Permissions } from './services/permissions';
import { getUserDefaultWorkspace } from './api/tenantHub';

export const container = new Container();

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL,
  middleware: [
    {
      async preAsync(request: AjaxConfig): Promise<AjaxConfig> {
        const accessToken = await lastValueFrom(
          container.get<AuthService>(AuthService).getAccessTokenSilently$(),
        );

        if (request.url?.startsWith(import.meta.env.VITE_API_BASE_URL)) {
          request.headers = {
            ...request.headers,
            Authorization: `Bearer ${accessToken}`,
          };
        }

        return request;
      },
    },
    {
      async preAsync(request: AjaxConfig): Promise<AjaxConfig> {
        const userWorkspace = await getUserDefaultWorkspace();

        if (request.url?.startsWith(import.meta.env.VITE_API_BASE_URL)) {
          request.headers = {
            ...request.headers,
            'X-Sleekflow-Location': userWorkspace.server_location,
          };
        }

        return request;
      },
    },
  ],
});

container
  .bind<AccountApi>(AccountApi)
  .toConstantValue(new AccountApi(configuration));
container
  .bind<AnalyticsApi>(AnalyticsApi)
  .toConstantValue(new AnalyticsApi(configuration));
container
  .bind<AttachmentApi>(AttachmentApi)
  .toConstantValue(new AttachmentApi(configuration));
container
  .bind<AuditHubApi>(AuditHubApi)
  .toConstantValue(new AuditHubApi(configuration));
container
  .bind<Auth0AccountApi>(Auth0AccountApi)
  .toConstantValue(new Auth0AccountApi(configuration));
container
  .bind<Auth0ActionEventApi>(Auth0ActionEventApi)
  .toConstantValue(new Auth0ActionEventApi(configuration));
container
  .bind<Auth0CompanyApi>(Auth0CompanyApi)
  .toConstantValue(new Auth0CompanyApi(configuration));
container
  .bind<AutomationApi>(AutomationApi)
  .toConstantValue(new AutomationApi(configuration));
container
  .bind<BackgroundTaskApi>(BackgroundTaskApi)
  .toConstantValue(new BackgroundTaskApi(configuration));
container
  .bind<BroadcastMessageApi>(BroadcastMessageApi)
  .toConstantValue(new BroadcastMessageApi(configuration));
container
  .bind<CommerceHubApi>(CommerceHubApi)
  .toConstantValue(new CommerceHubApi(configuration));
container
  .bind<CommonApi>(CommonApi)
  .toConstantValue(new CommonApi(configuration));
container
  .bind<CompanyApi>(CompanyApi)
  .toConstantValue(new CompanyApi(configuration));
container
  .bind<CompanyTeamApi>(CompanyTeamApi)
  .toConstantValue(new CompanyTeamApi(configuration));
container
  .bind<ConversationApi>(ConversationApi)
  .toConstantValue(new ConversationApi(configuration));
container
  .bind<ConversationMessageApi>(ConversationMessageApi)
  .toConstantValue(new ConversationMessageApi(configuration));
container
  .bind<CrmHubApi>(CrmHubApi)
  .toConstantValue(new CrmHubApi(configuration));
container.bind<DemoApi>(DemoApi).toConstantValue(new DemoApi(configuration));
container.bind<ErrorApi>(ErrorApi).toConstantValue(new ErrorApi(configuration));
container
  .bind<ExtendedMessageFilesApi>(ExtendedMessageFilesApi)
  .toConstantValue(new ExtendedMessageFilesApi(configuration));
container
  .bind<FbIgAutoReplyApi>(FbIgAutoReplyApi)
  .toConstantValue(new FbIgAutoReplyApi(configuration));
container.bind<FbOtnApi>(FbOtnApi).toConstantValue(new FbOtnApi(configuration));
container
  .bind<FlowHubApi>(FlowHubApi)
  .toConstantValue(new FlowHubApi(configuration));
container
  .bind<ImportWhatsappHistoryApi>(ImportWhatsappHistoryApi)
  .toConstantValue(new ImportWhatsappHistoryApi(configuration));
container
  .bind<IntelligentHubApi>(IntelligentHubApi)
  .toConstantValue(new IntelligentHubApi(configuration));
container
  .bind<JourneyBuilderCustomActivityApi>(JourneyBuilderCustomActivityApi)
  .toConstantValue(new JourneyBuilderCustomActivityApi(configuration));
container
  .bind<LiveWebhookApi>(LiveWebhookApi)
  .toConstantValue(new LiveWebhookApi(configuration));
container
  .bind<MessageApi>(MessageApi)
  .toConstantValue(new MessageApi(configuration));
container
  .bind<MessagingChannelApi>(MessagingChannelApi)
  .toConstantValue(new MessagingChannelApi(configuration));
container
  .bind<PublicApiApi>(PublicApiApi)
  .toConstantValue(new PublicApiApi(configuration));
container
  .bind<PushNotificationsApi>(PushNotificationsApi)
  .toConstantValue(new PushNotificationsApi(configuration));
container
  .bind<QrcodeGeneratorApi>(QrcodeGeneratorApi)
  .toConstantValue(new QrcodeGeneratorApi(configuration));
container
  .bind<QuickReplyApi>(QuickReplyApi)
  .toConstantValue(new QuickReplyApi(configuration));
container
  .bind<RegisterWhatsappApi>(RegisterWhatsappApi)
  .toConstantValue(new RegisterWhatsappApi(configuration));
container
  .bind<SandboxApi>(SandboxApi)
  .toConstantValue(new SandboxApi(configuration));
container
  .bind<ShareableInvitationApi>(ShareableInvitationApi)
  .toConstantValue(new ShareableInvitationApi(configuration));
container
  .bind<ShopifyApi>(ShopifyApi)
  .toConstantValue(new ShopifyApi(configuration));
container
  .bind<ShopifyDraftOrderApi>(ShopifyDraftOrderApi)
  .toConstantValue(new ShopifyDraftOrderApi(configuration));
container
  .bind<ShopifyMandatoryWebhookApi>(ShopifyMandatoryWebhookApi)
  .toConstantValue(new ShopifyMandatoryWebhookApi(configuration));
container
  .bind<ShopifyProductApi>(ShopifyProductApi)
  .toConstantValue(new ShopifyProductApi(configuration));
container
  .bind<ShopifySubscriptionApi>(ShopifySubscriptionApi)
  .toConstantValue(new ShopifySubscriptionApi(configuration));
container
  .bind<StripeApi>(StripeApi)
  .toConstantValue(new StripeApi(configuration));
container
  .bind<StripePaymentApi>(StripePaymentApi)
  .toConstantValue(new StripePaymentApi(configuration));
container
  .bind<StripePaymentLinkApi>(StripePaymentLinkApi)
  .toConstantValue(new StripePaymentLinkApi(configuration));
container
  .bind<SupportTicketApi>(SupportTicketApi)
  .toConstantValue(new SupportTicketApi(configuration));
container
  .bind<SuzukiClientCustomApi>(SuzukiClientCustomApi)
  .toConstantValue(new SuzukiClientCustomApi(configuration));
container.bind<TagsApi>(TagsApi).toConstantValue(new TagsApi(configuration));
container
  .bind<TenantHubApi>(TenantHubApi)
  .toConstantValue(new TenantHubApi(configuration));
container
  .bind<TwilioTemplateApi>(TwilioTemplateApi)
  .toConstantValue(new TwilioTemplateApi(configuration));
container
  .bind<UserProfileApi>(UserProfileApi)
  .toConstantValue(new UserProfileApi(configuration));
container
  .bind<UserRoleApi>(UserRoleApi)
  .toConstantValue(new UserRoleApi(configuration));
container
  .bind<WebClientApi>(WebClientApi)
  .toConstantValue(new WebClientApi(configuration));
container
  .bind<WebhookApi>(WebhookApi)
  .toConstantValue(new WebhookApi(configuration));
container
  .bind<WebsiteApi>(WebsiteApi)
  .toConstantValue(new WebsiteApi(configuration));
container
  .bind<WhatsApp360DialogApi>(WhatsApp360DialogApi)
  .toConstantValue(new WhatsApp360DialogApi(configuration));
container
  .bind<WhatsApp360DialogFileApi>(WhatsApp360DialogFileApi)
  .toConstantValue(new WhatsApp360DialogFileApi(configuration));
container
  .bind<WhatsApp360DialogOptinApi>(WhatsApp360DialogOptinApi)
  .toConstantValue(new WhatsApp360DialogOptinApi(configuration));
container
  .bind<WhatsApp360DialogTemplateApi>(WhatsApp360DialogTemplateApi)
  .toConstantValue(new WhatsApp360DialogTemplateApi(configuration));
container
  .bind<WhatsappCloudApiApi>(WhatsappCloudApiApi)
  .toConstantValue(new WhatsappCloudApiApi(configuration));
container
  .bind<WhatsappCloudApiMigrationApi>(WhatsappCloudApiMigrationApi)
  .toConstantValue(new WhatsappCloudApiMigrationApi(configuration));
container
  .bind<WhatsappCloudApiOptinApi>(WhatsappCloudApiOptinApi)
  .toConstantValue(new WhatsappCloudApiOptinApi(configuration));
container
  .bind<WhatsappCloudApiProductCatalogApi>(WhatsappCloudApiProductCatalogApi)
  .toConstantValue(new WhatsappCloudApiProductCatalogApi(configuration));
container
  .bind<WhatsappCloudApiTemplateApi>(WhatsappCloudApiTemplateApi)
  .toConstantValue(new WhatsappCloudApiTemplateApi(configuration));
container
  .bind<WhatsAppTemplateQuickReplyCallbackApi>(
    WhatsAppTemplateQuickReplyCallbackApi,
  )
  .toConstantValue(new WhatsAppTemplateQuickReplyCallbackApi(configuration));
container
  .bind<ZapierApiApi>(ZapierApiApi)
  .toConstantValue(new ZapierApiApi(configuration));
container
  .bind<TicketingHubApi>(TicketingHubApi)
  .toConstantValue(new TicketingHubApi(configuration));

container.bind<AuthService>(AuthService).to(AuthService).inSingletonScope();
container.bind<LogService>(LogService).to(LogService).inSingletonScope();

Commerces.loadDeps(container);
Companies.loadDeps(container);
SavedReplies.loadDeps(container);
ConversationMessages.loadDeps(container);
Conversations.loadDeps(container);
Features.loadDeps(container);
Labels.loadDeps(container);
i18n.loadDeps(container);
Persistences.loadDeps(container);
SignalR.loadDeps(container);
Sleekpay.loadDeps(container);
UserProfileAuditLogs.loadDeps(container);
UserProfiles.loadDeps(container);
Contacts.loadDeps(container);
ConversationInputs.loadDeps(container);
Analytics.loadDeps(container);
PushNotifications.loadDeps(container);
OnlineManager.loadDeps(container);
Ticketing.loadDeps(container);
ToastMessages.loadDeps(container);
Permissions.loadDeps(container);

container
  .get<AuthService>(AuthService)
  .getIsInitialized$()
  .pipe(
    filter((t) => t),
    take(1),
  )
  .subscribe((t) => {
    if (t) {
      console.log('Authenticated.');
      container.get<ClassicRealTimeService>(ClassicRealTimeService).init();
    }
  });

export default function getContainer() {
  return container;
}
