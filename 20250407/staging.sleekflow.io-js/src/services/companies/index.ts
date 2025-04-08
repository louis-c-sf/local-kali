import { Container } from 'inversify';

import { WhatsappCloudApiBalanceDataSource } from './balances/whatsapp-cloud-api-balance-data-source';
import { WhatsappCloudApiBalanceDataSourceManager } from './balances/whatsapp-cloud-api-balance-data-source-manager';
import { CompanyService } from './company.service';

function loadDeps(container: Container) {
  container
    .bind<CompanyService>(CompanyService)
    .to(CompanyService)
    .inSingletonScope();

  container
    .bind<WhatsappCloudApiBalanceDataSourceManager>(
      WhatsappCloudApiBalanceDataSourceManager,
    )
    .toConstantValue(
      new WhatsappCloudApiBalanceDataSourceManager(
        () => new WhatsappCloudApiBalanceDataSource(container),
      ),
    );
}

export const Companies = {
  loadDeps,
};
