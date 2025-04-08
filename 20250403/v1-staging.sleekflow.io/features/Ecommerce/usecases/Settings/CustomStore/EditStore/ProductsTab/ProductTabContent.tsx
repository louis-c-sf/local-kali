import styles from "../ProductsTab.module.css";
import { SearchInput } from "component/shared/input/SearchInput";
import { Dimmer, Loader } from "semantic-ui-react";
import { EmptyList } from "./EmptyList";
import { ProductsGridContext } from "./ProductsGridContext";
import { ProductsGrid } from "./ProductsGrid";
import React from "react";
import { useTranslation } from "react-i18next";
import { useItemSelection } from "component/shared/grid/ItemSelection/useItemSelection";
import { Button } from "component/shared/Button/Button";
import { NavLink } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { ProductListInterface } from "./useProductListApi";
import { DeleteApiInterface } from "./useDeleteSelected";
import { DuplicateApiInterface } from "./useDuplicateSelected";
import { useDebouncedCallback } from "use-debounce";
import { ConfirmDeleteProducts } from "./ConfirmDeleteProducts";

export function ProductTabContent(props: {
  storeId: string;
  listApi: ProductListInterface;
  deleteApi: DeleteApiInterface;
  duplicateApi: DuplicateApiInterface;
  pagesPerGroup: number;
  pageSize: number;
  onImport: () => void;
}) {
  const { deleteApi, listApi, duplicateApi } = props;
  const { routeTo } = useRouteConfig();
  const itemSelection = useItemSelection();

  const [searchDebounced] = useDebouncedCallback(listApi.searchBy, 200);
  const updateSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const query = ev.target.value;
    listApi.setQuery(query);
    searchDebounced(query);
  };

  const resetSearch = () => {
    listApi.searchBy("");
  };

  function changePage(page: number) {
    listApi.setPage(page);
    itemSelection.deselectAll();
  }

  async function loadNextGroup() {
    await listApi.loadNextPageGroup();
    itemSelection.deselectAll();
  }

  async function loadPrevGroup() {
    await listApi.loadPrevPageGroup();
    itemSelection.deselectAll();
  }

  const hasQuery = listApi.query.trim().length > 0;

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <div className={styles.search}>
          <SearchInput
            onChange={updateSearch}
            hasQuery={hasQuery}
            loading={listApi.loading && hasQuery}
            reset={resetSearch}
            query={listApi.query}
          />
        </div>
        <Actions
          addUrl={routeTo(
            `/settings/commerce/store/${props.storeId}/products/add`
          )}
          onDelete={() => {
            deleteApi.start(itemSelection.checkedIds);
            itemSelection.deselectAll();
          }}
          onDuplicate={() => {
            duplicateApi.perform(itemSelection.checkedIds);
            itemSelection.deselectAll();
          }}
          onImport={props.onImport}
        />
      </div>
      <div className={styles.list}>
        {(!listApi.booted || listApi.loading) && (
          <Dimmer active inverted>
            <Loader active />
          </Dimmer>
        )}
        {listApi.booted &&
          (listApi.items.length === 0 ? (
            <EmptyList />
          ) : (
            <ProductsGridContext.Provider
              value={{
                duplicateRecords: listApi.duplicateRecords,
                startDeletingRecords: deleteApi.start,
                storeId: props.storeId,
                toggleDisplayProduct: listApi.toggleDisplay,
                itemLoadingId: listApi.itemLoadingId,
                currencies: listApi.booted.currencies,
              }}
            >
              <ProductsGrid
                items={listApi.items}
                onPageChange={changePage}
                pagesPerGroup={props.pagesPerGroup}
                pageSize={props.pageSize}
                groupResultCount={props.listApi.groupItemsCount}
                page={listApi.page}
                onNextGroup={loadNextGroup}
                onPrevGroup={loadPrevGroup}
                prevToken={listApi.prevToken}
                nextToken={listApi.nextToken}
                currencies={listApi.booted.currencies}
              />
              {deleteApi.isConfirming && (
                <ConfirmDeleteProducts
                  isRunning={deleteApi.loading}
                  execute={deleteApi.confirm}
                  cancel={deleteApi.cancel}
                  count={deleteApi.count}
                />
              )}
            </ProductsGridContext.Provider>
          ))}
      </div>
    </div>
  );
}

function Actions(props: {
  onDelete: () => void;
  onDuplicate: () => void;
  addUrl: string;
  onImport: () => void;
}) {
  const { t } = useTranslation();
  const selection = useItemSelection();

  const selectedCount = selection.checkedIds.length;
  return (
    <div className={styles.actions}>
      {!selection.anyChecked ? (
        <>
          <Button
            content={t("settings.commerce.product.importCSV.button")}
            onClick={props.onImport}
          />
          <Button
            as={(btnProps: any) => (
              <NavLink {...btnProps} to={props.addUrl}>
                {t("settings.commerce.product.addProduct.button")}
              </NavLink>
            )}
            primary
          />
        </>
      ) : (
        <>
          <Button
            content={t("settings.commerce.product.duplicate.button", {
              count: selectedCount,
            })}
            onClick={props.onDuplicate}
          />
          <Button
            primary
            content={t("settings.commerce.product.delete.button", {
              count: selectedCount,
            })}
            onClick={props.onDelete}
          />
        </>
      )}
    </div>
  );
}
