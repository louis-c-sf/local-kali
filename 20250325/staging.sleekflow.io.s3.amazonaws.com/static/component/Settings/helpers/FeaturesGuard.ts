import {
  isDemoPlan,
  isEnterprisePlan,
  isFreeOrFreemiumPlan,
  isPremiumPlan,
  PlanType,
} from "../../../types/PlanSelectionType";
import CompanyType from "../../../types/CompanyType";
import { ExcludedAddOn } from "../SettingPlanSubscription/SettingPlan/SettingPlan";
import { UsageType } from "../../../types/LoginType";
import ChannelInfoType from "../../../types/ChannelInfoType";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import moment from "moment";

const CHANNELS_NOT_ALLOWED_FREE_PLAN = [
  "zapier",
  "sleekflowApi",
  "calendly",
  "googleSheet",
  "woocommerce",
  "make",
];
const CHANNELS_NOT_ALLOWED_FREEMIUM_PLAN = ["stripe"];

export class FeaturesGuard {
  constructor(
    private plan: PlanType,
    private usage: UsageType,
    private company: CompanyType | undefined
  ) {}

  channelRequiresUpgrade(
    channelsIntegration: ChannelInfoType[],
    currentChannel: ChannelInfoType
  ) {
    if (
      isFreeOrFreemiumPlan(this.plan) &&
      channelsIntegration.some((chnl) => currentChannel.name === chnl.name) &&
      CHANNELS_NOT_ALLOWED_FREE_PLAN.includes(currentChannel.name)
    ) {
      return true;
    }
    if (
      isFreeOrFreemiumPlan(this.plan) &&
      CHANNELS_NOT_ALLOWED_FREEMIUM_PLAN.includes(currentChannel.name)
    ) {
      return true;
    }
    if (
      currentChannel.name === "sleekflowApi" &&
      !(
        isEnterprisePlan(this.plan) ||
        isPremiumPlan(this.plan) ||
        isDemoPlan(this.plan)
      )
    ) {
      return true;
    }
    return false;
  }

  canSeeSleekflowV2() {
    if (!this.company) {
      return false;
    }
    if (
      process.env.REACT_APP_V2_COMPANY_LIST?.split(",").includes(
        this.company.id
      ) ||
      moment(this.company.createdAt).isSameOrAfter(moment("2023-10-09"))
    ) {
      return true;
    }
    return false;
  }

  canUseCreateLead() {
    if (!this.company) {
      return false;
    }
    if (
      process.env.REACT_APP_COMPANY_ID_ALLOW_TO_CREATE_LEAD?.split(
        ","
      ).includes(this.company.id)
    ) {
      return true;
    }
    return false;
  }

  canConnectWhatsapp() {
    if (!this.company) {
      return false;
    }
    if (
      this.company.purchasedChatAPIInstance &&
      this.company.purchasedChatAPIInstance > 0
    ) {
      return true;
    }
    if (
      (this.company.wsChatAPIConfigs &&
        this.company.wsChatAPIConfigs.length > 0) ||
      (this.company.whatsAppConfigs &&
        this.company.whatsAppConfigs.length > 0) ||
      (this.company.whatsApp360DialogConfigs &&
        this.company.whatsApp360DialogConfigs.length > 0) ||
      (this.company.whatsappCloudApiConfigs &&
        this.company.whatsappCloudApiConfigs.length > 0)
    ) {
      return true;
    }
    return false;
  }

  canUseTeams() {
    return (
      isPremiumPlan(this.plan) ||
      isEnterprisePlan(this.plan) ||
      isDemoPlan(this.plan)
    );
  }

  canUseAnalytics() {
    return (
      isPremiumPlan(this.plan) ||
      isEnterprisePlan(this.plan) ||
      isDemoPlan(this.plan)
    );
  }

  canShowTopUp() {
    return !isDemoPlan(this.plan);
  }

  canSeeTemplates() {
    return !isDemoPlan(this.plan);
  }

  canShowPlanSubscription() {
    return !isDemoPlan(this.plan);
  }

  canCreateTemplate() {
    return !isDemoPlan(this.plan);
  }

  getInvitedUsersCount() {
    return this.usage?.currentAgents ?? 0;
  }

  getMaxInviteUsers() {
    return this.usage?.maximumAgents ?? 0;
  }

  canInviteMoreUsers() {
    return (
      this.getInvitedUsersCount() < this.getMaxInviteUsers() ||
      isFreeOrFreemiumPlan(this.plan)
    );
  }

  canSendMessages() {
    return this.usage.totalContacts < this.usage.maximumContacts;
  }

  hasUserPaidBills() {
    const billRecords = this.company?.billRecords.filter(ExcludedAddOn);
    return !!(billRecords && billRecords.length > 1);
  }

  canCreateAutomation(liveAutomationNumber: number) {
    if (!this.company) {
      return false;
    }
    return liveAutomationNumber < this.company.maximumAutomations;
  }

  isRegionAllowedToInviteUser(location: string) {
    return location === "eastasia";
  }
  isRegionAllowedToUseSandbox(location: string) {
    return location === "eastasia";
  }

  isCompanyAllowedToInviteUser() {
    if (!this.company) {
      return false;
    }
    return !process.env.REACT_APP_COMPANY_NOT_ALLOWED_INVITE_USER?.split(
      ","
    ).includes(this.company.id);
  }

  isAbleToShow360DialogChannel(selectedChannel?: TargetedChannelType[]) {
    if (!this.company) {
      return false;
    }
    if (
      ((this.company.whatsApp360DialogConfigs &&
        this.company.whatsApp360DialogConfigs.length > 0) ||
        (this.company.whatsappCloudApiConfigs &&
          this.company.whatsappCloudApiConfigs.length > 0)) &&
      (selectedChannel === undefined ||
        selectedChannel.length === 0 ||
        selectedChannel?.some((chnl) =>
          ["whatsapp360dialog", "whatsappcloudapi"].includes(chnl.channel)
        ))
    ) {
      return true;
    }
    return false;
  }

  isOutOfTwilioUsage() {
    const [firstUsage] = this.company?.twilioUsageRecords ?? [];
    if (
      firstUsage &&
      this.company?.whatsAppConfigs?.some((whatsapp) => whatsapp.isSubaccount)
    ) {
      return firstUsage.balance < 0;
    }
    return false;
  }

  canUseMaskedContactSetting() {
    if (!this.company) {
      return false;
    }
    return this.company?.enableSensitiveSetting;
  }

  canUseChannelsSetting() {
    return isPremiumPlan(this.plan) || isEnterprisePlan(this.plan);
  }

  hasWhatsappTemplateBookmarkFeature(channel: string) {
    return ["twilio_whatsapp", "whatsappcloudapi"].includes(channel);
  }

  canUseStripePayments() {
    return Boolean(this.company?.isStripePaymentEnabled);
  }

  canUseSalesDashboard() {
    if (!this.company) {
      return false;
    }
    return (
      this.canUseStripePayments() ||
      (this.company.shopifyConfigs && this.company.shopifyConfigs.length > 0)
    );
  }

  canUseSalesforceCrm() {
    return Boolean(
      this.company?.crmHubProviderConfigs?.some(
        (conf) => conf.provider_name === "salesforce-integrator"
      )
    );
  }

  canUseHubspotCrm() {
    return Boolean(
      this.company?.crmHubProviderConfigs?.some(
        (conf) => conf.provider_name === "hubspot-integrator"
      )
    );
  }

  isShopifyStoreExist() {
    return Boolean(this.company?.shopifyConfigs?.length);
  }
  isShopifyAccount() {
    return Boolean(this.company?.isShopifyAccount);
  }

  canIntegrateWithStripe(currentPlan: PlanType) {
    if (this.company?.isGlobalPricingFeatureEnabled) {
      if (
        currentPlan.id.indexOf("v10") > -1 &&
        !isFreeOrFreemiumPlan(currentPlan)
      ) {
        return true;
      } else {
        return (
          Boolean(this.company?.isStripeIntegrationEnabled) ||
          isEnterprisePlan(currentPlan)
        );
      }
    }
    return Boolean(this.company?.isStripeIntegrationEnabled);
  }
  canConnectChannel(currentPlan: PlanType) {
    if (!this.company) {
      return false;
    }
    if (this.company?.isGlobalPricingFeatureEnabled) {
      if (
        currentPlan.id.indexOf("v10") > -1 &&
        !isFreeOrFreemiumPlan(currentPlan)
      ) {
        return (
          this.usage?.currentNumberOfChannels <
          this.usage?.maximumNumberOfChannel
        );
      } else {
        return (
          isEnterprisePlan(currentPlan) ||
          Boolean(this.company.addonStatus?.isUnlimitedChannelEnabled) ||
          this.usage?.currentNumberOfChannels <
            this.usage?.maximumNumberOfChannel
        );
      }
    }
    return Boolean(this.company.addonStatus?.isUnlimitedChannelEnabled);
  }

  canConnectHubspot(currentPlan: PlanType) {
    if (!this.company) {
      return false;
    }
    if (this.company.isGlobalPricingFeatureEnabled) {
      if (
        (currentPlan.id.indexOf("v10") > -1 && isPremiumPlan(currentPlan)) ||
        isEnterprisePlan(currentPlan)
      ) {
        return true;
      }
      return Boolean(this.company.addonStatus?.isHubspotIntegrationEnabled);
    }
    return Boolean(this.company.addonStatus?.isHubspotIntegrationEnabled);
  }
  canConnectSalesforce(currentPlan: PlanType) {
    if (!this.company) {
      return false;
    }
    if (this.company.isGlobalPricingFeatureEnabled) {
      if (isEnterprisePlan(currentPlan)) {
        return true;
      }
      return Boolean(this.company.addonStatus?.isSalesforceCrmEnabled);
    }
    return Boolean(this.company.addonStatus?.isSalesforceCrmEnabled);
  }
  canConnectWhatsAppCatalog(currentPlan: PlanType) {
    if (!this.company) {
      return false;
    }
    if (this.company.isGlobalPricingFeatureEnabled) {
      if (
        currentPlan.id.indexOf("v10") > -1 &&
        !isFreeOrFreemiumPlan(currentPlan)
      ) {
        return true;
      }
      return !isFreeOrFreemiumPlan(currentPlan);
    }
    return true;
  }
  canConnectShopify(currentPlan: PlanType) {
    if (!this.company) {
      return false;
    }
    if (this.company.isGlobalPricingFeatureEnabled) {
      if (
        currentPlan.id.indexOf("v10") > -1 &&
        !isFreeOrFreemiumPlan(currentPlan)
      ) {
        return true;
      }
      return (
        isEnterprisePlan(currentPlan) ||
        Boolean(this.company.addonStatus?.isShopifyIntegrationEnabled)
      );
    }
    return Boolean(this.company.addonStatus?.isShopifyIntegrationEnabled);
  }
}
