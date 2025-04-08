import { useState } from "react";
import { submitDuplicateProducts } from "api/CommerceHub/submitDuplicateProducts";

export type DuplicateApiInterface = ReturnType<typeof useDuplicateSelected>;

export function useDuplicateSelected(props: {
  onCompleted: () => Promise<any>;
  storeId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function submitDuplicate(idList: string[]) {
    setLoading(true);
    try {
      await submitDuplicateProducts(props.storeId, idList);
      await props.onCompleted();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    async perform(ids: string[]) {
      return submitDuplicate(ids);
    },
  };
}
