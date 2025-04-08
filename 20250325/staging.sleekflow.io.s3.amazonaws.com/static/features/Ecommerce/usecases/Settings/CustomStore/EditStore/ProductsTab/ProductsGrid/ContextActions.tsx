import React, { useContext } from "react";
import styles from "./ContextActions.module.css";
import { NavLink } from "react-router-dom";
import { TableContextMenu } from "component/shared/grid/TableContextMenu";
import { Dropdown, DropdownItem } from "semantic-ui-react";
import { useProductsGridContext } from "../ProductsGridContext";
import gridDummy from "component/shared/Placeholder/GridDummy";
import { useTranslation } from "react-i18next";
import useRouteConfig from "config/useRouteConfig";

export function ContextActions(props: { itemId: string }) {
  const grid = useProductsGridContext();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  return (
    <div className={styles.actions}>
      <NavLink
        to={routeTo(
          `/settings/commerce/store/${grid.storeId}/products/${props.itemId}`
        )}
        className={styles.trigger}
      >
        {t("form.button.edit")}
      </NavLink>{" "}
      <TableContextMenu>
        {(close) => {
          return (
            <>
              <DropdownItem
                onClick={() => {
                  grid?.duplicateRecords([props.itemId]);
                  close();
                }}
              >
                {t("settings.commerce.product.duplicateOne")}
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  grid?.startDeletingRecords([props.itemId]);
                  close();
                }}
              >
                {t("settings.commerce.product.deleteOne")}
              </DropdownItem>
            </>
          );
        }}
      </TableContextMenu>
    </div>
  );
}
