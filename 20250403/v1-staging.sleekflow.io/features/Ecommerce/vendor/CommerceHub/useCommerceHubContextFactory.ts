import { BootableCartContextType } from "../../usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { CommerceHubProductProvider } from "./CommerceHubProductProvider";
import { CommerceHubLinkSharingService } from "./CommerceHubLinkSharingService";
import { CommerceHubCartService } from "./CommerceHubCartService";
import { useProductListApi } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore/ProductsTab/useProductListApi";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import { StripePaymentGateway } from "./StripePaymentGateway";
import { useFeaturesGuard } from "../../../../component/Settings/hooks/useFeaturesGuard";

export function useCommerceHubContextFactory(props: {
  pageSize: number;
  pageGroupSize: number;
  storeId: string;
  store: CustomStoreType | undefined;
}): BootableCartContextType {
  const featuresGuard = useFeaturesGuard();
  const commerceHubListApi = useProductListApi({
    storeId: props.storeId as string,
    pageSize: props.pageSize,
    pageGroupsSize: props.pageGroupSize,
    visibleOnly: true,
  });

  return {
    vendor: "commerceHub",
    productProvider: new CommerceHubProductProvider(
      props.pageSize,
      props.pageGroupSize,
      commerceHubListApi
    ),
    linkSharingService: new CommerceHubLinkSharingService(
      props.storeId as string
    ),
    shoppingCartService: new CommerceHubCartService(),
    paymentGateway: new StripePaymentGateway(
      featuresGuard.canUseStripePayments(),
      props.store
    ),
  };
}
