import React, { useEffect, useState } from "react";
import styles from "./WhatsappCatalogOnboarding.module.css";
import { Button } from "component/shared/Button/Button";
import { useWhatsappCatalogOnboarding } from "./WhatsappCatalogOnboarding";
import StepHeader from "./components/StepHeader";
import { fetchProductCatalog } from "api/CloudAPI/fetchProductCatalog";
import { postConnectWabaProductCatalog } from "api/CloudAPI/postConnectWabaProductCatalog";
import CatalogAccordion from "./components/CatalogAccordion";
import WhatsappPhoneNumberTable from "./components/WhatsappPhoneNumberTable";
import { Loader, Dimmer } from "semantic-ui-react";
import { ProductCatalogType } from "features/WhatsappCatalog/models/ProductCatalogType";
import { postSetProductCatalogPhoneNumber } from "api/CloudAPI/postSetProductCatalogPhoneNumber";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import PhoneNumberSwitch from "./components/PhoneNumberSwitch";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { fetchWhatsappCatalogSettings } from "api/CloudAPI/fetchWhatsappCatalogSettings";
import {
  normalizeWhatsappCatalogSetting,
  WabaInfoType,
} from "./components/helper/normalizeWhatsappCatalogSetting";

const getHeaderText = (t: TFunction) => [
  "",
  t("onboarding.whatsappCatalog.connectWhatsappPhoneNumber.phoneNumber"),
  t("onboarding.whatsappCatalog.connectWhatsappPhoneNumber.whatsappName"),
];

export const getErrorMessage = (t: TFunction, message?: string) => {
  if (message === "unable to find any cloud api config") {
    return t(
      "onboarding.whatsappCatalog.connectWhatsappPhoneNumber.configNotFound"
    );
  }
  if (message === "Unable to locate any valid waba") {
    return t(
      "onboarding.whatsappCatalog.connectWhatsappPhoneNumber.wabaNotFound"
    );
  }
  if (
    message ===
    "Unable to patch waba phone number with whatsapp commerce setting"
  ) {
    return t(
      "onboarding.whatsappCatalog.connectWhatsappPhoneNumber.UnableConnect"
    );
  }
  return t(
    "onboarding.whatsappCatalog.connectWhatsappPhoneNumber.changeFailed"
  );
};

const isConnected = (
  wabaId: string,
  catalogId: string,
  connectedCatalog: { [key in string]: WabaInfoType[] }
): boolean => {
  const catalogConfig = connectedCatalog[catalogId];
  if (
    catalogConfig &&
    catalogConfig.find((catalog) => catalog.wabaId === wabaId)
  ) {
    return true;
  }
  return false;
};

export default function ConnectWhatsappNumber() {
  const { goToNextStep, accessToken, setCatalogInfo } =
    useWhatsappCatalogOnboarding();
  const [whatsappCatalog, setWhatsappCatalog] = useState<ProductCatalogType>();
  const [loading, setLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const cloudApiConfig = useAppSelector(
    (state) => state.company?.whatsappCloudApiConfigs,
    equals
  );
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  useEffect(() => {
    const getProductCatalogs = async () => {
      setLoading(true);
      try {
        const catalogs = await fetchProductCatalog(accessToken);
        const result = await fetchWhatsappCatalogSettings(false);
        const connectedCatalogs = await normalizeWhatsappCatalogSetting(result);
        const filteredCatalogs = catalogs.filter(
          (catalog) =>
            catalog.waba_product_catalog &&
            catalog.waba &&
            !isConnected(
              catalog.waba.id,
              catalog.waba_product_catalog.facebook_product_catalog_id,
              connectedCatalogs
            )
        ) as ProductCatalogType[];
        if (filteredCatalogs.length) {
          setCatalogInfo({
            wabaName: filteredCatalogs[0].waba.facebook_waba_name,
            catalogName:
              filteredCatalogs[0].waba_product_catalog
                .facebook_product_catalog_name,
          });
          setWhatsappCatalog(filteredCatalogs[0]);
          await postConnectWabaProductCatalog(
            filteredCatalogs[0].waba.id,
            filteredCatalogs[0].waba_product_catalog.facebook_product_catalog_id
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getProductCatalogs();
  }, []);

  const switchChange = (phoneNumberId: string) => async (checked: boolean) => {
    const currentPhoneNumber = cloudApiConfig?.find(
      (config) => config.facebookPhoneNumberId === phoneNumberId
    );
    if (!whatsappCatalog || !currentPhoneNumber) return;
    try {
      setSwitchLoading(true);
      await postSetProductCatalogPhoneNumber({
        wabaId: whatsappCatalog.waba.id,
        wabaPhoneNumberId: currentPhoneNumber.messagingHubWabaPhoneNumberId,
        isCatalogVisible: checked,
        isCartEnabled: checked,
      });
      flash(
        t("onboarding.whatsappCatalog.connectWhatsappPhoneNumber.changeSuccess")
      );
    } catch (error) {
      console.error(error);
      flash(getErrorMessage(t, error?.response?.data.message));
    } finally {
      setSwitchLoading(false);
    }
  };

  const getPhoneNumberTable = () => {
    if (!whatsappCatalog) return [];
    return whatsappCatalog.waba.waba_dto_phone_numbers.map((phoneNumber) => [
      <PhoneNumberSwitch
        onSwitchChange={switchChange(phoneNumber.facebook_phone_number_id)}
        loading={switchLoading}
      />,
      phoneNumber.facebook_phone_number,
      phoneNumber.facebook_phone_number_verified_name,
    ]);
  };

  return (
    <div
      className={`container ${styles.content} ${styles.connectWhatsappNumber}`}
    >
      <StepHeader
        title={t("onboarding.whatsappCatalog.connectWhatsappPhoneNumber.title")}
      />
      <div className={styles.description}>
        {t("onboarding.whatsappCatalog.connectWhatsappPhoneNumber.description")}
      </div>
      <div className={styles.catalogsWrapper}>
        <Dimmer.Dimmable>
          <Dimmer inverted active={loading}>
            <Loader active />
          </Dimmer>
          {whatsappCatalog ? (
            <CatalogAccordion
              activeItem={
                whatsappCatalog.waba_product_catalog.facebook_product_catalog_id
              }
              catalogName={
                whatsappCatalog.waba_product_catalog
                  .facebook_product_catalog_name
              }
              businessAccountName={whatsappCatalog.waba.facebook_waba_name}
              id={
                whatsappCatalog.waba_product_catalog.facebook_product_catalog_id
              }
            >
              {whatsappCatalog.waba.waba_dto_phone_numbers.length === 0 ? (
                <div className={styles.noCatalog}>
                  {t(
                    "onboarding.whatsappCatalog.connectWhatsappPhoneNumber.noAvailableNumber"
                  )}
                </div>
              ) : (
                <WhatsappPhoneNumberTable
                  headerTexts={getHeaderText(t)}
                  bodyRows={getPhoneNumberTable()}
                />
              )}
            </CatalogAccordion>
          ) : (
            <div className={styles.noCatalog}>
              {t(
                "onboarding.whatsappCatalog.connectWhatsappPhoneNumber.noAvailableCatalog"
              )}
            </div>
          )}
        </Dimmer.Dimmable>
      </div>
      <Button
        className={styles.button}
        primary
        fluid
        onClick={goToNextStep}
        disabled={!whatsappCatalog}
      >
        {t("onboarding.whatsappCatalog.action.confirm")}
      </Button>
    </div>
  );
}
