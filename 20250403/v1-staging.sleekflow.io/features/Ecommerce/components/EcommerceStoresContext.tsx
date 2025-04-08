import React, { ReactNode, useEffect, useState, useContext } from "react";
import { StoreOptionType } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { fetchShopifyStores } from "features/Ecommerce/vendor/Shopify/fetchShopifyStores";
import { fetchCommerceHubStores } from "features/Ecommerce/vendor/CommerceHub/fetchCommerceHubStores";

interface EcommerceStoresContextType {
  storeChoices: StoreOptionType[];
}

const InnerContext = React.createContext<EcommerceStoresContextType | null>(
  null
);

const loadEmpty = async () => [];

export function EcommerceStoresContext(props: {
  standalone: boolean;
  children: ReactNode;
}) {
  const [storeChoices, setStoreChoices] = useState<StoreOptionType[]>([]);

  useEffect(() => {
    Promise.all([
      fetchShopifyStores(),
      props.standalone ? loadEmpty() : fetchCommerceHubStores(),
    ]).then((results) => {
      setStoreChoices(results.flat(1).filter((res) => res.isShowInInbox));
    });
  }, []);

  return (
    <InnerContext.Provider
      value={{
        storeChoices: storeChoices,
      }}
    >
      {props.children}
    </InnerContext.Provider>
  );
}

export function useEcommerceStores() {
  const context = useContext(InnerContext);
  if (context === null) {
    throw "Initiate EcommerceStoresContext first";
  }
  return context;
}
