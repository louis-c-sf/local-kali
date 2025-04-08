import React, { useState } from "react";
import { ChannelContextMenu } from "../ChannelAvailable";
import styles from "../ChannelActive.module.css";
import { useChannelContextActions } from "../useChannelContextActions";
import { useTranslation } from "react-i18next";
import SyncWhatsappHistoryModal from "../Whatsapp/SyncWhatsappHistoryModal";
import { getConfigId } from "../selectors";
import SyncFacebookHistoryModal from "../Whatsapp/SyncFacebookHistoryModal";
import { useHistory } from "react-router";
import { ChannelInfoConfiguredType } from "../../../types/ChannelInfoType";
import { ChannelsAction } from "../channelsReducer";
import { ViberQrCodeActivated } from "container/Onboarding/viber/ViberQrCodeActivated";
import { TelegramQrCodeActivated } from "container/Onboarding/telegram/TelegramQrCodeActivated";
import { Button } from "component/shared/Button/Button";
import { onClickRedirectToStripe } from "component/Settings/SettingPlanSubscription/SettingPlanUtils";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { isExpired } from "api/Channel/useFetchShopifyStatus";
import postSubscribeShopifyPlan from "api/Shopify/postSubscribeShopifyPlan";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";

export function ChannelActions(props: {
  channel: ChannelInfoConfiguredType<any>;
  dispatch: (action: ChannelsAction) => void;
  status: string;
  shopifyPlanId?: string;
  stripePublicKey?: string;
}) {
  const { channel, dispatch, status, shopifyPlanId, stripePublicKey } = props;
  const { t } = useTranslation();
  const featureGuard = useFeaturesGuard();
  const [openSyncHistoryModal, setOpenSyncHistoryModal] = useState(false);
  const [openViberQrCodeModal, setOpenViberQrCodeModal] = useState(false);
  const [openTelegramQrCodeModal, setOpenTelegramQrCodeModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const history = useHistory();
  const flash = useFlashMessageChannel();
  function onSync() {
    setOpenSyncHistoryModal(true);
  }

  function onViewQrCode(channel: string) {
    channel === "viber"
      ? setOpenViberQrCodeModal(true)
      : setOpenTelegramQrCodeModal(true);
  }

  const isLivechatChannel = channel.name === "web";
  const isFacebookChannel = channel.name === "facebook";
  const isWhatsappChannel = channel.name === "whatsapp";
  const isWhatsappCatalogChannel = channel.name === "whatsappCatalog";
  const isStripeChannel = channel.name === "stripe";
  const isSalesforceChannel = channel.name === "salesforce";
  const isHubspotChannel = channel.name === "hubspot";
  const isViberChannel = channel.name === "viber";
  const isTelegramChannel = channel.name === "telegram";
  const isShopifyChannel = channel.name === "shopify";
  const isShopifyExpired =
    isShopifyChannel && isExpired(channel.config.billRecord?.periodEnd);

  const actions = useChannelContextActions({
    channel,
    status: isShopifyExpired ? "disconnected" : "",
    onSync,
    onViewQrCode,
    dispatch,
  });
  async function payShopifyAddOn() {
    if (!shopifyPlanId || !stripePublicKey) {
      return;
    }
    if (featureGuard.isShopifyAccount()) {
      try {
        const result = await postSubscribeShopifyPlan(shopifyPlanId);
        return (window.location.href = result.url);
      } catch (e) {
        flash(`unable to connect shopify ${e}`);
      }
    } else {
      onClickRedirectToStripe({
        setLoading: setPaymentLoading,
        t,
        flash,
        planId: shopifyPlanId,
        stripePublicKey,
        shopifyConfigId: String(channel.config.id),
        quantity: 1,
      });
    }
  }
  return (
    <>
      {isWhatsappChannel && (
        <SyncWhatsappHistoryModal
          instanceId={getConfigId(channel)}
          open={openSyncHistoryModal}
          onDismiss={() => setOpenSyncHistoryModal(false)}
        />
      )}
      {isWhatsappCatalogChannel && (
        <div
          className={`${styles.addChannel} ui button`}
          onClick={() => history.push("/onboarding/whatsappCatalog/setting")}
        >
          {t("onboarding.whatsappCatalog.setting.action.settings")}
        </div>
      )}
      {isFacebookChannel && (
        <SyncFacebookHistoryModal
          pageId={getConfigId(channel)}
          open={openSyncHistoryModal}
          onDismiss={() => setOpenSyncHistoryModal(false)}
        />
      )}
      {isStripeChannel && (
        <div
          className={`${styles.addChannel} ui button`}
          onClick={() => history.push("/settings/paymentlink")}
        >
          {t("onboarding.livechat.setting")}
        </div>
      )}
      {isSalesforceChannel && (
        <div
          className={`${styles.addChannel} ui button`}
          onClick={() => history.push("/settings/salesforce")}
        >
          {t("onboarding.livechat.setting")}
        </div>
      )}
      {isHubspotChannel && (
        <div
          className={`${styles.addChannel} ui button`}
          onClick={() => history.push("/settings/hubspot")}
        >
          {t("onboarding.livechat.setting")}
        </div>
      )}
      {isLivechatChannel && (
        <div
          className={`${styles.addChannel} ui button`}
          onClick={() => history.push("/settings/livechatwidget")}
        >
          {t("onboarding.livechat.setting")}
        </div>
      )}
      {!featureGuard.isShopifyAccount() &&
        isShopifyChannel &&
        isShopifyExpired && (
          <Button
            primary
            loading={paymentLoading}
            onClick={paymentLoading ? undefined : payShopifyAddOn}
          >
            {t("channels.action.renew")}
          </Button>
        )}
      {isViberChannel && openViberQrCodeModal && (
        <ViberQrCodeActivated
          channel={channel.config}
          onRest={() => setOpenViberQrCodeModal(false)}
        />
      )}
      {isTelegramChannel && openTelegramQrCodeModal && (
        <TelegramQrCodeActivated
          channel={channel.config}
          onRest={() => setOpenTelegramQrCodeModal(false)}
        />
      )}
      {actions.length > 0 &&
        !isLivechatChannel &&
        !isStripeChannel &&
        !isSalesforceChannel &&
        !isHubspotChannel &&
        !isWhatsappCatalogChannel && <ChannelContextMenu actions={actions} />}
    </>
  );
}
