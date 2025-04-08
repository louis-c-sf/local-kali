import { Container } from 'inversify';

import { I18nService } from '@/services/i18n/i18n.service';

function loadDeps(container: Container) {
  container.bind<I18nService>(I18nService).to(I18nService).inSingletonScope();
}

export const i18n = {
  loadDeps,
};
