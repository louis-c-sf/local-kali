import {
  SleekflowApisCrmHubModelProviderConfigDto,
  TravisBackendConversationDomainViewModelsCompanyCustomFieldFieldLingualViewModel,
  TravisBackendConversationDomainViewModelsCompanyCustomFieldViewModel,
  TravisBackendConversationDomainViewModelsCompanyResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';

import {
  Company,
  CompanyCustomFields,
  CrmHubModelSyncConfig,
  CrmHubProviderConfig,
  Linguals,
} from '@/api/types';

export const convertTravisBackendResponseToCompany = (
  companyResponse:
    | TravisBackendConversationDomainViewModelsCompanyResponse
    | null
    | undefined,
): Company => {
  const timezoneInfo = companyResponse?.timeZoneInfo || {};
  return {
    id: companyResponse?.id || '',
    companyName: companyResponse?.companyName || '',
    signalRGroupName: companyResponse?.signalRGroupName || '',
    timeZoneInfo: timezoneInfo || '',
    facebookConfigs: companyResponse?.facebookConfigs || [],
    leadAdsFacebookConfigs: companyResponse?.leadAdsFacebookConfigs || [],
    emailConfig: companyResponse?.emailConfig || '',
    whatsAppConfigs: companyResponse?.whatsAppConfigs || [],
    weChatConfig: companyResponse?.weChatConfig || '',
    lineConfigs: companyResponse?.lineConfigs || [],
    viberConfigs: companyResponse?.viberConfigs || [],
    telegramConfigs: companyResponse?.telegramConfigs || [],
    smsConfigs: companyResponse?.smsConfigs || [],
    shoplineConfigs: companyResponse?.shoplineConfigs || [],
    shopifyConfigs: companyResponse?.shopifyConfigs || [],
    instagramConfigs: companyResponse?.instagramConfigs || [],
    companyCustomFields:
      companyResponse?.companyCustomFields?.map(
        (
          c: TravisBackendConversationDomainViewModelsCompanyCustomFieldViewModel,
        ) => {
          return {
            category: c.category || '',
            companyCustomFieldFieldLinguals:
              c.companyCustomFieldFieldLinguals?.map(
                (
                  l: TravisBackendConversationDomainViewModelsCompanyCustomFieldFieldLingualViewModel,
                ) => {
                  return {
                    language: l.language || '',
                    displayName: l.displayName || '',
                  } as Linguals;
                },
              ) || [],
            fieldName: c.fieldName || '',
            value: c.value || '',
            type: c.type || '',
            order: c.order || 0,
            isVisible: c.isVisible || false,
            isEditable: c.isEditable || false,
            isDefault: c.isDefault || false,
          } as CompanyCustomFields;
        },
      ) || [],
    customUserProfileFields: companyResponse?.customUserProfileFields || [],
    companyHashtags: companyResponse?.companyHashtags || [],
    whatsApp360DialogConfigs: companyResponse?.whatsApp360DialogConfigs || [],
    whatsApp360DialogUsageRecords:
      companyResponse?.whatsApp360DialogUsageRecords || [],
    billRecords: companyResponse?.billRecords || [],
    crmHubProviderConfigs:
      companyResponse?.crmHubProviderConfigs?.map(
        (c: SleekflowApisCrmHubModelProviderConfigDto) => {
          return {
            sleekflow_company_id: c.sleekflow_company_id || '',
            key: c.key || '',
            entity_type_name_to_sync_config_dict:
              Object.entries(
                c.entity_type_name_to_sync_config_dict ?? {},
              ).reduce((k, [key, value]) => {
                k[key] = {
                  filters: value.filters || '',
                  field_filters: value.field_filters || '',
                  interval: value.interval || 0,
                  entity_type_name: value.entity_type_name || '',
                } as CrmHubModelSyncConfig;
                return k;
              }, {} as { [key: string]: CrmHubModelSyncConfig }) || {},
            provider_name: c.provider_name || '',
            is_authenticated: c.is_authenticated || false,
            default_region_code: c.default_region_code || '',
            id: c.id || '',
          } as CrmHubProviderConfig;
        },
      ) || [],
    createdAt: companyResponse?.createdAt || '',
    companyIconFileURL: companyResponse?.companyIconFileURL || '',
    companyIconFile: companyResponse?.companyIconFile || '',
    maximumAgents: companyResponse?.maximumAgents || 0,
    maximumWhatsappInstance: companyResponse?.maximumWhatsappInstance || 0,
    maximumAutomations: companyResponse?.maximumAutomations || 0,
    maximumNumberOfChannel: companyResponse?.maximumNumberOfChannel || 0,
    currentAgents: companyResponse?.currentAgents || 0,
    isSubscriptionActive: companyResponse?.isSubscriptionActive || false,
    companyCountry: companyResponse?.companyCountry || '',
    isFreeTrial: companyResponse?.isFreeTrial || false,
    referralCode: companyResponse?.referralCode || '',
    isRemovedChannels: companyResponse?.isRemovedChannels || false,
    enableSensitiveSetting: companyResponse?.enableSensitiveSetting || false,
    isShowQRCodeMapping: companyResponse?.isShowQRCodeMapping || false,
    isQRCodeMappingEnabled: companyResponse?.isQRCodeMappingEnabled || false,
    twilioUsageRecords: companyResponse?.twilioUsageRecords || [],
    companySetting: companyResponse?.companySetting || {},
    rolePermission: companyResponse?.rolePermission || [],
    isExceededTwilioDailyLimit:
      companyResponse?.isExceededTwilioDailyLimit || false,
    isPaymentFailed: companyResponse?.isPaymentFailed || false,
    isSandbox: companyResponse?.isSandbox || false,
    defaultInboxOrder: companyResponse?.defaultInboxOrder || '',
    isEnabledSFCC: companyResponse?.isEnabledSFCC || false,
    isShopifyAccount: companyResponse?.isShopifyAccount || false,
    shopifyOrderConversion: companyResponse?.shopifyOrderConversion || 0,
    maximumShopifyStore: companyResponse?.maximumShopifyStore || 0,
    associatedCompaniesList: companyResponse?.associatedCompaniesList || [],
    companyType: companyResponse?.companyType || 0,
    isStripePaymentEnabled: companyResponse?.isStripePaymentEnabled || false,
    reseller: companyResponse?.reseller || '',
    whatsappCloudApiConfigs: companyResponse?.whatsappCloudApiConfigs || [],
    whatsappCloudApiUsageRecords:
      companyResponse?.whatsappCloudApiUsageRecords || [],
  } as Company;
};
