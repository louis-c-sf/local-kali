import { PaymentGatewayInterface } from "../../../../core/models/Ecommerce/Cart/ShoppingCartServiceInterface";
import { CustomStoreType } from "../../../../core/models/Ecommerce/Catalog/CustomStoreType";

export class StripePaymentGateway implements PaymentGatewayInterface {
  constructor(
    private companyStripeEnabled: boolean,
    private store: CustomStoreType | undefined
  ) {}

  canUsePayments(): boolean {
    const storeFlag = this.store?.is_payment_enabled ?? false;
    return storeFlag && this.companyStripeEnabled;
  }
}
