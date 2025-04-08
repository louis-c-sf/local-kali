import React, { useContext } from "react";

export type ProductsGridContextType = {
  itemLoadingId: string | undefined;
  duplicateRecords: (ids: string[]) => Promise<void>;
  startDeletingRecords: (ids: string[]) => void;
  toggleDisplayProduct: (id: string) => void;
  storeId: string;
  currencies: string[];
};

export const ProductsGridContext =
  React.createContext<ProductsGridContextType | null>(null);

export function useProductsGridContext() {
  const context = useContext(ProductsGridContext);
  if (context === null) {
    throw "Initiate ProductsGridContext first";
  }
  return context;
}
