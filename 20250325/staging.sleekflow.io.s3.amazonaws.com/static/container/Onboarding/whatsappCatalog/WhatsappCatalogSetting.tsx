import React, { useEffect, useState } from "react";
import styles from "./components/WhatsappCatalogSetting.module.css";
import StepHeader from "./components/StepHeader";
import CatalogAccordion from "./components/CatalogAccordion";
import WhatsappPhoneNumberTable from "./components/WhatsappPhoneNumberTable";
import { PostLogin } from "component/Header";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { BackLink } from "component/shared/nav/BackLink";
import { fetchWhatsappCatalogSettings } from "api/CloudAPI/fetchWhatsappCatalogSettings";
import PhoneNumberSwitch from "./components/PhoneNumberSwitch";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { Dimmer, Image, Loader } from "semantic-ui-react";
import { useHistory } from "react-router";
import { Button } from "component/shared/Button/Button";
import InfoIcon from "../../../assets/images/info.svg";
import { InfoTooltip } from "../../../component/shared/popup/InfoTooltip";
import { postSetProductCatalogPhoneNumber } from "api/CloudAPI/postSetProductCatalogPhoneNumber";
import { getErrorMessage } from "./ConnectWhatsappNumber";
import StatusAlert from "component/shared/StatusAlert";
import { fetchChannelList } from "api/Channel/fetchChannelList";
import {
  normalizeWhatsappCatalogSetting,
  WabaInfoType,
} from "./components/helper/normalizeWhatsappCatalogSetting";
import { postAutoStripePaymentLink } from "api/CloudAPI/postAutoStripePaymentLink";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";

export default function WhatsappCatalogSetting() {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [catalogs, setCatalogs] = useState<Record<string, WabaInfoType[]>>({});
  const [activeItem, setActiveItem] = useState("");
  const [switchLoading, setSwitchLoading] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);

  const regions = useSupportedRegions();
  const stripeCurrency =
    regions.currenciesSupported[0]?.currencyCode.toUpperCase();

  const changeActiveItem = (item: string) => {
    setActiveItem(item);
  };

  const handleBack = () => {
    history.push("/channels");
  };

  const getCatalogInfo = async () => {
    try {
      const result = await fetchWhatsappCatalogSettings(false);
      const catalogs = await normalizeWhatsappCatalogSetting(result);
      if (catalogs) {
        setCatalogs(catalogs);
        setActiveItem(Object.keys(catalogs)[0]);
      }
    } catch (error) {
      console.log(`error`, error);
    }
  };

  const checkAvailableChannels = async () => {
    try {
      const result = await fetchChannelList();

      if (result.whatsappCloudApiConfigs) {
        const wabaList = {};
        result.whatsappCloudApiConfigs.forEach((config) => {
          const isConnected =
            (config.facebookProductCatalogId &&
              config.productCatalogSetting?.hasEnabledProductCatalog) ??
            false;
          wabaList[config.messagingHubWabaId] = isConnected;
        });
        const isDisabled = Object.values(wabaList).some((value) => !value);
        setIsDisableButton(isDisabled);
      }
    } catch (e) {
      console.error("checkAvailableChannels e: ", e);
    }
  };

  const getDefaultInfo = async () => {
    setLoading(true);
    await Promise.all([getCatalogInfo(), checkAvailableChannels()]);
    setLoading(false);
  };

  const switchChange =
    (props: {
      wabaPhoneNumberId: string;
      wabaId: string;
      switchCatalogVisible?: boolean;
      switchStripeEnabled?: boolean;
    }) =>
    async (checked: boolean) => {
      if (!catalogs) return;
      const {
        wabaId,
        wabaPhoneNumberId,
        switchCatalogVisible,
        switchStripeEnabled,
      } = props;
      try {
        setSwitchLoading(true);
        let notification = "";
        if (switchCatalogVisible) {
          const param = {
            wabaId,
            wabaPhoneNumberId,
            isCatalogVisible: checked,
            isCartEnabled: checked,
          };
          await postSetProductCatalogPhoneNumber(param);
          notification = checked
            ? t(
                "onboarding.whatsappCatalog.setting.flash.catalogVisible.enable"
              )
            : t(
                "onboarding.whatsappCatalog.setting.flash.catalogVisible.disable"
              );
        } else if (switchStripeEnabled) {
          const param = {
            wabaId,
            wabaPhoneNumberId,
            isActive: checked,
          };
          await postAutoStripePaymentLink(param);
          notification = checked
            ? t("onboarding.whatsappCatalog.setting.flash.cartEnabled.enable")
            : t("onboarding.whatsappCatalog.setting.flash.cartEnabled.disable");
        }
        flash(notification);
      } catch (error) {
        console.error(error);
        flash(getErrorMessage(t, error?.response?.data.message));
        throw error;
      } finally {
        setSwitchLoading(false);
      }
    };

  const getHeaderText = () => [
    t("onboarding.whatsappCatalog.setting.table.displayName"),
    t("onboarding.whatsappCatalog.setting.table.phoneNumber"),
    t("onboarding.whatsappCatalog.setting.table.enableCatalog"),
    <div className={styles.enableStripeWrapper}>
      {t("onboarding.whatsappCatalog.setting.table.enableStripe")}
      <InfoTooltip
        placement={"top"}
        trigger={
          <div className={"text-full"}>
            <Image src={InfoIcon} className={styles.icon} />
          </div>
        }
      >
        <Trans
          i18nKey="onboarding.whatsappCatalog.setting.table.enableStripeTooltip"
          values={{
            currency: stripeCurrency,
          }}
        >
          Your connected Stripe account: {stripeCurrency} account
          <br />
          Please make sure the currency you are using in the product catalogs
          matches with the currency in the Stripe account you connected.
          Otherwise, payment links cannot be generated.
        </Trans>
      </InfoTooltip>
    </div>,
  ];
  const getPhoneNumberRow = (item: WabaInfoType) => {
    if (!catalogs) return [];
    return [
      [
        item.whatsappDisplayName,
        item.whatsappPhoneNumber,
        <PhoneNumberSwitch
          onSwitchChange={switchChange({
            wabaPhoneNumberId: item.wabaPhoneNumberId,
            wabaId: item.wabaId,
            switchCatalogVisible: true,
          })}
          defaultChecked={item.hasEnabledProductCatalog}
          loading={switchLoading}
        />,
        <PhoneNumberSwitch
          onSwitchChange={switchChange({
            wabaPhoneNumberId: item.wabaPhoneNumberId,
            wabaId: item.wabaId,
            switchStripeEnabled: true,
          })}
          defaultChecked={item.hasEnabledAutoSendStripePaymentUrl}
          loading={switchLoading}
        />,
      ],
    ];
  };
  const connectedNumber = Object.keys(catalogs)?.length;
  const handleCreateNew = () => {
    history.push("/onboarding/whatsappCatalog");
  };

  const handleConnect = () => {
    history.push("/onboarding/stripe");
  };

  useEffect(() => {
    getDefaultInfo();
  }, []);

  return (
    <div className="post-login">
      <PostLogin selectedItem="" />
      <Helmet title={t("onboarding.stripe.pageTitle")} />
      <div className={styles.container}>
        <BackLink onClick={handleBack} className={styles.backButton}>
          {t("onboarding.ig.back")}
        </BackLink>
        <div
          className={`container ${styles.content} ${styles.connectWhatsappNumber}`}
        >
          <StepHeader title={t("onboarding.whatsappCatalog.setting.title")} />
          <Dimmer.Dimmable>
            <Dimmer inverted active={loading}>
              <Loader active />
            </Dimmer>
            <div className={styles.description}>
              <div className="connected">
                <Trans
                  i18nKey="onboarding.whatsappCatalog.setting.table.connectedNumber"
                  values={{
                    number: connectedNumber,
                  }}
                >
                  Connected catalogs ({connectedNumber})
                </Trans>
              </div>
              {
                <Button
                  primary
                  onClick={handleCreateNew}
                  disabled={isDisableButton}
                >
                  {t("onboarding.whatsappCatalog.setting.action.new")}
                </Button>
              }
            </div>
            {Object.keys(catalogs).length > 0 && (
              <div className={styles.catalogsWrapper}>
                {Object.entries(catalogs).map(([key, items]) => (
                  <CatalogAccordion
                    key={key}
                    activeItem={activeItem}
                    changeActiveItem={changeActiveItem}
                    catalogName={`${items[0].productCatalogName} (${key})`}
                    businessAccountName={items[0].facebookWabaName}
                    id={key}
                    catalogTitleLabel={t(
                      "onboarding.whatsappCatalog.setting.table.catalogTitleLabel"
                    )}
                  >
                    {items.map((item) => (
                      <WhatsappPhoneNumberTable
                        key={item.wabaPhoneNumberId}
                        headerTexts={getHeaderText()}
                        bodyRows={getPhoneNumberRow(item)}
                      />
                    ))}
                  </CatalogAccordion>
                ))}
              </div>
            )}
            <StatusAlert
              type="info"
              headerText={t(
                "onboarding.whatsappCatalog.stripeUnconnected.title"
              )}
              className={styles.statusAlert}
            >
              <div className={styles.statusAlertChildContainer}>
                <div className={styles.statusAlertContent}>
                  {t("onboarding.whatsappCatalog.stripeUnconnected.content")}
                </div>
                <Button primary onClick={handleConnect}>
                  {t(
                    "onboarding.whatsappCatalog.stripeUnconnected.action.connect"
                  )}
                </Button>
              </div>
            </StatusAlert>
          </Dimmer.Dimmable>
        </div>
      </div>
    </div>
  );
}
