import type {
  SleekflowApisCommerceHubModelDiscount,
  TravisBackendIntegrationServicesModelsShopifyProduct,
  TravisBackendIntegrationServicesModelsShopifyProductVariant,
  TravisBackendStripeIntegrationDomainModelsStripePaymentLineItem,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { FormApi, FormOptions } from '@tanstack/react-form';
import { yupValidator } from '@tanstack/yup-form-adapter';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import * as Immutable from 'immutable';
import { interfaces } from 'inversify';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  filter,
  finalize,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
} from 'rxjs';

import { CartDiscountObj } from '@/services/commerces/custom-catalogs/models/cart-discount-obj';
import { ShopifyService } from '@/services/commerces/shopify/shopify.service';
import { DisposableDataSource } from '@/services/data-sources/disposable-data-source';
import { SleekpayService } from '@/services/sleekpay/sleekpay-service';
import { CurrencyMap } from '../../../api/types';
import { PaymentLinkDateValidator } from '../shared/PaymentLinkDateValidator';

export interface ShopifyCalculatedLineItem {
  line_item_pre_calculated_amount: number;
  line_item_calculated_amount: number;
  product_variant_id: number;
  product_id: number;
  quantity: number;
  line_item_discount?: SleekflowApisCommerceHubModelDiscount;
}

export interface ShopifyCartLineItem {
  product_snapshot: TravisBackendIntegrationServicesModelsShopifyProduct;
  product_variant_id: number;
  product_id: number;
  quantity: number;
  line_item_discount?: SleekflowApisCommerceHubModelDiscount;
}

export interface ShopifyCart {
  line_items: ShopifyCartLineItem[];
  cart_discount: SleekflowApisCommerceHubModelDiscount | undefined;
}

export interface ShopifyStoreModalViewModelProps {
  storeId: number;
  userProfileId: string;
}

export interface ShopifyCalculatedCart {
  calculated_line_items: Array<ShopifyCalculatedLineItem>;
  subtotal_price: number;
  total_price: number;
  store_id: number;
  line_items: Array<ShopifyCartLineItem>;
  cart_discount?: SleekflowApisCommerceHubModelDiscount;
}

export interface ShopifyStoreModalCaclculatedData {
  cart: ShopifyCalculatedCart;
  cartDiscountObj: CartDiscountObj;
}

export interface ShopifyStoreModalInputData {
  lineItems: ShopifyCartLineItem[];
  itemDiscountType: 'item-discounts-rate' | 'item-discounts-absolute';
  cartDiscount: SleekflowApisCommerceHubModelDiscount | undefined;
  paymentLinkExpiryDate: string;
}

export class ShopifyStoreModalViewModel implements DisposableDataSource {
  private readonly shopifyService: ShopifyService;
  private readonly sleekpayService: SleekpayService;

  private shopifyStoreModalViewModelProps:
    | ShopifyStoreModalViewModelProps
    | undefined = undefined;

  private isCalculatedCartLoading$$ = new BehaviorSubject<boolean>(false);

  private updateCartTrigger$$ = new BehaviorSubject<boolean>(true);
  private cart$$ = new BehaviorSubject<ShopifyCart | undefined>(undefined);
  private calculatedCart$$ = new BehaviorSubject<
    ShopifyCalculatedCart | undefined
  >(undefined);

  public form = new FormApi<ShopifyStoreModalInputData, typeof yupValidator>(
    this.getDefaultFormApiParams(),
  );

  private shopifyCartInputViewModelData$$ =
    new BehaviorSubject<ShopifyStoreModalInputData>({
      itemDiscountType: 'item-discounts-rate',
      paymentLinkExpiryDate: dayjs()
        .add(1, 'day')
        .startOf('minute')
        .toISOString(),
      lineItems: [],
      cartDiscount: undefined,
    });

  private supportedCurrencies$$ = new BehaviorSubject<CurrencyMap[]>([]);

  constructor(container: interfaces.Container) {
    this.shopifyService = container.get<ShopifyService>(ShopifyService);
    this.sleekpayService = container.get<SleekpayService>(SleekpayService);
  }

  observed(): boolean {
    return true;
  }

  disconnect(): void {
    // This is intentionally left blank as cart is managed by its own manager
  }

  disconnected(): boolean {
    return false;
  }

  getDisconnect$(): Observable<void> {
    return new Subject();
  }

  complete(): void {
    // This is intentionally left blank as cart is managed by its own manager
  }

  getComplete$(): Observable<void> {
    return new Subject();
  }

  public getDefaultFormApiParams() {
    const dateValidator = new PaymentLinkDateValidator('stripe');
    const defaultFormApiParams: FormOptions<
      ShopifyStoreModalInputData,
      typeof yupValidator
    > = {
      defaultValues: {
        lineItems: [],
        itemDiscountType: 'item-discounts-rate',
        cartDiscount: undefined,
        paymentLinkExpiryDate: dateValidator
          .getMinMaxPaymentDate()[1]
          .toISOString(),
      },
      validatorAdapter: yupValidator,
    };
    return defaultFormApiParams;
  }

  public setupAndGet$(
    shopifyStoreModalViewModelProps: ShopifyStoreModalViewModelProps,
  ) {
    const result = {
      calculatedCart$: this.calculatedCart$$.asObservable(),
      cart$: this.cart$$.asObservable(),
      cartDiscountObj$: this.calculatedCart$$.pipe(
        map((x) => {
          if (x) {
            return this.extractAsCartDiscountObj(x);
          }
          return null;
        }),
      ),
    };

    if (this.shopifyStoreModalViewModelProps) {
      return result;
    }
    this.form.mount();
    this.setup(shopifyStoreModalViewModelProps);
    this.form.store.subscribe(() => {
      this.updateCartTrigger$$.next(true);
    });

    const inputDataTrigger$ = this.updateCartTrigger$$.pipe(
      switchMap(() => {
        return of(this.form.state.values);
      }),
    );

    inputDataTrigger$.subscribe((data) => {
      let hasDuplicates = false;
      const newLineItems = data.lineItems.reduce(
        (acc, nextVal) => {
          const variantIndex = acc.findIndex(
            (x) => x.product_variant_id === nextVal.product_variant_id,
          );
          if (variantIndex !== -1) {
            hasDuplicates = true;
            acc[variantIndex].quantity += nextVal.quantity;
          } else {
            acc.push(nextVal);
          }

          return acc;
        },
        [] as ShopifyStoreModalInputData['lineItems'],
      );

      if (hasDuplicates) {
        this.form.setFieldValue('lineItems', newLineItems);
      }

      this.isCalculatedCartLoading$$.next(true);
      this.cart$$.next({
        line_items: data.lineItems,
        cart_discount: data.cartDiscount,
      });

      this.isCalculatedCartLoading$$.next(false);
    });

    this.cart$$.subscribe((data) => {
      if (data) {
        this.calculatedCart$$.next(
          this.getCalculatedCart(data.line_items, data.cart_discount),
        );
      }
    });

    this.sleekpayService
      .getSupportedCurrencies$()
      .subscribe((supportedCurrencies) => {
        this.supportedCurrencies$$.next(supportedCurrencies);
      });

    return result;
  }

  public getDiscountMode({
    cartDiscount,
    lineItems,
  }: {
    cartDiscount: ShopifyStoreModalInputData['cartDiscount'];
    lineItems: ShopifyStoreModalInputData['lineItems'];
  }) {
    if (cartDiscount) {
      return 'order-discount-rate';
    }
    if (
      lineItems.some(
        (li) =>
          li.line_item_discount && li.line_item_discount.type === 'RateOff',
      )
    ) {
      return 'item-discounts-rate';
    }
    if (
      lineItems.some(
        (li) =>
          li.line_item_discount && li.line_item_discount.type === 'AbsoluteOff',
      )
    ) {
      return 'item-discounts-absolute';
    }
    return 'no-discount';
  }

  public updateCartItemQuantity({
    productId,
    productVariantId,
    quantity,
    product,
  }: {
    productVariantId: number;
    productId: number;
    quantity: (lineItem: ShopifyCartLineItem | undefined) => number;
    product: TravisBackendIntegrationServicesModelsShopifyProduct;
  }) {
    const currentLineItems = this.form.getFieldValue('lineItems');
    const currentLineItemIndex = currentLineItems.findIndex((x) => {
      return x.product_variant_id === productVariantId!;
    });
    if (currentLineItemIndex !== -1) {
      const targetCartItem = currentLineItems[currentLineItemIndex];
      this.form.setFieldValue(
        `lineItems[${currentLineItemIndex}].quantity`,
        quantity(targetCartItem),
      );
    } else {
      this.form.pushFieldValue('lineItems', {
        product_snapshot: product,
        product_variant_id: productVariantId,
        product_id: productId!,
        quantity: quantity(undefined),
        line_item_discount: undefined,
      });
    }
  }

  public setDiscountMode(
    mode:
      | 'no-discount'
      | 'item-discounts-rate'
      | 'item-discounts-absolute'
      | 'order-discount-rate',
  ) {
    if (mode === 'no-discount') {
      this.form.setFieldValue('cartDiscount', undefined);
      this.form.getFieldValue('lineItems').forEach((_, index) => {
        this.form.setFieldValue(
          `lineItems[${index}].line_item_discount`,
          undefined,
        );
      });
    } else if (mode === 'order-discount-rate') {
      this.form.setFieldValue('cartDiscount', {
        title: undefined,
        description: undefined,
        value: 0,
        type: 'RateOff',
        metadata: {},
      });
      this.form.getFieldValue('lineItems').forEach((_, index) => {
        this.form.setFieldValue(
          `lineItems[${index}].line_item_discount`,
          undefined,
        );
      });
    } else if (mode === 'item-discounts-rate') {
      this.form.setFieldValue('itemDiscountType', 'item-discounts-rate');
      this.form.setFieldValue('cartDiscount', undefined);
      this.form.state.values.lineItems.forEach((_, index) => {
        this.form.setFieldValue(`lineItems[${index}].line_item_discount`, {
          title: undefined,
          description: undefined,
          value: 0,
          type: 'RateOff',
          metadata: {},
        });
      });
    } else if (mode === 'item-discounts-absolute') {
      this.form.setFieldValue('itemDiscountType', 'item-discounts-absolute');
      this.form.setFieldValue('cartDiscount', undefined);
      this.form.state.values.lineItems.forEach((_, index) => {
        this.form.setFieldValue(`lineItems[${index}].line_item_discount`, {
          title: undefined,
          description: undefined,
          value: 0,
          type: 'AbsoluteOff',
          metadata: {},
        });
      });
    } else {
      throw new Error(`setDiscountMode - Invalid mode ${mode}`);
    }
  }

  public setCartDiscountRate$(percentage: number) {
    return this.shopifyCartInputViewModelData$$.pipe(
      take(1),
      map((inputData) => {
        this.onNextShopifyStoreModalInputViewModelData({
          ...inputData!,
          cartDiscount: {
            title: undefined,
            description: undefined,
            value: percentage / 100,
            type: 'RateOff',
            metadata: {},
          },
        });

        return inputData;
      }),
    );
  }

  public setCartItemDiscountValue$(
    product_variant_id: number,
    value: number,
    type: 'RateOff' | 'AbsoluteOff',
    product_variant_snapshot?: TravisBackendIntegrationServicesModelsShopifyProductVariant,
  ) {
    return this.shopifyCartInputViewModelData$$.pipe(
      take(1),
      map((inputData) => {
        this.onNextShopifyStoreModalInputViewModelData({
          ...inputData!,
          lineItems: inputData!.lineItems.map((li) => {
            if (li.product_variant_id !== product_variant_id) {
              return li;
            }

            if (type === 'RateOff' && value > 0.99) {
              value = 0.99;
            }

            if (type === 'RateOff' && value < 0) {
              value = 0;
            }

            if (type === 'AbsoluteOff' && value < 0) {
              value = 0;
            }

            if (type === 'AbsoluteOff' && product_variant_snapshot) {
              const price = product_variant_snapshot.price || 0;

              if (value > price) {
                value = price;
              }
            }

            return {
              ...li,
              line_item_discount: {
                title: undefined,
                description: undefined,
                value: value,
                type: type,
                metadata: {},
              },
            };
          }),
        });

        return inputData;
      }),
    );
  }

  private onNextShopifyStoreModalInputViewModelData(
    shopifyStoreModalInputViewModelData: ShopifyStoreModalInputData,
  ) {
    shopifyStoreModalInputViewModelData.lineItems.forEach((lineItem) => {
      if (
        lineItem.line_item_discount &&
        lineItem.line_item_discount.type === 'RateOff'
      ) {
        if (
          lineItem.line_item_discount.value &&
          lineItem.line_item_discount.value > 0.99
        ) {
          lineItem.line_item_discount.value = 0.99;
        }

        if (
          lineItem.line_item_discount.value &&
          lineItem.line_item_discount.value < 0
        ) {
          lineItem.line_item_discount.value = 0;
        }
      }

      if (
        lineItem.line_item_discount &&
        lineItem.line_item_discount.type === 'AbsoluteOff'
      ) {
        if (
          lineItem.line_item_discount.value &&
          lineItem.line_item_discount.value < 0
        ) {
          lineItem.line_item_discount.value = 0;
        }
      }
    });

    if (shopifyStoreModalInputViewModelData.cartDiscount) {
      if (shopifyStoreModalInputViewModelData.cartDiscount.type === 'RateOff') {
        if (
          shopifyStoreModalInputViewModelData.cartDiscount.value &&
          shopifyStoreModalInputViewModelData.cartDiscount.value > 0.99
        ) {
          shopifyStoreModalInputViewModelData.cartDiscount.value = 0.99;
        }

        if (
          shopifyStoreModalInputViewModelData.cartDiscount.value &&
          shopifyStoreModalInputViewModelData.cartDiscount.value < 0
        ) {
          {
            shopifyStoreModalInputViewModelData.cartDiscount.value = 0;
          }
        }
      }

      if (
        shopifyStoreModalInputViewModelData.cartDiscount.type === 'AbsoluteOff'
      ) {
        if (
          shopifyStoreModalInputViewModelData.cartDiscount.value &&
          shopifyStoreModalInputViewModelData.cartDiscount.value < 0
        ) {
          shopifyStoreModalInputViewModelData.cartDiscount.value = 0;
        }
      }
    }

    this.shopifyCartInputViewModelData$$.next(
      shopifyStoreModalInputViewModelData,
    );
  }

  private setup(
    shopifyStoreModalViewModelProps: ShopifyStoreModalViewModelProps,
  ) {
    this.shopifyStoreModalViewModelProps = shopifyStoreModalViewModelProps;
  }

  public getIsCalculatedCartLoading$(): Observable<boolean> {
    return this.isCalculatedCartLoading$$.asObservable();
  }

  private extractAsCartDiscountObj(
    cart: ShopifyCalculatedCart,
  ): CartDiscountObj {
    const productVariantIdToDiscount = cart.line_items!.reduce(
      (map, lineItem) => {
        const discount = lineItem.line_item_discount;
        if (discount) {
          map[lineItem.product_variant_id!] = discount;
        }
        return map;
      },
      {} as {
        [productVariantId: string]: SleekflowApisCommerceHubModelDiscount;
      },
    );
    if (
      Object.keys(productVariantIdToDiscount).length > 0 &&
      Object.values(productVariantIdToDiscount).every(
        (x) => x.type === 'RateOff',
      )
    ) {
      return {
        type: 'item-discounts-rate',
        productVariantIdToDiscount: Immutable.Map<
          string,
          SleekflowApisCommerceHubModelDiscount
        >(productVariantIdToDiscount),
        cartDiscount: undefined,
      };
    }
    if (
      Object.keys(productVariantIdToDiscount).length > 0 &&
      Object.values(productVariantIdToDiscount).every(
        (x) => x.type === 'AbsoluteOff',
      )
    ) {
      return {
        type: 'item-discounts-absolute',
        productVariantIdToDiscount: Immutable.Map<
          string,
          SleekflowApisCommerceHubModelDiscount
        >(productVariantIdToDiscount),
        cartDiscount: undefined,
      };
    }
    if (cart.cart_discount) {
      return {
        type: 'order-discount-rate',
        productVariantIdToDiscount: Immutable.Map<
          string,
          SleekflowApisCommerceHubModelDiscount
        >(),
        cartDiscount: cart.cart_discount,
      };
    }

    return {
      type: 'no-discount',
      productVariantIdToDiscount: Immutable.Map<
        string,
        SleekflowApisCommerceHubModelDiscount
      >(),
      cartDiscount: undefined,
    };
  }

  public roundUpToTwoDecimalPlaces(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private getCalculatedCart(
    inputLineItems: ShopifyCartLineItem[],
    inputCartDiscount: SleekflowApisCommerceHubModelDiscount | undefined,
  ): ShopifyCalculatedCart {
    const lineItems = inputLineItems.filter(
      (lineItem) => lineItem.quantity > 0,
    );

    const calculatedLineItems = lineItems.map((lineItem) => {
      const productVariant = lineItem.product_snapshot.variants!.find(
        (variant) => variant.id === lineItem.product_variant_id,
      );

      const productVariantPrice = productVariant?.price;

      if (productVariantPrice === undefined || productVariantPrice === null) {
        throw new Error('Product variant price not found');
      }

      let postCalculatedPerItemAmount = productVariantPrice;

      postCalculatedPerItemAmount = this.applyDiscount(
        postCalculatedPerItemAmount,
        lineItem.line_item_discount,
      );
      postCalculatedPerItemAmount = this.applyDiscount(
        postCalculatedPerItemAmount,
        inputCartDiscount,
      );
      postCalculatedPerItemAmount = this.roundUpToTwoDecimalPlaces(
        postCalculatedPerItemAmount,
      );

      return {
        line_item_pre_calculated_amount: this.roundUpToTwoDecimalPlaces(
          productVariantPrice * lineItem.quantity,
        ),
        line_item_calculated_amount: this.roundUpToTwoDecimalPlaces(
          postCalculatedPerItemAmount * lineItem.quantity,
        ),
        product_variant_id: lineItem.product_variant_id,
        product_id: lineItem.product_id,
        quantity: lineItem.quantity,
        line_item_discount: lineItem.line_item_discount,
      };
    });

    const { subtotal_price, total_price } = calculatedLineItems.reduce(
      (acc, calculatedLineItem) => ({
        subtotal_price:
          acc.subtotal_price +
          calculatedLineItem.line_item_pre_calculated_amount,
        total_price:
          acc.total_price + calculatedLineItem.line_item_calculated_amount,
      }),
      { subtotal_price: 0, total_price: 0 },
    );

    const cart: ShopifyCalculatedCart = {
      calculated_line_items: calculatedLineItems,
      subtotal_price: this.roundUpToTwoDecimalPlaces(subtotal_price),
      total_price: this.roundUpToTwoDecimalPlaces(total_price),
      store_id: this.shopifyStoreModalViewModelProps!.storeId!,
      line_items: lineItems,
      cart_discount: inputCartDiscount,
    };

    return cart;
  }

  private applyRateOffDiscount(amount: number, discount: number): number {
    return amount * (1 - discount);
  }

  private applyAbsoluteOffDiscount(amount: number, discount: number): number {
    return amount - discount;
  }

  private applyDiscount(
    amount: number,
    discount?: SleekflowApisCommerceHubModelDiscount,
  ): number {
    if (!discount) return amount;

    switch (discount.type) {
      case 'RateOff':
        return this.applyRateOffDiscount(amount, discount.value!);
      case 'AbsoluteOff':
        return this.applyAbsoluteOffDiscount(amount, discount.value!);
      default:
        return amount;
    }
  }

  private getTextFromHtml(html: string) {
    const purifiedHtml = DOMPurify.sanitize(html);

    return purifiedHtml
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n/g, '\n');
  }

  public generateStripePaymentLink$({
    inputData,
  }: {
    inputData: ShopifyStoreModalInputData;
  }) {
    this.isCalculatedCartLoading$$.next(true);
    return of({ ...inputData }).pipe(
      switchMap((value) => {
        return this.calculatedCart$$.pipe(
          take(1),
          map((calculatedCart) => {
            return { calculatedCart, inputData: value };
          }),
        );
      }),
      switchMap(({ inputData }) => {
        return combineLatest({
          calculatedCart: of(
            this.getCalculatedCart(inputData.lineItems, inputData.cartDiscount),
          ),
          inputData: of(inputData),
          store: this.shopifyService.getShopifyStores$().pipe(
            take(1),
            map((stores) => {
              return stores.find(
                (store) =>
                  store.id === this.shopifyStoreModalViewModelProps!.storeId,
              );
            }),
          ),
        });
      }),
      switchMap(({ calculatedCart, inputData, store }) => {
        const expiredAt = dayjs(inputData.paymentLinkExpiryDate);

        const platformCountry = this.supportedCurrencies$$.value
          .find(
            (c) =>
              c.currency.toUpperCase() ===
              (store?.currency?.toUpperCase() ?? ''),
          )
          ?.platformCountry.toUpperCase();

        return combineLatest({
          paymentLinkObj: this.sleekpayService.generateSleekpayPaymentLink$(
            calculatedCart.calculated_line_items!.map((lineItem) => {
              const productSnapshot:
                | TravisBackendIntegrationServicesModelsShopifyProduct
                | undefined = calculatedCart.line_items?.find(
                (i) => i.product_variant_id === lineItem.product_variant_id,
              )?.product_snapshot;
              if (productSnapshot === undefined) {
                throw new Error('The product snapshot not found');
              }

              const myLineItem: TravisBackendStripeIntegrationDomainModelsStripePaymentLineItem =
                {
                  name: productSnapshot.title,
                  description: this.getTextFromHtml(
                    productSnapshot?.body_html || '',
                  ),
                  amount:
                    lineItem.line_item_pre_calculated_amount! /
                    lineItem.quantity!,
                  quantity: lineItem.quantity!,
                  currency: store!.currency!,
                  imageUrls:
                    productSnapshot.images!.length > 0
                      ? productSnapshot.images!.map((i) => i.src!)
                      : [],
                  metadata: {
                    variantId: lineItem.product_variant_id.toString(),
                  },
                  totalDiscount:
                    (lineItem.line_item_pre_calculated_amount! -
                      lineItem.line_item_calculated_amount!) /
                    lineItem.quantity!,
                };

              return myLineItem;
            }),
            expiredAt,
            platformCountry ?? 'HK',
            this.shopifyStoreModalViewModelProps!.userProfileId,
            store!.id,
          ),
          paymentMessageTemplate:
            this.sleekpayService.getPaymentMessageTemplate(),
        }).pipe(
          map(({ paymentLinkObj, paymentMessageTemplate }) => {
            return {
              paymentLink: paymentLinkObj.paymentLink,
              paymentIntentId: paymentLinkObj.paymentIntentId,
              paymentMessage: paymentMessageTemplate.messageBody.replace(
                '{0}',
                paymentLinkObj.paymentLink,
              ),
            };
          }),
        );
      }),
      finalize(() => {
        this.isCalculatedCartLoading$$.next(false);
      }),
    );
  }

  public generateShopifyPaymentLink$() {
    this.isCalculatedCartLoading$$.next(false);
    return this.calculatedCart$$.pipe(take(1)).pipe(
      switchMap((calculatedCart) => {
        if (!calculatedCart) {
          return EMPTY;
        }
        return combineLatest({
          draftOrder: this.shopifyService.createShopifyDraftOrder$(
            this.shopifyStoreModalViewModelProps!.storeId,
            this.shopifyStoreModalViewModelProps!.userProfileId,
            calculatedCart.calculated_line_items.map((calculatedLineItem) => {
              return {
                variantId: calculatedLineItem.product_variant_id,
                quantity: calculatedLineItem.quantity,
                discountOption: {},
              };
            }),
          ),
          paymentMessageTemplate:
            this.sleekpayService.getPaymentMessageTemplate(),
        });
      }),
      map(({ draftOrder, paymentMessageTemplate }) => {
        return {
          paymentLink: draftOrder.sleekflow_url,
          paymentMessage: paymentMessageTemplate.messageBody.replace(
            '{0}',
            draftOrder.sleekflow_url,
          ),
        };
      }),
      finalize(() => {
        this.isCalculatedCartLoading$$.next(false);
      }),
    );
  }

  public shareCartItems$() {
    this.isCalculatedCartLoading$$.next(true);

    return this.calculatedCart$$.pipe(
      take(1),
      switchMap((calculatedCart) => {
        if (!calculatedCart) {
          return EMPTY;
        }

        return combineLatest(
          calculatedCart.calculated_line_items.map((calculatedLineItem) => {
            return this.shopifyService.getShopifyProductSharedTemplate$(
              this.shopifyStoreModalViewModelProps!.storeId,
              calculatedCart.line_items.find(
                (i) =>
                  i.product_variant_id ===
                  calculatedLineItem.product_variant_id,
              )!.product_snapshot,
              this.shopifyStoreModalViewModelProps!.userProfileId,
              calculatedLineItem.product_variant_id,
            );
          }),
        );
      }),
      finalize(() => {
        this.isCalculatedCartLoading$$.next(false);
      }),
    );
  }

  public shareCartItem$(productVariantId: number) {
    this.isCalculatedCartLoading$$.next(true);

    return this.calculatedCart$$.pipe(
      filter((x) => {
        return Boolean(x);
      }),
      take(1),
      switchMap((calculatedCart) => {
        if (!calculatedCart) {
          return EMPTY;
        }

        const lineItem = calculatedCart.line_items?.find(
          (i) => i.product_variant_id === productVariantId,
        );

        if (lineItem?.product_snapshot) {
          return this.shopifyService.getShopifyProductSharedTemplate$(
            this.shopifyStoreModalViewModelProps!.storeId,
            lineItem.product_snapshot,
            this.shopifyStoreModalViewModelProps!.userProfileId,
            productVariantId,
          );
        }

        return EMPTY;
      }),
    );
  }

  public shareProductVariant$(
    productVariant: TravisBackendIntegrationServicesModelsShopifyProductVariant,
    product: TravisBackendIntegrationServicesModelsShopifyProduct,
  ) {
    this.isCalculatedCartLoading$$.next(true);

    return this.shopifyService
      .getShopifyProductSharedTemplate$(
        this.shopifyStoreModalViewModelProps!.storeId,
        product,
        this.shopifyStoreModalViewModelProps!.userProfileId,
        productVariant.id!,
      )
      .pipe(
        finalize(() => {
          this.isCalculatedCartLoading$$.next(false);
        }),
      );
  }
}
