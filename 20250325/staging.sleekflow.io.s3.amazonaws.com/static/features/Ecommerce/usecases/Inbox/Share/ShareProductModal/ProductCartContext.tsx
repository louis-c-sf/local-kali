import { ProductProviderInterface } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { LinkSharingServiceInterface } from "core/models/Ecommerce/Cart/LinkSharingServiceInterface";
import {
  ShoppingCartServiceInterface,
  PaymentGatewayInterface,
} from "core/models/Ecommerce/Cart/ShoppingCartServiceInterface";
import { useShopifyCartBoot } from "features/Ecommerce/vendor/Shopify/useShopifyCartBoot";
import { useCommerceHubCartBoot } from "features/Ecommerce/vendor/CommerceHub/useCommerceHubCartBoot";
import { useShopifyContextFactory } from "features/Ecommerce/vendor/Shopify/useShopifyContextFactory";
import { useCommerceHubContextFactory } from "features/Ecommerce/vendor/CommerceHub/useCommerceHubContextFactory";
import { usePaymentsPolicy } from "../../../../../../core/policies/Ecommerce/Payments/usePaymentsPolicy";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../../AppRootContext";
import { useFlashMessageChannel } from "../../../../../../component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/browser";

export type ShoppingVendorType = "shopify" | "commerceHub";

export interface BootableCartContextType {
  vendor: ShoppingVendorType;
  productProvider: ProductProviderInterface;
  linkSharingService: LinkSharingServiceInterface;
  shoppingCartService: ShoppingCartServiceInterface;
  paymentGateway: PaymentGatewayInterface;
}
export interface ProductCartContextType extends BootableCartContextType {
  currenciesBooted: string[] | undefined;
  selectedCurrency: string | undefined;
  /** @deprecated temp field */
  isShopifyPaymentLink: boolean | undefined;
  /** @deprecated temp field */
  isShopifyStatusLoading: boolean;
}

const InternalContext = React.createContext<ProductCartContextType | null>(
  null
);

const PAGE_SIZE = 20;
const PAGE_GROUP_SIZE = 8;

export function ProductCartContext<TVendor extends ShoppingVendorType>(props: {
  service: TVendor;
  storeId: string | number;
  children: ReactNode;
}) {
  const loginDispatch = useAppDispatch();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const [currenciesBooted, setCurrenciesBooted] = useState<string[]>();

  const selectedCurrency = useAppSelector((s) =>
    s.inbox.product?.currency?.toUpperCase()
  ) as string;

  const userProfileId = useAppSelector((s) => s.profile.id);
  const paymentsPolicy = usePaymentsPolicy();
  const shopifyBoot = useShopifyCartBoot({
    storeId: props.service === "shopify" ? (props.storeId as number) : null,
  });

  const shopifyContext = useShopifyContextFactory({
    defaultCurrency: shopifyBoot.defaultShopifyCurrency,
    pageSize: PAGE_SIZE,
    storeSettings: shopifyBoot.settings,
    storeStatus: shopifyBoot.storeStatus,
    selectedCurrency,
    currenciesBooted: currenciesBooted ?? [],
  });

  const commerceHubBoot = useCommerceHubCartBoot({
    storeId: props.service === "commerceHub" ? (props.storeId as string) : null,
  });

  const commerceHubContext = useCommerceHubContextFactory({
    storeId: props.storeId as string,
    pageGroupSize: PAGE_GROUP_SIZE,
    pageSize: PAGE_SIZE,
    store: commerceHubBoot.store,
  });

  const contextData =
    props.service === "shopify" ? shopifyContext : commerceHubContext;

  useEffect(() => {
    if (props.service === "shopify" && !shopifyBoot.booted) {
      shopifyBoot.boot().catch((e) => {
        loginDispatch({
          type: "INBOX.SHOPIFY_MODAL.CLOSE",
          storeId: props.storeId,
          userProfileId: userProfileId,
          vendor: "shopify",
        });
        flash(t("system.error.unknown"));
        Sentry.captureException(e);
      });
    } else if (props.service === "commerceHub" && !commerceHubBoot.booted) {
      commerceHubBoot.boot().catch((e) => {
        loginDispatch({
          type: "INBOX.SHOPIFY_MODAL.CLOSE",
          storeId: props.storeId,
          userProfileId: userProfileId,
          vendor: "commerceHub",
        });
        flash(t("system.error.unknown"));
        Sentry.captureException(e);
      });
    }
  }, [
    props.service,
    shopifyBoot.booted,
    commerceHubBoot.booted,
    userProfileId,
  ]);

  const contextValueSelected =
    props.service === "shopify" ? shopifyContext : commerceHubContext;

  useEffect(() => {
    if (currenciesBooted !== undefined) {
      return;
    }

    contextValueSelected.productProvider
      .fetchCurrencies(props.storeId)
      .then((currencies) => {
        setCurrenciesBooted(currencies);
        loginDispatch({
          type: "INBOX.CART.UPDATE.CURRENCY",
          currency:
            contextValueSelected.productProvider.getDefaultCurrency(currencies),
        });
      })
      .catch(console.error);
  }, [props.service, currenciesBooted?.join()]);

  return (
    <InternalContext.Provider
      value={{
        ...contextValueSelected,
        paymentGateway: new PolicyAwarePaymentGateway(
          contextValueSelected.paymentGateway,
          paymentsPolicy.canUseCommercePayments
        ),
        selectedCurrency,
        currenciesBooted,
        isShopifyStatusLoading: shopifyBoot.isShopifyStatusLoading,
        isShopifyPaymentLink: shopifyBoot.isShopifyPaymentLink,
      }}
    >
      {props.children}
    </InternalContext.Provider>
  );
}

export function useProductCartContext() {
  const context = useContext(InternalContext);
  if (context === null) {
    throw "Please initialize <ProductCartContext /> first";
  }
  return context;
}

class PolicyAwarePaymentGateway implements PaymentGatewayInterface {
  constructor(
    private wrapped: PaymentGatewayInterface,
    private isPaymentAllowedByPolicy: boolean
  ) {}

  canUsePayments(): boolean {
    return this.isPaymentAllowedByPolicy && this.wrapped.canUsePayments();
  }
}
