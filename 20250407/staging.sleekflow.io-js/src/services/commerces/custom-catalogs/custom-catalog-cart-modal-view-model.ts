import type {
  SleekflowApisCommerceHubModelCalculatedCartDto,
  SleekflowApisCommerceHubModelCalculatedLineItem,
  SleekflowApisCommerceHubModelCartDto,
  SleekflowApisCommerceHubModelCartLineItem,
  SleekflowApisCommerceHubModelCurrencyDto,
  SleekflowApisCommerceHubModelLanguageDto,
  SleekflowApisCommerceHubModelProductVariantDto,
  SleekflowApisCommerceHubModelDiscount,
  TravisBackendStripeIntegrationDomainModelsStripePaymentLineItem,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { FormApi, FieldApi, FormOptions } from '@tanstack/react-form';
import { yupValidator } from '@tanstack/yup-form-adapter';
import dayjs from 'dayjs';
import * as Immutable from 'immutable';
import { interfaces } from 'inversify';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
  throttleTime,
} from 'rxjs';
import * as yup from 'yup';

import { formatCurrency } from '@/i18n/number/formatCurrency';
import { UnifiedMessageCommerceHubSharedProduct } from '@/services/conversation-inputs/my-conversation-input-view-model';
import { OnlineManagerService } from '@/services/online-manager/online-manager.service';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';
import { SleekpayService } from '@/services/sleekpay/sleekpay-service';

import { DisposableDataSource } from '../../data-sources/disposable-data-source';
import { CustomCatalogService } from './custom-catalog.service';
import { CartDiscountObj } from './models/cart-discount-obj';
import { CurrencyMap } from '../../../api/types';
import { TFunction } from 'i18next';
import { PaymentLinkDateValidator } from '../shared/PaymentLinkDateValidator';

export interface CustomCatalogCartModalViewModelProps {
  storeId: string;
  userProfileId: string;
}

export interface CustomCatalogCartModalInputData {
  lineItems: SleekflowApisCommerceHubModelCartLineItem[];
  itemDiscountType: 'item-discounts-rate' | 'item-discounts-absolute';
  cartDiscount: SleekflowApisCommerceHubModelDiscount | undefined;
  paymentLinkExpiryDate: string;
  currency: SleekflowApisCommerceHubModelCurrencyDto | '';
  language: SleekflowApisCommerceHubModelLanguageDto | '';
  isCurrencySupported: boolean;
}

export function dateTimeValidation(
  t: TFunction,
  validator: PaymentLinkDateValidator,
) {
  return ({ fieldApi }: { fieldApi: FieldApi<any, any> }) => {
    if (!validator.validate(fieldApi.getValue())) {
      return t('conversation-input.payment-modal.error.date-time', {
        defaultValue: 'invalid expiry date and time',
      });
    }
  };
}

export const itemDicountRateInputSchema = yup
  .number()
  .required()
  .min(0)
  .max(0.99);

export const orderDiscountRateInputSchema = yup
  .number()
  .required()
  .min(0)
  .max(1);

export const cartDiscountAbsoluteValueInput = yup.number().required().min(0);

export class CustomCatalogCartModalViewModel implements DisposableDataSource {
  private readonly customCatalogService: CustomCatalogService;
  private readonly sleekpayService: SleekpayService;

  private updateCartTrigger$$ = new BehaviorSubject<boolean>(true);
  public form = new FormApi<
    CustomCatalogCartModalInputData,
    typeof yupValidator
  >(this.getDefaultFormApiParams());

  private onlineManagerService: OnlineManagerService;

  private customCatalogCartModalViewModelProps:
    | CustomCatalogCartModalViewModelProps
    | undefined = undefined;

  private isCalculatedCartLoading$$ = new BehaviorSubject<boolean>(false);
  private updateCartError$$ = new BehaviorSubject<boolean>(false);

  private cart$$ = new BehaviorSubject<
    SleekflowApisCommerceHubModelCartDto | undefined
  >(undefined);
  private calculatedCart$$ = new BehaviorSubject<
    SleekflowApisCommerceHubModelCalculatedCartDto | undefined
  >(undefined);
  private supportedCurrencies$$ = new BehaviorSubject<CurrencyMap[]>([]);

  constructor(container: interfaces.Container) {
    this.onlineManagerService =
      container.get<OnlineManagerService>(OnlineManagerService);
    this.customCatalogService =
      container.get<CustomCatalogService>(CustomCatalogService);
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
      CustomCatalogCartModalInputData,
      typeof yupValidator
    > = {
      defaultValues: {
        isCurrencySupported: false,
        currency: '',
        language: '',
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
    customCatalogCartModalViewModelProps: CustomCatalogCartModalViewModelProps,
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
    if (this.customCatalogCartModalViewModelProps) {
      return result;
    }
    this.form.mount();
    this.setup(customCatalogCartModalViewModelProps);
    this.form.store.subscribe(() => {
      this.updateCartTrigger$$.next(true);
    });

    const inputDataTrigger$ = merge(
      this.updateCartTrigger$$,
      this.onlineManagerService.online$.pipe(filter((x) => x)),
    ).pipe(
      switchMap(() => {
        return of(this.form.state.values);
      }),
    );

    inputDataTrigger$
      .pipe(
        throttleTime(1),
        distinctUntilChanged((a, b) => {
          return (
            (a.currency !== '' ? a.currency?.currency_iso_code : '') ===
            (b.currency !== '' ? b.currency?.currency_iso_code : '')
          );
        }),
        switchMap((inputData) => {
          if (inputData.currency !== '') {
            const currencyISOCode = inputData.currency?.currency_iso_code;
            if (currencyISOCode) {
              return this.isSupportedCurrency$(currencyISOCode);
            }
          }
          return of(false);
        }),
      )
      .subscribe((x) => {
        this.form.setFieldValue('isCurrencySupported', x);
      });

    // updates cart periodically on change in the background to keep server up to date
    inputDataTrigger$
      .pipe(
        tap(() => {
          this.isCalculatedCartLoading$$.next(true);
        }),
        // subscribe from form spams quite a bit throttleTime de-dups the spamming
        debounceTime(500),
        tap(() => {
          this.updateCartError$$.next(false);
        }),
        switchMap((data) => {
          return this.customCatalogService
            .updateCart$(
              this.customCatalogCartModalViewModelProps!.storeId!,
              this.customCatalogCartModalViewModelProps!.userProfileId,
              data.lineItems.filter(
                (li) => li.quantity !== undefined && li.quantity > 0,
              ),
              data.cartDiscount,
            )
            .pipe(
              map((cart: SleekflowApisCommerceHubModelCartDto) => {
                return {
                  cart,
                  inputData: data,
                };
              }),
              catchError(() => {
                this.updateCartError$$.next(true);
                // catch error to keep outside observable alive
                return of({
                  inputData: data,
                  cart: null,
                });
              }),
            );
        }),
        tap((data) => {
          if (data.cart) {
            this.cart$$.next(data.cart);
          }
        }),
        filter((data) => {
          // cannot calculate cart if currency and language is not set
          const currency = data.inputData.currency;
          const language = data.inputData.language;
          return Boolean(
            currency !== '' &&
              currency?.currency_iso_code &&
              language !== '' &&
              language?.language_iso_code,
          );
        }),
        switchMap((cart) => {
          return this.getCalculatedCart$(
            this.customCatalogCartModalViewModelProps!.storeId!,
            this.customCatalogCartModalViewModelProps!.userProfileId,
            (
              cart.inputData
                .currency as SleekflowApisCommerceHubModelCurrencyDto
            ).currency_iso_code!,
            (
              cart.inputData
                .language as SleekflowApisCommerceHubModelLanguageDto
            ).language_iso_code!,
          ).pipe(
            catchError(() => {
              this.updateCartError$$.next(true);
              // catch error to keep outside observable alive
              return of(null);
            }),
          );
        }),
      )
      .subscribe(
        (cart) => {
          this.isCalculatedCartLoading$$.next(false);
          if (cart) {
            // refreshes calculated cart on change
            this.calculatedCart$$.next(cart);
          }
        },
        (err) => {
          console.log('CATCH ERROR', err);
        },
      );

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
    cartDiscount: CustomCatalogCartModalInputData['cartDiscount'];
    lineItems: CustomCatalogCartModalInputData['lineItems'];
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

  private setup(
    customCatalogCartModalViewModelProps: CustomCatalogCartModalViewModelProps,
  ) {
    this.customCatalogCartModalViewModelProps =
      customCatalogCartModalViewModelProps;
  }

  public roundUpToTwoDecimalPlaces(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private getCalculatedCart$(
    storeId: string,
    userProfileId: string,
    currencyIsoCode: string,
    languageIsoCode: string,
  ) {
    return this.customCatalogService
      .getCart$(storeId, userProfileId, currencyIsoCode, languageIsoCode)
      .pipe(
        map((calculatedCart) => {
          calculatedCart.subtotal_price = this.roundUpToTwoDecimalPlaces(
            calculatedCart.subtotal_price || 0,
          );
          calculatedCart.total_price = this.roundUpToTwoDecimalPlaces(
            calculatedCart.total_price || 0,
          );

          return calculatedCart;
        }),
        RxjsUtils.getRetryAPIRequest(),
      );
  }

  public getIsCalculatedCartLoading$(): Observable<boolean> {
    return this.isCalculatedCartLoading$$.asObservable();
  }

  public getUpdateCartError$(): Observable<boolean> {
    return this.updateCartError$$.asObservable();
  }

  public updateCartItemQuantity({
    productId,
    productVariantId,
    quantity,
  }: {
    productVariantId: string;
    productId: string;
    quantity: (
      lineItem: SleekflowApisCommerceHubModelCartLineItem | undefined,
    ) => number;
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
        product_id: productId!,
        product_variant_id: productVariantId,
        quantity: quantity(undefined),
      });
    }
  }

  private extractAsCartDiscountObj(
    cart: SleekflowApisCommerceHubModelCalculatedCartDto,
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

  public isSupportedCurrency$(currency: string): Observable<boolean> {
    return this.sleekpayService.getSupportedCurrencies$().pipe(
      map((supportedCurrencies) => {
        return supportedCurrencies
          .map((c) => c.currency.toLowerCase())
          .includes(currency.toLowerCase());
      }),
    );
  }

  public generatePaymentLink$({
    inputData,
    storeId,
    userProfileId,
  }: {
    storeId: string;
    userProfileId: string;
    inputData: CustomCatalogCartModalInputData;
  }) {
    return of({
      ...inputData,
      storeId,
      userProfileId,
    }).pipe(
      switchMap((value) => {
        return this.calculatedCart$$.pipe(
          take(1),
          map((calculatedCart) => {
            return { calculatedCart, inputData: value };
          }),
        );
      }),
      switchMap(
        ({
          calculatedCart,
          inputData: {
            currency,
            language,
            paymentLinkExpiryDate: paymentLinkExpiryDateInput,
          },
        }) => {
          if (
            !calculatedCart ||
            !currency ||
            !language ||
            !paymentLinkExpiryDateInput
          ) {
            throw new Error('generatePaymentLink$ - Invalid input');
          }
          const expiredAt = dayjs(paymentLinkExpiryDateInput);

          const platformCountry =
            this.supportedCurrencies$$.value
              .find(
                (c) =>
                  c.currency.toUpperCase() ===
                  (currency.currency_iso_code?.toUpperCase() ?? ''),
              )
              ?.platformCountry.toUpperCase() ?? 'HK';

          return combineLatest({
            paymentLinkObj: this.sleekpayService.generateSleekpayPaymentLink$(
              calculatedCart.calculated_line_items!.map((lineItem) => {
                const productVariantSnapshot = calculatedCart.line_items?.find(
                  (i) => i.product_variant_id === lineItem.product_variant_id,
                )?.product_variant_snapshot;

                const myLineItem: TravisBackendStripeIntegrationDomainModelsStripePaymentLineItem =
                  {
                    name:
                      productVariantSnapshot?.names!.find(
                        (name) =>
                          name.language_iso_code === language.language_iso_code,
                      )?.value || productVariantSnapshot?.names![0]!.value,
                    description: lineItem.description!,
                    amount:
                      lineItem.line_item_calculated_amount! /
                      lineItem.quantity!,
                    quantity: lineItem.quantity!,
                    currency: currency.currency_iso_code!,
                    imageUrls: lineItem.message_preview?.coverImageUrl
                      ? [lineItem.message_preview?.coverImageUrl]
                      : [],
                    metadata: lineItem.metadata!,
                  };

                return myLineItem;
              }),
              expiredAt,
              platformCountry ?? 'HK',
              this.customCatalogCartModalViewModelProps!.userProfileId,
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
        },
      ),
    );
  }

  private getSharedCartItem(
    lineItem: SleekflowApisCommerceHubModelCalculatedLineItem,
    calculatedCart: SleekflowApisCommerceHubModelCalculatedCartDto,
  ) {
    const productVariantSnapshot = calculatedCart.line_items?.find(
      (i) => i.product_variant_id === lineItem.product_variant_id,
    )?.product_variant_snapshot;

    if (!productVariantSnapshot) {
      throw new Error('getSharedCartItem - Invalid product variant');
    }
    const defaultImg = productVariantSnapshot?.images?.[0]?.image_url;
    return this.getSharedProductVariant({
      coverImageURL:
        lineItem.message_preview?.coverImageUrl || defaultImg || '',
      productVariant: productVariantSnapshot,
    });
  }

  public shareCartItems$() {
    return this.calculatedCart$$.pipe(
      filter((x) => {
        return Boolean(x);
      }),
      take(1),
      map((calculatedCart) => {
        if (!calculatedCart) {
          return [];
        }

        return (
          calculatedCart.calculated_line_items?.map(
            (lineItem: SleekflowApisCommerceHubModelCalculatedLineItem) => {
              return this.getSharedCartItem(lineItem, calculatedCart);
            },
          ) || []
        );
      }),
    );
  }

  public shareCartItem$(productVariantId: string) {
    this.isCalculatedCartLoading$$.next(true);

    return this.calculatedCart$$.pipe(
      filter((x) => {
        return Boolean(x);
      }),
      take(1),
      map((calculatedCart) => {
        if (!calculatedCart) {
          return null;
        }
        const lineItem = calculatedCart.calculated_line_items?.find(
          (i) => i.product_variant_id === productVariantId,
        );

        if (lineItem) {
          return this.getSharedCartItem(lineItem, calculatedCart);
        }

        return null;
      }),
    );
  }

  private getSharedProductVariant({
    coverImageURL,
    productVariant: productVariantSnapshot,
  }: {
    coverImageURL: string;
    productVariant: SleekflowApisCommerceHubModelProductVariantDto;
  }) {
    const language = this.form.getFieldValue('language');
    const currencyFromForm = this.form.getFieldValue('currency');

    if (productVariantSnapshot === null || !language || !currencyFromForm) {
      return null;
    }
    const name =
      productVariantSnapshot?.names!.find(
        (name) => name.language_iso_code === language.language_iso_code,
      )?.value || productVariantSnapshot?.names![0]!.value;
    const currency = currencyFromForm.currency_iso_code || '$';
    const price =
      productVariantSnapshot?.prices!.find(
        (price) => price.currency_iso_code === currency,
      )?.amount || 0;
    const description =
      (productVariantSnapshot?.descriptions || []).find(
        (d) =>
          d.type === 'text' &&
          d.text?.language_iso_code === language.language_iso_code,
      )?.text?.value ?? '';

    const url = productVariantSnapshot?.url || '';

    const defaultMessagePreview = `${name}
${formatCurrency(price, currency)}

Description: ${description}

${url}`;

    const u: UnifiedMessageCommerceHubSharedProduct = {
      messagePreview: defaultMessagePreview,
      coverImageUrl: coverImageURL,
      productVariant: productVariantSnapshot!,
    };

    return u;
  }

  public shareProductVariant$(productId: string, productVariantId: string) {
    return this.customCatalogService
      .getProductVariant$(
        this.customCatalogCartModalViewModelProps!.storeId!,
        productId,
        productVariantId,
      )
      .pipe(
        map(
          ({
            productVariant: productVariantSnapshot,
            product: productSnapshot,
          }) => {
            if (!productVariantSnapshot || !productSnapshot) {
              throw new Error('shareProductVariant$ - Invalid product variant');
            }

            return this.getSharedProductVariant({
              coverImageURL:
                productSnapshot?.images && productSnapshot?.images.length > 0
                  ? productSnapshot!.images[0].image_url!
                  : '',
              productVariant: productVariantSnapshot,
            });
          },
        ),
      );
  }
}
