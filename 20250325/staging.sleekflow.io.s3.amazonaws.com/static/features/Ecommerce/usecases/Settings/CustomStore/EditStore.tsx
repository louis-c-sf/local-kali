import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./EditStore.module.css";
import { LoggedInLayoutBasic } from "core/Layout/LoggedInLayoutBasic";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import { Header } from "features/Ecommerce/components/EditStoreContainer/Header";
import {
  Tab,
  Dimmer,
  Loader,
  Placeholder,
  PlaceholderLine,
} from "semantic-ui-react";
import { FormTab } from "./EditStore/FormTab";
import { ProductsTab } from "./EditStore/ProductsTab";
import { TabProps } from "semantic-ui-react/src/modules/Tab";
import { useCustomStoreBoot } from "./EditStore/useCustomStoreBoot";
import { DisableControls } from "core/components/DisableControls/DisableControls";
import { useDeleteStoreApi } from "./EditStore/useDeleteStoreApi";
import { DeleteStoreConfirm } from "./EditStore/DeleteStoreConfirm";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import { EditStoreContainer } from "features/Ecommerce/components/EditStoreContainer/EditStoreContainer";
import Logo from "./assets/store-custom.svg";
import { CurrenciesTab } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore/CurrenciesTab";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";

export interface CustomStoreFormType {
  name: string;
  active: boolean;
  enablePayment: boolean;
  languages: string[];
  sharingMessageTemplates: Array<{ language: string; message: string }>;
}

const tabs = ["settings", "products", "currencies"] as const;
type TabType = typeof tabs[number];

export function EditStore() {
  const { t, i18n } = useTranslation();
  const { routeTo } = useRouteConfig();
  const urlParams = useParams<{ id: string; tab: TabType }>();
  const history = useHistory();
  const flash = useFlashMessageChannel();

  const boot = useCustomStoreBoot(urlParams.id);

  const deleteApi = useDeleteStoreApi(urlParams.id, () => {
    flash(t("settings.commerce.flash.settingsSaved"));
    history.replace(routeTo("/settings/commerce"));
  });

  const [actionsRef, setActionsRef] = useState<HTMLDivElement | null>(null);

  const tabInit = urlParams.tab ?? "settings";
  const [tabSelected, setTabSelected] = useState<TabType>(tabInit as TabType);

  const [initValues, setInitValues] = useState<CustomStoreFormType>({
    active: false,
    enablePayment: false,
    languages: [],
    name: "",
    sharingMessageTemplates: [],
  });

  const [name, setName] = useState(initValues.name);

  useEffect(() => {
    boot.boot().then(({ store }) => {
      if (!store) {
        history.push("/settings/commerce");
        return;
      }
      const formValues = denormalizeStore(store);
      setInitValues(formValues);
      setName(formValues.name);
    });
  }, [urlParams.id]);

  const pageTitle = t("nav.menu.settings.commerce");

  const panes = useMemo(() => {
    return [
      {
        render: () => (
          <Tab.Pane attached={false} className={styles.pane}>
            {boot.booted?.store ? (
              <FormTab
                id={urlParams.id ?? null}
                actionsRef={actionsRef}
                initValues={initValues}
                storeLoaded={boot.booted.store}
                hasProducts={boot.booted.hasProducts}
                setName={setName}
              />
            ) : (
              <Dimmer active inverted>
                <Loader active />
              </Dimmer>
            )}
          </Tab.Pane>
        ),
        menuItem: {
          name: "settings",
          key: "settings",
          content: t("settings.commerce.stores.tab.settings"),
        },
        visible: true,
      },
      {
        render: () => (
          <Tab.Pane attached={false} className={styles.pane}>
            <ProductsTab storeId={urlParams.id} />
          </Tab.Pane>
        ),
        menuItem: {
          name: "products",
          key: "products",
          content: t("settings.commerce.stores.tab.products"),
        },
        visible: urlParams.id !== undefined,
      },
      {
        render: () => (
          <Tab.Pane attached={false} className={styles.pane}>
            <CurrenciesTab storeId={urlParams.id} />
          </Tab.Pane>
        ),
        menuItem: {
          name: "currencies",
          key: "currencies",
          content: t("settings.commerce.stores.tab.currencies"),
        },
        visible: urlParams.id !== undefined,
      },
      //todo languages
    ].filter((p) => p.visible);
  }, [
    JSON.stringify(initValues),
    JSON.stringify(boot.booted?.store),
    boot.booted?.hasProducts,
    urlParams.id,
    actionsRef,
    i18n.language,
  ]);

  const switchTab = useCallback(
    (_: any, data: TabProps) => {
      const idx = data.activeIndex;
      const itemName = tabs[idx as number];
      setTabSelected(itemName);
      history.push(
        routeTo(`/settings/commerce/store/${urlParams.id}/${itemName}`)
      );
    },
    [tabs.join(), urlParams.id]
  );

  const renderTabGeneric = useCallback(
    (props: any) => <div {...props} className={styles.inner} />,
    []
  );

  const menuConfig = useMemo(
    () => ({
      secondary: true,
      pointing: true,
      fluid: true,
    }),
    []
  );

  return (
    <LoggedInLayoutBasic
      selectedItem={"settings"}
      pageTitle={t("nav.common.title", { page: pageTitle })}
      scrollableY
      extraMainClass={""}
    >
      <DisableControls disabled={!boot.booted}>
        <EditStoreContainer
          insideTab={true}
          backLink={`/settings/commerce`}
          catchActionsPortal={setActionsRef}
          header={
            <Header
              onDelete={deleteApi.start}
              name={
                name || (
                  <Placeholder>
                    <Placeholder.Header>
                      <Placeholder.Line length={"medium"} />
                    </Placeholder.Header>
                  </Placeholder>
                )
              }
              logoSrc={Logo}
              hasTabs
            />
          }
        >
          <Tab
            as={renderTabGeneric}
            activeIndex={tabs.findIndex((t) => t === tabSelected)}
            onTabChange={switchTab}
            menu={menuConfig}
            renderActiveOnly
            panes={panes}
          />
        </EditStoreContainer>

        {deleteApi.confirmVisible && (
          <DeleteStoreConfirm
            name={initValues.name}
            cancel={deleteApi.cancel}
            execute={deleteApi.execute}
            isRunning={deleteApi.isRunning}
          />
        )}
      </DisableControls>
    </LoggedInLayoutBasic>
  );
}

function denormalizeStore(input: CustomStoreType): CustomStoreFormType {
  return {
    active: input.is_view_enabled,
    enablePayment: input.is_payment_enabled,
    languages: input.languages.map((lang) => lang.language_iso_code),
    name: input.names[0]?.value ?? "",
    sharingMessageTemplates: input.template_dict.message_preview_templates.map(
      (d) => ({
        language: d.language_iso_code,
        message: d.value,
      })
    ),
  };
}
