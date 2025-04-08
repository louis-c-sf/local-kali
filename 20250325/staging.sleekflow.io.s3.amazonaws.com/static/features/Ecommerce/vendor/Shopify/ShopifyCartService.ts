import { ShoppingCartServiceInterface } from "core/models/Ecommerce/Cart/ShoppingCartServiceInterface";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { ProductVariantOptionGenericType } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { ShopifyConfigsType } from "../../../../types/CompanyType";
import { PaymentLinkOptionDict } from "../../usecases/Settings/Shopify/useConvertPaymentLinkOption";
import { ShopifySettingResponseType } from "../../../../api/StripePayment/fetchShopifySetting";

export class ShopifyCartService implements ShoppingCartServiceInterface {
  constructor(
    private storeStatus: ShopifyConfigsType | null,
    private storeSettings: ShopifySettingResponseType | null
  ) {}

  getDefaultVariantStock(product: ProductGenericType): number {
    return product.variantsOptions[0]?.stock ?? 0;
  }

  getDefaultVariantId(
    product: ProductGenericType
  ): string | number | undefined {
    return product.variantsOptions[0]?.id;
  }

  canUseDiscounts(): boolean {
    let isShopifyPaymentEnabled =
      this.storeStatus?.paymentLinkSetting?.isPaymentLinkEnabled ?? undefined;
    const isShopifyPaymentLink = this.storeStatus
      ? this.storeStatus.paymentLinkSetting?.isPaymentLinkEnabled &&
        this.storeStatus.paymentLinkSetting?.paymentLinkOption ===
          PaymentLinkOptionDict.Shopify
      : undefined;

    const isDiscountEnabled = this.storeSettings?.isEnabledDiscounts ?? false;

    return (
      isDiscountEnabled && !(isShopifyPaymentEnabled && isShopifyPaymentLink)
    );
  }

  getSelectedVariantOption(
    product: GenericCartItemType
  ): ProductVariantOptionGenericType {
    const idx = product.variants.findIndex(
      (v) => v.id === product.selectedVariantId
    );
    return product.variantsOptions[idx];
  }
}
