import React, { useEffect, useReducer, useState } from "react";
import { PostLogin } from "../Header";
import ChannelInfoType, {
  ChannelInfoConfiguredType,
} from "../../types/ChannelInfoType";
import Helmet from "react-helmet";
import FacebookPageType, {
  FacebookPageResponseType,
} from "../../types/FacebookPageType";
import {
  DELETE_360DIALOG_CHANNEL,
  DELETE_CLOUDAPI_CHANNEL,
  DELETE_FACEBOOK_ADS_CHANNEL,
  DELETE_FACEBOOK_CHANNEL,
  DELETE_INSTAGRAM_PROFILE,
  DELETE_LINE_CHANNEL,
  DELETE_SHOPIFY_CHANNEL,
  DELETE_TWILIO_SMS_CHANNEL,
  DELETE_TWILIO_WHATSAPP_CHANNEL,
  DELETE_WECHAT_CHANNEL,
  DELETE_WHATSAPP_CHANNEL,
  POST_CHANNEL_RENAME,
  POST_TWILIO_SMS_RENAME,
  POST_TWILIO_WHATSAPP_RENAME,
  POST_WHATSAPP_RENAME,
  PUT_360DIALOG_RENAME,
} from "../../api/apiPath";
import {
  deleteMethod,
  parseHttpError,
  postWithExceptions,
  putMethodWithExceptions,
} from "../../api/apiRequest";
import "../../style/css/channel_selection.css";
import { fetchOnboardingProgress } from "../../api/Onboarding/fetchOnboardingProgress";
import {
  ChannelsAction,
  ChannelsState,
  defaultChannelsState,
} from "./channelsReducer";
import { getConfigId } from "./selectors";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { ChannelsContext } from "./ChannelsContext";
import useSubscriptionPlans from "../SubscriptionPlan/useSubscriptionPlans";
import { useCompanyChannelIntegrations } from "../Chat/hooks/useCompanyChannels";
import { equals, pick } from "ramda";
import { BillRecordsType } from "../../types/CompanyType";
import moment from "moment";
import { ExcludedAddOn } from "../Settings/SettingPlanSubscription/SettingPlan/SettingPlan";
import RenameChannelModal from "./RenameChannelModal";
import { useTranslation } from "react-i18next";
import { RemoveChannelModal } from "./RemoveChannelModal";
import { useChannelLocales } from "./localizable/useChannelLocales";
import { useChannelsPageReducer } from "./useChannelsPageReducer";
import { useLocation } from "react-router";
import { fetchCompany } from "../../api/Company/fetchCompany";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { ChannelType } from "../Chat/Messenger/types";
import { ChannelDummy } from "./ChannelDummy";
import { submitDeleteViberChannel } from "../../api/Channel/submitDeleteViberChannel";
import { submitDeleteTelegramChannel } from "../../api/Channel/submitDeleteTelegramChannel";
import { submitRenameViberChannel } from "../../api/Channel/submitRenameViberChannel";
import { submitRenameTelegramChannel } from "../../api/Channel/submitRenameTelegramChannel";
import { useFeaturesGuard } from "../Settings/hooks/useFeaturesGuard";
import { useSettingsSubscriptionPlan } from "component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";
import {
  isFreeOrFreemiumPlan,
  isProPlan,
  isYearlyPlan,
} from "types/PlanSelectionType";
import ChannelSelectionGrid from "./ChannelSelectionGrid/ChannelSelectionGrid";
import useFetchShopifyStatus from "api/Channel/useFetchShopifyStatus";
import createShopifyOwner from "api/Company/postShopfiyOwner";
import postSubscribeShopifyPlan from "api/Shopify/postSubscribeShopifyPlan";
import useFetchShopifyOwner from "api/Company/useFetchShopifyOwner";
import { deleteShopifySubscription } from "api/Company/deleteShopifySubscription";
import { fetchShopifySubscriptionStatus } from "api/Company/fetchShopifySubscriptionStatus";
import { htmlEscape } from "../../lib/utility/htmlEscape";
import ReviewPlanModal from "component/shared/modal/ReviewPlanModal/ReviewPlanModal";
import NewVersionModal from "component/shared/modal/NewVersionModal/NewVersionModal";
import { useRequireRBAC } from "component/shared/useRequireRBAC";
import { PERMISSION_KEY } from "types/Rbac/permission";

export default ChannelSelection;

const removeChannelPath = {
  wechat: DELETE_WECHAT_CHANNEL,
  facebook: DELETE_FACEBOOK_CHANNEL,
  whatsapp: DELETE_WHATSAPP_CHANNEL,
  whatsapp360dialog: DELETE_360DIALOG_CHANNEL,
  line: DELETE_LINE_CHANNEL,
  twilio_whatsapp: DELETE_TWILIO_WHATSAPP_CHANNEL,
  sms: DELETE_TWILIO_SMS_CHANNEL,
  facebookLeadAds: DELETE_FACEBOOK_ADS_CHANNEL,
  instagram: DELETE_INSTAGRAM_PROFILE,
  shopify: DELETE_SHOPIFY_CHANNEL,
  whatsappcloudapi: DELETE_CLOUDAPI_CHANNEL,
} as const;

export interface WhatsappFormInputType {
  name: string;
}

export interface WeChatFormInputType {
  wechatId: string;
  appId: string;
  appSecret: string;
  name: string;
}

export interface LineFormInputType {
  basicId: string;
  channelId: string;
  channelSecret: string;
}

export interface FacebookFormInputType {
  access_token: string;
  page_name: string;
}

export interface TwilioWhatsappFormInputType {
  name: string;
  accountSID: string;
  accountSecret: string;
  phoneNumber: string;
  messagingServiceSid: string;
}

export interface SmsFormInputType {
  name: string;
  accountSID: string;
  accountSecret: string;
  phoneNumber: string;
}

interface RequestWhatsappPrefill {
  companyId: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  companyName: string;
}
interface RenameRequestType {
  name: string;
  messagingServiceSid?: string;
}
export type FacebookResponseType = {
  data: FacebookPageType[];
  business_integration_system_user_access_token: string | null;
};
export function havingActiveBillRecord() {
  return (billRecord: BillRecordsType) =>
    moment().isBetween(billRecord.periodStart, billRecord.periodEnd) &&
    !/free$/i.test(billRecord.subscriptionPlan.id.toLowerCase());
}
function getVendorConfigId(channel: ChannelInfoConfiguredType<any>) {
  if (channel.name === "telegram") {
    return {
      ...channel,
      config: {
        ...channel.config,
        telegramBotId: channel.config.id,
      },
    };
  }
  return channel;
}
function ChannelSelection() {
  useRequireRBAC([PERMISSION_KEY.channelView]);
  const [facebookResult, setFacebookResult] = useState<FacebookResponseType>();
  const {
    company,
    facebookResponse,
    facebookAdsResponse,
    isPlanUpdated,
    currentPlan,
  } = useAppSelector(
    pick([
      "company",
      "facebookResponse",
      "facebookAdsResponse",
      "isPlanUpdated",
      "currentPlan",
    ]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const [isNotStandardBillRecord, setIsNotStandardBillRecord] = useState(false);
  const channelsReducer = useChannelsPageReducer();
  const [state, dispatch] = useReducer<
    React.Reducer<ChannelsState, ChannelsAction>
  >(channelsReducer, defaultChannelsState());
  const companyHash = JSON.stringify(company);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const { stripePublicKey, stripePlans } = useSettingsSubscriptionPlan();
  const shopifyStatus = useFetchShopifyStatus();
  useEffect(() => {
    if (company?.id && shopifyStatus.storeStatus === undefined) {
      shopifyStatus.refresh();
    }
  }, [company?.id, shopifyStatus.storeStatus?.map((c) => c.id).join()]);
  const shopifyPlan =
    stripePlans?.addOnPlans?.integrationFeatures[
      isYearlyPlan(currentPlan) ? "yearly" : "monthly"
    ][isProPlan(currentPlan) ? "pro" : "premium"].shopifyIntegration;
  const { getSelectedChannelList } = useChannelLocales();
  const location = useLocation<{
    shopifyConnectionSuccess: boolean;
    channelName?: string;
  }>();
  const featureGuard = useFeaturesGuard();
  const { refreshShopifyOwner, shopifyId } = useFetchShopifyOwner();
  const shopifyConfig = useAppSelector((s) => s.company?.shopifyConfigs ?? []);
  useEffect(() => {
    if (isPlanUpdated) {
      flash(t("flash.channels.subscription.updated"));
      loginDispatch({ type: "UPDATED_PLAN", isPlanUpdated: false });
    }
  }, [isPlanUpdated]);
  useEffect(() => {
    if (shopifyId === undefined) {
      refreshShopifyOwner();
    }
  }, [shopifyId]);
  useEffect(() => {
    if (location.state?.shopifyConnectionSuccess) {
      flash(t("flash.channels.subscription.shopify.success"));
    }
  }, [location.state?.shopifyConnectionSuccess]);
  useEffect(() => {
    dispatch({ type: "LIVECHAT_STATUS_LOAD" });
    if (company === undefined || shopifyStatus.storeStatus === undefined) {
      return;
    }
    if (company?.billRecords.length > 0) {
      const latesttBillRecord = company.billRecords
        .filter(ExcludedAddOn)
        .find(havingActiveBillRecord);
      setIsNotStandardBillRecord(
        !latesttBillRecord?.subscriptionPlan.id
          .toLowerCase()
          .endsWith("standard") || false
      );
    }
    fetchOnboardingProgress()
      .then((flags) => {
        dispatch({
          type: "LIVECHAT_STATUS_UPDATE",
          status: flags.isWebWidgetAdded,
        });
      })
      .catch((err) => {
        console.error(`Onboarding progress load fail: ${err}`);
      });
  }, [companyHash, shopifyStatus.storeStatus?.map((s) => s.id).join()]);

  useSubscriptionPlans(
    (list) => {
      if (!company) {
        return;
      }
      dispatch({
        type: "COMPANY_LOADED",
        plans: list,
        company: company,
      });
    },
    [companyHash]
  );
  const { channelsIntegrations, commerceIntegrations, leadAdsIntegrations } =
    useCompanyChannelIntegrations(shopifyStatus.storeStatus);
  useEffect(() => {
    if (facebookResponse) {
      dispatch({
        type: "CHANNEL_FORM_OPEN",
        channelName: facebookResponse.type as ChannelType,
      });
      const result: FacebookPageResponseType = JSON.parse(
        facebookResponse.response
      );
      loginDispatch({
        type: "UPDATE_FACEBOOK_RESPONSE",
        facebookResponse: undefined,
      });
      setFacebookResult({
        data: result.data,
        business_integration_system_user_access_token:
          result.business_integration_system_user_access_token,
      });
    }
  }, [facebookResponse]);

  useEffect(() => {
    if (location.state?.channelName == "twilio_whatsapp") {
      dispatch({
        type: "CHANNEL_FORM_OPEN",
        channelName: "twilio_whatsapp",
      });
    }
  }, [location.state?.channelName]);

  useEffect(() => {
    if (facebookAdsResponse) {
      dispatch({
        type: "CHANNEL_FORM_OPEN",
        channelName: "facebookLeadAds",
      });
      const result: FacebookPageResponseType = JSON.parse(facebookAdsResponse);
      loginDispatch({
        type: "UPDATE_FACEBOOK_ADS_RESPONSE",
        facebookResponse: "",
      });
      setFacebookResult({
        data: result.data,
        business_integration_system_user_access_token:
          result.business_integration_system_user_access_token,
      });
    }
  }, [facebookAdsResponse]);

  useEffect(() => {
    if (company === undefined) {
      return;
    }
    dispatch({
      type: "STRIPE_STATUS_UPDATE",
      status: company.isStripePaymentEnabled || false,
    });
  }, [companyHash, shopifyStatus.storeStatus?.map((s) => s.id).join()]);

  useEffect(() => {
    if (!featureGuard.canUseSalesforceCrm()) {
      return;
    }
    dispatch({ type: "SALESFORCE_STATUS_UPDATE" });
  }, [featureGuard.canUseSalesforceCrm()]);

  useEffect(() => {
    if (!featureGuard.canUseHubspotCrm()) {
      return;
    }
    dispatch({ type: "HUBSPOT_STATUS_UPDATE" });
  }, [featureGuard.canUseHubspotCrm()]);

  async function updateCompanyData() {
    const companyUpdated = await fetchCompany();
    loginDispatch({
      type: "ADD_COMPANY",
      company: companyUpdated,
    });
  }

  async function handleChannelConnected(channel: ChannelInfoType) {
    setTimeout(async () => {
      await updateCompanyData();
      dispatch({
        type: "CHANNEL_ACTIVATED",
        channel,
      });
    }, 1500);
  }

  async function removeSelectedChannel(
    channel: ChannelInfoConfiguredType<any>
  ) {
    const configId = getConfigId(getVendorConfigId(channel));
    const deleteEndpoint = removeChannelPath[channel.name] ?? "";

    try {
      if (channel.name === "shopify") {
        if (
          featureGuard.isShopifyAccount() &&
          shopifyId &&
          shopifyId === Number(configId)
        ) {
          try {
            const result = await fetchShopifySubscriptionStatus();
            if (result.subscriptionStatus) {
              await deleteShopifySubscription();
            }
            const remainingStores = shopifyConfig.filter(
              (s) => s.id !== Number(configId)
            );
            const [firstStore] = remainingStores;
            if (firstStore) {
              await createShopifyOwner(`${firstStore.id}`);
              await deleteMethod(deleteEndpoint.replace("${id}", configId), {
                param: {},
              });
              if (!isFreeOrFreemiumPlan(currentPlan)) {
                const result = await postSubscribeShopifyPlan(currentPlan.id);
                window.location.href = result.url;
              }
            } else {
              await deleteMethod(deleteEndpoint.replace("${id}", configId), {
                param: {},
              });
            }
          } catch (e) {
            const error = parseHttpError(e);
            flash(error);
          }
        } else {
          await deleteMethod(deleteEndpoint.replace("${id}", configId), {
            param: {},
          });
        }
        return;
      } else if (channel.name === "viber") {
        await submitDeleteViberChannel(Number(configId));
      } else if (channel.name === "telegram") {
        await submitDeleteTelegramChannel(Number(configId));
      } else if (deleteEndpoint && configId) {
        let apiPath = "";
        let param: object = {};
        if (channel.name === "twilio_whatsapp") {
          apiPath = `${deleteEndpoint}?sid=${configId}`;
        } else if (channel.name === "whatsappcloudapi") {
          apiPath = deleteEndpoint;
          param = {
            wabaId: channel.config.messagingHubWabaId,
            wabaPhoneNumberId: channel.config.messagingHubWabaPhoneNumberId,
          };
        } else {
          apiPath = deleteEndpoint.replace("${id}", configId);
        }
        await deleteMethod(apiPath, { param });
        await updateCompanyData();
      }
      dispatch({ type: "REMOVE_COMPLETE" });
    } catch (e) {
      //todo flash?
      console.error(e);
    }
  }

  async function removeExecute(channel: ChannelInfoConfiguredType<any>) {
    dispatch({ type: "EXECUTE_START" });
    await removeSelectedChannel(channel);
    await updateCompanyData();
    flash(
      t("flash.channels.channel.removed", {
        name: htmlEscape(state.channelClicked!.title),
      })
    );
    dispatch({ type: "REMOVE_COMPLETE" });
  }

  async function renameExecute(
    channel: ChannelInfoConfiguredType<any>,
    name: string,
    senderName?: string,
    messagingServiceSid?: string
  ) {
    dispatch({ type: "EXECUTE_START" });
    await renameSelectedChannel(channel, name, senderName, messagingServiceSid);
    await updateCompanyData();
    flash(
      t("flash.channels.channel.renamed", {
        name: htmlEscape(state.channelClicked!.title),
      })
    );
    dispatch({ type: "RENAME_COMPLETE" });
  }

  async function renameSelectedChannel(
    channel: ChannelInfoConfiguredType<any>,
    name: string,
    senderName?: string,
    messagingServiceSid?: string
  ) {
    let renamePath = "";
    const channelId = getConfigId(getVendorConfigId(channel));
    if (channelId && name) {
      let param: RenameRequestType = {
        name,
      };
      switch (channel.name) {
        case "whatsapp360dialog":
          return await putMethodWithExceptions(
            PUT_360DIALOG_RENAME.replace("{id}", channelId),
            { param: { channelName: name } }
          );
        case "whatsapp":
          renamePath = POST_WHATSAPP_RENAME.replace("{instanceId}", channelId);
          break;
        case "twilio_whatsapp":
          console.debug("messagingServiceSid", messagingServiceSid);
          renamePath = POST_TWILIO_WHATSAPP_RENAME.concat(`?sid=${channelId}`);
          if (messagingServiceSid) {
            param = {
              ...param,
              messagingServiceSid,
            };
          }
          break;
        case "sms":
          renamePath = POST_TWILIO_SMS_RENAME.replace(
            "{instanceId}",
            channelId
          );
          break;
        case "whatsappcloudapi":
          return await putMethodWithExceptions(
            "/company/whatsapp/cloudapi/channel",
            {
              param: {
                channelName: name,
                wabaId: channel.config.messagingHubWabaId,
                wabaPhoneNumberId: channel.config.messagingHubWabaPhoneNumberId,
              },
            }
          );
        case "viber":
          return await submitRenameViberChannel(
            Number(channelId),
            name,
            senderName ?? ""
          );
        case "telegram":
          return await submitRenameTelegramChannel(Number(channelId), name);
        default:
          renamePath = POST_CHANNEL_RENAME.replace(
            "{channel}",
            channel.name
          ).replace("{instanceId}", channelId);
          break;
      }
      return await postWithExceptions(renamePath, {
        param,
      });
    }
  }

  const pageName = t("nav.menu.channels");
  return (
    <ChannelsContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      <div className="channel-selection post-login">
        <PostLogin selectedItem={"Channels"} />
        <Helmet title={t("nav.common.title", { page: pageName })} />
        <div className="main channel-selection__main">
          <div className="main-primary-column channel-selection__body">
            <ChannelSelectionGrid
              facebookResponseData={facebookResult}
              onConnect={handleChannelConnected}
              stripePublicKey={stripePublicKey}
              addOnPlans={stripePlans?.addOnPlans}
              loading={state.pending}
              type="channel"
              channels={getSelectedChannelList("channel")}
              channelsActive={channelsIntegrations}
            />
            <ChannelSelectionGrid
              facebookResponseData={facebookResult}
              onConnect={handleChannelConnected}
              stripePublicKey={stripePublicKey}
              addOnPlans={stripePlans?.addOnPlans}
              loading={state.pending}
              type="commerce"
              channels={getSelectedChannelList("commerce")}
              shopifyPlanId={shopifyPlan?.id}
              channelsActive={commerceIntegrations}
            />
            <ChannelSelectionGrid
              facebookResponseData={facebookResult}
              onConnect={handleChannelConnected}
              stripePublicKey={stripePublicKey}
              addOnPlans={stripePlans?.addOnPlans}
              loading={state.pending}
              channels={getSelectedChannelList("integration")}
              type="integration"
              channelsActive={leadAdsIntegrations}
            />
          </div>
        </div>
        {state.channelClicked && (
          <RenameChannelModal
            channel={state.channelClicked}
            open={state.showRenameConfirmModal}
            onClose={() => dispatch({ type: "EXECUTE_CANCEL" })}
            onConfirm={renameExecute}
            loading={state.channelsPending}
          />
        )}
        <ReviewPlanModal />
        <NewVersionModal />
        {state.channelClicked && (
          <RemoveChannelModal
            channel={state.channelClicked}
            showModal={state.showRemoveConfirmModal}
            onClose={() => dispatch({ type: "EXECUTE_CANCEL" })}
            loading={state.confirmModalPending}
            onExecute={removeExecute}
            onCancel={() => dispatch({ type: "EXECUTE_CANCEL" })}
          />
        )}
      </div>
    </ChannelsContext.Provider>
  );
}

export function ChannelsDummy() {
  return (
    <div className={"channel-list"}>
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <ChannelDummy key={i} />
        ))}
    </div>
  );
}

export function getPrefillRequestWhatsappForm(
  prefillInfo: RequestWhatsappPrefill
) {
  const { companyId, lastName, firstName, phoneNumber, email, companyName } =
    prefillInfo;
  const searchParams = new URLSearchParams({
    companyName,
    refId: companyId,
    email,
    firstName,
    lastName: lastName ?? "",
    phone: phoneNumber,
  }).toString();
  // todo is that used?
  return `/request-whatsapp?${searchParams}`;
}
