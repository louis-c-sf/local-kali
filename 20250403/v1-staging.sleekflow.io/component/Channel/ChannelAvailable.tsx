import React, { CSSProperties, useCallback, useContext, useState } from "react";
import { Dropdown, DropdownItemProps, Image } from "semantic-ui-react";
import ChannelInfoType from "../../types/ChannelInfoType";
import ChannelForms from "./ChannelForms";
import FacebookPageType from "../../types/FacebookPageType";
import { useHistory } from "react-router";
import { ChannelsContext } from "./ChannelsContext";
import { ChannelType } from "../Chat/Messenger/types";
import {
  isFreemiumPlan,
  isFreeOrFreemiumPlan,
  isFreePlan,
  isPremiumPlan,
} from "types/PlanSelectionType";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { useFeaturesGuard } from "../Settings/hooks/useFeaturesGuard";
import BadgeTag from "../shared/BadgeTag/BadgeTag";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import styles from "./ChannelAvailable.module.css";
import channelStyles from "./ChannelActive.module.css";
import { equals } from "ramda";
import AddChannelButton from "./AddChannelButton";
import {
  getWhatsAppSupportUrl,
  getWhatsAppSupportUrlByCountryName,
} from "utility/getWhatsAppSupportUrl";
import { Icon } from "component/shared/Icon/Icon";
import { FreeTrialStatus } from "features/FreeTrial/modules/types";
import { onClickRedirectToStripe } from "component/Settings/SettingPlanSubscription/SettingPlanUtils";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { appendBillToAddonStatus } from "features/FreeTrial/helper/appendBillToAddonStatus";
import {
  StripeCheckoutCoreFeatures,
  StripeCheckoutIntegrationFeatures,
} from "api/User/useSettingsStipeCheckout";
import { getIntegrationFeaturePlanDetails } from "component/Settings/helpers/getIntegrationFeaturePlanDetails";
import { useShopifyConnect } from "features/Shopify/policies/useShopifyConnect";
import { FacebookResponseType } from "./ChannelSelection";
import {
  IntegrationType,
  useChannelLocales,
} from "./localizable/useChannelLocales";

export default ChannelAvailable;
const listOfChannels = [
  "whatsapp",
  "facebook",
  "instagram",
  "twilio_whatsapp",
  "telegram",
  "viber",
  "sms",
  "line",
  "wechat",
];
function ChannelAvailable(props: {
  isChannel?: boolean;
  channelInfo: ChannelInfoType;
  onConnect: Function;
  facebookResponseData?: FacebookResponseType;
  hidden?: boolean;
  stripePublicKey?: string;
  addOnPlans?:
    | {
        coreFeatures: StripeCheckoutCoreFeatures;
        integrationFeatures: StripeCheckoutIntegrationFeatures;
      }
    | undefined;
}) {
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const loginDispatch = useAppDispatch();
  const { dispatch } = useContext(ChannelsContext);
  const {
    channelInfo,
    onConnect,
    facebookResponseData,
    hidden = false,
    isChannel,
    stripePublicKey,
    addOnPlans,
  } = props;
  const { image, title, installMode } = channelInfo;

  const history = useHistory();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const featureGuard = useFeaturesGuard();
  const [buttonLoading, setButtonLoading] = useState(false);
  const accessRuleGuard = useAccessRulesGuard();
  const flash = useFlashMessageChannel();

  const { getSelectedChannelList } = useChannelLocales();
  const integrationChannels = getSelectedChannelList(
    "integration"
  ) as IntegrationType;
  const channelsIntegrations = [
    ...integrationChannels.crm,
    ...integrationChannels.automated,
    ...integrationChannels.customized,
  ];
  const shopifyConnect = useShopifyConnect({
    setLoading: setButtonLoading,
    addOnPlans,
    stripePublicKey,
  });

  const installModeLocales = {
    easy: t("channels.selection.installMode.easy"),
    moderate: t("channels.selection.installMode.moderate"),
    advanced: t("channels.selection.installMode.advanced"),
  };
  const {
    isAdditionalStaffEnabled,
    isAdditionalStaffFreeTrialEligible,
    isHubspotIntegrationEnabled,
    isHubspotIntegrationFreeTrialEligible,
    isSalesforceCrmEnabled,
    isSalesforceCrmFreeTrialEligible,
  } = useAppSelector((s) => ({
    isAdditionalStaffEnabled: s.company?.addonStatus?.isAdditionalStaffEnabled,
    isAdditionalStaffFreeTrialEligible:
      s.company?.addonStatus?.isAdditionalStaffFreeTrialEligible,
    isHubspotIntegrationEnabled:
      s.company?.addonStatus?.isHubspotIntegrationEnabled,
    isHubspotIntegrationFreeTrialEligible:
      s.company?.addonStatus?.isHubspotIntegrationFreeTrialEligible,
    isSalesforceCrmEnabled: s.company?.addonStatus?.isSalesforceCrmEnabled,
    isSalesforceCrmFreeTrialEligible:
      s.company?.addonStatus?.isSalesforceCrmFreeTrialEligible,
  }));
  const isGlobalPricingFeatureEnabled = useAppSelector(
    (s) => s.company?.isGlobalPricingFeatureEnabled
  );

  const billRecords = useAppSelector((s) => s.company?.billRecords);
  const isCurrentPlanPremium = isPremiumPlan(currentPlan);
  const currentPlanString = isCurrentPlanPremium ? "premium" : "pro";

  const freeTrialStatus = appendBillToAddonStatus(
    isAdditionalStaffEnabled,
    isAdditionalStaffFreeTrialEligible,
    isHubspotIntegrationEnabled,
    isHubspotIntegrationFreeTrialEligible,
    isSalesforceCrmEnabled,
    isSalesforceCrmFreeTrialEligible,
    billRecords,
    currentPlanString
  );
  const isSalesforceNotUsedFreeTrial =
    freeTrialStatus.salesforceCrm.freeTrialStatus === FreeTrialStatus.notUsed;
  const isHubspotCrmNotUsedFreeTrial =
    freeTrialStatus.hubspotCrm.freeTrialStatus === FreeTrialStatus.notUsed;

  const companyCountry = useAppSelector((s) => s.company?.companyCountry);

  function redirectToSalesforceSetup() {
    if (isFreeOrFreemiumPlan(currentPlan)) {
      window.open(
        getWhatsAppSupportUrl(
          t(
            "settings.plan.addOn.integrationFeatures.salesforceCRMIntegration.consultUsMessage"
          )
        ),
        "_blank"
      );
      return;
    } else if (isSalesforceNotUsedFreeTrial) {
      history.push({
        pathname: routeTo("/free-trial/intro/salesforce"),
        state: {
          back: "/channels",
        },
      });
      return;
    } else {
      onClickRedirectToStripe({
        setLoading: setButtonLoading,
        flash,
        planId: getIntegrationFeaturePlanDetails(
          currentPlan,
          addOnPlans?.integrationFeatures,
          "salesforceCRMIntegration"
        ).id,
        stripePublicKey,
        t,
      });
      return;
    }
  }
  function openReviewPlanModal() {
    dispatch({
      type: "REVIEW_PLAN_MODAL_OPEN",
    });
    return;
  }
  const handleClick = useCallback(() => {
    if (isGlobalPricingFeatureEnabled === undefined) {
      return;
    }
    if (isFreePlan(currentPlan)) {
      if (isGlobalPricingFeatureEnabled) {
        return openReviewPlanModal();
      }
      history.push(routeTo("/settings/plansubscription"));
      return;
    } else if (
      featureGuard.channelRequiresUpgrade(channelsIntegrations, channelInfo)
    ) {
      if (isGlobalPricingFeatureEnabled) {
        return openReviewPlanModal();
      }
      loginDispatch({
        type: "IS_DISPLAY_UPGRADE_PLAN_MODAL",
        isDisplayUpgradePlanModal: true,
      });
      return;
    } else {
      if (
        listOfChannels.includes(channelInfo.name) &&
        !featureGuard.canConnectChannel(currentPlan)
      ) {
        if (isGlobalPricingFeatureEnabled) {
          return openReviewPlanModal();
        }
      }
      if (
        channelInfo.name === "whatsapp" &&
        isFreeOrFreemiumPlan(currentPlan) &&
        isGlobalPricingFeatureEnabled
      ) {
        return openReviewPlanModal();
      }
      if (channelInfo.name === "web") {
        history.push(routeTo("/settings/livechatwidget"));
        return;
      }
      if (channelInfo.name === "viber") {
        history.push(routeTo("/onboarding/viber"));
        return;
      }
      if (channelInfo.name === "telegram") {
        history.push(routeTo("/onboarding/telegram"));
        return;
      }
      if (channelInfo.name === "facebookLeadAds") {
        dispatch({
          type: "NEW_VERSION_MODAL_OPEN",
          channelName: "facebookLeadAds",
        });
        return;
      }
      if (channelInfo.name === "stripe") {
        if (featureGuard.canIntegrateWithStripe(currentPlan)) {
          history.push(routeTo("/onboarding/stripe"));
          return;
        } else {
          if (isGlobalPricingFeatureEnabled) {
            dispatch({
              type: "REVIEW_PLAN_MODAL_OPEN",
            });
            return;
          } else {
            window.open(
              getWhatsAppSupportUrlByCountryName(
                companyCountry,
                t(
                  "settings.plan.addOn.integrationFeatures.stripeIntegration.consultUsMessage"
                )
              ),
              "_blank"
            );
            return;
          }
        }
      }
      if (channelInfo.name === "whatsappCatalog") {
        if (featureGuard.canConnectWhatsAppCatalog(currentPlan)) {
          history.push(routeTo("/onboarding/whatsappCatalog"));
        } else {
          if (isGlobalPricingFeatureEnabled) {
            return openReviewPlanModal();
          }
        }
        return;
      }
      if (
        ["salesforce", "salesforceMarketingCloud"].includes(channelInfo.name)
      ) {
        if (isSalesforceCrmEnabled) {
          if (channelInfo.name === "salesforce") {
            if (featureGuard.canConnectSalesforce(currentPlan)) {
              dispatch({
                type: "NEW_VERSION_MODAL_OPEN",
                channelName: "salesforce",
              });
              return;
            } else {
              if (isGlobalPricingFeatureEnabled) {
                return openReviewPlanModal();
              }
            }
          } else {
            dispatch({
              type: "CHANNEL_FORM_OPEN",
              channelName: channelInfo.name as ChannelType,
            });
            return;
          }
        } else {
          if (isGlobalPricingFeatureEnabled) {
            return openReviewPlanModal();
          }
          redirectToSalesforceSetup();
          return;
        }
      }
      if (channelInfo.name === "hubspot") {
        if (featureGuard.canConnectHubspot(currentPlan)) {
          history.push(routeTo("/onboarding/hubspot"));
          return;
        } else {
          if (isGlobalPricingFeatureEnabled) {
            return openReviewPlanModal();
          } else if (isFreeOrFreemiumPlan(currentPlan)) {
            window.open(
              getWhatsAppSupportUrl(
                t(
                  "settings.plan.addOn.integrationFeatures.hubspotIntegration.consultUsMessage"
                )
              ),
              "_blank"
            );
            return;
          } else if (isHubspotCrmNotUsedFreeTrial) {
            history.push({
              pathname: routeTo("/free-trial/intro/hubspot"),
              state: {
                back: "/channels",
              },
            });
            return;
          } else {
            onClickRedirectToStripe({
              setLoading: setButtonLoading,
              flash,
              planId: getIntegrationFeaturePlanDetails(
                currentPlan,
                addOnPlans?.integrationFeatures,
                "hubspotIntegration"
              ).id,
              stripePublicKey,
              t,
            });
            return;
          }
        }
      }
      if (channelInfo.name === "whatsapp") {
        Cookies.set("syncing", "");
        Cookies.set("whatsappConnecting", "");
        Cookies.set("whatsappNotSync", "");
      }
      if (channelInfo.name === "shopify") {
        if (featureGuard.canConnectShopify(currentPlan)) {
          if (accessRuleGuard.isPaid()) {
            shopifyConnect.start();
            return;
          }
          history.push(routeTo("/shopify-upgrade-plan"));
          return;
        } else {
          if (isGlobalPricingFeatureEnabled) {
            dispatch({
              type: "REVIEW_PLAN_MODAL_OPEN",
            });
            return;
          }
          history.push(routeTo("/shopify-upgrade-plan"));
          return;
        }
      }
      if (channelInfo.name === "facebook") {
        Cookies.set("fbConnecting", "");
      }
      if (channelInfo.name === "instagram") {
        history.push(routeTo("/onboarding/instagram"));
        return;
      }
      if (channelInfo.name !== "whatsapp") {
        dispatch({
          type: "CHANNEL_FORM_OPEN",
          channelName: channelInfo.name as ChannelType,
        });
      } else {
        if (featureGuard.canConnectWhatsapp()) {
          if (isFreemiumPlan(currentPlan)) {
            history.push(routeTo("/settings/plansubscription"));
          } else {
            history.push(routeTo("/guide/whatsapp-comparison/cloudAPI"));
          }
        } else {
          history.push(routeTo("/onboarding/contact-first"));
        }
      }
    }
  }, [
    currentPlan,
    routeTo,
    channelInfo.name,
    history,
    accessRuleGuard.isPaid(),
    featureGuard.canConnectWhatsapp,
    featureGuard.channelRequiresUpgrade(channelsIntegrations, channelInfo),
    freeTrialStatus,
    isHubspotIntegrationEnabled,
    isSalesforceCrmEnabled,
    stripePublicKey,
    isHubspotCrmNotUsedFreeTrial,
    isSalesforceNotUsedFreeTrial,
    addOnPlans?.integrationFeatures,
    channelsIntegrations,
    isGlobalPricingFeatureEnabled,
  ]);

  function getInstallModeStyle(level: string) {
    const levelMap = {
      easy: channelStyles.easy,
      moderate: channelStyles.moderate,
      advanced: channelStyles.advanced,
    };
    return levelMap[level] ?? channelStyles.moderate;
  }

  const styleInline: CSSProperties = {};
  if (channelInfo.name === "twilio_whatsapp") {
    styleInline.display = "none";
  }
  let addLabel: string | undefined = undefined;
  if (channelInfo.name === "salesforceMarketingCloud") {
    addLabel = t("channels.selection.button.addShort");
  }

  return (
    <div
      className={`${channelStyles.channel} ${channelInfo.name}`}
      style={styleInline}
    >
      <div className={channelStyles.image}>
        <Image src={image} />
      </div>
      <div className={`${channelStyles.description}`}>
        <div className={channelStyles.nameWrapper}>
          <div className={`${channelStyles.name} link2`}>{title}</div>
        </div>
        {channelInfo.descBrief && (
          <div className={styles.hint}>{channelInfo.descBrief}</div>
        )}
        {["whatsapp", "shopify"].includes(title.toLowerCase()) && (
          <BadgeTag
            text={
              isGlobalPricingFeatureEnabled
                ? t("account.proOrAbove")
                : t("account.proAndPremium")
            }
            noMargins
            compact
          />
        )}
        {isGlobalPricingFeatureEnabled && title.toLowerCase() === "stripe" && (
          <BadgeTag text={t("account.proOrAbove")} noMargins compact />
        )}
        {isGlobalPricingFeatureEnabled && title.toLowerCase() === "hubspot" && (
          <BadgeTag
            text={t("account.premiumAndEnterprise")}
            noMargins
            compact
          />
        )}
        {isGlobalPricingFeatureEnabled &&
          title.toLowerCase() === "salesforce" && (
            <BadgeTag text={t("account.enterprise")} noMargins compact />
          )}
        {!isGlobalPricingFeatureEnabled &&
          !isFreeOrFreemiumPlan(currentPlan) &&
          !isSalesforceCrmEnabled &&
          title.toLowerCase() === "salesforce" &&
          isSalesforceNotUsedFreeTrial && (
            <BadgeTag
              text={t("channels.freeTrial.tag")}
              noMargins
              compact
              className={channelStyles.freeTrialTag}
            />
          )}
        {!isGlobalPricingFeatureEnabled &&
          !isFreeOrFreemiumPlan(currentPlan) &&
          !isHubspotIntegrationEnabled &&
          title.toLowerCase() === "hubspot" &&
          isHubspotCrmNotUsedFreeTrial && (
            <BadgeTag
              text={t("channels.freeTrial.tag")}
              noMargins
              compact
              className={channelStyles.freeTrialTag}
            />
          )}
        {installMode && (
          <div
            className={`${channelStyles.installMode} ${getInstallModeStyle(
              installMode
            )}`}
          >
            {installModeLocales[installMode]}
          </div>
        )}
      </div>
      <AddChannelButton
        isChannel={isChannel}
        handleClick={handleClick}
        buttonLoading={buttonLoading}
        addLabel={addLabel}
      />
      <ChannelForms
        facebookChannelData={facebookResponseData}
        channelInfo={channelInfo}
        onConnect={onConnect}
      />
    </div>
  );
}

export function ChannelContextMenu(props: { actions: DropdownItemProps[] }) {
  const [open, setOpen] = useState<boolean | undefined>(undefined);
  const { t } = useTranslation();

  return (
    <Dropdown
      upward={false}
      open={open}
      className={styles.actions}
      onBlur={() => setOpen(false)}
      icon={false}
      direction={"left"}
      options={props.actions.map((option, key) => ({
        ...option,
        key,
        selected: false,
        onClick: (event, data) => {
          setOpen(false);
          option.onClick && option.onClick(event, data);
        },
      }))}
      trigger={
        <span
          className={styles.iconWrap}
          onClick={() => setOpen(!open)}
          title={t("channels.action.action")}
        >
          <Icon type={"dots horizontal"} />
        </span>
      }
    />
  );
}
