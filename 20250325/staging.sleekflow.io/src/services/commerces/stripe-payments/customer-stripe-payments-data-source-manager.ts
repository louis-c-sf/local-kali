import { injectable } from 'inversify';

import { DataSourceManager } from '@/services/data-sources/data-source-manager';

import {
  CustomerStripePaymentsDataSource,
  CustomerStripePaymentsParams,
} from './customer-stripe-payments-data-source';

@injectable()
export class CustomerStripePaymentsDataSourceManager extends DataSourceManager<
  CustomerStripePaymentsDataSource,
  CustomerStripePaymentsParams
> {}
