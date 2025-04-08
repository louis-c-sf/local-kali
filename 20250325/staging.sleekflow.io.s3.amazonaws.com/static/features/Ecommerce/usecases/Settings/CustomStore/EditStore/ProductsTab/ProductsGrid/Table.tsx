import React, { useCallback } from "react";
import styles from "./Table.module.css";
import gridStyles from "component/shared/grid/Grid.module.css";
import {
  Table as STable,
  Checkbox,
  TableCellProps,
  Loader,
} from "semantic-ui-react";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import { useTranslation } from "react-i18next";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { ContextActions } from "./ContextActions";
import { ToggleInput } from "component/shared/input/ToggleInput";
import { formatCurrency } from "utility/string";
import { useItemSelection } from "component/shared/grid/ItemSelection/useItemSelection";
import { useProductsGridContext } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore/ProductsTab/ProductsGridContext";

export function Table(props: { items: ProductType[]; currencies: string[] }) {
  const selection = useItemSelection();
  const renderHeaderCell = useCallback(
    (props: any) => <STable.HeaderCell {...props} />,
    []
  );
  const renderCell = useCallback(
    (props: any) => <STable.Cell {...props} />,
    []
  );
  const { t } = useTranslation();
  const { currencies } = useProductsGridContext();
  const grid = useProductsGridContext();

  let basicHeadCells: TableCellProps[] = [
    {
      key: "check",
      content: (
        <Checkbox
          checked={selection.allChecked}
          onChange={selection.toggleAll}
        />
      ),
      className: `${styles.checkbox} ${styles.cell}`,
    },
    {
      key: "name",
      content: t("settings.commerce.product.field.name"),
      className: `${styles.checkbox} ${styles.cell}`,
    },
    {
      key: "actions",
      content: "",
    },
    {
      key: "show",
      content: t("settings.commerce.product.field.displayInChats"),
    },
  ];

  basicHeadCells = basicHeadCells.concat(
    currencies.map((currency) => {
      return {
        key: `price${currency}`,
        content: t("settings.commerce.product.price", {
          currency: currency,
        }),
        className: "",
      };
    })
  );

  function getBodyCells(item: ProductType) {
    const [name] = item.names;
    const [img] = item.images;
    let basicCells: TableCellProps[] = [
      {
        key: "check",
        content: (
          <>
            {grid.itemLoadingId === item.id ? (
              <Loader inline active size={"small"} />
            ) : (
              <Checkbox
                checked={selection.isChecked(item.id)}
                onChange={() => selection.toggleCheck(item.id)}
              />
            )}
          </>
        ),
      },
      {
        key: "name",
        content: (
          <div className={styles.name}>
            <div
              className={`${styles.image} ${
                img?.image_url ? "" : styles.empty
              }`}
            >
              {img?.image_url && <img src={img.image_url} />}
            </div>
            {name?.value ?? "-"}
          </div>
        ),
      },
      {
        key: "actions",
        content: <ContextActions itemId={item.id} />,
        className: `${styles.cell} ${styles.actions}`,
      },
      {
        key: "toggleShow",
        content: (
          <ToggleInput
            on={item.is_view_enabled}
            disabled={grid.itemLoadingId === item.id}
            onChange={() => grid.toggleDisplayProduct(item.id)}
          />
        ),
      },
    ];
    return basicCells.concat(
      currencies.map((curr) => {
        const price = item.product_variant_prices.find(
          (pr) => pr.currency_iso_code.toLowerCase() === curr.toLowerCase()
        );
        return {
          key: `price${curr}`,
          content: price
            ? formatCurrency(price.amount, price.currency_iso_code)
            : "",
        };
      })
    );
  }

  return (
    <STable className={`${gridStyles.grid} ${styles.table}`}>
      <STable.Header>
        <STable.Row cellAs={renderHeaderCell} cells={basicHeadCells} />
      </STable.Header>
      <STable.Body>
        {props.items.map((item) => (
          <STable.Row
            key={item.id}
            cellAs={renderCell}
            cells={getBodyCells(item)}
          />
        ))}
      </STable.Body>
    </STable>
  );
}
