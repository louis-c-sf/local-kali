import { TravisBackendIntegrationServicesModelsShopifyOrderRecord } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { interfaces } from 'inversify';
import _noop from 'lodash/noop';
import { map, takeUntil, tap } from 'rxjs';

import { ArrayPagedDataSource } from '@/services/data-sources/array-paged-data-source';
import { Wrapper } from '@/services/models/wrapper';

import { ShopifyService } from './shopify.service';

export enum ShopifyOrderFinancialStatus {
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
}

export interface CustomerShopifyOrdersParams {
  userProfileId: string;
}

export class CustomerShopifyOrder implements Wrapper {
  constructor(
    public order: TravisBackendIntegrationServicesModelsShopifyOrderRecord,
  ) {}

  getId(): string | number {
    return this.order.id!;
  }

  destroy = _noop;

  subscribe = _noop;

  unsubscribe = _noop;

  observed() {
    return false;
  }
}

export class CustomerShopifyOrdersDataSource extends ArrayPagedDataSource<CustomerShopifyOrder> {
  private hasSetup = false;

  private readonly shopifyService: ShopifyService;

  private readonly pageSize = 100;

  constructor(container: interfaces.Container) {
    super();
    this.shopifyService = container.get<ShopifyService>(ShopifyService);
  }

  public setupAndGet$(params: CustomerShopifyOrdersParams) {
    if (this.hasSetup) {
      return this.getCachedItems$();
    }

    this.hasSetup = true;
    this.shopifyService
      .getUserShopifyOrders$({
        userProfileId: params.userProfileId,
        limit: this.pageSize,
      })
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        map(
          (res) =>
            res.results?.map((order) => new CustomerShopifyOrder(order)) || [],
        ),
        tap((orders) => {
          if (orders.length > 0) {
            this.addItems(orders);
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
      a.order.createdAt! > b.order.createdAt! ? -1 : 1,
    );

    return this.getCachedItems$();
  }
}
