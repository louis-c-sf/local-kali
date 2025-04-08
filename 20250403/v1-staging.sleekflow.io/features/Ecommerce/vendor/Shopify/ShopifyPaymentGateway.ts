import { ShopifyConfigsType } from "../../../../types/CompanyType";
import { PaymentGatewayInterface } from "../../../../core/models/Ecommerce/Cart/ShoppingCartServiceInterface";

export class ShopifyPaymentGateway implements PaymentGatewayInterface {
  constructor(
    private storeStatus: ShopifyConfigsType | null,
    private currenciesBooted: string[],
    private selectedCurrency: string,
    private profilePhone: string | undefined
  ) {}

  canUsePayments(): boolean {
    if ((this?.profilePhone ?? "").trim() === "") {
      return false;
    }

    const isShopifyPaymentEnabled =
      this.storeStatus?.paymentLinkSetting?.isPaymentLinkEnabled ?? undefined;

    return isShopifyPaymentEnabled ?? true;
  }
}
