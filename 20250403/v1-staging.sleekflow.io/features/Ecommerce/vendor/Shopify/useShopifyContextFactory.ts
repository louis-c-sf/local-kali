import { BootableCartContextType } from "../../usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { ShopifyProductProvider } from "./ShopifyProductProvider";
import { ShopifyLinkSharingService } from "./ShopifyLinkSharingService";
import { ShopifyCartService } from "./ShopifyCartService";
import { useState } from "react";
import { ProductsPagingType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { ShopifyConfigsType } from "../../../../types/CompanyType";
import { ShopifySettingResponseType } from "../../../../api/StripePayment/fetchShopifySetting";
import { ShopifyPaymentGateway } from "./ShopifyPaymentGateway";
import { useAppSelector } from "../../../../AppRootContext";

export function useShopifyContextFactory(props: {
  pageSize: number;
  defaultCurrency: string;
  storeStatus: ShopifyConfigsType | null;
  storeSettings: ShopifySettingResponseType | null;
  currenciesBooted: string[];
  selectedCurrency: string;
}): BootableCartContextType {
  const [activePage, setActivePage] = useState(1);
  const [products, setProducts] = useState<ProductsPagingType>();
  const [loading, setLoading] = useState<boolean>(false);
  const profilePhone = useAppSelector((s) => {
    const phoneField = s.company?.customUserProfileFields.find(
      (f) => f.fieldName === "PhoneNumber"
    );
    if (!phoneField) {
      return;
    }
    return s.profile.customFields.find(
      (cf) => cf.companyDefinedFieldId === phoneField.id
    )?.value;
  });

  return {
    vendor: "shopify",
    productProvider: new ShopifyProductProvider(
      props.pageSize,
      props.defaultCurrency,
      {
        activePage,
        setActivePage,
        products,
        setProducts,
        loading,
        setLoading,
      }
    ),
    linkSharingService: new ShopifyLinkSharingService(),
    shoppingCartService: new ShopifyCartService(
      props.storeStatus,
      props.storeSettings
    ),
    paymentGateway: new ShopifyPaymentGateway(
      props.storeStatus,
      props.currenciesBooted,
      props.selectedCurrency,
      profilePhone
    ),
  };
}
