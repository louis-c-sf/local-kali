export const GET_MESSAGE_BY_GROUP_NAME = "/Message/group";
export const GET_MESSAGE_BY_DEVICE_UUID = "/Message/device";
export const GET_MESSAGE_BY_USER_ID = "/Message/User";
export const DELETE_MESSAGE_SCHEDULED = "/Message/Schedule/Delete";
export const POST_FORWARD_MESSAGE = "/Message/Forward";
export const POST_DELETE_MESSAGE = "/Message/Delete";
export const TICKET_STATUS_UPDATE = "/Ticket/Status/Update";
export const STAFF_REMARK_UPDATE = "/Ticket/StaffRemarks/Update";
export const GET_ALL_TICKETS = "/Tickets/All";
export const CREATE_TICKET = "/Ticket/Create";
export const POST_TOKEN_INFO = "/Account/Token";
export const GET_CONVERSATIONS = "/Conversations";
export const GET_CONVERSATIONS_SUMMARY = "/v2/Conversation/summary";
export const GET_FILTERS_SUMMARY_ALL = "/v2/Conversation/summary/all";
export const GET_FILTERS_SUMMARY_MENTIONS =
  "/v2/Conversation/summary/mentioned";
export const GET_FILTERS_SUMMARY_UNASSIGNED =
  "/v2/Conversation/summary/unassigned";
export const GET_FILTERS_SUMMARY_TEAM_UNASSIGNED =
  "/v2/Conversation/summary/team";
export const GET_FILTERS_SUMMARY_USER = "/v2/Conversation/summary/{userId}";
export const GET_CONVERSATIONS_ME = "/Conversations/me";
export const GET_CONVERSATIONS_MENTIONED = "/Conversations/mentioned";
export const GET_CONVERSATIONS_DETAIL = "/Conversation/{id}";
export const GET_CONVERSATIONS_BY_ASSIGNEE_ID = "/Conversations/{id}";
export const GET_CONVERSATIONS_BY_TEAM = "/Conversations/team";
export const GET_CONVERSATIONS_ALL = "/Conversations/all";
export const GET_CONVERSATIONS_MESSAGES = `/Conversation/Message/{id}`;
export const GET_All_CONVERSATIONS_MESSAGES = `/v2/Conversation/Message`;
export const POST_CONVERSATIONS_ASSIGN_STAFF = `/Conversation/Assign/{id}`;
export const UPDATE_CONVERSATIONS_STATUS = `/Conversation/Status/{id}`;
export const POST_CONVERSATION_MARK_READ = "/Conversation/Read/{id}";
export const POST_CONVERSATION_MARK_UNREAD = "/Conversation/Unread/{id}";
export const POST_CONVERSATION_BOOKMARK = "/Conversation/Bookmark/{id}";

// Quick Replies
export const GET_QUICK_REPLIES = "/Company/QuickReply";
export const GET_QUICK_REPLY_TEXT = "/Company/QuickReply/Text";
export const POST_CREATE_QUICK_REPLY = "/Company/QuickReply";
export const POST_UPDATE_QUICK_REPLY = "/Company/QuickReply";
export const DELETE_QUICK_REPLY = "/Company/QuickReply";
export const GET_QUICK_REPLY_ATTACHMENT = "/Company/quickreply/attachment/{id}";
export const POST_QUICK_REPLY_ATTACHMENT =
  "/Company/QuickReply/attachment/{id}";
export const DELETE_QUICK_REPLY_ATTACHMENT =
  "/Company/QuickReply/attachment/{id}";

export const REMOVE_CONVERSATIONS_HASHTAGS = `/Conversation/Tags/Remove/{id}`;
export const ADD_CONVERSATIONS_HASHTAGS = `/Conversation/Tags/add/{id}`;
export const DELETE_CONVERSATIONS_HASHTAGS = `/Conversation/Tags/remove/{id}`;
export const GET_MESSAGE_FILE = "/Message/File/{id}";
export const POST_MERGE_PROFILE = "/UserProfile/Merge/{id}";
export const POST_SPLIT_PROFILE = "/UserProfile/Split/{id}";
export const GET_USERPROFILE_DETAIL = "/UserProfile/{id}";
export const POST_USERPROFILE_CUSTOMFIELD = "/UserProfile/CustomFields";
export const GET_USERPROFILE = "/UserProfile";
export const DELETE_USERPROFILE = "/UserProfile";
export const GET_USERPROFILE_TOTAL = "/UserProfile/Total";
export const WEBCLIENT_INIT = "/WebClient/Init";
export const POST_CONVERSATIONS_REMARK = "/userprofile/activity/{id}";
export const POST_UPDATE_CONVERSATIONS_REMARK =
  "/userprofile/activity/Update/{id}";
export const DELETE_CONVERSATIONS_REMARK = "/userprofile/activity/{id}";
export const GET_CONVERSATIONS_REMARK = "/userprofile/activity/{id}";
export const POST_PROFILE_UPDATE = "/UserProfile/Update/{id}";
export const POST_NEW_PROFILE = "/UserProfile/Add";
export const POST_BROADCAST = "/Broadcast";
export const GET_BROADCAST = "/Broadcast";
export const GET_BROADCAST_TOTAL = "/Broadcast/Total";
export const POST_BROADCAST_WITH_TEMPLATE = "/Broadcast/BroadcastWithTemplete";
export const POST_BROADCAST_WITH_TEMPLATE_ID = "/Broadcast/{id}";
export const POST_BROADCAST_STATUSES = "/Broadcast/{id}/recipient/status";
export const GET_BROADCAST_STATISTICS_WITH_TEMPLATE_ID =
  "/Broadcast/{id}/Statistics";
export const GET_BROADCAST_BY_ID = "/Broadcast/{id}";
export const DELETE_BROADCASTS = "/Broadcast/Delete";
export const POST_UPDATE_ATTACHMENT_IMAGE = "/Broadcast/Attachment/{id}";
export const POST_DUPLICATE_BROADCAST = "/Broadcast/duplicate/{broadcastId}";
export const GET_BROADCAST_FILE = "/Broadcast/File/{id}";
export const DELETE_BROADCAST_FILE = "/Broadcast/File/Delete/{fileId}";
export const GET_EXPORT_BROADCAST =
  "/Broadcast/History/{broadcastTemplateId}/export";
export const POST_PAUSE_BROADCAST = "/Broadcast/action/{broadcastId}/pause";
export const POST_RESUME_BROADCAST = "/Broadcast/action/{broadcastId}/resume";

// Get conversation by profile id is only for creating new message
export const GET_CONVERSATION_BY_PROFILE_ID = "/UserProfile/conversation/{id}";
export const POST_USER_PROFILE_SEARCH = "/UserProfile/Search";
export const POST_USER_PROFILE_SEARCH_V3 = "/v3/UserProfile/Search";
export const POST_USER_PROFILE_SELECT_ALL = "/UserProfile/SelectAll";
export const POST_USER_PROFILE_COUNT = "/UserProfile/Total";
export const POST_UPDATE_ADD_CUSTOM_RPOFILE_FIELD =
  "/Company/UserProfileFields";
export const DELETE_CUSTOM_PROFILE_FIELD = "/Company/UserProfileField";

// user groups
export const GET_USER_PROFILES_LIST = "/UserProfile/List";
export const GET_USER_PROFILE = "/UserProfile/List/{id}";
export const DELETE_USER_PROFILE_GROUP = "/UserProfile/List";
export const CREATE_USER_PROFILE_GROUP = "/UserProfile/List/Create";
export const POST_UPDATE_USER_PROFILE_GROUP = "/UserProfile/List/{id}/Add";
export const POST_UPDATE_USER_PROFILE_REMOVE_FROM_GROUP =
  "/UserProfile/List/{id}/Remove";
export const POST_BOOKMARK_USER_PROFILE_GROUP = "/userprofile/list/bookmark";
export const POST_REORDER_USER_PROFILE_GROUP = "/userprofile/list/reorder";

// user groups import
export const GET_USER_PROFILE_IMPORT_SPREADSHEET =
  "/UserProfile/Import/Spreadsheet";
export const GET_USER_PROFILE_IMPORT_EXCEL = "/Userprofile/Import/Excel";
export const POST_USER_PROFILE_EXPORT_SPREADSHEET = "/UserProfile/Export";

// Assignment Rules
export const GET_ASSIGNMENT_RULES = "/Company/AssignmentRule";
export const GET_ASSIGNMENT_RULE_UPLOAD_PREVIEW =
  "/Company/AutomationAction/Attachment/{fileId}";
export const POST_ASSIGNMENT_RULE = "/Company/AssignmentRule";
export const GET_ASSIGNMENT_RULE = "/Company/AssignmentRule/{assignmentRuleId}";
export const GET_ASSIGNMENT_RULE_BLANK = "/Company/AssignmentRule/Blank";
export const POST_ASSIGNMENT_RULE_BLANK = "/Company/AssignmentRule/Blank";
export const POST_ASSIGNMENT_RULE_ACTION_BLANK =
  "/Company/AssignmentRule/{assignmentRuleId}/AutomationAction/Blank";
export const POST_ASSIGNMENT_RULE_REORDER = "/Company/AssignmentRule/reorder";
export const POST_ASSIGNMENT_RULE_ACTION_FILE_UPLOAD =
  "/Company/AutomationAction/Attachment/{automationActionId}";
export const UPDATE_ASSIGNMENT_RULE = "/Company/AssignmentRule";
export const DELETE_ASSIGNMENT_RULE = "/Company/AssignmentRule";
export const DELETE_ASSIGNMENT_RULE_ACTION_FILE =
  "/Company/AutomationAction/{automationActionId}/Attachment/{attachmentId}";
export const POST_DUPLICATE_AUTOMATION_RULE =
  "/Company/AssignmentRule/duplicate/{ruleId}";

//FB&IG
export const GET_FB_PAGES = "/FbIgAutoReply/company/fb/pages";
export const GET_IG_PAGES = "/FbIgAutoReply/company/ig/pages";
export const GET_FB_POSTS = "/FbIgAutoReply/FbPosts/{pageId}";
export const GET_IG_POSTS = "/FbIgAutoReply/IgPosts/{pageId}";
export const POST_FbIg_AUTOREPLY_BLANK =
  "/FbIgAutoReply/{assignmentRuleId}/AutomationAction/Blank";
export const POST_DM_MEDIA_FILE_UPLOAD = "/FbIgAutoReply/UploadAttachment";
export const PUT_PREVIEW_CODE =
  "/FbIgAutoReply/UpdatePreviewCode/{assignmentId}";
export const GET_FbIg_STATISTICS =
  "/FbIgAutoReply/rule/statistics/{assignmentId}";
export const DELETE_FbIg_ATTACHMENT =
  "/FbIgAutoReply/RemoveAttachment/{fbIgAutoReplyFileId}";
export const GET_FbIg_AUTOMATION_HISTORY =
  "/FbIgAutoReply/rule/history/{assignmentId}";
export const POST_REPLAY_DM_ACTION =
  "/Company/Automation/{fbIgAutoReplyId}/dmreplay/{historyId}";

// Automation
export const GET_AUTOMATION_HISTORIES =
  "/Company/Automation/{automationId}/history";
export const POST_AUTOMATION_HISTORY_REPLAY =
  "/Company/Automation/{automationId}/replay/{historyId}";

// WebhookURL API Calls
export const GET_COMPANY_WHATSAPP_CHATAPI_WEBHOOKURL =
  "/Company/whatsapp/chatapi/webhookURL";
export const GET_COMPANY_WECHAT_WEBHOOKURL = "/Company/wechat/webhookURL";
export const GET_COMPANY_EMAIL_WEBHOOKURL = "/Company/email/webhookURL";
export const GET_COMPANY_FACEBOOK_CONNECTIONURL =
  "/Company/Facebook/ConnectionURL";
export const GET_COMPANY_INSTAGRAM_CONNECTIONURL =
  "/Company/Instagram/ConnectionURL";
export const GET_COMPANY_FACEBOOK_ADS_CONNECTIONURL =
  "/facebook/ads/ConnectionURL";
export const GET_COMPANY_LINE_WEBHOOKURL = "/Company/line/webhookURL";

// Get WhatsApp QR code
export const GET_WHATSAPP_QR_CODE = "/Company/whatsapp/chatapi/qrcode";
export const GET_WHATSAPP_QR_CODE_BY_INSTANCE =
  "/Company/whatsapp/chatapi/qrcode";
export const POST_GENERATE_WHATSAPP_QR_CODE = "/qrcode/generate/whatsapp";

// Form Submission API Calls
export const POST_COMPANY_WHATSAPP_CHATAPI_CONNECT =
  "/Company/whatsapp/chatapi/connect";
export const POST_COMPANY_WHATSAPP_CHATAPI_RENAME =
  "/Company/whatsapp/chatapi/rename/{id}";
export const POST_COMPANY_WHATSAPP_CHATAPI_REGISTER_INSTANCE =
  "/company/whatsapp/chatapi/done";
export const POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE =
  "/userprofile/chatapi/instance/{id}";
export const POST_COMPANY_WECHAT_CONNECT = "/Company/wechat/connect";
export const POST_COMPANY_EMAIL_CONNECT = "/Company/email/connect";
export const POST_COMPANY_LINE_CONNECT = "/Company/line/connect";
export const POST_WECHAT_QRCODE = "/Company/wechat/qrcode/{connectId}";
export const POST_COMPANY_FACEBOOK_SUBSCRIBE = "/Company/Facebook/Subscrible";
export const POST_COMPANY_INSTAGRAM_SUBSCRIBE = "/Company/Instagram/Subscribe";
export const POST_FACEBOOK_ADS_SUBSCRIBE = "/facebook/ads/subscrible";
export const POST_COMPANY_TWILIO_SMS_CONNECT = "/Company/twilio/sms";
export const POST_COMPANY_TWILIO_WHATSAPP_CONNECT = "/Company/twilio/whatsapp";
export const GET_PERSONAL_WHATSAPP_QR_CODE = "/Company/Staff/Qrcode/{staffId}";
export const GET_TEAM_WHATSAPP_QR_CODE = "/Company/Team/Qrcode/{teamId}";
export const POST_PERSONAL_WHATSAPP_QR_CODE = "/Company/Staff/Qrcode/{staffId}";

//WhatsappQRCode
export const POST_TEAM_QRCODE = "/Company/team/{teamId}/qrcode";
export const POST_USER_QRCODE = "/Company/Staff/{staffId}";

// Remove channel
export const DELETE_WECHAT_CHANNEL = "/Company/wechat/${id}";
export const DELETE_LINE_CHANNEL = "/Company/line/${id}";
export const DELETE_SHOPIFY_CHANNEL = "/Company/shopify/delete/${id}";
export const DELETE_WHATSAPP_CHANNEL = "/Company/whatsapp/chatapi/${id}";
export const DELETE_360DIALOG_CHANNEL = "/company/whatsapp/360dialog/${id}";
export const DELETE_FACEBOOK_CHANNEL = "/Company/Facebook/${id}";
export const DELETE_TWILIO_SMS_CHANNEL = "/Company/twilio/sms/${id}";
export const DELETE_TWILIO_WHATSAPP_CHANNEL = "/Company/twilio/whatsapp";
export const DELETE_FACEBOOK_ADS_CHANNEL = "/facebook/ads/unsubscribe/${id}";
export const DELETE_INSTAGRAM_PROFILE = "/Company/instagram/${id}";
export const DELETE_CLOUDAPI_CHANNEL = "/company/whatsapp/cloudapi/channel";

export const GET_FACEBOOK_REDIRECT = "/facebook/connect";
export const GET_INSTAGRAM_REDIRECT = "/instagram/connect";
export const GET_FACEBOOK_ADS_REDIRECT = "/facebook/ads/connect";
export const POST_REQUEST_CHANNEL = "/Company/Request/Channel";

// whatsapp reboot and sync api
export const POST_WHATSAPP_REBOOT =
  "/Company/whatsapp/chatapi/reboot/{instanceId}";
export const POST_WHATSAPP_SYNC = "/Company/whatsapp/chatapi/sync/{instanceId}";
export const POST_WHATSAPP_SCHEDULED_SYNC = "/core/loadhistory/schedule";
export const GET_WHATSAPP_STATUS =
  "/Company/whatsapp/chatapi/status/{instanceId}";
export const POST_WHATSAPP_RENAME =
  "/Company/whatsapp/chatapi/update/{instanceId}";
export const POST_TWILIO_WHATSAPP_RENAME = "/Company/twilio/whatsapp/update";
export const POST_TWILIO_SMS_RENAME = "/Company/twilio/sms/update/{instanceId}";
export const POST_CHANNEL_RENAME = "/Company/{channel}/update/{instanceId}";
export const GET_FACEBOOK_SYNC = "/Company/facebook/sync/{pageId}";
export const GET_ATTACHMENT_LINK = "/attachment/{attachmentType}/file/{fileId}";
export const GET_ATTACHMENT_URL_LINK =
  "/attachment/{attachmentType}/url/{fileId}";
export const POST_IMPORT_CHAT_HISTORY = "/import/whatsapp/history";

// GET COMPANY INFORMATION
export const GET_COMPANY = "/Company";
export const GET_COMPANY_STAFF = "/Company/Staff";
export const GET_STAFF_PROFILE_PIC = "/comapny/profilepicture";
export const GET_COMPANY_NOTIFICATION = "/company/notifications";
export const GET_COMPANY_NOTIFICATION_ACK = "/company/notificationsack";

// Reset password
export const POST_RESET_PASSWORD_REQUEST = "/account/password/reset/request";
export const POST_AUTH0_RESET_PASSWORD = "/auth0/account/PasswordReset";

// onboard
export const POST_ACCOUNT_REGISTER = "/Account/Register";
export const POST_ACCOUNT_VERIFY = "/Account/Verify";
export const POST_COMPANY_REGISTER = "/Account/RegisterCompany";
export const POST_COMPANY_ACCOUNT_REGISTER = "/Account/RegisterAccountCompany";

export const GET_AUTH0_IS_COMPANY_REGISTERED =
  "/auth0/account/IsCompanyRegistered";
export const POST_AUTH0_IS_COMPANY_REGISTERED =
  "/v1/tenant-hub/Register/Companies/IsCompanyRegistered";

export const POST_REGISTER_STAFF = "/Account/RegisterStaff";
export const POST_COMPANY_INVITE = "/Company/Invite";
export const POST_COMPANY_INVITE_V2 = "/company/v2/invite";
export const POST_AUTH0_COMPLETE_INVITATION =
  "/auth0/account/CompleteInvitation";
export const DELETE_REMOVE_STAFF = "/Account/RemoveStaff";
export const GET_ONBOARDING_PROGRESS = "/v2/Company/OnboardingProgress";
export const POST_ONBOARDING_MIGRATE_REQUEST =
  "/support/ticket/migrate-to-360dialog";
export const POST_ONBOARDING_CONNECT_360DIALOG =
  "/company/whatsapp/360dialog/connect";
export const GET_INBOX_DEMO_CONVERSATIONS = "/demo/conversations/{staffId}";
export const GET_INBOX_DEMO_CONVERSATION = "/demo/{demoConversationId}";
export const POST_GENERATE_INBOX_DEMO = "/demo/mock-data/{staffId}";
export const DELETE_GENERATE_INBOX_DEMO = "/demo/conversations/{staffId}";
export const POST_INBOX_DEMO_MESSAGE = "/demo/message";
export const POST_INBOX_DEMO_NOTE = "/demo/note";
export const POST_INBOX_DEMO_STATUS = "/demo/status/{demoConversationId}";
export const POST_INBOX_DEMO_ASSIGN = "/demo/assign/{demoConversationId}";
export const POST_INBOX_DEMO_COMPLETE = "/demo/mark-as-completed/{staffId}";

// company
export const POST_COMPANY_NAME = "/Company/Update"; //update timezone and company name
export const GET_COMPANY_FIELD = "/Company/CompanyFields"; // read company fields
export const POST_COMPANY_FIELD = "/Company/CompanyFields"; // update company fields
export const POST_COMPANY_ICON = "/Company/icon";
export const GET_COMPANY_ICON = "/company/icon";
export const GET_COMPANY_TIMEZONE = "/company/timezone";
export const GET_COMPANY_TIMEZONE_BYID = "/company/timezone"; //?id=China Standard Time
export const POST_COMPANY_FETCH_MATADATA =
  "/Company/CompanyFields/GetMetaDataFromURL";
export const GET_COMPANY_COUNTRY = "/company/countrylist";
export const GET_COMPANY_TAGS = "/company/Tags";
export const POST_COMPANY_TAGS = "/company/Tags";
export const DELETE_COMPANY_TAGS = "/company/Tags";

// staff info
export const POST_COMPANY_STAFF_PIC = "/Company/Staff/ProfilePicture/{staffid}";
export const DELETE_COMPANY_STAFF_PIC =
  "/Company/Staff/ProfilePicture/{staffId}";
export const DELETE_COMPANY_PIC = "/company/icon/{companyId}";
export const GET_COMPANY_STAFF_PIC = "/comapny/profilepicture";
export const POST_COMPANY_STAFF_INFO = "/Company/Staff/{staffId}";
export const DELETE_COMPANY_STAFF = "/UserRole/member/remove/staff";
export const GET_COMPANY_STAFF_BY_ID = "/v2/Company/Staff/{staffId}";
export const DELETE_COMPANY_STAFF_BY_ID = "/Company/Staff/{staffId}";
export const POST_RESEND_INVITATION_COMPANY_STAFF_BY_ID =
  "/Company/resendInvitation/{staffId}";
export const POST_INVITATION_LINK_GENERATE = "/company/invite/shared/generate";
export const GET_INVITATION_LINK_DETAILS = "/company/invite/shared/{linkId}";
export const POST_AUTH0_INVITATION_LINK_INVITE =
  "/company/invite/shared/{linkId}";
export const POST_RESET_STAFF_PASSWORD =
  "/Company/Staff/ResetPassword/{staffId}";
//get number of message count
export const GET_MESSAGE_COUNT = "/company/usage";

//search message
export const GET_SEARCH_MESSAGE_BY_ASSIGNEE_V2 =
  "/v2/Conversation/{assigneeId}/Search/Message"; //keywords=siu hang leung&offset=0&limit=10
export const GET_SEARCH_MESSAGE_BY_CONVERSATION =
  "/Conversation/Search/Message/{conversationId}"; //keywords=siu hang leung&offset=0&limit=10

// stripe
export const GET_STRIPE_SETUP = "/stripe/setup"; //get plan information
export const POST_STRIPE_CHECKOUT = "/stripe/create-checkout-session";
export const POST_STRIPE_CHECKOUT_V2 = "/v2/stripe/create-checkout-session";

export const POST_CANCEL_SUBSCRIPTION = "/subscription/cannel";
export const POST_STRIPE_UPDATE_CARD = "/stripe/update-card";
export const POST_STRIPE_PAYMENT_LINK = "/stripe/payment-link";

export const POST_OTHER_STRIPE_CHECKOUT =
  "/stripe/other/create-checkout-session";
export const POST_OTHER_ONEOFF_STRIPE_CHECKOUT =
  "/stripe/one-time/create-checkout-session";
export const POST_ALIPAY_ONEOFF_STRIPE_CHECKOUT =
  "/stripe/one-time/alipay/create-checkout-session";
// cancel subscription reason
export const GET_CANCEL_SUBSCRIPTION = "/subscription/cannel/reason";

export const GET_CANNY_TOKEN = "/Canny/CreateCannyToken";

export const GET_SANDBOX_USER = "/sandbox/user";

export const GET_SANDBOX_QRCODE_URL = "/sandbox/join/url";

export const GET_TEAMS = "/company/team";
export const GET_TEAM = "/v2/Company/Team/{teamId}";
export const POST_TEAMS_CREATE = "/company/team/create";
export const POST_TEAMS_ADD_USER = "/Company/Team/{id}/add";
export const POST_TEAMS_REMOVE_USER = "/Company/Team/{id}/remove";
export const POST_TEAM_UPDATE = "/company/team/{id}/update";
export const DELETE_TEAMS = "/company/team/delete";

export const POST_CREATE_WHATSAPP = "/twilio/whatsapp/register";

export const POST_GOOGLE_SIGNIN = "/google/auth";

export const POST_VERIFY_PROMOCODE = "/Account/VerifyPromotionCode";

export const POST_CONVERSATION_TYPING = "/conversation/typing";

export const POST_CHECK_EMAIL = "/account/checkemail";

export const POST_SHOPIFY_REDIRECT_LINK = "/company/shopify/authorization/url";
export const POST_SHOPIFY_INTEGRATE_LINK = "/company/shopify/integrate/public";

// validate facebook business api
export const GET_FACEBOOK_BUSINESS_API_VALIDATE =
  "/twilio/whatsapp/businessId/verify";
export const GET_FACEBOOK_API_STATUS = "/Company/Facebook/status/{pageId}";

// Analytics dashboard
export const POST_ANALYTICS_DATA = "/company/analytics/data";
export const POST_EXPORT_ANALYTICS_DATA = "/company/analytics/export";
export const POST_TWILIO_TOPUP = "/stripe/twilio/topup";
export const POST_CANCEL_TOKEN = "/Account/CancelAccessToken";

// twilio whatsapp templates
export const GET_TWILIO_TEMPLATES = "/twilio/whatsapp/template";
export const POST_TWILIO_TEMPLATE_BOOKMARK =
  "/twilio/whatsapp/template/bookmark?AccountSID={id}";
export const POST_SAVE_SURVEY_INFO = "/Company/SaveInfo";

// 360Dialog whatsapp template
export const POST_360DIALOG_TEMPLATE_FILE =
  "/company/whatsapp/360dialog/{id}/file";
export const DELETE_360DIALOG_TEMPLATE_FILE =
  "/company/whatsapp/360dialog/{id}/file/{fileId}";
export const GET_360DIALOG_WABA = "/company/whatsapp/360dialog/by-waba";
export const POST_360DIALOG_CHANGE_CHANNEL =
  "/userprofile/whatsapp360dialog/switch-channel";
export const PUT_360DIALOG_RENAME = "/company/whatsapp/360dialog/{id}";
// twilio topup credit
export const GET_TWILIO_TOPUP_CREDIT_PLANS = "/stripe/twilio/topup";
export const POST_TWILIO_TOPUP_CREDIT = "/stripe/twilio/topup";
export const GET_TWILIO_USAGE = "/company/twilio/usage";

// twilio opt-in
// Viber
export const POST_VIBER_CREATE_CHANNEL = "/Company/viber/connect";
export const PUT_VIBER_RENAME_CHANNEL = "/Company/viber";
export const DELETE_VIBER_DELETE_CHANNEL = "/Company/viber";
export const POST_VIBER_GENERATE_QR_CODE = "/qrcode/generate/viber";

// Telegram
export const POST_TELEGRAM_CREATE_CHANNEL = "/Company/telegram/connect";
export const PUT_TELEGRAM_RENAME_CHANNEL = "/Company/telegram";
export const DELETE_TELEGRAM_DELETE_CHANNEL = "/Company/telegram";
export const POST_TELEGRAM_GENERATE_QR = "/qrcode/generate/telegram";

// opt-in
export const POST_OPT_IN = "/Company/twilio/optin";

// 360 dialog op-in
export const POST_360DIALOG_OPT_IN = "/company/whatsapp/360dialog/{id}/opt-in";
export const PUT_360DIALOG_OPT_IN = "/company/whatsapp/360dialog/{id}/opt-in";
export const DELETE_360DIALOG_OPT_IN =
  "/company/whatsapp/360dialog/{id}/opt-in";

// Segment Api
export const POST_CREATE_SEGMENT = "/company/analytics/segment/create";
export const GET_SEGMENT_LIST = "/company/analytics/segment";
export const PUT_EDIT_SEGMENT = "/company/analytics/segment/update/{id}";
export const DELETE_SEGMENT = "/company/analytics/segment/{id}";

export const POST_TWILIO_VERIFICATION = "/twilio/whatsapp/verification";

// Device session
export const POST_SESSION_REGISTER_DEVICE = "/Account/Register/Device";

// user role permission
export const GET_USER_ROLE_PRIMISSION = "/Company/UserRole/permission";
export const POST_USER_ROLE_PRIMISSION = "/Company/UserRole/permission";
// webhook sample json
export const GET_CONTACT_WEBHOOK_SAMPLE = "/webhook/contact/sample";
export const GET_MESSAGE_WEBHOOK_SAMPLE = "/webhook/message/sample";
// Conversation Analytics
export const GET_ANALYTICS_CLIENT_INFO =
  "/userprofile/webclient/info/{webclientUUID}";

// Get Shopify Information
export const GET_SHOPIFY_ABANDONED_CART =
  "/userprofile/shopify/abandoned/{userProfileId}";
// Shopify private app
export const POST_SHOPIFY_PRIVATE_APP = "/company/shopify/integrate/outofbox";

// Sync Shopify contacts and orders
export const POST_SYNC_SHOPIFY_INFO =
  "/company/shopify/sync/setting/{shopifyId}";

// Get Shopify # of contacts and orders
export const GET_SHOPIFY_USAGE = "/company/shopify/usage/{shopifyId}";

// Get Shopify connection status
export const GET_SHOPIFY_STATUS = "/company/shopify/status/{shopifyId}";
export const PUT_SHOPIFY_STATUS = "/company/Shopify/status/{shopifyId}";
export const GET_SHOPIFY_LIST_STATUS = "/company/Shopify/status/list";
export const GET_SLEEKPAY_CONNECT = "/SleekPay/Connect";
export const GET_SLEEKPAY_DASHBOARD = "/SleekPay/Dashboard";
export const GET_SLEEKPAY_COMPANY_LOGO_URL = "/SleekPay/company-logo-url";
export const GET_SLEEKPAY_RESULT = "/SleekPay/Result/{resultId}";
export const GET_SLEEKPAY_MESSAGE_TEMPLATE = "/SleekPay/message/template";
export const POST_SESSION_DEREGISTER_DEVICE = "/Account/Deregister/Device";

// User role permission
export const GET_USER_ROLE_PERMISSION = "/Company/UserRole/permission";
export const POST_USER_ROLE_PERMISSION = "/Company/UserRole/permission";
//Sort Message
export const POST_COMPANY_SORT_MESSAGE = "/Company/default-inbox-order/{order}";
// HelpCenter
export const POST_NEW_ISSUE_TICKET = "/support/ticket";
export const POST_CREATE_CUSTOMER_PORTAL_SESSION =
  "/stripe/create-customer-portal-session";

//Background Task
export const GET_BACKGROUND_LIST = "/background-task/list";
export const POST_EXPORT_ANALYTICS_DATA_BACKGROUND =
  "/Company/Analytics/export/background";
export const POST_USERPROFILE_CUSTOMFIELD_BACKGROUND =
  "/UserProfile/CustomFields/background";
export const POST_BACKGROUND_TASK_DISMISS = "/background-task/dismiss";
export const GET_EXPORT_BROADCAST_BACKGROUND =
  "/Broadcast/History/{broadcastTemplateId}/export/background";

//shopify subscription plan
export const GET_SHOPIFY_SUBSCRIPTION_STATUS = "/shopify/subscription/status";
export const GET_SHOPIFY_PLAN = "/shopify/subscription";
export const POST_SHOPIFY_PLAN = "/shopify/subscription";
export const DELETE_SHOPIFY_PLAN = "/shopify/subscription";

//shopify merchant products
export const GET_SHOPIFY_PRODUCT_VARIANTS = "/Shopify/Product/Variant";
export const POST_SHOPIFY_DRAFT_ORDER = "/Shopify/DraftOrder";
//settings payment link
export const PUT_SHOPIFY_STATUS_UPDATE =
  "/company/Shopify/status/{shopifyConfigId}";

// Rewardful
export const GET_PARTNER_STATUS = "/rewardful/partner/status";
export const GET_PARTNER_COMMISSION = "/rewardful/partner/commission";
