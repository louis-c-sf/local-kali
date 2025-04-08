import type { PermissionKeyFromServer } from '@/api/permissionKeyFromServer';

const inbox = {
  inboxConversationView: 'inbox:conversation:view',
  inboxConversationViewAssignedToMe: 'inbox:conversation:view:assigned_to_me',
  inboxConversationViewAssignedToMyTeam:
    'inbox:conversation:view:assigned_to_my_team',
  inboxConversationViewAllAssigned: 'inbox:conversation:view:all_assigned',
  inboxConversationViewUnassignedUnderMyTeam:
    'inbox:conversation:view:unassigned_under_my_team',
  inboxConversationViewAllUnassigned: 'inbox:conversation:view:all_unassigned',
  inboxConversationCreate: 'inbox:conversation:create',
  inboxConversationSendMessageAssignedToMe: 'inbox:send_message:assigned_to_me',
  inboxConversationSendMessageAssignedToMyTeam:
    'inbox:send_message:assigned_to_my_team',
  inboxConversationSendMessageAllAssigned: 'inbox:send_message:all_assigned',
  inboxConversationSendMessageUnassignedUnderMyTeam:
    'inbox:send_message:unassigned_under_my_team',
  inboxConversationSendMessageAllUnassigned:
    'inbox:send_message:all_unassigned',
  inboxSendPaymentLinkView: 'inbox:send_payment_link:view',
  inboxSendProductCatalogView: 'inbox:send_product_catalog:view',
  inboxConversationAssignmentEdit: 'inbox:conversation:assignment:edit',
  inboxConversationAssignToMe: 'inbox:conversation:assign_to_me',
  inboxConversationAssignToAnyUser: 'inbox:conversation:assign_to_any_user',
  inboxSettingsManage: 'inbox:settings:manage',
  inboxSavedRepliesView: 'inbox:settings:quick_replies:view',
  inboxSavedRepliesCreate: 'inbox:settings:quick_replies:create',
  inboxSavedRepliesEdit: 'inbox:settings:quick_replies:edit',
  inboxSavedRepliesDelete: 'inbox:settings:quick_replies:delete',
} as const;

const ticketing = {
  ticketingAccess: 'ticketing:access',
  ticketingManage: 'ticketing:manage',
  ticketingTicketsCreate: 'ticketing:tickets:create',
  ticketingTicketsDelete: 'ticketing:tickets:delete',
} as const;

const contacts = {
  contactsAccess: 'contacts:contact:access',

  contactsAssignedToMeView: 'contacts:contact:assigned-to-me:view',
  contactsAssignedToMyTeamView: 'contacts:contact:assigned-to-my-team:view',
  contactsAssignedToOthersView: 'contacts:contact:assigned-to-others:view',
  contactsAssignedToNoneView: 'contacts:contact:assigned-to-none:view',

  contactsAssignedToMeEdit: 'contacts:contact:assigned-to-me:edit',
  contactsAssignedToMyTeamEdit: 'contacts:contact:assigned-to-my-team:edit',
  contactsAssignedToOthersEdit: 'contacts:contact:assigned-to-others:edit',
  contactsAssignedToNoneEdit: 'contacts:contact:assigned-to-none:edit',

  contactsAssignedToMeDelete: 'contacts:contact:assigned-to-me:delete',
  contactsAssignedToMyTeamDelete: 'contacts:contact:assigned-to-my-team:delete',
  contactsAssignedToOthersDelete: 'contacts:contact:assigned-to-others:delete',
  contactsAssignedToNoneDelete: 'contacts:contact:assigned-to-none:delete',

  contactsAssignToMe: 'contacts:contact:assign-to-me',
  contactsAssignToMyTeam: 'contacts:contact:assign-to-my-team',
  contactsAssignToOthers: 'contacts:contact:assign-to-others',

  contactsCreate: 'contacts:contact:create',
  contactsExport: 'contacts:contact:export',

  contactsListView: 'contacts:list:view',
  contactsListCreate: 'contacts:list:create',
  contactsListEdit: 'contacts:list:edit',
  contactsListDelete: 'contacts:list:delete',
  contactsListAddRemoveContacts: 'contacts:list:add-remove-contacts',

  contactsSettingsLabelsView: 'company-settings:labels:view',
  contactsSettingsLabelsCreate: 'company-settings:labels:create',
  contactsSettingsLabelsEdit: 'company-settings:labels:edit',
  contactsSettingsLabelsDelete: 'company-settings:labels:delete',

  contactsSettingsCustomFieldsView: 'company-settings:contact-properties:view',
  contactsSettingsCustomFieldsCreate:
    'company-settings:contact-properties:create',
  contactsSettingsCustomFieldsEdit: 'company-settings:contact-properties:edit',
  contactsSettingsCustomFieldsDelete:
    'company-settings:contact-properties:delete',

  contactsSettingsDeletedView: 'company-settings:contacts-deleted:view',
  contactsSettingsConversionLoggingAccess:
    'company-settings:contacts-conversion-logs:access',
} as const;

const companySettings = {
  companySettingsCompanyDetailsView: 'company-settings:company-details:view',
  companySettingsCompanyDetailsEdit: 'company-settings:company-details:edit',
  companySettingsSecuritySettingsView:
    'company-settings:security-settings:view',
  companySettingsSecuritySettingsEdit:
    'company-settings:security-settings:edit',
  companySettingsUserView: 'company-settings:user:view',
  companySettingsUserInvite: 'company-settings:user:invite',
  companySettingsUserEdit: 'company-settings:user:edit',
  // companySettingsUserEmailEdit: 'company-settings:user:email-edit', // TODO: waiting for checking
  // companySettingsUserStatusEdit: 'company-settings:user:status-edit',
  companySettingsUserSecuritySettingsEdit:
    'company-settings:user:security-settings-edit',
  companySettingsUserDelete: 'company-settings:user:delete',
  companySettingsTeamView: 'company-settings:team:view',
  companySettingsTeamCreate: 'company-settings:team:create',
  companySettingsTeamEdit: 'company-settings:team:edit',
  companySettingsTeamDelete: 'company-settings:team:delete',
  companySettingsRoleView: 'company-settings:role:view',
  companySettingsRoleCreate: 'company-settings:role:create',
  companySettingsRoleEdit: 'company-settings:role:edit',
  companySettingsRoleDelete: 'company-settings:role:delete',
  companySettingsAuditLogView: 'company-settings:audit-log:view',
  // companySettingsAuditLogExport: 'company-settings:audit-log:export', // TODO: waiting for implementation
  // companySettingsPiiMaskingView: 'company-settings:pii-masking:view', // TODO: waiting for implementation
  // companySettingsPiiMaskingCreate: 'company-settings:pii-masking:create',
  // companySettingsPiiMaskingEdit: 'company-settings:pii-masking:edit',
  // companySettingsPiiMaskingDelete: 'company-settings:pii-masking:delete',
} as const;

const plansAndBillings = {
  plansAndBillingsPlanAndSubscriptionManage:
    'plans-and-billings:plan-and-subscription:manage',
  planSummaryAccess: 'plans-and-billings:plan-summary:access',
} as const;

const channel = {
  channelView: 'channel:view',
  channelConnect: 'channel:connect',
  channelEdit: 'channel:edit',
  channelDelete: 'channel:delete',
  channelBillingManage: 'channel:billing:manage',
  channelOptInManage: 'channel:optin:manage',
  channelTemplateView: 'channel:template:view',
  channelTemplateCreate: 'channel:template:create',
  channelTemplateEdit: 'channel:template:edit',
  channelTemplateDelete: 'channel:template:delete',
  channelQrCodeManage: 'channel:qrcode:manage',
} as const;

const analytics = {
  analyticsConversationView: 'view:analytics:conversation',
  analyticsSalesView: 'view:analytics:sale',
  analyticsConversationExport: 'export:analytics:conversation',
  analyticsConversationSegmentManage: 'manage:analytics:conversation:segment',
  analyticsEventsView: 'access:analytics:events',
} as const;

const customObjects = {
  customObjectsDataAccess: 'custom-objects:data:access',
  customObjectsDataCreate: 'custom-objects:data:create',
  customObjectsDataEdit: 'custom-objects:data:edit',
  customObjectsDataDelete: 'custom-objects:data:delete',
  customObjectsSettingsManage: 'company-settings:custom-objects:manage',
} as const;

const privacySettings = {
  privacySettingsDataAccess: 'privacy-settings:access',
  privacySettingsDataCreate: 'privacy-settings:create',
  privacySettingsDataEdit: 'privacy-settings:edit',
  privacySettingsDataDelete: 'privacy-settings:delete',
} as const;

const integrations = {
  integrationsView: 'integrations:view',
} as const;

const commerce = {
  commerceView: 'commerce:view',
  commerceSettingsAccess: 'commerce.settings:access',
} as const;

const flowBuilder = {
  flowBuilderView: 'access:flow-builder',
  flowDetailView: 'view:details',
  flowCreate: 'create:flow',
  flowEdit: 'edit:flow',
  flowDelete: 'delete:flow',
} as const;

const broadcast = {
  broadcastView: 'access:broadcast',
  broadcastCreate: 'create:broadcast',
  broadcastPublish: 'publish:broadcast',
  broadcastDelete: 'delete:broadcast',
} as const;

const ai = {
  aiView: 'access:ai',
} as const;

export const PERMISSION_KEY = {
  ...inbox,
  ...contacts,
  ...integrations,
  ...commerce,
  ...companySettings,
  ...plansAndBillings,
  ...channel,
  ...ticketing,
  ...analytics,
  ...customObjects,
  ...privacySettings,
  ...flowBuilder,
  ...broadcast,
  ...ai,
} as const;

export type PermissionKey =
  (typeof PERMISSION_KEY)[keyof typeof PERMISSION_KEY];

export const PERMISSION_DICT: {
  [key in PermissionKey]: PermissionKeyFromServer[];
} = {
  [PERMISSION_KEY.companySettingsCompanyDetailsView]: ['view:company'],
  [PERMISSION_KEY.companySettingsCompanyDetailsEdit]: ['edit:company'],
  [PERMISSION_KEY.companySettingsSecuritySettingsView]: [
    'view:security.settings',
  ],
  [PERMISSION_KEY.companySettingsSecuritySettingsEdit]: [
    'edit:security.settings',
  ],
  [PERMISSION_KEY.companySettingsUserView]: ['view:company.user'],
  [PERMISSION_KEY.companySettingsUserInvite]: ['invite:company.user'],
  [PERMISSION_KEY.companySettingsUserEdit]: ['edit:company.user'],
  // [PERMISSION_KEY.companySettingsUserEmailEdit]: ['edit:company.user'], // TODO: waiting for checking
  // [PERMISSION_KEY.companySettingsUserStatusEdit]: ['edit:company.user'],
  [PERMISSION_KEY.companySettingsUserSecuritySettingsEdit]: [
    'edit:company.user.security',
  ],
  [PERMISSION_KEY.companySettingsUserDelete]: ['delete:company.user'],
  [PERMISSION_KEY.companySettingsTeamView]: ['view:company.team'],
  [PERMISSION_KEY.companySettingsTeamCreate]: ['add:company.team'],
  [PERMISSION_KEY.companySettingsTeamEdit]: ['edit:company.team'],
  [PERMISSION_KEY.companySettingsTeamDelete]: ['delete:company.team'],
  [PERMISSION_KEY.companySettingsRoleView]: ['view:rbac'],
  [PERMISSION_KEY.companySettingsRoleCreate]: ['add:rbac'],
  [PERMISSION_KEY.companySettingsRoleEdit]: ['edit:rbac'],
  [PERMISSION_KEY.companySettingsRoleDelete]: ['delete:rbac'],
  [PERMISSION_KEY.companySettingsAuditLogView]: ['view:company.auditlogs'],
  // [PERMISSION_KEY.companySettingsAuditLogExport]: ['mock-permission'], // TODO: waiting for implementation
  // [PERMISSION_KEY.companySettingsPiiMaskingView]: ['mock-permission'], // TODO: waiting for implementation
  // [PERMISSION_KEY.companySettingsPiiMaskingCreate]: ['mock-permission'],
  // [PERMISSION_KEY.companySettingsPiiMaskingEdit]: ['mock-permission'],
  // [PERMISSION_KEY.companySettingsPiiMaskingDelete]: ['mock-permission'],
  [PERMISSION_KEY.planSummaryAccess]: ['view:plan.summary'],
  [PERMISSION_KEY.plansAndBillingsPlanAndSubscriptionManage]: [
    'manage:plan.subscriptions',
  ],
  // channel
  [PERMISSION_KEY.channelView]: ['view:channel'],
  [PERMISSION_KEY.channelConnect]: ['connect:channel'],
  [PERMISSION_KEY.channelEdit]: ['edit:channel'],
  [PERMISSION_KEY.channelDelete]: ['delete:channel'],
  [PERMISSION_KEY.channelBillingManage]: [
    'manage:channel.billing',
    'view:channel',
  ],
  [PERMISSION_KEY.channelOptInManage]: ['manage:channel.optin', 'view:channel'],
  [PERMISSION_KEY.channelTemplateView]: [
    'view:channel.template',
    'view:channel',
  ],
  [PERMISSION_KEY.channelTemplateCreate]: ['create:channel.template'],
  [PERMISSION_KEY.channelTemplateEdit]: ['edit:channel.template'],
  [PERMISSION_KEY.channelTemplateDelete]: ['delete:channel.template'],
  [PERMISSION_KEY.channelQrCodeManage]: [
    'manage:channel.qrcode',
    'view:channel',
  ],
  // ticketing
  [PERMISSION_KEY.ticketingAccess]: [
    'access:ticketing',
    'view:ticketing.tickets',
    'edit:ticketing.tickets',
  ],
  [PERMISSION_KEY.ticketingManage]: ['manage:ticketing'],
  [PERMISSION_KEY.ticketingTicketsCreate]: ['create:ticketing.tickets'],
  [PERMISSION_KEY.ticketingTicketsDelete]: ['delete:ticketing.tickets'],
  // analytics
  [PERMISSION_KEY.analyticsConversationView]: ['view:analytics.conversation'],
  [PERMISSION_KEY.analyticsSalesView]: ['view:analytics.sale'],
  [PERMISSION_KEY.analyticsConversationExport]: [
    'export:analytics.conversation',
  ],
  [PERMISSION_KEY.analyticsConversationSegmentManage]: [
    'view:analytics.conversation.segment',
    'list:analytics.conversation.segment',
    'create:analytics.conversation.segment',
    'edit:analytics.conversation.segment',
    'delete:analytics.conversation.segment',
  ],
  [PERMISSION_KEY.analyticsEventsView]: ['access:analytics.events'],
  // inbox
  [PERMISSION_KEY.inboxConversationView]: ['view:inbox.conversation'],
  [PERMISSION_KEY.inboxConversationViewAssignedToMe]: [
    'view:inbox.conversation',
    'view_conversations:assigned_to_me',
  ],
  [PERMISSION_KEY.inboxConversationViewAssignedToMyTeam]: [
    'view_conversations:assigned_to_my_team',
  ],
  [PERMISSION_KEY.inboxConversationViewAllAssigned]: [
    'view_conversations:all_assigned_conversations',
  ],
  [PERMISSION_KEY.inboxConversationViewUnassignedUnderMyTeam]: [
    'view_conversations:unassigned_conversations_under_my_team',
  ],
  [PERMISSION_KEY.inboxConversationViewAllUnassigned]: [
    'view_conversations:all_unassigned_conversations',
  ],
  [PERMISSION_KEY.inboxConversationCreate]: ['create:inbox.conversation'],
  [PERMISSION_KEY.inboxConversationSendMessageAssignedToMe]: [
    'create:inbox.conversation',
    'send_message:assigned_to_me',
  ],
  [PERMISSION_KEY.inboxConversationSendMessageAssignedToMyTeam]: [
    'send_message:assigned_to_my_team',
  ],
  [PERMISSION_KEY.inboxConversationSendMessageAllAssigned]: [
    'send_message:all_assigned_conversations',
  ],
  [PERMISSION_KEY.inboxConversationSendMessageUnassignedUnderMyTeam]: [
    'send_message:unassigned_conversations_under_my_team',
  ],
  [PERMISSION_KEY.inboxConversationSendMessageAllUnassigned]: [
    'send_message:all_unassigned_conversations',
  ],
  [PERMISSION_KEY.inboxSendPaymentLinkView]: ['create:inbox.send_payment_link'],
  [PERMISSION_KEY.inboxSendProductCatalogView]: [
    'create:inbox.send_product_link',
  ],

  [PERMISSION_KEY.inboxConversationAssignmentEdit]: [
    'edit:inbox.conversation.assignment',
  ],
  [PERMISSION_KEY.inboxConversationAssignToMe]: [
    'edit:inbox.conversation.assignment',
    'assign_conversations:assign_to_me',
  ],
  [PERMISSION_KEY.inboxConversationAssignToAnyUser]: [
    'assign_conversations:assign_to_any_user',
  ],
  // inbox settings
  [PERMISSION_KEY.inboxSettingsManage]: [
    'view:inbox.settings',
    'edit:inbox.settings',
    'create:inbox.settings',
  ],
  [PERMISSION_KEY.inboxSavedRepliesView]: ['view:inbox.settings.quick_replies'],
  [PERMISSION_KEY.inboxSavedRepliesCreate]: [
    'create:inbox.settings.quick_replies',
  ],
  [PERMISSION_KEY.inboxSavedRepliesEdit]: ['edit:inbox.settings.quick_replies'],
  [PERMISSION_KEY.inboxSavedRepliesDelete]: [
    'delete:inbox.settings.quick_replies',
  ],
  [PERMISSION_KEY.contactsAccess]: ['access:contacts'],
  [PERMISSION_KEY.contactsAssignedToMeView]: ['view:contacts.assigned.own'],
  [PERMISSION_KEY.contactsAssignedToMyTeamView]: [
    'view:contacts.assigned.team',
  ],
  [PERMISSION_KEY.contactsAssignedToOthersView]: [
    'view:contacts.assigned.others',
  ],
  [PERMISSION_KEY.contactsAssignedToNoneView]: ['view:contacts.assigned.none'],
  [PERMISSION_KEY.contactsAssignedToMeEdit]: ['edit:contacts.assigned.own'],
  [PERMISSION_KEY.contactsAssignedToMyTeamEdit]: [
    'edit:contacts.assigned.team',
  ],
  [PERMISSION_KEY.contactsAssignedToOthersEdit]: [
    'edit:contacts.assigned.others',
  ],
  [PERMISSION_KEY.contactsAssignedToNoneEdit]: ['edit:contacts.assigned.none'],
  [PERMISSION_KEY.contactsAssignedToMeDelete]: ['delete:contacts.assigned.own'],
  [PERMISSION_KEY.contactsAssignedToMyTeamDelete]: [
    'delete:contacts.assigned.team',
  ],
  [PERMISSION_KEY.contactsAssignedToOthersDelete]: [
    'delete:contacts.assigned.others',
  ],
  [PERMISSION_KEY.contactsAssignedToNoneDelete]: [
    'delete:contacts.assigned.none',
  ],
  [PERMISSION_KEY.contactsAssignToMe]: ['assign.self:contacts.assignment'],
  [PERMISSION_KEY.contactsAssignToMyTeam]: ['assign.team:contacts.assignment'],
  [PERMISSION_KEY.contactsAssignToOthers]: [
    'assign.others:contacts.assignment',
  ],
  [PERMISSION_KEY.contactsCreate]: ['create:contacts'],
  [PERMISSION_KEY.contactsExport]: ['export:contacts'],
  [PERMISSION_KEY.contactsListView]: ['view:contacts.assigned.none'],
  [PERMISSION_KEY.contactsListCreate]: ['create:contacts'],
  [PERMISSION_KEY.contactsListEdit]: ['edit:contacts.assigned.none'],
  [PERMISSION_KEY.contactsListDelete]: ['delete:contacts.assigned.none'],
  [PERMISSION_KEY.contactsListAddRemoveContacts]: [
    'manage-contents:contacts.lists',
  ],
  [PERMISSION_KEY.contactsSettingsCustomFieldsView]: [
    'access:contacts.settings.contact_properties',
  ],
  [PERMISSION_KEY.contactsSettingsCustomFieldsCreate]: [
    'create:contacts.settings.contact_properties',
  ],
  [PERMISSION_KEY.contactsSettingsCustomFieldsEdit]: [
    'edit:contacts.settings.contact_properties',
  ],
  [PERMISSION_KEY.contactsSettingsCustomFieldsDelete]: [
    'delete:contacts.settings.contact_properties',
  ],
  [PERMISSION_KEY.contactsSettingsDeletedView]: [
    'access:contacts.safe_deleted',
  ],
  [PERMISSION_KEY.contactsSettingsConversionLoggingAccess]: [
    'access:contacts.settings.conversion_logs',
  ],
  [PERMISSION_KEY.contactsSettingsLabelsView]: [
    'access:contacts.settings.labels',
  ],
  [PERMISSION_KEY.contactsSettingsLabelsCreate]: [
    'create:contacts.settings.labels',
  ],
  [PERMISSION_KEY.contactsSettingsLabelsEdit]: [
    'edit:contacts.settings.labels',
  ],
  [PERMISSION_KEY.contactsSettingsLabelsDelete]: [
    'delete:contacts.settings.labels',
  ],
  [PERMISSION_KEY.customObjectsDataAccess]: ['access:custom_objects.data'],
  [PERMISSION_KEY.customObjectsDataCreate]: ['create:custom_objects.data'],
  [PERMISSION_KEY.customObjectsDataDelete]: ['delete:custom_objects.data'],
  [PERMISSION_KEY.customObjectsDataEdit]: ['update:custom_objects.data'],
  [PERMISSION_KEY.customObjectsSettingsManage]: [
    'access:custom_objects.settings',
  ],
  [PERMISSION_KEY.privacySettingsDataAccess]: [
    'access:contacts.settings.data_privacy',
  ],
  [PERMISSION_KEY.privacySettingsDataCreate]: [
    'create:contacts.settings.data_privacy',
  ],
  [PERMISSION_KEY.privacySettingsDataDelete]: [
    'delete:contacts.settings.data_privacy',
  ],
  [PERMISSION_KEY.privacySettingsDataEdit]: [
    'edit:contacts.settings.data_privacy',
  ],
  [PERMISSION_KEY.integrationsView]: ['view:integrations'],
  [PERMISSION_KEY.commerceView]: ['view:commerce'],
  [PERMISSION_KEY.commerceSettingsAccess]: ['access:commerce.settings'],
  [PERMISSION_KEY.flowBuilderView]: ['access:flowbuilder'],
  [PERMISSION_KEY.flowDetailView]: ['view:flowbuilder.workflow'],
  [PERMISSION_KEY.flowCreate]: ['create:flowbuilder.workflow'],
  [PERMISSION_KEY.flowEdit]: ['edit:flowbuilder.workflow'],
  [PERMISSION_KEY.flowDelete]: ['delete:flowbuilder.workflow'],
  [PERMISSION_KEY.broadcastView]: ['access:broadcast'],
  [PERMISSION_KEY.broadcastCreate]: ['create:broadcast'],
  [PERMISSION_KEY.broadcastPublish]: ['publish:broadcast'],
  [PERMISSION_KEY.broadcastDelete]: ['delete:broadcast'],
  [PERMISSION_KEY.aiView]: ['access:ai'],
};
