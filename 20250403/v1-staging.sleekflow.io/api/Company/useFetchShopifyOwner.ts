import { useState } from "react";
import fetchShopifyOwner from "./fetchShopifyOwner";

function useFetchShopifyOwner() {
  const [loading, setLoading] = useState(false);
  const [shopifyId, setShopifyId] = useState<number | null>();
  async function refreshShopifyOwner() {
    setLoading(true);
    try {
      const result = await fetchShopifyOwner();
      setShopifyId(result.shopifyConfigId ?? null);
    } catch (e) {
      console.error(`fetchShopifyOwner error ${e}`);
      setShopifyId(null);
    } finally {
      setLoading(false);
    }
  }
  return {
    loading,
    shopifyId,
    refreshShopifyOwner,
  };
}

export default useFetchShopifyOwner;
