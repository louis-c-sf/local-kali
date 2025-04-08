import React, { useEffect, useMemo, useState } from "react";
import { ItemSelectionContextProvider } from "component/shared/grid/ItemSelection/useItemSelection";
import { useProductListApi } from "./ProductsTab/useProductListApi";
import { useDeleteSelected } from "./ProductsTab/useDeleteSelected";
import { ProductTabContent } from "./ProductsTab/ProductTabContent";
import { useDuplicateSelected } from "./ProductsTab/useDuplicateSelected";
import { ImportModal } from "./ProductsTab/ImportModal";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";

const PAGES_PER_GROUP = 5;
const PAGE_SIZE = 10;

export function ProductsTab(props: { storeId: string }) {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const listApi = useProductListApi({
    pageGroupsSize: PAGES_PER_GROUP,
    pageSize: PAGE_SIZE,
    storeId: props.storeId,
    visibleOnly: false,
  });

  const deleteApi = useDeleteSelected({
    onDeleted: listApi.refresh,
    storeId: props.storeId,
  });

  const duplicateApi = useDuplicateSelected({
    storeId: props.storeId,
    onCompleted: listApi.refresh,
  });

  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    listApi.boot().catch(console.error);
  }, []);

  const idList = listApi.items.map((i) => i.id);

  const initIds = useMemo(() => idList, [idList.join()]);

  return (
    <ItemSelectionContextProvider initIds={initIds}>
      <ProductTabContent
        pageSize={PAGE_SIZE}
        pagesPerGroup={PAGES_PER_GROUP}
        storeId={props.storeId}
        deleteApi={deleteApi}
        duplicateApi={duplicateApi}
        listApi={listApi}
        onImport={() => setShowImportDialog(true)}
      />
      {showImportDialog && (
        <ImportModal
          close={() => setShowImportDialog(false)}
          storeId={props.storeId}
          onFinish={() => {
            listApi.boot();
            flash(t("settings.commerce.importCsv.flash.success"), 10000);
            setShowImportDialog(false);
          }}
        />
      )}
    </ItemSelectionContextProvider>
  );
}
