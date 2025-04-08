import { Container } from 'inversify';

import { LabelService } from './label.service';

function loadDeps(container: Container) {
  container
    .bind<LabelService>(LabelService)
    .to(LabelService)
    .inSingletonScope();
}

export const Labels = {
  loadDeps,
};
