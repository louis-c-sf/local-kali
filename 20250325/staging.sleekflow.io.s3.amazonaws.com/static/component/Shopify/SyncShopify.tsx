import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router";
import StatusAlert from "../shared/StatusAlert";
import ShopifySuccessImg from "../Channel/Onboarding/assets/shopify/shopify-success.svg";
import { GET_SHOPIFY_USAGE, POST_SYNC_SHOPIFY_INFO } from "../../api/apiPath";
import { get, postWithExceptions } from "../../api/apiRequest";
import { Button, Checkbox } from "semantic-ui-react";
import styles from "./SyncShopify.module.css";
import useRouteConfig from "config/useRouteConfig";

interface ShopifyUsageInfoType {
  orderCount: number;
  customerCount: number;
}

interface SyncShopifyProps {
  shopifyUsageInfo?: ShopifyUsageInfoType;
  connectedShopifyId?: string;
}

export default function SyncShopify(props: SyncShopifyProps) {
  const history = useHistory();
  const { t } = useTranslation();
  const [loadingData, setLoadingData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncAllStatus, setSyncAllStatus] = useState(true);
  const [syncOnlyIfPhoneNumberExist, setSyncOnlyIfPhoneNumberExist] =
    useState(true);
  const [syncOrderTags, setSyncOrderTags] = useState(true);
  const [syncProductTags, setSyncProductTags] = useState(true);
  const [syncCustomerTags, setSyncCustomerTags] = useState(true);
  const { routeTo } = useRouteConfig();
  const [shopifyUsageInfo, setShopifyUsageInfo] =
    useState<ShopifyUsageInfoType>({
      orderCount: 0,
      customerCount: 0,
    });
  const params = useParams<{ shopifyId: string }>();
  const shopifyId = props.connectedShopifyId
    ? props.connectedShopifyId
    : params.shopifyId;

  useEffect(() => {
    if (!shopifyId) {
      return;
    }
    if (!props.shopifyUsageInfo && shopifyId) {
      setLoadingData(true);
      get(GET_SHOPIFY_USAGE.replace("{shopifyId}", shopifyId), {
        param: {},
      })
        .then((res) => {
          if (res) {
            setShopifyUsageInfo(res);
          }
        })
        .catch((error) => {
          console.error(`error ${error}`);
        })
        .finally(() => {
          setLoadingData(false);
        });
    } else {
      if (props.shopifyUsageInfo) {
        setShopifyUsageInfo(props.shopifyUsageInfo);
      }
    }
  }, [props.shopifyUsageInfo, shopifyId]);
  const handleSyncShopifyData = async () => {
    if (!shopifyId) {
      return;
    }
    setIsLoading(true);
    try {
      await postWithExceptions(
        POST_SYNC_SHOPIFY_INFO.replace("{shopifyId}", shopifyId),
        {
          param: {
            syncAllStatus,
            syncOnlyIfPhoneNumberExist,
            syncOrderTags,
            syncProductTags,
            syncCustomerTags,
          },
        }
      );
      history.push("/onboarding/sync-shopify");
    } catch (e) {
      console.error(`Shopify sync data error ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  function backToChannels() {
    history.push(routeTo("/settings/commerce"));
  }

  const isCountGreaterThan0 =
    shopifyUsageInfo.customerCount > 0 || shopifyUsageInfo.orderCount > 0;
  if (loadingData) {
    return null;
  }
  return (
    <div className="sync-shopify-container">
      <div className={`${styles.container} sub-container`}>
        <div className="header-with-img row">
          <div>
            <img
              src={ShopifySuccessImg}
              style={{ width: 90, height: "auto" }}
              alt=""
            />
          </div>
          {!params.shopifyId && (
            <div className="header-text">
              <div className="h3 success-text">
                {t("onboarding.shopify.complete")}
              </div>
              <div>{t("onboarding.shopify.completeText")}</div>
            </div>
          )}
        </div>
        <div className="row">
          <b>{t("onboarding.shopify.syncOrNot")}</b>
          <div>{t("onboarding.shopify.youWillSee")}</div>
        </div>
        {isCountGreaterThan0 ? (
          <div className="row">
            {t("onboarding.shopify.infoFromShopify")}
            <div className="shopify-info-row">
              <div className="shopify-info-field">
                <b>{t("onboarding.shopify.contacts")}</b>
              </div>
              <div>{shopifyUsageInfo.customerCount}</div>
            </div>
            <div className="shopify-info-row">
              <div className="shopify-info-field">
                <b>{t("onboarding.shopify.orders")}</b>
              </div>
              <div>{shopifyUsageInfo.orderCount}</div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
        <div className="row">
          {isCountGreaterThan0 ? (
            <StatusAlert type="info">
              <>
                <div>{t("onboarding.shopify.syncLimit")}</div>
                <Trans i18nKey="onboarding.shopify.checkLimit">
                  You can check
                  <a
                    className="link"
                    href="https://shopify.dev/api/usage/rate-limits#rate-limiting-methods"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    here
                  </a>
                </Trans>
              </>
            </StatusAlert>
          ) : (
            <StatusAlert type="warning">
              <div>{t("onboarding.shopify.noSynData")}</div>
            </StatusAlert>
          )}
        </div>

        {isCountGreaterThan0 ? (
          <>
            <div className="row">
              <div>
                <Trans i18nKey="onboarding.shopify.syncNote">
                  1 <b>Note:</b> Only customers with email or phone number will
                  be sync to SleekFlow
                </Trans>
              </div>
            </div>
            <div className="row">
              <div className="checkbox-row">
                <Checkbox
                  className="isContinue-field"
                  label={t("onboarding.shopify.syncAllStatus")}
                  checked={syncAllStatus}
                  onChange={() => setSyncAllStatus(!syncAllStatus)}
                />
              </div>
              <div className="checkbox-row">
                <Checkbox
                  className="isContinue-field"
                  label={t("onboarding.shopify.syncOnlyIfPhoneNumberExist")}
                  checked={syncOnlyIfPhoneNumberExist}
                  onChange={() =>
                    setSyncOnlyIfPhoneNumberExist(!syncOnlyIfPhoneNumberExist)
                  }
                />
              </div>
              <div className="checkbox-row">
                <Checkbox
                  className="isContinue-field"
                  label={t("onboarding.shopify.syncOrderTags")}
                  checked={syncOrderTags}
                  onChange={() => setSyncOrderTags(!syncOrderTags)}
                />
              </div>
              <div className="checkbox-row">
                <Checkbox
                  className="isContinue-field"
                  label={t("onboarding.shopify.syncProductTags")}
                  checked={syncProductTags}
                  onChange={() => setSyncProductTags(!syncProductTags)}
                />
              </div>
              <div className="checkbox-row">
                <Checkbox
                  className="isContinue-field"
                  label={t("onboarding.shopify.syncCustomerTags")}
                  checked={syncCustomerTags}
                  onChange={() => setSyncCustomerTags(!syncCustomerTags)}
                />
              </div>
            </div>
            <Button
              className="primary full-button"
              disabled={!shopifyId}
              loading={isLoading}
              onClick={handleSyncShopifyData}
            >
              {t("onboarding.shopify.syncNow")}
            </Button>
            <div className="do-later-button" onClick={backToChannels}>
              {t("onboarding.shopify.doLater")}
            </div>
          </>
        ) : (
          <div
            onClick={backToChannels}
            className="ui button primary full-button"
          >
            {t("nav.back", { to: t("nav.menu.channels") })}
          </div>
        )}
      </div>
    </div>
  );
}
