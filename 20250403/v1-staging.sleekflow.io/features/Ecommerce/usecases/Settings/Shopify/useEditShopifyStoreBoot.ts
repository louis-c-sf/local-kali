import { useState } from "react";
import { ShopifyStoreFormType } from "features/Ecommerce/usecases/Settings/Shopify/useEditShopifyStoreForm";
import {
  fetchStripeMessageTemplate,
  MessageTypeEnum,
  StripeMessageTemplateType,
} from "api/Stripe/fetchStripeMessageTemplate";
import { fetchShopifyStore } from "api/Stripe/fetchShopifyStore";
import { ShopifyStoreResponseType } from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";

export function useEditShopifyStoreBoot(props: { id: number }) {
  const [booted, setBooted] = useState<{
    form: ShopifyStoreFormType;
    store: ShopifyStoreResponseType;
    template: StripeMessageTemplateType | null;
  }>();

  async function boot(countryCode: string | null) {
    const [templatesData, store] = await Promise.all([
      countryCode
        ? fetchStripeMessageTemplate(countryCode)
        : Promise.resolve([]),
      fetchShopifyStore(props.id),
    ]);
    const productTemplate = templatesData.find(
      (m) => m.messageType === MessageTypeEnum.product
    );

    setBooted({
      form: {
        sharingMessageTemplate: productTemplate?.messageBody ?? null,
        name: store.name,
        active: store.isShowInInbox,
      },
      store: store,
      template: productTemplate ?? null,
    });
  }

  return {
    booted,
    boot,
  };
}
