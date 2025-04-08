import React, { useState, useEffect } from "react";
import styles from "./EditShopifyStore.module.css";
import { LoggedInLayoutBasic } from "core/Layout/LoggedInLayoutBasic";
import { useTranslation } from "react-i18next";
import { DisableControls } from "core/components/DisableControls/DisableControls";
import { useEditShopifyStoreBoot } from "features/Ecommerce/usecases/Settings/Shopify/useEditShopifyStoreBoot";
import { EditStoreContainer } from "features/Ecommerce/components/EditStoreContainer/EditStoreContainer";
import { Header } from "features/Ecommerce/components/EditStoreContainer/Header";
import { Field } from "features/Ecommerce/components/EditStoreContainer/Field";
import { ToggleInput } from "component/shared/input/ToggleInput";
import { Fieldset } from "features/Ecommerce/components/EditStoreContainer/Fieldset";
import { MessagePreview } from "container/Settings/Messages/components/MessagePreview";
import { useEditShopifyStoreForm } from "features/Ecommerce/usecases/Settings/Shopify/useEditShopifyStoreForm";
import { TextareaCounted } from "component/shared/form/TextareaCounted/TextareaCounted";
import { useParams, useHistory } from "react-router";
import { Portal, Button, Dimmer, Loader, Card, Radio } from "semantic-ui-react";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import useRouteConfig from "config/useRouteConfig";
import Logo from "./assets/shopify-logo.svg";
import {
  PaymentLinkOptionDict,
  PaymentLinkOptionKeyDict,
  useConvertPaymentLinkOption,
} from "./useConvertPaymentLinkOption";
import { useFetchStripeConnectedStatus } from "./useFetchStripeConnectedStatus";

export function EditShopifyStore() {
  const { t } = useTranslation();
  const pageTitle = t("nav.menu.settings.commerce");
  const params = useParams<{ storeId: string }>();
  const history = useHistory();
  const storeBoot = useEditShopifyStoreBoot({
    id: Number(params.storeId) || -1,
  });
  const { routeTo } = useRouteConfig();
  const regions = useSupportedRegions({ forceBoot: true });
  const [actionsRef, setActionsRef] = useState<HTMLDivElement | null>(null);
  const { findOptionValueByKey } = useConvertPaymentLinkOption();
  const paymentLinkOptionMap = {
    [PaymentLinkOptionDict.Shopify]: PaymentLinkOptionKeyDict.shopify,
    [PaymentLinkOptionDict.Stripe]: PaymentLinkOptionKeyDict.stripe,
  };

  const gatewayItems = [
    {
      key: PaymentLinkOptionKeyDict.shopify,
      header: t("settings.commerce.store.paymentLink.gateway.shopify"),
      content: t("settings.commerce.store.paymentLink.gateway.shopifyContent"),
    },
    {
      key: PaymentLinkOptionKeyDict.stripe,
      header: t("settings.commerce.store.paymentLink.gateway.stripe"),
      content: t("settings.commerce.store.paymentLink.gateway.stripeContent"),
    },
  ];
  const { isConnected: isStripeConnected } = useFetchStripeConnectedStatus(
    Number(params.storeId)
  );
  const form = useEditShopifyStoreForm({
    initialValues: storeBoot.booted
      ? {
          form: {
            ...storeBoot.booted.form,
            paymentLinkSetting: storeBoot.booted.store.paymentLinkSetting,
          },
          prototypeStore: storeBoot.booted.store,
          prototypeTemplate: storeBoot.booted.template,
        }
      : null,
  });
  const updateText =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setFieldValue(field, e.target.value);
    };

  const updateToggle = (field: string) => (checked: boolean) =>
    form.setFieldValue(field, checked);

  useEffect(() => {
    if (!regions.booted) {
      return;
    }
    storeBoot
      .boot(regions.currenciesSupported[0]?.countryCode ?? null)
      .catch((e) => {
        console.error("Boot", e, regions);
        history.push(routeTo("/settings/commerce"));
      });
  }, [regions.booted]);

  return (
    <LoggedInLayoutBasic
      selectedItem={"settings"}
      pageTitle={t("nav.common.title", { page: pageTitle })}
      scrollableY
      extraMainClass={""}
    >
      <DisableControls disabled={!storeBoot.booted}>
        <EditStoreContainer
          insideTab={false}
          backLink={"/settings/commerce"}
          header={
            <Header
              name={storeBoot.booted?.store.name ?? ""}
              url={storeBoot.booted?.store.usersMyShopifyUrl ?? ""}
              logoSrc={Logo}
              hasTabs={false}
            />
          }
          catchActionsPortal={setActionsRef}
        >
          <div className={`ui form ${styles.root}`}>
            {!storeBoot.booted && (
              <Dimmer active inverted>
                <Loader active />
              </Dimmer>
            )}
            <Field
              key={"name"}
              label={t("settings.commerce.store.field.name.label")}
              hint={t("settings.commerce.store.field.name.hint")}
              error={form.errors.name}
            >
              <input
                type="text"
                value={form.values.name}
                onChange={updateText("name")}
              />
            </Field>

            <Field
              key={"status"}
              label={t("settings.commerce.store.field.status.label")}
              error={form.errors.active}
              checkbox
            >
              <ToggleInput
                on={form.values.active}
                labelOn={t("settings.commerce.store.active")}
                labelOff={t("settings.commerce.store.inactive")}
                onChange={updateToggle("active")}
                size={"large"}
              />
            </Field>
            <Field
              key={"sharePaymentLinkStatus"}
              label={t("settings.commerce.store.paymentLink.status.label")}
              error={form.errors.paymentLinkSetting}
              checkbox
            >
              <div className={styles.description}>
                {t("settings.commerce.store.paymentLink.status.description")}
              </div>
              <ToggleInput
                on={
                  form.values.paymentLinkSetting?.isPaymentLinkEnabled ?? false
                }
                labelOn={t("settings.commerce.store.active")}
                labelOff={t("settings.commerce.store.inactive")}
                onChange={updateToggle(
                  "paymentLinkSetting.isPaymentLinkEnabled"
                )}
                size={"large"}
              />
            </Field>
            {form.values.paymentLinkSetting?.isPaymentLinkEnabled && (
              <Field
                key={"paymentLinkOption"}
                label={t("settings.commerce.store.paymentLink.gateway.label")}
                error={form.errors.paymentLinkSetting}
              >
                <div className={styles.radioGroup}>
                  {gatewayItems.map((item, index) => (
                    <Card
                      key={index}
                      className={`${styles.gatewayCard} ${
                        item.key === PaymentLinkOptionKeyDict.stripe &&
                        !isStripeConnected
                          ? "stripeUnconnected"
                          : ""
                      }`}
                    >
                      <Card.Content>
                        {item.key === PaymentLinkOptionKeyDict.stripe &&
                        !isStripeConnected ? (
                          <div className={styles.unconnected}>
                            {t(
                              "settings.commerce.store.paymentLink.gateway.unconnected"
                            )}
                          </div>
                        ) : (
                          <Radio
                            value={
                              form.values.paymentLinkSetting?.paymentLinkOption
                            }
                            checked={
                              paymentLinkOptionMap[
                                form.values.paymentLinkSetting
                                  ?.paymentLinkOption as number
                              ] === item.key
                            }
                            onChange={() =>
                              form.setFieldValue(
                                "paymentLinkSetting.paymentLinkOption",
                                findOptionValueByKey(item.key)
                              )
                            }
                          />
                        )}
                        <Card.Header>{item.header}</Card.Header>
                        <Card.Description>{item.content}</Card.Description>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              </Field>
            )}
            {form.values.sharingMessageTemplate && (
              <>
                <Fieldset
                  head={t("settings.commerce.store.messageTemplate.head")}
                  subhead={t("settings.commerce.store.messageTemplate.subhead")}
                />
                <div className={styles.languagesGrid}>
                  <div className={styles.messages}>
                    <Field
                      key={`template`}
                      error={form.errors.sharingMessageTemplate}
                      fullWidth
                      label={t("settings.commerce.store.field.message.label")}
                    >
                      <TextareaCounted
                        onChange={(val) =>
                          form.setFieldValue("sharingMessageTemplate", val)
                        }
                        value={form.values.sharingMessageTemplate}
                        max={1024}
                      />
                    </Field>
                  </div>
                  <div className={styles.preview}>
                    <label className={styles.label}>
                      {t("settings.commerce.store.field.preview.label")}
                    </label>
                    <MessagePreview
                      showImage={true}
                      messageBody={form.values.sharingMessageTemplate}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </EditStoreContainer>
        <Portal mountNode={actionsRef} open={actionsRef !== null}>
          <Button
            primary
            content={t("form.button.save")}
            onClick={form.submitForm}
            disabled={
              !storeBoot.booted || form.isSubmitting || form.isSubmitDisabled
            }
            loading={form.isSubmitting}
          />
        </Portal>
      </DisableControls>
    </LoggedInLayoutBasic>
  );
}
