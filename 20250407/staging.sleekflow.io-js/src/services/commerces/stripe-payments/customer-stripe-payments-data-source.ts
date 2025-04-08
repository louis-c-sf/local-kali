import { interfaces } from 'inversify';
import _noop from 'lodash/noop';
import _uniqBy from 'lodash/uniqBy';
import {
  catchError,
  combineLatest,
  filter,
  map,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { ArrayPagedDataSource } from '@/services/data-sources/array-paged-data-source';
import { Wrapper } from '@/services/models/wrapper';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';
import { SleekpayService } from '@/services/sleekpay/sleekpay-service';

import { CommerceService } from '../commerce.service';
import { StripePaymentStatus } from './constants';

export interface CustomerStripePayments {
  totalNumberOfRecords: number;
  stripePaymentCustomerPaymentHistoryRecords: CustomerStripePayment[];
}

export interface CustomerStripePaymentsParams {
  userProfileId: string;
}

export interface CustomerStripePaymentLineItem {
  name: string;
  description: string;
  amount: number;
  quantity: number;
  currency: string;
  totalDiscount: number;
}

export interface CustomerStripePayment {
  sleekPayId: number;
  paymentId: string;
  userProfileId: string;
  conversationId: string;
  platformCountry: string;
  status: StripePaymentStatus;
  lineItems: CustomerStripePaymentLineItem[];
  createdAt: string;
  paymentTrackingUrl: string;
  expiredAt: string;
  refundedAmount: number;
  payAmount: number;
  paymentAmount: number;
  shippingFeeAmount: number;
  contactOwner: string;
  isPaymentLinkSent: boolean;
  currency?: string;
}

export class CustomerStripePaymentWrapper implements Wrapper {
  constructor(public payment: CustomerStripePayment) {}

  getId(): string | number {
    return this.payment.paymentId!;
  }

  destroy = _noop;

  subscribe = _noop;

  unsubscribe = _noop;

  observed() {
    return true;
  }
}

export class CustomerStripePaymentsDataSource extends ArrayPagedDataSource<CustomerStripePaymentWrapper> {
  private hasSetup = false;

  private readonly commerceService: CommerceService;
  private readonly sleekpayService: SleekpayService;
  private readonly pageSize = 100;

  constructor(container: interfaces.Container) {
    super();
    this.commerceService = container.get(CommerceService);
    this.sleekpayService = container.get(SleekpayService);
  }

  public setupAndGet$(params: CustomerStripePaymentsParams) {
    if (this.hasSetup) {
      return this.getCachedItems$();
    }

    this.hasSetup = true;
    this.sleekpayService
      .getOnSleekpayPaymentLinkGenerated$()
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        // When initializing, no need to wait for onSleekpayPaymentLinkGenerated$, just fetch the page
        startWith({ userProfileId: params.userProfileId }),
        filter((payment) => payment.userProfileId === params.userProfileId),
        switchMap(() => this.fetchPage(0, params)),
        map((res) =>
          _uniqBy(
            res.flatMap((r) => r.stripePaymentCustomerPaymentHistoryRecords),
            'paymentId',
          ).map((payment) => new CustomerStripePaymentWrapper(payment)),
        ),
        tap((customerStripePayments) => {
          if (customerStripePayments?.length > 0) {
            this.addItems(customerStripePayments);
          } else {
            this.complete();
            this.yieldSortedItems();
          }
          this.setIsFetchingNextPage(false);
        }),
      )
      .subscribe();

    // Yields the initial empty array
    this.yieldSortedItems(true);

    this.setupSortFunc((a, b) =>
      a.payment.createdAt > b.payment.createdAt ? -1 : 1,
    );

    return this.getCachedItems$();
  }

  private fetchPage(pageNumber: number, params: CustomerStripePaymentsParams) {
    return combineLatest(
      Object.values(StripePaymentStatus).map((status) =>
        this.commerceService
          .getCustomerStripePayments$({
            userProfileId: params.userProfileId,
            offset: pageNumber * this.pageSize,
            limit: this.pageSize,
            status,
          })
          .pipe(
            RxjsUtils.getRetryAPIRequest(),
            catchError(() =>
              of({
                totalNumberOfRecords: 0,
                stripePaymentCustomerPaymentHistoryRecords: [],
              }),
            ),
          ),
      ),
    );
  }
}
