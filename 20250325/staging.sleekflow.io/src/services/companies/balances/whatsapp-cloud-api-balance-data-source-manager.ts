import { injectable } from 'inversify';

import { DataSourceManager } from '@/services/data-sources/data-source-manager';

import { WhatsappCloudApiBalanceDataSource } from './whatsapp-cloud-api-balance-data-source';

@injectable()
export class WhatsappCloudApiBalanceDataSourceManager extends DataSourceManager<
  WhatsappCloudApiBalanceDataSource,
  object
> {}
