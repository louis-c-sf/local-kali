import React from "react";
import styles from "./CommerceSettings.module.css";
import { SettingsPage } from "../../../components/Layout/SettingsPage";
import { useTranslation } from "react-i18next";
import CatalogTab from "../../../Payment/usecases/Settings/Catalog/CatalogTab";
import { CatalogProvider } from "../../../Payment/usecases/Settings/Catalog/reducer/catalogContext";

export function CommerceSettings() {
  const { t } = useTranslation();

  return (
    <SettingsPage
      header={t("settings.commerce.main.title")}
      panes={[]}
      hasTableContent
      selectedItem={""}
      onItemSelected={() => {}}
    >
      <div className={styles.paneContainer}>
        <div className={styles.paddedContent}>
          <CatalogProvider>
            <CatalogTab />
          </CatalogProvider>
        </div>
      </div>
    </SettingsPage>
  );
}
