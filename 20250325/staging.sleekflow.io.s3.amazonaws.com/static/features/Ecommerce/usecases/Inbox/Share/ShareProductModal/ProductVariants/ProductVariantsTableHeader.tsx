import { useTranslation } from "react-i18next";
import { Table } from "semantic-ui-react";
import React from "react";

export function ProductVariantsTableHeader(props: { keys: string[] }) {
  const { t } = useTranslation();
  const ShopifyProductVariantHeaderMapping = (title: string) => {
    const mapping = {
      stock: t("chat.shopifyProductsModal.products.table.header.stock"),
      price: t("chat.shopifyProductsModal.products.table.header.price"),
      id: t("chat.shopifyProductsModal.products.table.header.addToCart"),
    };
    return mapping[title] ?? title;
  };
  return (
    <Table.Header>
      <Table.Row>
        {props.keys.map((key) => {
          return (
            <Table.HeaderCell key={key} className={"status-cell"}>
              {ShopifyProductVariantHeaderMapping(key)}
            </Table.HeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
}
