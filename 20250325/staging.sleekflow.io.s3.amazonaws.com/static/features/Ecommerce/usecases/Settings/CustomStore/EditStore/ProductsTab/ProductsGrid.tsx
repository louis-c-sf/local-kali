import React from "react";
import styles from "./ProductsGrid.module.css";
import { Table } from "./ProductsGrid/Table";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import { GroupPagination } from "features/Salesforce/components/GroupPagination/GroupPagination";
import { useDisableControls } from "core/components/DisableControls/DisableControls";

export function ProductsGrid(props: {
  page: number;
  pageSize: number;
  pagesPerGroup: number;
  groupResultCount: number;
  items: ProductType[];
  prevToken: string | null;
  nextToken: string | null;
  onPageChange: (page: number) => void;
  onPrevGroup?: () => void;
  onNextGroup?: () => void;
  currencies: string[];
}) {
  const controls = useDisableControls();

  return (
    <div className={styles.grid}>
      <div className={styles.table}>
        <Table items={props.items} currencies={props.currencies} />
      </div>
      <div className={styles.pagination}>
        <GroupPagination
          disabled={controls.disabled}
          onPageChange={props.onPageChange}
          prevToken={props.prevToken}
          nextToken={props.nextToken}
          groupResultCount={props.groupResultCount}
          page={props.page}
          pageSize={props.pageSize}
          pagesPerGroup={props.pagesPerGroup}
          onNextGroup={props.onNextGroup}
          onPrevGroup={props.onPrevGroup}
        />
      </div>
    </div>
  );
}
