import { submitDeleteProducts } from "api/CommerceHub/submitDeleteProducts";
import { useState } from "react";

export type DeleteApiInterface = ReturnType<typeof useDeleteSelected>;

export function useDeleteSelected(props: {
  onDeleted: () => Promise<any>;
  storeId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const [isConfirming, setIsConfirming] = useState(false);

  async function submitDelete(idList: string[]) {
    setLoading(true);
    try {
      await submitDeleteProducts(props.storeId, idList);
      await props.onDeleted();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    isConfirming,
    count: deleteIds.length,
    start(ids: string[]) {
      setDeleteIds(ids);
      setIsConfirming(true);
    },

    cancel() {
      setDeleteIds([]);
      setIsConfirming(false);
    },

    async confirm() {
      await submitDelete(deleteIds);
      setIsConfirming(false);
      setDeleteIds([]);
    },
  };
}
