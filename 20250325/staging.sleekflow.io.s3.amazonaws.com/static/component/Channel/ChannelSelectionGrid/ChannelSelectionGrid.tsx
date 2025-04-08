import {
  StripeCheckoutCoreFeatures,
  StripeCheckoutIntegrationFeatures,
} from "api/User/useSettingsStipeCheckout";
import { Button } from "component/shared/Button/Button";
import useRouteConfig from "config/useRouteConfig";
import React from "react";
import { useTranslation } from "react-i18next";
import ChannelInfoType from "types/ChannelInfoType";
import FacebookPageType from "types/FacebookPageType";
import ChannelAvailable from "../ChannelAvailable";
import { ChannelsDummy, FacebookResponseType } from "../ChannelSelection";
import ChannelsSelectionActive from "../ChannelSelectionActive";
import { ChannelType } from "../localizable/useChannelLocales";
import { nameMatches } from "../selectors";
import styles from "./ChannelSelectionGrid.module.css";
import { Link } from "react-router-dom";
import { PermissionGuard } from "component/PermissionGuard";
import { PERMISSION_KEY } from "types/Rbac/permission";

function isChannelType(x: any): x is Array<ChannelInfoType> {
  return x.crm === undefined;
}
export default function <ChannelSelectionGrid>(props: {
  type: "channel" | "integration" | "commerce";
  loading: boolean;
  onConnect: (channel: ChannelInfoType) => void;
  facebookResponseData?: FacebookResponseType;
  hidden?: boolean;
  stripePublicKey?: string;
  addOnPlans?:
    | {
        coreFeatures: StripeCheckoutCoreFeatures;
        integrationFeatures: StripeCheckoutIntegrationFeatures;
      }
    | undefined;
  channels: ChannelType;
  channelsActive?: ChannelInfoType[];
  shopifyPlanId?: string;
}) {
  const {
    type,
    loading,
    stripePublicKey,
    facebookResponseData,
    onConnect,
    addOnPlans,
    channels,
    channelsActive = [],
    shopifyPlanId,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const channelsAvailable = isChannelType(channels)
    ? channels.filter((c) =>
        type === "commerce"
          ? ["shopify", "stripe", "whatsappCatalog"].includes(c.name)
          : c.canHaveMultipleInstances || !channelsActive.find(nameMatches(c))
      )
    : channels.customized.filter(
        (c) =>
          c.canHaveMultipleInstances || !channelsActive.find(nameMatches(c))
      );
  const titleMapping = {
    commerce: {
      title: t("channels.connection.commerce.title"),
      connectedHeader: t("channels.connection.commerce.connected.header"),
      addNewHeader: t("channels.connection.commerce.addNew.header"),
    },
    channel: {
      title: t("channels.connection.channel.title"),
      connectedHeader: t("channels.connection.channel.connected.header"),
      addNewHeader: t("channels.connection.channel.addNew.header"),
    },
    integration: {
      title: t("channels.connection.integrations.title"),
      connectedHeader: "",
      addNewHeader: "",
      crm: {
        title: t("channels.connection.integrations.crm.header"),
      },
      automated: {
        title: t("channels.connection.integrations.automated.header"),
        subTitle: t("channels.connection.integrations.automated.subHeader"),
      },
      customized: {
        title: t("channels.connection.integrations.customized.header"),
      },
    },
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{titleMapping[type].title}</span>
        {type === "commerce" && (
          <Button blue>
            <Link to={routeTo("/settings/commerce")}>
              {t("channels.button.manageCatalog")}
            </Link>
          </Button>
        )}
      </div>
      <div className={styles.list}>
        <div className={styles.channelSelection}>
          {isChannelType(channels) ? (
            <>
              <PermissionGuard keys={PERMISSION_KEY.channelConnect}>
                <h2 className={styles.title}>
                  {titleMapping[type].addNewHeader}
                </h2>
              </PermissionGuard>
              {loading ? (
                <ChannelsDummy />
              ) : (
                <>
                  <PermissionGuard keys={PERMISSION_KEY.channelConnect}>
                    <div className="channel-list">
                      {channelsAvailable.map(
                        (channel: ChannelInfoType, index: number) => {
                          return (
                            <ChannelAvailable
                              stripePublicKey={stripePublicKey}
                              facebookResponseData={facebookResponseData}
                              key={`channel_${index}`}
                              channelInfo={channel}
                              onConnect={onConnect}
                              addOnPlans={addOnPlans}
                            />
                          );
                        }
                      )}
                    </div>
                  </PermissionGuard>
                  <h2 className={styles.title}>
                    {titleMapping[type].connectedHeader}
                  </h2>
                  <ChannelsSelectionActive
                    requestChannels={channels}
                    channelInfo={channelsActive}
                    stripePublicKey={stripePublicKey}
                    shopifyPlanId={shopifyPlanId}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {Object.keys(channels).map((key, index) => (
                <IntegrationChannels
                  facebookResponseData={facebookResponseData}
                  key={`${key}_${index}`}
                  header={titleMapping[type][key].title}
                  subHeader={titleMapping[type][key].subTitle}
                  type={key}
                  channels={channels[key]}
                  onConnect={onConnect}
                  addOnPlans={addOnPlans}
                  stripePublicKey={stripePublicKey}
                  loading={loading}
                  channelsActive={channelsActive}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationChannels(props: {
  type: string;
  channels: ChannelInfoType[];
  header: string;
  onConnect: (channel: ChannelInfoType) => void;
  loading: boolean;
  stripePublicKey?: string;
  facebookResponseData?: FacebookResponseType;
  addOnPlans?:
    | {
        coreFeatures: StripeCheckoutCoreFeatures;
        integrationFeatures: StripeCheckoutIntegrationFeatures;
      }
    | undefined;
  subHeader?: string;
  channelsActive?: ChannelInfoType[];
}) {
  const {
    type,
    channels,
    onConnect,
    facebookResponseData,
    addOnPlans,
    stripePublicKey,
    loading,
    channelsActive,
  } = props;
  const { t } = useTranslation();
  return (
    <>
      <h2 className={styles.title}>{props.header}</h2>
      {props.subHeader && (
        <div className={styles.subTitle}>{props.subHeader}</div>
      )}
      {loading ? (
        <ChannelsDummy />
      ) : (
        <>
          <div className="channel-list">
            {channels.map((channel: ChannelInfoType, index: number) => {
              return (
                <ChannelAvailable
                  stripePublicKey={stripePublicKey}
                  facebookResponseData={facebookResponseData}
                  key={`channel${index}`}
                  channelInfo={channel}
                  onConnect={onConnect}
                  addOnPlans={addOnPlans}
                />
              );
            })}
          </div>
          {type === "customized" && channelsActive?.length ? (
            <>
              <h2 className={styles.title}>
                {t(
                  "channels.connection.integrations.customized.connected.header"
                )}
              </h2>
              <ChannelsSelectionActive
                requestChannels={channels}
                channelInfo={channelsActive}
                stripePublicKey={stripePublicKey}
                shopifyPlanId={undefined}
              />
            </>
          ) : null}
        </>
      )}
    </>
  );
}
