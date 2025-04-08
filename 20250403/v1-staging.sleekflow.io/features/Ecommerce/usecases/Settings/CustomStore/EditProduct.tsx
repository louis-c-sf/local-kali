import React, { useEffect } from "react";
import styles from "./EditProduct.module.css";
import { useTranslation } from "react-i18next";
import { LoggedInLayoutBasic } from "core/Layout/LoggedInLayoutBasic";
import { BackNavBar } from "../../../components/BackNavBar/BackNavBar";
import { useParams, useHistory } from "react-router";
import { useProductForm } from "./EditProduct/useProductForm";
import { ProductForm } from "./EditProduct/ProductForm";
import { useEditProductBoot } from "./EditProduct/useEditProductBoot";
import { DisableControls } from "core/components/DisableControls/DisableControls";
import { Button } from "component/shared/Button/Button";
import useRouteConfig from "config/useRouteConfig";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";

export function EditProduct() {
  const { t } = useTranslation();
  const pageTitle = t("nav.menu.settings.commerce");
  const urlParams = useParams<{ storeId: string; id: string | undefined }>();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();

  const boot = useEditProductBoot({
    storeId: urlParams.storeId,
    productId: urlParams.id,
    onMissing: () => {
      history.push(
        routeTo(`/settings/commerce/store/${urlParams.storeId}/products`)
      );
    },
  });
  const languages = boot.booted?.store
    ? boot.booted.store.languages.map((n) => n.language_iso_code)
    : ["en"];

  const currencies = boot.booted?.product
    ? boot.booted.product.prices.map((n) => n.currency_iso_code)
    : ["HKD"];

  const productForm = useProductForm({
    id: urlParams.id,
    store: boot.booted?.store || null,
    initValues: boot.booted?.product,
    languages,
    currencies,
    productPrototype: boot.booted?.productPrototype ?? null,
    onCreated: (newId) => {
      flash(t("settings.commerce.flash.settingsSaved"));
      history.push(
        routeTo(
          `/settings/commerce/store/${urlParams.storeId}/products/${newId}`
        )
      );
    },
    onUpdated: (result) => {
      flash(t("settings.commerce.flash.settingsSaved"));
      boot.updatePrototype(result);
    },
  });

  useEffect(() => {
    boot.boot().then((value) => {
      if (value) {
        productForm.form.setValues(value, urlParams.id !== undefined);
      }
    });
  }, [urlParams.storeId, urlParams.id]);

  return (
    <LoggedInLayoutBasic
      selectedItem={"settings"}
      pageTitle={t("nav.common.title", { page: pageTitle })}
      scrollableY
      extraMainClass={""}
    >
      <DisableControls disabled={!boot.booted}>
        <div className={styles.canvas}>
          <BackNavBar
            to={`/settings/commerce/store/${urlParams.storeId}/products`}
          />
          <div className={styles.header}>
            <div className={styles.text}>
              <div className={styles.title}>
                {urlParams.id
                  ? t("settings.commerce.addProduct.title.edit")
                  : t("settings.commerce.addProduct.title.add")}
              </div>
              <div className={styles.subtitle}>
                {t("settings.commerce.addProduct.subtitle.add")}
              </div>
            </div>
            <div className={styles.actions}>
              <Button
                primary
                content={t("form.button.save")}
                disabled={productForm.form.isSubmitDisabled}
                loading={productForm.form.isSubmitting}
                onClick={productForm.form.submitForm}
              />
            </div>
          </div>
          <ProductForm
            containerClass={styles.container}
            form={productForm.form}
            languages={languages}
            prototypeData={boot.booted?.productPrototype ?? null}
            storeId={urlParams.storeId}
          />
        </div>
      </DisableControls>
    </LoggedInLayoutBasic>
  );
}
