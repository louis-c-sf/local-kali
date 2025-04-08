import type { TravisBackendIntegrationServicesModelsShopifyProduct } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { interfaces } from 'inversify';
import { filter, Observable, takeUntil } from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

import { ArrayPagedDataSource } from '../../data-sources/array-paged-data-source';
import { Wrapper } from '../../models/wrapper';
import { ShopifyService } from './shopify.service';

export interface ShopifySearchProductsParams {
  searchKeyword: string;
  storeId: number;
}

export class ShopifySearchProductResult implements Wrapper {
  constructor(
    public product: TravisBackendIntegrationServicesModelsShopifyProduct,
  ) {}

  getId(): string | number {
    return this.product.id!;
  }

  destroy(): void {
    // This is intentionally left blank as userProfile and product are managed by their own managers
  }

  subscribe(): void {
    // Intentionally left blank
  }

  unsubscribe(): void {
    // Intentionally left blank
  }

  observed() {
    return false;
  }
}

export class ShopifySearchProductDataSource extends ArrayPagedDataSource<ShopifySearchProductResult> {
  private readonly shopifyService: ShopifyService;

  private readonly pageSize = 24;
  private readonly fetchedPageIdxs = new Set<number>();

  private hasSetup = false;

  public constructor(container: interfaces.Container) {
    super();

    this.shopifyService = container.get<ShopifyService>(ShopifyService);
  }

  public setupAndGet$(
    searchProductsParams: ShopifySearchProductsParams,
    next$: Observable<boolean>,
  ): Observable<ShopifySearchProductResult[]> {
    next$
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        filter((b) => b),
      )
      .subscribe(() => {
        this.fetchNextProducts(
          [...this.fetchedPageIdxs].reduce((pv, cv) => (cv > pv ? cv : pv), 0),
          searchProductsParams,
        );
      });

    if (this.hasSetup) {
      return this.getCachedItems$();
    }

    this.hasSetup = true;

    // Yields the initial empty array
    this.yieldSortedItems(true);

    this.setup(searchProductsParams);

    return this.getCachedItems$();
  }

  private searchProductsParams: ShopifySearchProductsParams | undefined =
    undefined;

  private setup(searchProductsParams: ShopifySearchProductsParams): void {
    this.setupSortFunc(this.sortNothingFunc);

    this.searchProductsParams = searchProductsParams;

    this.fetchNextProducts(0, searchProductsParams);
  }

  public refresh() {
    this.fetchedPageIdxs.clear();
    this.reset();

    if (this.searchProductsParams) {
      this.fetchNextProducts(0, this.searchProductsParams);
    }
  }

  private fetchNextProducts(
    page: number,
    searchProductsParams: ShopifySearchProductsParams,
  ): void {
    if (this.fetchedPageIdxs.has(page)) {
      return;
    }
    this.fetchedPageIdxs.add(page);

    const observable$ = this.shopifyService.searchShopifyProducts$(
      searchProductsParams.storeId,
      searchProductsParams.searchKeyword,
      page * this.pageSize,
      this.pageSize,
    );

    // Update isLoading to true before starting to fetch data
    this.setIsFetchingNextPage(true);

    observable$
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        RxjsUtils.getRetryAPIRequest(),
      )
      .subscribe(
        (resp) => {
          const searchedProducts = resp.items;

          if (searchedProducts && searchedProducts.length > 0) {
            if (searchedProducts.length < this.pageSize) {
              this.complete();
            }

            this.addItems(
              searchedProducts.map((sr) => {
                return new ShopifySearchProductResult(sr);
              }),
            );
          } else {
            this.yieldSortedItems();
          }
        },
        (error) => {
          console.error(error);
        },
        () => {
          this.setIsFetchingNextPage(false);
        },
      );
  }

  private sortNothingFunc = () => {
    return 0;
  };
}
