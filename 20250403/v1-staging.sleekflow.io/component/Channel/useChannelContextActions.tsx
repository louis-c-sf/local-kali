import { DropdownItemProps } from "semantic-ui-react";
import {
  ChannelInfoConfiguredType,
  HasChannelConfig,
} from "../../types/ChannelInfoType";
import moment from "moment";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { getConfigId, getWhatsappPhone } from "./selectors";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import React, { useEffect, useMemo } from "react";
import useRouteConfig from "../../config/useRouteConfig";
import { useHistory } from "react-router";
import { copyToClipboard } from "../../utility/copyToClipboard";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { ChannelsAction } from "./channelsReducer";
import fetchShopifyOwner from "api/Company/fetchShopifyOwner";
import { useAppSelector } from "AppRootContext";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

const CHANNELS_NOT_ALLOWED_TO_RENAME = [
  "facebookLeadAds",
  "instagram",
  "shopify",
];

export function useChannelContextActions(props: {
  channel: ChannelInfoConfiguredType<any>;
  status: string;
  onSync: () => any;
  onViewQrCode(channel: string): void;
  dispatch: (action: ChannelsAction) => void;
}) {
  const { channel, status, onSync, onViewQrCode, dispatch } = props;
  const featureGuard = useFeaturesGuard();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const flash = useFlashMessageChannel();
  const { check } = usePermission();
  const [canEditChannels, canDeleteChannels] = useMemo(
    () => check([PERMISSION_KEY.channelEdit, PERMISSION_KEY.channelDelete]),
    [check]
  );

  const isTwilio = channel.name === "twilio_whatsapp";
  function copyWaMeLink(phone: string) {
    return () => {
      copyToClipboard(`https://wa.me/${phone.replace(/\D+/g, "")}`);
      flash(t("flash.channels.channel.whatsapp.waLinkCopied"));
    };
  }
  function goToProfileLink({
    businessId,
    phoneNumber,
    wabaId,
  }: {
    businessId: string;
    phoneNumber: string;
    wabaId: string;
  }) {
    window.open(
      `https://business.facebook.com/wa/manage/phone-numbers/?business_id=${businessId}&phone_number=${phoneNumber}&waba_id=${wabaId}&childRoute=PHONE_PROFILE%2FPROFILE`,
      "_blank"
    );
  }

  let actions: DropdownItemProps[] = [];
  if (channel.name === "web") {
    actions.push({
      text: t("onboarding.livechat.setting"),
      onClick: () => {
        history.push(routeTo("/settings/livechatwidget"));
      },
    });
  } else {
    if (canEditChannels && channel.name === "whatsapp") {
      const channelConfig = (channel as HasChannelConfig<"whatsapp">).config;
      const isDisabledSync =
        !["Synced", "Authenticated"].includes(status) ||
        channelConfig?.lastSyncedAt
          ? moment
              .utc()
              .diff(moment.utc(channelConfig?.lastSyncedAt), "minutes") < 5
          : false;
      actions = [
        {
          disabled: isDisabledSync,
          onClick: isDisabledSync ? undefined : onSync,
          content: (
            <InfoTooltip
              offset={[0, 0]}
              trigger={
                <span className={"text"}>{t("channels.action.sync")}</span>
              }
              placement={"left"}
              children={t("channels.tooltip.action.sync")}
            />
          ),
        },
      ];
    }
    if (
      canEditChannels &&
      !CHANNELS_NOT_ALLOWED_TO_RENAME.includes(channel.name)
    ) {
      actions.push({
        onClick: () => {
          dispatch({
            type: "RENAME_CONFIRM",
            channel,
          });
        },
        content: (
          <InfoTooltip
            offset={[0, 0]}
            trigger={
              <span className={"text"}>
                {isTwilio
                  ? t("channels.action.edit")
                  : t("channels.action.rename")}
              </span>
            }
            placement={"left"}
            children={
              isTwilio
                ? t("channels.tooltip.action.updateTwilio")
                : t("channels.tooltip.action.rename")
            }
          />
        ),
      });
    }
    if (
      canEditChannels &&
      ["whatsapp", "twilio_whatsapp", "whatsappcloudapi"].includes(channel.name)
    ) {
      const phone = getWhatsappPhone(channel);
      if (phone) {
        actions.push({
          onClick: copyWaMeLink(phone),
          content: (
            <InfoTooltip
              offset={[0, 0]}
              trigger={
                <span className={"text"}>
                  {t("channels.action.copyWaLink")}
                </span>
              }
              placement={"left"}
              children={
                <Trans i18nKey={"channels.tooltip.action.copyWaLink"}>
                  Your wa.me link allows any user to start a conversation
                  directly with you.
                  <br />
                  Copy and use it on your website or a call-to-action button
                </Trans>
              }
            />
          ),
        });
      }
    }
    if (channel.name === "whatsappcloudapi") {
      const whatsappPhone = getWhatsappPhone(channel);
      const whatsappCloudConfig = (
        channel as ChannelInfoConfiguredType<"whatsappcloudapi">
      ).config;
      if (whatsappPhone && whatsappCloudConfig) {
        const items = [
          ...(canEditChannels
            ? [
                {
                  onClick: () =>
                    goToProfileLink({
                      businessId: whatsappCloudConfig.facebookWabaBusinessId,
                      phoneNumber: whatsappCloudConfig.whatsappPhoneNumber,
                      wabaId: whatsappCloudConfig.facebookWabaId,
                    }),
                  content: (
                    <span className="text">
                      {t("channels.action.updateWhatsAppProfile")}
                    </span>
                  ),
                },
              ]
            : []),
          {
            content: (
              <InfoTooltip
                offset={[0, 0]}
                trigger={
                  <Link
                    to={`/channels/official/whatsapp/cloudapi/${whatsappPhone}/check-access`}
                    className={"text"}
                  >
                    {t("channels.action.checkAccessDetail")}
                  </Link>
                }
                placement={"left"}
                children={
                  <Trans i18nKey={"channels.tooltip.action.copyWaLink"}>
                    Your wa.me link allows any user to start a conversation
                    directly with you.
                    <br />
                    Copy and use it on your website or a call-to-action button
                  </Trans>
                }
              />
            ),
          },
        ];
        actions.push(...items);
      }
    }
    if (channel.name === "whatsapp360dialog") {
      const whatsappPhone = getWhatsappPhone(channel);
      const dialogChannelId = (
        channel as ChannelInfoConfiguredType<"whatsapp360dialog">
      ).config?.channelId;
      if (whatsappPhone && dialogChannelId) {
        actions.push({
          content: (
            <InfoTooltip
              offset={[0, 0]}
              trigger={
                <Link
                  to={`/channels/official/whatsapp/360dialog/check-access?channelId=${dialogChannelId}`}
                  className={"text"}
                >
                  {t("channels.action.checkAccessDetail")}
                </Link>
              }
              placement={"left"}
              children={
                <Trans i18nKey={"channels.tooltip.action.copyWaLink"}>
                  Your wa.me link allows any user to start a conversation
                  directly with you.
                  <br />
                  Copy and use it on your website or a call-to-action button
                </Trans>
              }
            />
          ),
        });
      }
    }

    if (channel.name === "shopify") {
      const channelConfig = (channel as HasChannelConfig<"shopify">).config;
      if (status !== "disconnected" || featureGuard.isShopifyAccount()) {
        actions.push({
          onClick: () => history.push(`/sync-shopify/${channelConfig?.id}`),
          text: t("channels.action.syncShopifyData"),
        });
      }
    }
    if (canEditChannels && channel.name === "facebook") {
      actions.push({
        onClick: onSync,
        content: (
          <InfoTooltip
            offset={[0, 0]}
            trigger={
              <span className={"text"}>{t("channels.action.sync")}</span>
            }
            placement={"left"}
            children={t("channels.tooltip.action.facebookSync")}
          />
        ),
      });
    }
    if (canDeleteChannels && channel.name !== "whatsapp360dialog") {
      actions.push({
        text: t("channels.action.remove"),
        onClick: () => {
          dispatch({
            type: "REMOVE_CONFIRM",
            channel,
          });
        },
      });
    }
    if (
      canEditChannels &&
      (channel.name === "viber" || channel.name === "telegram")
    ) {
      actions.push({
        onClick: () => onViewQrCode(channel.name),
        text: t("channels.action.viewQrCode"),
      });
    }
  }

  return actions;
}
