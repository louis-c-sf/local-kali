import { Container } from 'inversify';

import { CommerceService } from './commerce.service';
import { CustomCatalogCartModalViewModel } from './custom-catalogs/custom-catalog-cart-modal-view-model';
import { CustomCatalogCartModalViewModelManager } from './custom-catalogs/custom-catalog-cart-modal-view-model-manager';
import { CustomCatalogSearchProductDataSource } from './custom-catalogs/custom-catalog-search-product-data-source';
import { CustomCatalogSearchProductDataSourceManager } from './custom-catalogs/custom-catalog-search-product-data-source-manager';
import { CustomCatalogService } from './custom-catalogs/custom-catalog.service';
import { CustomerShopifyAbandonedCartDataSource } from './shopify/customer-shopify-abandoned-cart-data-source';
import { CustomerShopifyAbandonedCartDataSourceManager } from './shopify/customer-shopify-abandoned-cart-data-source-manager';
import { CustomerShopifyOrdersDataSource } from './shopify/customer-shopify-orders-data-source';
import { CustomerShopifyOrdersDataSourceManager } from './shopify/customer-shopify-orders-data-source-manager';
import { ShopifySearchProductDataSource } from './shopify/shopify-search-product-data-source';
import { ShopifySearchProductDataSourceManager } from './shopify/shopify-search-product-data-source-manager';
import { ShopifyStoreModalViewModel } from './shopify/shopify-store-modal-view-model';
import { ShopifyStoreModalViewModelManager } from './shopify/shopify-store-modal-view-model-manager';
import { ShopifyService } from './shopify/shopify.service';
import { CustomerStripePaymentsDataSource } from './stripe-payments/customer-stripe-payments-data-source';
import { CustomerStripePaymentsDataSourceManager } from './stripe-payments/customer-stripe-payments-data-source-manager';

function loadDeps(container: Container) {
  container
    .bind<CustomCatalogService>(CustomCatalogService)
    .to(CustomCatalogService)
    .inSingletonScope();
  container
    .bind<CustomCatalogCartModalViewModelManager>(
      CustomCatalogCartModalViewModelManager,
    )
    .toConstantValue(
      new CustomCatalogCartModalViewModelManager(
        () => new CustomCatalogCartModalViewModel(container),
      ),
    );
  container
    .bind<CustomCatalogSearchProductDataSourceManager>(
      CustomCatalogSearchProductDataSourceManager,
    )
    .toConstantValue(
      new CustomCatalogSearchProductDataSourceManager(
        () => new CustomCatalogSearchProductDataSource(container),
      ),
    );

  container
    .bind<ShopifyService>(ShopifyService)
    .to(ShopifyService)
    .inSingletonScope();
  container
    .bind<ShopifyStoreModalViewModelManager>(ShopifyStoreModalViewModelManager)
    .toConstantValue(
      new ShopifyStoreModalViewModelManager(
        () => new ShopifyStoreModalViewModel(container),
      ),
    );
  container
    .bind<ShopifySearchProductDataSourceManager>(
      ShopifySearchProductDataSourceManager,
    )
    .toConstantValue(
      new ShopifySearchProductDataSourceManager(
        () => new ShopifySearchProductDataSource(container),
      ),
    );

  container
    .bind<CommerceService>(CommerceService)
    .to(CommerceService)
    .inSingletonScope();

  container
    .bind<CustomerStripePaymentsDataSourceManager>(
      CustomerStripePaymentsDataSourceManager,
    )
    .toConstantValue(
      new CustomerStripePaymentsDataSourceManager(
        () => new CustomerStripePaymentsDataSource(container),
      ),
    );

  container
    .bind<CustomerShopifyOrdersDataSourceManager>(
      CustomerShopifyOrdersDataSourceManager,
    )
    .toConstantValue(
      new CustomerShopifyOrdersDataSourceManager(
        () => new CustomerShopifyOrdersDataSource(container),
      ),
    );

  container
    .bind<CustomerShopifyAbandonedCartDataSourceManager>(
      CustomerShopifyAbandonedCartDataSourceManager,
    )
    .toConstantValue(
      new CustomerShopifyAbandonedCartDataSourceManager(
        () => new CustomerShopifyAbandonedCartDataSource(container),
      ),
    );
}

export const Commerces = {
  loadDeps,
};
