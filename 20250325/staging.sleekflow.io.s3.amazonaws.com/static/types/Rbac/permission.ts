export type PermissionKeyFromServer =
  | "mock-permission" // old mock data
  | "view:channel"
  | "connect:channel"
  | "edit:channel"
  | "delete:channel"
  | "manage:channel.billing"
  | "manage:channel.qrcode"
  | "manage:channel.optin"
  | "view:channel.template"
  | "create:channel.template"
  | "edit:channel.template"
  | "delete:channel.template"
  | "access:ticketing"
  | "manage:ticketing"
  | "view:ticketing.tickets"
  | "edit:ticketing.tickets"
  | "create:ticketing.tickets"
  | "delete:ticketing.tickets"
  | "view:analytics.conversation"
  | "view:analytics.sale"
  | "export:analytics.conversation"
  | "list:analytics.conversation.segment"
  | "create:analytics.conversation.segment"
  | "edit:analytics.conversation.segment"
  | "delete:analytics.conversation.segment"
  | "view:inbox.settings"
  | "edit:inbox.settings"
  | "create:inbox.settings"
  | "view:inbox.settings.quick_replies"
  | "create:inbox.settings.quick_replies"
  | "edit:inbox.settings.quick_replies"
  | "delete:inbox.settings.quick_replies"
  | "view:company"
  | "edit:company"
  | "view:security.settings"
  | "edit:security.settings"
  | "view:company.user"
  | "invite:company.user"
  | "edit:company.user"
  | "edit:company.user.security"
  | "delete:company.user"
  | "view:company.team"
  | "add:company.team"
  | "edit:company.team"
  | "delete:company.team"
  | "view:rbac"
  | "add:rbac"
  | "edit:rbac"
  | "view:company.auditlogs"
  | "view:plan.summary"
  | "manage:plan.subscriptions"
  | "view_conversations:view_default_channels_messages_only"
  | "assign_conversations:remain_collaborator_when_reassigned"
  | "send_message:become_collaborator_when_reply"
  | "view_conversations:unassigned_conversations_notifications";

const inbox = {
  inboxSettingsManage: "inbox:settings:manage",
  inboxSavedRepliesView: "inbox:settings:quick_replies:view",
  inboxSavedRepliesCreate: "inbox:settings:quick_replies:create",
  inboxSavedRepliesEdit: "inbox:settings:quick_replies:edit",
  inboxSavedRepliesDelete: "inbox:settings:quick_replies:delete",
} as const;

const ticketing = {
  ticketingAccess: "ticketing:access",
  ticketingManage: "ticketing:manage",
  ticketingTicketsCreate: "ticketing:tickets:create",
  ticketingTicketsDelete: "ticketing:tickets:delete",
} as const;

const companySettings = {
  companySettingsCompanyDetailsView: "company-settings:company-details:view",
  companySettingsCompanyDetailsEdit: "company-settings:company-details:edit",
  companySettingsSecuritySettingsView:
    "company-settings:security-settings:view",
  companySettingsSecuritySettingsEdit:
    "company-settings:security-settings:edit",
  companySettingsUserView: "company-settings:user:view",
  companySettingsUserInvite: "company-settings:user:invite",
  companySettingsUserEdit: "company-settings:user:edit",
  // companySettingsUserEmailEdit: 'company-settings:user:email-edit', // TODO: waiting for checking
  // companySettingsUserStatusEdit: 'company-settings:user:status-edit',
  companySettingsUserSecuritySettingsEdit:
    "company-settings:user:security-settings-edit",
  companySettingsUserDelete: "company-settings:user:delete",
  companySettingsTeamView: "company-settings:team:view",
  companySettingsTeamCreate: "company-settings:team:create",
  companySettingsTeamEdit: "company-settings:team:edit",
  companySettingsTeamDelete: "company-settings:team:delete",
  companySettingsRoleView: "company-settings:role:view",
  companySettingsRoleCreate: "company-settings:role:create",
  companySettingsRoleEdit: "company-settings:role:edit",
  // companySettingsRoleDelete: 'company-settings:role:delete', // TODO: waiting for implementation
  companySettingsAuditLogView: "company-settings:audit-log:view",
  // companySettingsAuditLogExport: 'company-settings:audit-log:export', // TODO: waiting for implementation
  // companySettingsPiiMaskingView: 'company-settings:pii-masking:view', // TODO: waiting for implementation
  // companySettingsPiiMaskingCreate: 'company-settings:pii-masking:create',
  // companySettingsPiiMaskingEdit: 'company-settings:pii-masking:edit',
  // companySettingsPiiMaskingDelete: 'company-settings:pii-masking:delete',
} as const;

const plansAndBillings = {
  plansAndBillingsPlanAndSubscriptionManage:
    "plans-and-billings:plan-and-subscription:manage",
  planSummaryAccess: "plans-and-billings:plan-summary:access",
} as const;

const channel = {
  channelView: "channel:view",
  channelConnect: "channel:connect",
  channelEdit: "channel:edit",
  channelDelete: "channel:delete",
  channelBillingManage: "channel.billing:manage",
  channelQRCodeManage: "channel.qrcode:manage",
  channelOptInManage: "channel.optin:manage",
  channelTemplateView: "channel.template:view",
  channelTemplateCreate: "channel.template:create",
  channelTemplateEdit: "channel.template:edit",
  channelTemplateDelete: "channel.template:delete",
} as const;

const analytics = {
  analyticsConversationView: "analytics:conversation:view",
  analyticsSalesView: "analytics:sales:view",
  analyticsConversationExport: "analytics:conversation:export",
  analyticsConversationSegmentManage: "analytics:conversation:segment:manage",
} as const;

export const PERMISSION_KEY = {
  ...inbox,
  ...companySettings,
  ...plansAndBillings,
  ...channel,
  ...ticketing,
  ...analytics,
} as const;
export type PermissionKey = typeof PERMISSION_KEY[keyof typeof PERMISSION_KEY];

export const PERMISSION_DICT: {
  [key in PermissionKey]: PermissionKeyFromServer[];
} = {
  [PERMISSION_KEY.companySettingsCompanyDetailsView]: ["view:company"],
  [PERMISSION_KEY.companySettingsCompanyDetailsEdit]: ["edit:company"],
  [PERMISSION_KEY.companySettingsSecuritySettingsView]: [
    "view:security.settings",
  ],
  [PERMISSION_KEY.companySettingsSecuritySettingsEdit]: [
    "edit:security.settings",
  ],
  [PERMISSION_KEY.companySettingsUserView]: ["view:company.user"],
  [PERMISSION_KEY.companySettingsUserInvite]: ["invite:company.user"],
  [PERMISSION_KEY.companySettingsUserEdit]: ["edit:company.user"],
  // [PERMISSION_KEY.companySettingsUserEmailEdit]: ['edit:company.user'], // TODO: waiting for checking
  // [PERMISSION_KEY.companySettingsUserStatusEdit]: ['edit:company.user'],
  [PERMISSION_KEY.companySettingsUserSecuritySettingsEdit]: [
    "edit:company.user.security",
  ],
  [PERMISSION_KEY.companySettingsUserDelete]: ["delete:company.user"],
  [PERMISSION_KEY.companySettingsTeamView]: ["view:company.team"],
  [PERMISSION_KEY.companySettingsTeamCreate]: ["add:company.team"],
  [PERMISSION_KEY.companySettingsTeamEdit]: ["edit:company.team"],
  [PERMISSION_KEY.companySettingsTeamDelete]: ["delete:company.team"],
  [PERMISSION_KEY.companySettingsRoleView]: ["view:rbac"],
  [PERMISSION_KEY.companySettingsRoleCreate]: ["add:rbac"],
  [PERMISSION_KEY.companySettingsRoleEdit]: ["edit:rbac"],
  // [PERMISSION_KEY.companySettingsRoleDelete]: ['mock-permission'], // TODO: waiting for implementation
  [PERMISSION_KEY.companySettingsAuditLogView]: ["view:company.auditlogs"],
  // [PERMISSION_KEY.companySettingsAuditLogExport]: ['mock-permission'], // TODO: waiting for implementation
  // [PERMISSION_KEY.companySettingsPiiMaskingView]: ['mock-permission'], // TODO: waiting for implementation
  // [PERMISSION_KEY.companySettingsPiiMaskingCreate]: ['mock-permission'],
  // [PERMISSION_KEY.companySettingsPiiMaskingEdit]: ['mock-permission'],
  // [PERMISSION_KEY.companySettingsPiiMaskingDelete]: ['mock-permission'],
  [PERMISSION_KEY.planSummaryAccess]: ["view:plan.summary"],
  [PERMISSION_KEY.plansAndBillingsPlanAndSubscriptionManage]: [
    "manage:plan.subscriptions",
  ],
  // channel
  [PERMISSION_KEY.channelView]: ["view:channel"],
  [PERMISSION_KEY.channelConnect]: ["connect:channel"],
  [PERMISSION_KEY.channelEdit]: ["edit:channel"],
  [PERMISSION_KEY.channelDelete]: ["delete:channel"],
  [PERMISSION_KEY.channelBillingManage]: ["manage:channel.billing"],
  [PERMISSION_KEY.channelQRCodeManage]: ["manage:channel.qrcode"],
  [PERMISSION_KEY.channelOptInManage]: ["manage:channel.optin"],
  [PERMISSION_KEY.channelTemplateView]: ["view:channel.template"],
  [PERMISSION_KEY.channelTemplateCreate]: ["create:channel.template"],
  [PERMISSION_KEY.channelTemplateEdit]: ["edit:channel.template"],
  [PERMISSION_KEY.channelTemplateDelete]: ["delete:channel.template"],
  [PERMISSION_KEY.ticketingAccess]: [
    "access:ticketing",
    "view:ticketing.tickets",
    "edit:ticketing.tickets",
  ],
  [PERMISSION_KEY.ticketingManage]: ["manage:ticketing"],
  [PERMISSION_KEY.ticketingTicketsCreate]: ["create:ticketing.tickets"],
  [PERMISSION_KEY.ticketingTicketsDelete]: ["delete:ticketing.tickets"],

  [PERMISSION_KEY.analyticsConversationView]: ["view:analytics.conversation"],
  [PERMISSION_KEY.analyticsSalesView]: ["view:analytics.sale"],
  [PERMISSION_KEY.analyticsConversationExport]: [
    "export:analytics.conversation",
  ],
  [PERMISSION_KEY.analyticsConversationSegmentManage]: [
    "list:analytics.conversation.segment",
    "create:analytics.conversation.segment",
    "edit:analytics.conversation.segment",
    "delete:analytics.conversation.segment",
  ],

  [PERMISSION_KEY.inboxSettingsManage]: [
    "view:inbox.settings",
    "edit:inbox.settings",
    "create:inbox.settings",
  ],
  [PERMISSION_KEY.inboxSavedRepliesView]: ["view:inbox.settings.quick_replies"],
  [PERMISSION_KEY.inboxSavedRepliesCreate]: [
    "create:inbox.settings.quick_replies",
  ],
  [PERMISSION_KEY.inboxSavedRepliesEdit]: ["edit:inbox.settings.quick_replies"],
  [PERMISSION_KEY.inboxSavedRepliesDelete]: [
    "delete:inbox.settings.quick_replies",
  ],
};
