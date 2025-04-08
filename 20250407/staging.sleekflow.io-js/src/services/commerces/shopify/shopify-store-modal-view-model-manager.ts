import { injectable } from 'inversify';

import { DataSourceManager } from '../../data-sources/data-source-manager';
import {
  ShopifyStoreModalViewModel,
  ShopifyStoreModalViewModelProps,
} from './shopify-store-modal-view-model';

@injectable()
export class ShopifyStoreModalViewModelManager extends DataSourceManager<
  ShopifyStoreModalViewModel,
  ShopifyStoreModalViewModelProps
> {}
