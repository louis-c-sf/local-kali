import { Container } from 'inversify';

import { PermissionService } from './permission.service';

function loadDeps(container: Container) {
  container
    .bind<PermissionService>(PermissionService)
    .to(PermissionService)
    .inSingletonScope();
}

export const Permissions = {
  loadDeps,
};
