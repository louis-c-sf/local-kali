import { Dayjs } from 'dayjs';

import { LegacyApiResponseTemplate, Money } from '@/api/types';

export interface WabaConversationUsageAnalyticResponse {
  conversation_usage_analytic: ConversationUsageAnalytic;
  facebook_business_id: string;
  facebook_business_name: string;
  facebook_business_waba: FacebookBusinessWaba;
}

export interface ConversationUsageAnalytic {
  granular_conversation_usage_analytics: GranularConversationUsageAnalytic[];
  total_business_initiated_paid_quantity: number;
  total_business_initiated_free_tier_quantity: number;
  total_user_initiated_paid_quantity: number;
  total_user_initiated_free_tier_quantity: number;
  total_user_initiated_free_entry_point_quantity: number;
  conversation_category_quantities: ConversationCategoryQuantities;
  total_used: Money;
  total_markup: Money;
  total_transaction_handling_fee: Money;
  granularity: string;
  start: string;
  end: string;
}

export interface GranularConversationUsageAnalytic {
  business_initiated_paid_quantity: number;
  business_initiated_free_tier_quantity: number;
  user_initiated_paid_quantity: number;
  user_initiated_free_tier_quantity: number;
  user_initiated_free_entry_point_quantity: number;
  conversation_category_quantities: ConversationCategoryQuantities;
  used: Money;
  markup: Money;
  transaction_handling_fee: Money;
  start: string;
  end: string;
}

export interface ConversationCategoryQuantities {
  AUTHENTICATION?: number;
  MARKETING?: number;
  SERVICE?: number;
  UTILITY?: number;
}

export interface FacebookBusinessWaba {
  facebook_waba_id: string;
  facebook_waba_name: string;
  facebook_phone_numbers: string[];
  facebook_waba_timezone: FacebookWabaTimezone;
}

export interface FacebookWabaTimezone {
  id: string;
  name: string;
  displayName: string;
  timezoneOffset: string;
}

export interface CalculatedConversationUsageAnalytic
  extends ConversationUsageAnalytic {
  all_conversation: number;
  all_business_initiated_category_conversation: number;
  all_user_initiated_category_conversation: number;
  all_free_quantity: number;
  all_free_tier_quantity: number;
  all_paid_quantity: number;
}

export interface BillingAnalyticsParams {
  fbbaId: string;
  wabaId: string;
  wabaName?: string | undefined;
  timeRange: [Dayjs | null, Dayjs | null];
}

export interface GraphApiSuccessResponse {
  success_response: {
    success: boolean;
  };
}

export interface ConversationalAutomationListResponse {
  result?: ConversationalAutomationWithChannel[];
  code: number;
  timeStamp: Date;
}

export interface Cursors {
  before: string;
  after: string;
}

export interface ConversationalAutomationWithChannel {
  id: string;
  channel_name: string;
  verified_name: string;
  display_phone_number: string;
  facebook_phone_number_status: string;
  conversational_automation?: ConversationalAutomation;
}
export interface ConversationalAutomation {
  enable_welcome_message?: boolean;
  commands?: Command[];
  prompts?: string[];
}
export interface Command {
  command_name: string;
  command_description: string;
}

export interface SwitchToWabaLevelParams extends SwitchToBusinessLevelParams {
  creditAllocation: CreditAllocation;
}

export interface SwitchToBusinessLevelParams {
  facebookBusinessId: string;
  eTag?: string;
}

export interface CreditAllocation {
  credit_transfers: CreditTransfer[];
}

export interface CreditTransfer {
  credit_transfer_from: CreditTransferSubject;
  credit_transfer_to: CreditTransferSubject;
  credit_transfer_amount: Money;
  credit_transfer_type: CreditTransferType;
}

export type CreditTransferType =
  | 'NORMAL_TRANSFER_FROM_BUSINESS_TO_WABA'
  | 'NORMAL_TRANSFER_FROM_WABA_TO_BUSINESS'
  | string;

export interface CreditTransferSubject {
  facebook_business_id?: string;
  facebook_waba_id?: string;
  target_type: 'facebook_waba' | 'facebook_business' | string;
}

export interface WabaTopUpProfileResponse {
  business_balance_auto_top_up_profiles: BusinessBalanceAutoTopUpProfile[];
}

interface BusinessBalanceAutoTopUpProfile {
  facebook_waba_id: string;
  facebook_business_id: string;
  customer_id: string;
  minimum_balance: Money;
  auto_top_up_plan: AutoTopUpPlan;
  is_auto_top_up_enabled: boolean;
  record_statuses: string[];
  _etag: string;
  sleekflow_company_id: string;
  created_by: CreatedBy;
  updated_by: CreatedBy;
  created_at: string;
  updated_at: string;
  id: string;
  sys_type_name: string;
  ttl: number;
}

interface CreatedBy {
  sleekflow_staff_id: string;
  sleekflow_staff_team_ids: string[];
}

interface AutoTopUpPlan {
  id: string;
  name: string;
  price: Money;
}

export interface CloudApiErrorResponse {
  success: boolean;
  errorCode: number;
  errorMessage: string;
  errorContext: ErrorContext;
}
interface ErrorContext {
  output: Output;
}
interface Output {
  success: boolean;
  data: Datum[];
  message: string;
  date_time: string;
  http_status_code: number;
  request_id: string;
}
interface Datum {
  errorMessage: string;
  memberNames: string[];
}

export enum ChannelQualityRating {
  LOW = 'RED',
  MEDIUM = 'YELLOW',
  HIGH = 'GREEN',
  NONE = 'NONE',
}

export interface GetConversationAnalyticsInput {
  end_timestamp: number;
  phone_number: string;
  start_timestamp: number;
  waba_id: string;
}

export type GetConversationAnalyticsResponse = LegacyApiResponseTemplate<{
  conversation_analytics: ConversationAnalytic[];
}>;

export interface ConversationAnalytic {
  data_points: DataPoint[];
}

export interface DataPoint {
  start: number;
  end: number;
  start_datetime_offset: string;
  end_datetime_offset: string;
  conversation: number;
  phone_number: string;
  country: string;
  conversation_type: string;
  conversation_direction: string;
  conversation_category: string;
  cost: number;
}
