import { Container } from 'inversify';

import { FeatureService } from './feature.service';

function loadDeps(container: Container) {
  container
    .bind<FeatureService>(FeatureService)
    .to(FeatureService)
    .inSingletonScope();
}

export const Features = {
  loadDeps,
};
