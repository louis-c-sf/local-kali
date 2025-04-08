import { Container } from 'inversify';

import { UserService } from '../user.service';
import { UserProfileWrapperManagerService } from './managers/user-profile-wrapper-manager.service';
import { UserProfileDataSource } from './user-profile-data-source';
import { UserProfileDataSourceManager } from './user-profile-data-source-manager';
import { UserProfileService } from './user-profile.service';

function loadDeps(container: Container) {
  container
    .bind<UserProfileWrapperManagerService>(UserProfileWrapperManagerService)
    .to(UserProfileWrapperManagerService)
    .inSingletonScope();
  container
    .bind<UserProfileService>(UserProfileService)
    .to(UserProfileService)
    .inSingletonScope();
  container.bind<UserService>(UserService).to(UserService).inSingletonScope();
  container
    .bind<UserProfileDataSourceManager>(UserProfileDataSourceManager)
    .toConstantValue(
      new UserProfileDataSourceManager(
        () => new UserProfileDataSource(container),
      ),
    );
}

export const UserProfiles = {
  loadDeps,
};
