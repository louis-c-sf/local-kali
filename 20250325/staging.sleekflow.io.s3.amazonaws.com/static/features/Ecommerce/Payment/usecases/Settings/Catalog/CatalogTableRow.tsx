import React from "react";
import { ToggleInput } from "component/shared/input/ToggleInput";
import { useTranslation } from "react-i18next";
import { Input, Table } from "semantic-ui-react";
import { CatalogStateType } from "./types";
import styles from "./CatalogTab.module.css";
import { NavLink } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { CatalogIcon } from "features/Ecommerce/components/Icon/CatalogIcon";
import { FieldError } from "component/shared/form/FieldError";

const CatalogTableRow = (props: {
  store: CatalogStateType<string | number>;
  onShowStatusChanged: (show: boolean) => void;
  onEnablePaymentChanged?: (value: boolean) => void;
  onNameChanged: (name: string) => void;
  error: string | undefined;
}) => {
  const { store } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  const updateShowStatus = () => {
    props.onShowStatusChanged(!store.isShowInInbox);
  };

  const updateEnablePayment = () => {
    props.onEnablePaymentChanged?.(!store.isPaymentEnabled);
  };

  const updateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    props.onNameChanged(value);
  };

  const isShopify = store.usersMyShopifyUrl?.includes("shopify") ?? false;

  return (
    <tr>
      <Table.Cell verticalAlign="middle" className={styles.first}>
        <Input
          fluid
          value={store.name}
          placeholder={t(
            "settings.paymentLink.catalog.table.linkedCatalog.placeholder"
          )}
          onChange={updateName}
        />
        {props.error && <FieldError text={props.error} />}
      </Table.Cell>
      <Table.Cell verticalAlign="middle">
        <div className={styles.typeCell}>
          {isShopify && (
            <>
              <CatalogIcon vendor={"shopify"} />
              <div className={styles.label}>
                <div className={styles.name}>Shopify</div>
                <div className={styles.url}>{store.usersMyShopifyUrl}</div>
              </div>
            </>
          )}
          {!isShopify && (
            <>
              <CatalogIcon vendor={"commerceHub"} />
              <div className={styles.label}>
                <div className={styles.name}>
                  {t("settings.paymentLink.catalog.table.custom")}
                </div>
              </div>
            </>
          )}
        </div>
      </Table.Cell>
      <Table.Cell verticalAlign="middle">
        <ToggleInput
          on={store.isShowInInbox}
          labelOn={t("settings.paymentLink.catalog.table.showHide.toggle.show")}
          labelOff={t("settings.paymentLink.catalog.table.showHide.toggle.off")}
          onChange={updateShowStatus}
        />
      </Table.Cell>
      <Table.Cell verticalAlign="middle">
        {!isShopify && (
          <ToggleInput
            on={store.isPaymentEnabled}
            labelOn={t(
              "settings.paymentLink.catalog.table.paymentEnabled.toggle.on"
            )}
            labelOff={t(
              "settings.paymentLink.catalog.table.paymentEnabled.toggle.off"
            )}
            onChange={updateEnablePayment}
          />
        )}
        {isShopify && "-"}
      </Table.Cell>
      <Table.Cell className={styles.links}>
        {!isShopify && (
          <NavLink to={routeTo(`/settings/commerce/store/${store.id}`)}>
            {t("settings.paymentLink.catalog.table.settings")}
          </NavLink>
        )}
        {isShopify && (
          <NavLink to={routeTo(`/settings/commerce/shopify/${store.id}`)}>
            {t("settings.paymentLink.catalog.table.settings")}
          </NavLink>
        )}
      </Table.Cell>
    </tr>
  );
};
export default CatalogTableRow;
