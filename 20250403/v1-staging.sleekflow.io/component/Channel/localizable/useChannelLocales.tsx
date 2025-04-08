import ChannelInfoType from "../../../types/ChannelInfoType";
import FacebookLeadAdsImg from "../../../assets/images/channels/facebook-lead-ads.svg";
import ZapierImg from "../../../assets/images/channels/zapier-logomark.svg";
import SleekFlowImg from "../../../assets/images/logo-solid.svg";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import ShopifyImg from "../../../assets/images/channels/shopify.svg";
import Stripe from "../../../assets/images/channels/stripe.svg";
import SalesforceImg from "../../../assets/images/channels/salesforce.svg";
import HubspotImg from "../../../assets/images/channels/hubspot.svg";
import MakeComImg from "../../../assets/images/channels/make-com.svg";
import { iconFactory } from "../../Chat/hooks/useCompanyChannels";

export type IntegrationType = {
  crm: ChannelInfoType[];
  automated: ChannelInfoType[];
  customized: ChannelInfoType[];
};
export type ChannelType = IntegrationType | Array<ChannelInfoType>;

export function useChannelLocales(): {
  channelIntegrationList: ChannelInfoType[];
  liveChatChannel: ChannelInfoType;
  channelPrototypeList: ChannelInfoType[];
  customizedIntegrationList: ChannelInfoType[];
  crmChannelIntegrationList: ChannelInfoType[];
  channelAutomatedIntegrationList: ChannelInfoType[];
  automationChannelIntegrationList: ChannelInfoType[];
  commerceChannelIntegrationList: ChannelInfoType[];
  getSelectedChannelList: (
    type: "channel" | "integration" | "commerce"
  ) => ChannelType;
} {
  const { t } = useTranslation();
  const channelAutomatedIntegrationList: ChannelInfoType[] = [
    {
      image: FacebookLeadAdsImg,
      desc: [t("channelPrototype.facebookLeadAds.desc")],
      descBrief: t("channelPrototype.facebookLeadAds.descBrief"),
      descBriefHeader: t("channelPrototype.facebookLeadAds.descBriefHeader"),
      name: "facebookLeadAds",
      title: t("channelPrototype.facebookLeadAds.title"),
      titleContent: t("channelPrototype.facebookLeadAds.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.facebookLeadAds.longDescription"}>
          Allow SleekFlow to automatically retrieve contacts from Facebook Lead
          Ads. Lead Source will be marked as “Facebook Lead Ads” together with
          the Form ID the customers used to provide details.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.facebookLeadAds.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/app-integrations/facebook-lead-ads",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: SleekFlowImg,
      desc: [],
      descBrief: t("channelPrototype.sleekflow.descBrief"),
      descBriefHeader: t("channelPrototype.sleekflow.descBriefHeader"),
      name: "sleekflowApi",
      title: t("channelPrototype.sleekflow.title"),
      titleContent: t("channelPrototype.sleekflow.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.sleekflow.longDescription"}>
          SleekFlow has a published API that any SleekFlow Premium User can use.
          <br />
          You can use our API to send message and files, create or update
          contacts automatically.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.sleekflow.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink: "https://apidoc.sleekflow.io/docs/platform-api",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: ShopifyImg,
      desc: [],
      descBrief: t("channelPrototype.shopify.descBrief"),
      descBriefHeader: t("channelPrototype.shopify.descBriefHeader"),
      name: "shopify",
      title: t("channelPrototype.shopify.title"),
      titleContent: t("channelPrototype.shopify.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.shopify.longDescription"}>
          Connecting Shopify with SleekFlow allows you to automatically welcome
          new customers, trigger abandoned cart messages, promote new products,
          update order staus while syncing customer contacts and more.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.shopify.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/app-integrations/zapier-shopify",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: Stripe,
      desc: [],
      descBrief: t("channelPrototype.stripe.descBrief"),
      descBriefHeader: t("channelPrototype.stripe.descBriefHeader"),
      name: "stripe",
      title: t("channelPrototype.stripe.title"),
      titleContent: t("channelPrototype.stripe.titleContent"),
      setupFee: "",
      stepByStepGuideLinkTitle: "",
      stepByStepGuideLink: "",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: SalesforceImg,
      desc: [],
      descBrief: t("channelPrototype.salesforce.descBrief"),
      descBriefHeader: "",
      name: "salesforce",
      title: t("channelPrototype.salesforce.title"),
      titleContent: t("channelPrototype.salesforce.titleContent"),
      setupFee: "",
      stepByStepGuideLinkTitle: "",
      stepByStepGuideLink: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
    },
    {
      image: HubspotImg,
      desc: [],
      descBrief: t("channelPrototype.hubspot.descBrief"),
      descBriefHeader: "",
      name: "hubspot",
      title: t("channelPrototype.hubspot.title"),
      titleContent: t("channelPrototype.hubspot.titleContent"),
      setupFee: "",
      stepByStepGuideLinkTitle: "",
      stepByStepGuideLink: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
    },
  ];
  const channelIntegrationList: ChannelInfoType[] = [
    {
      image: FacebookLeadAdsImg,
      desc: [t("channelPrototype.facebookLeadAds.desc")],
      descBrief: t("channelPrototype.facebookLeadAds.descBrief"),
      descBriefHeader: t("channelPrototype.facebookLeadAds.descBriefHeader"),
      name: "facebookLeadAds",
      title: t("channelPrototype.facebookLeadAds.title"),
      titleContent: t("channelPrototype.facebookLeadAds.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.facebookLeadAds.longDescription"}>
          Allow SleekFlow to automatically retrieve contacts from Facebook Lead
          Ads. Lead Source will be marked as “Facebook Lead Ads” together with
          the Form ID the customers used to provide details.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.facebookLeadAds.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/app-integrations/facebook-lead-ads",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: SleekFlowImg,
      desc: [],
      descBrief: t("channelPrototype.sleekflow.descBrief"),
      descBriefHeader: t("channelPrototype.sleekflow.descBriefHeader"),
      name: "sleekflowApi",
      title: t("channelPrototype.sleekflow.title"),
      titleContent: t("channelPrototype.sleekflow.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.sleekflow.longDescription"}>
          SleekFlow has a published API that any SleekFlow Premium User can use.
          <br />
          You can use our API to send message and files, create or update
          contacts automatically.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.sleekflow.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink: "https://apidoc.sleekflow.io/docs/platform-api",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
  ];
  const channelPrototypeList: ChannelInfoType[] = [
    {
      image: iconFactory("whatsapp"),
      desc: [t("channelPrototype.whatsapp.desc")],
      descBrief: t("channelPrototype.whatsapp.descBrief"),
      descBriefHeader: t("channelPrototype.whatsapp.descBriefHeader"),
      name: "whatsapp",
      title: t("channelPrototype.whatsapp.title"),
      titleContent: t("channelPrototype.whatsapp.titleContent"),
      setupFee: t("channelPrototype.whatsapp.setupFee"),
      freeTrialDay: 7,
      longDescription: (
        <Trans i18nKey={"channelPrototype.whatsapp.longDescription"}>
          To route messages from WhatsApp to your inbox in SleekFlow, you’ll
          have to
          <a href="https://app.chat-api.com/registration" target="_blank">
            set up an account
          </a>
          on Chat API. Chat API provides a 3-day free trial to start with, and
          charge US$ 39 thereafter per WhatsApp Account. The messages are highly
          secured and encrypted in which both parties will not have access to
          the conversations. Please note that the billing is separate from
          SleekFlow, and you’ll have to pay monthly to Chat API at this stage.
          You’ll need WhatsApp to be installed on your phone connected to the
          Internet.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.whatsapp.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/messaging-channels/whatsapp",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: iconFactory("facebook"),
      desc: [t("channelPrototype.facebook.desc")],
      descBrief: t("channelPrototype.facebook.descBrief"),
      name: "facebook",
      title: t("channelPrototype.facebook.title"),
      titleContent: t("channelPrototype.facebook.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.facebook.longDescription"}>
          Route private messages from Facebook to your Inbox in SleekFlow,
          keeping all of your customer communications in one place. You can also
          manage all Facebook visitors’ profiles in one place.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.facebook.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/messaging-channels/facebook-messenger",
      isComingSoon: false,
      canHaveMultipleInstances: true,
      installMode: "easy",
    },
    {
      image: iconFactory("instagram"),
      desc: [t("channelPrototype.instagram.desc")],
      descBrief: t("channelPrototype.instagram.descBrief"),
      name: "instagram",
      title: t("channelPrototype.instagram.title"),
      titleContent: t("channelPrototype.instagram.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.instagram.longDescription"}>
          Route private messages from instagram to your Inbox in SleekFlow,
          keeping all of your customer communications in one place. You can also
          manage all instagram visitors’ profiles in one place.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.instagram.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/messaging-channels/instagram-messenger",
      isComingSoon: false,
      canHaveMultipleInstances: true,
      installMode: "easy",
    },
    {
      image: iconFactory("wechat"),
      desc: [t("channelPrototype.wechat.desc")],
      descBrief: t("channelPrototype.wechat.descBrief"),
      descBriefHeader: t("channelPrototype.wechat.descBriefHeader"),
      name: "wechat",
      title: t("channelPrototype.wechat.title"),
      titleContent: t("channelPrototype.wechat.titleContent"),
      longDescription: (
        <Trans i18nKey={"channelPrototype.wechat.longDescription"}>
          To route messages from WeChat Official Account to your inbox in
          SleekFlow, you’ll need to log-in to the
          <a href="https://mp.weixin.qq.com/" target="_blank">
            dashboard.
          </a>
          You’ll also need to submit certain information provided below to
          WeChat to complete the set up.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.wechat.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/messaging-channels/wechat",
      setupFee: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
      installMode: "advanced",
    },
    {
      image: iconFactory("line"),
      desc: [t("channelPrototype.line.desc")],
      descBrief: t("channelPrototype.line.descBrief"),
      name: "line",
      title: t("channelPrototype.line.title"),
      titleContent: t("channelPrototype.line.titleContent"),
      longDescription: (
        <Trans i18nKey={"channelPrototype.line.longDescription"}>
          You can create you account for
          <a href="https://account.line.biz/signup" target="_blank">
            free.
          </a>
          To route LINE messages to your inbox in SleekFlow, you’ll need to
          log-in to the
          <a href="https://developers.line.biz/en/" target={"_blank"}>
            developer console.
          </a>
          You’ll also need to submit certain information provided below to Line
          to complete the set up.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.line.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink: "https://docs.sleekflow.io/messaging-channels/line",
      setupFee: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
      installMode: "moderate",
    },
    {
      image: iconFactory("sms"),
      setupFee: "",
      descBrief: t("channelPrototype.twilioSms.descBrief"),
      desc: [],
      longDescription: (
        <Trans i18nKey={"channelPrototype.whatsapp.longDescription"}>
          You’ll have to create an account on Twilio and apply for a number. To
          broadcast and receive SMS, you’ll need to log-in to the Twilio console
          and submit certain information to SleekFlow to complete the set up.
          Please note that all the billings are counted on Twilio separately.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.twilioSms.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/messaging-channels/twilio-sms",
      name: "sms",
      title: t("channelPrototype.twilioSms.title"),
      titlePopup: t("channelPrototype.twilioSms.titlePopup"),
      titleContent: t("channelPrototype.twilioSms.titleContent"),
      isComingSoon: false,
      canHaveMultipleInstances: false,
      installMode: "advanced",
    },
    {
      image: iconFactory("whatsapp"),
      setupFee: "",
      descBrief: t("channelPrototype.whatsappTwilio.descBrief"),
      descBriefHeader: t("channelPrototype.whatsappTwilio.descBriefHeader"),
      longDescription: (
        <Trans i18nKey={"channelPrototype.whatsappTwilio.longDescription"}>
          You’ll have to create an account on Twilio and apply for a number.
          Please refer to our guide to link your Twilio account to SleekFlow.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.whatsappTwilio.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/messaging-channels/twilio-whatsapp/connect-twilio-whatsapp",
      desc: [""],
      name: "twilio_whatsapp",
      title: t("channelPrototype.whatsappTwilio.title"),
      titlePopup: t("channelPrototype.whatsappTwilio.titlePopup"),
      titleContent: t("channelPrototype.whatsappTwilio.titleContent"),
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: iconFactory("viber"),
      setupFee: "",
      descBrief: "",
      desc: [""],
      name: "viber",
      title: t("channelPrototype.viber.title"),
      titleContent: "",
      canHaveMultipleInstances: true,
    },
    {
      image: iconFactory("telegram"),
      setupFee: "",
      descBrief: "",
      desc: [""],
      name: "telegram",
      title: t("channelPrototype.telegram.title"),
      titleContent: "",
      canHaveMultipleInstances: true,
    },
  ];
  const commerceChannelIntegrationList: ChannelInfoType[] = [
    {
      image: ShopifyImg,
      desc: [],
      descBrief: t("channelPrototype.shopify.descBrief"),
      descBriefHeader: t("channelPrototype.shopify.descBriefHeader"),
      name: "shopify",
      title: t("channelPrototype.shopify.title"),
      titleContent: t("channelPrototype.shopify.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.shopify.longDescription"}>
          Connecting Shopify with SleekFlow allows you to automatically welcome
          new customers, trigger abandoned cart messages, promote new products,
          update order staus while syncing customer contacts and more.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.shopify.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/app-integrations/zapier-shopify",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: Stripe,
      desc: [],
      descBrief: t("channelPrototype.stripe.descBrief"),
      descBriefHeader: t("channelPrototype.stripe.descBriefHeader"),
      name: "stripe",
      title: t("channelPrototype.stripe.title"),
      titleContent: t("channelPrototype.stripe.titleContent"),
      setupFee: "",
      stepByStepGuideLinkTitle: "",
      stepByStepGuideLink: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
    },
    {
      image: iconFactory("whatsapp"),
      desc: [],
      descBrief: t("channelPrototype.whatsappCatalog.descBrief"),
      descBriefHeader: "",
      name: "whatsappCatalog",
      title: t("channelPrototype.whatsappCatalog.title"),
      titleContent: "",
      setupFee: "",
      stepByStepGuideLinkTitle: "",
      stepByStepGuideLink: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
    },
  ];
  const crmChannelIntegrationList: ChannelInfoType[] = [
    {
      image: SalesforceImg,
      desc: [],
      descBrief: t("channelPrototype.salesforce.descBrief"),
      descBriefHeader: "",
      name: "salesforce",
      title: t("channelPrototype.salesforce.title"),
      titleContent: t("channelPrototype.salesforce.titleContent"),
      setupFee: "",
      stepByStepGuideLinkTitle: "",
      stepByStepGuideLink: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
    },
    {
      image: HubspotImg,
      desc: [],
      descBrief: t("channelPrototype.hubspot.descBrief"),
      descBriefHeader: "",
      name: "hubspot",
      title: t("channelPrototype.hubspot.title"),
      titleContent: t("channelPrototype.hubspot.titleContent"),
      setupFee: "",
      stepByStepGuideLinkTitle: "",
      stepByStepGuideLink: "",
      isComingSoon: false,
      canHaveMultipleInstances: false,
    },
  ];
  const automationChannelIntegrationList: ChannelInfoType[] = [
    {
      image: MakeComImg,
      desc: [],
      descBrief: t("channelPrototype.makeCom.descBrief"),
      descBriefHeader: t("channelPrototype.makeCom.descBriefHeader"),
      name: "make",
      title: t("channelPrototype.makeCom.title"),
      titleContent: t("channelPrototype.makeCom.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.makeCom.longDescription"}>
          Connect SleekFlow with thousands of apps including Google Sheet,
          Google Form, WooCommerce, Calendly, Mailchimp, and more.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.makeCom.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/app-integrations/make-getting-started",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: ZapierImg,
      desc: [],
      descBrief: t("channelPrototype.zapier.descBrief"),
      descBriefHeader: t("channelPrototype.zapier.descBriefHeader"),
      name: "zapier",
      title: t("channelPrototype.zapier.title"),
      titleContent: t("channelPrototype.zapier.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.zapier.longDescription"}>
          Zapier allow you to connect SleekFlow with thousands of apps on
          Zapier, with some useful examples such as Google Sheet, Google Form,
          Typeform, Hubspot, Shopify, WooCommerce, Calendly, Mailchimp, Stripe
          and many more.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.zapier.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/app-integrations/zapier-beta",
      isComingSoon: false,
      canHaveMultipleInstances: true,
    },
    {
      image: SalesforceImg,
      desc: [],
      descBrief: t("channelPrototype.salesforceMC.descBrief"),
      descBriefHeader: t("channelPrototype.salesforceMC.descBriefHeader"),
      name: "salesforceMarketingCloud",
      title: t("channelPrototype.salesforceMC.title"),
      titleContent: t("channelPrototype.salesforceMC.titleContent"),
      setupFee: "",
      longDescription: (
        <Trans i18nKey={"channelPrototype.salesforceMC.longDescription"}>
          Integrate SleekFlow with Salesforce Marketing Cloud to send WhatsApp
          messages to your customers through Salesforce journey builder.
        </Trans>
      ),
      stepByStepGuideLinkTitle: t(
        "channelPrototype.salesforceMC.stepByStepGuideLinkTitle"
      ),
      stepByStepGuideLink:
        "https://docs.sleekflow.io/app-integrations/salesforce-crm/salesforce-marketing-cloud",
      isComingSoon: false,
      canHaveMultipleInstances: false,
    },
  ];

  function getSelectedChannelList(
    type: "channel" | "integration" | "commerce"
  ): ChannelType {
    switch (type) {
      case "channel":
        return channelPrototypeList;
      case "commerce":
        return commerceChannelIntegrationList;
      case "integration":
        return {
          crm: crmChannelIntegrationList,
          automated: automationChannelIntegrationList,
          customized: channelIntegrationList,
        };
      default:
        return channelPrototypeList;
    }
  }

  return {
    getSelectedChannelList,
    channelPrototypeList: channelPrototypeList,
    commerceChannelIntegrationList: commerceChannelIntegrationList,
    channelIntegrationList: channelIntegrationList,
    customizedIntegrationList: channelIntegrationList,
    crmChannelIntegrationList: crmChannelIntegrationList,
    automationChannelIntegrationList: automationChannelIntegrationList,
    channelAutomatedIntegrationList: channelAutomatedIntegrationList,
    liveChatChannel: {
      image: iconFactory("web"),
      desc: [""],
      descBrief: t("channelPrototype.web.descBrief"),
      name: "web",
      title: t("channelPrototype.web.title"),
      titleContent: t("channelPrototype.web.titleContent"),
      setupFee: "",
      isComingSoon: true,
      canHaveMultipleInstances: false,
      installMode: "easy",
    },
  };
}
