import type { SleekflowApisCommerceHubModelProductDto } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { interfaces } from 'inversify';
import { filter, Observable, takeUntil } from 'rxjs';

import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';

import { ArrayPagedDataSource } from '../../data-sources/array-paged-data-source';
import { Wrapper } from '../../models/wrapper';
import { CustomCatalogService } from './custom-catalog.service';

export interface CustomCatalogSearchProductsParams {
  searchKeyword: string;
  storeId: string;
}

export class CustomCatalogSearchProductResult implements Wrapper {
  constructor(public product: SleekflowApisCommerceHubModelProductDto) {}

  getId(): string | number {
    return this.product.id!;
  }

  destroy(): void {
    // Intentionally left blank
  }

  subscribe(): void {
    // Intentionally left blank
  }

  unsubscribe(): void {
    // Intentionally left blank
  }

  observed() {
    return true;
  }
}

export class CustomCatalogSearchProductDataSource extends ArrayPagedDataSource<CustomCatalogSearchProductResult> {
  private readonly customCatalogService: CustomCatalogService;

  private readonly pageSize = 24;

  private hasSetup = false;

  private nextContinuationToken: string | null = null;
  private loadedContinuationTokens: Set<string> = new Set<string>();

  public constructor(container: interfaces.Container) {
    super();

    this.customCatalogService =
      container.get<CustomCatalogService>(CustomCatalogService);
  }

  public setupAndGet$(
    searchProductsParams: CustomCatalogSearchProductsParams,
    next$: Observable<boolean>,
  ): Observable<CustomCatalogSearchProductResult[]> {
    next$
      .pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
        filter((b) => b),
      )
      .subscribe(() => {
        if (this.nextContinuationToken) {
          this.fetchNextProducts(searchProductsParams);
        }
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

  private searchProductsParams: CustomCatalogSearchProductsParams | undefined =
    undefined;

  private setup(searchProductsParams: CustomCatalogSearchProductsParams): void {
    this.setupSortFunc(this.sortNothingFunc);

    this.searchProductsParams = searchProductsParams;

    this.fetchNextProducts(searchProductsParams);
  }

  public refresh() {
    this.nextContinuationToken = null;
    this.loadedContinuationTokens = new Set<string>();
    this.reset();

    if (this.searchProductsParams) {
      this.fetchNextProducts(this.searchProductsParams);
    }
  }

  private fetchNextProducts(
    searchProductsParams: CustomCatalogSearchProductsParams,
  ): void {
    if (
      this.nextContinuationToken !== null &&
      this.loadedContinuationTokens.has(this.nextContinuationToken)
    ) {
      return;
    }
    if (this.nextContinuationToken !== null) {
      this.loadedContinuationTokens.add(this.nextContinuationToken);
    }

    const observable$ = this.customCatalogService.searchProducts$(
      searchProductsParams.storeId,
      searchProductsParams.searchKeyword,
      this.pageSize,
      this.nextContinuationToken,
      true,
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
        (tuple) => {
          const searchedProducts = tuple.products;
          const nextContinuationToken = tuple.nextContinuationToken;

          if (searchedProducts && searchedProducts.length > 0) {
            if (searchedProducts.length < this.pageSize) {
              this.complete();
            }

            this.addItems(
              searchedProducts.map((sr) => {
                return new CustomCatalogSearchProductResult(sr);
              }),
            );
          } else {
            this.yieldSortedItems();
          }

          if (nextContinuationToken) {
            this.nextContinuationToken = nextContinuationToken;
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
