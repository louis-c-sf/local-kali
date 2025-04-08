import { Container } from 'inversify';

import { OnlineManagerService } from '@/services/online-manager/online-manager.service';

function loadDeps(container: Container) {
  container
    .bind(OnlineManagerService)
    .to(OnlineManagerService)
    .inSingletonScope();
}

export const OnlineManager = {
  loadDeps,
};
