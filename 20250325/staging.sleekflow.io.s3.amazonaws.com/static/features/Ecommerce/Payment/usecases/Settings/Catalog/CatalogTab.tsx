import React, { useEffect, useState } from "react";
import { Button, Table } from "semantic-ui-react";
import GridDummy from "component/shared/Placeholder/GridDummy";
import CatalogTableHeader from "./CatalogTableHeader";
import CatalogTableRow from "./CatalogTableRow";
import { useTranslation } from "react-i18next";
import styles from "./CatalogTab.module.css";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import PlusIcon from "assets/tsx/icons/PlusIcon";
import {
  CreateStoreModal,
  CreateCatalogFormType,
} from "features/Ecommerce/usecases/Settings/Commerce/CommerceSettings/CreateStoreModal";
import { useShopifyCatalogTabApi } from "./useShopifyCatalogTabApi";
import { useCustomStoreTabApi } from "./useCustomStoreTabApi";
import { CatalogStateType } from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";
import { useCreateCustomStoreFlow } from "features/Ecommerce/Payment/usecases/Settings/Catalog/useCreateCustomStoreFlow";
import { CatalogsListApiInterface } from "features/Ecommerce/Payment/usecases/Settings/contracts/CatalogsListApiInterface";
import { useShopifyConnect } from "features/Shopify/policies/useShopifyConnect";
import { useSettingsSubscriptionPlan } from "component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";

const CatalogTab = () => {
  const { t } = useTranslation();
  const [booting, setBooting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const flash = useFlashMessageChannel();
  const shopifyApi = useShopifyCatalogTabApi();
  const customStoreApi = useCustomStoreTabApi();
  const { createCustomStore } = useCreateCustomStoreFlow();
  const [saveAttempted, setSaveAttempted] = useState(false);

  const [createCatalogModalVisible, setCreateCatalogModalVisible] =
    useState(false);
  const { stripePublicKey, stripePlans } = useSettingsSubscriptionPlan();
  const shopifyConnect = useShopifyConnect({
    setLoading: setIsLoading,
    stripePublicKey,
    addOnPlans: stripePlans?.addOnPlans,
  });

  function initCreateCustomStore() {
    setCreateCatalogModalVisible(true);
  }

  function cancelCreatingCustomStore() {
    setCreateCatalogModalVisible(false);
  }

  async function performCreateCustomStore(values: CreateCatalogFormType) {
    try {
      await createCustomStore(values);
      await customStoreApi.fetchStores();
      setCreateCatalogModalVisible(false);
      flash(t("settings.commerce.flash.settingsSaved"));
    } catch (e) {
      console.error(e);
    }
  }

  function handleNameChanged<Id extends number | string>(
    shopifyApi: CatalogsListApiInterface<Id>,
    store: CatalogStateType<Id>
  ) {
    return (name: string) => {
      setSaveAttempted(false);
      shopifyApi.changeName(name, store.id as Id);
    };
  }

  function handleShowStatusChanged<Id extends number | string>(
    shopifyApi: CatalogsListApiInterface<Id>,
    store: CatalogStateType<Id>
  ) {
    return (show: boolean) => {
      setSaveAttempted(false);
      shopifyApi.changeShowStatus(show, store.id as Id);
    };
  }

  const performSave = async () => {
    setSaveAttempted(true);
    if (shopifyApi.hasErrors || customStoreApi.hasErrors) {
      return;
    }

    try {
      setIsLoading(true);
      const jobs: Promise<void>[] = [];
      if (shopifyApi.isCatalogChanged) {
        jobs.push(
          (async function () {
            try {
              await shopifyApi.updateCatalog();
              await shopifyApi.fetchStores();
            } catch (e) {
              console.error(e);
            }
          })()
        );
      }
      if (customStoreApi.isCatalogChanged) {
        jobs.push(
          (async function () {
            try {
              await customStoreApi.updateCatalog();
              await customStoreApi.fetchStores();
            } catch (e) {
              console.error(e);
            }
          })()
        );
      }
      if (jobs.length > 0) {
        await Promise.all(jobs);
        flash(t("settings.commerce.flash.settingsSaved"));
      }
    } catch (e) {
      flash(t("flash.settings.payment.error"));
    } finally {
      setSaveAttempted(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      shopifyApi.fetchStores().catch(console.error),
      customStoreApi.fetchStores().catch(console.error),
    ])
      .then(() => {
        setBooting(false);
      })
      .catch(console.error);
  }, []);

  const needDisplayErrors =
    saveAttempted && (shopifyApi.hasErrors || customStoreApi.hasErrors);
  const isSaveBlocked =
    (!shopifyApi.isCatalogChanged && !customStoreApi.isCatalogChanged) ||
    needDisplayErrors;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {t("settings.paymentLink.catalog.header")}
      </div>
      <div className={styles.description}>
        {t("settings.paymentLink.catalog.description")}
      </div>
      <Table>
        {booting ? (
          <GridDummy
            loading
            columnsNumber={5}
            hasCheckbox={false}
            rowSteps={6}
            renderHeader={() => <CatalogTableHeader />}
          />
        ) : (
          <>
            {shopifyApi.stores.length + customStoreApi.stores.length > 0 && (
              <>
                <CatalogTableHeader />
                <tbody>
                  {shopifyApi.stores.map((store) => (
                    <CatalogTableRow
                      store={store}
                      key={`shopify${store.id}`}
                      onNameChanged={handleNameChanged(shopifyApi, store)}
                      onShowStatusChanged={handleShowStatusChanged(
                        shopifyApi,
                        store
                      )}
                      onEnablePaymentChanged={() => null}
                      error={
                        needDisplayErrors
                          ? shopifyApi.getError(store.id)
                          : undefined
                      }
                    />
                  ))}
                  {customStoreApi.stores.map((store) => (
                    <CatalogTableRow
                      store={store}
                      key={store.id}
                      onNameChanged={handleNameChanged(customStoreApi, store)}
                      onShowStatusChanged={handleShowStatusChanged(
                        customStoreApi,
                        store
                      )}
                      onEnablePaymentChanged={(value) => {
                        const handler = customStoreApi.changePaymentEnabled;
                        handler && handler(value, store.id);
                      }}
                      error={
                        needDisplayErrors
                          ? customStoreApi.getError(store.id)
                          : undefined
                      }
                    />
                  ))}
                </tbody>
              </>
            )}
          </>
        )}
      </Table>
      <div className={styles.actions}>
        <Button
          className={styles.button}
          onClick={initCreateCustomStore}
          content={
            <>
              <PlusIcon />
              {t("settings.commerce.stores.createCustom")}
            </>
          }
        />
        <Button
          className={styles.button}
          onClick={shopifyConnect.start}
          content={
            <>
              <PlusIcon />
              {t("settings.commerce.stores.connectShopify")}
            </>
          }
        />
      </div>
      {createCatalogModalVisible && (
        <CreateStoreModal
          loading={false}
          onConfirm={performCreateCustomStore}
          cancel={cancelCreatingCustomStore}
        />
      )}
      <Button
        primary
        size={"mini"}
        disabled={isSaveBlocked}
        onClick={isSaveBlocked ? undefined : performSave}
        loading={isLoading}
      >
        {t("settings.paymentLink.button.save")}
      </Button>
    </div>
  );
};

export default CatalogTab;
