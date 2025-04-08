import { Container } from 'inversify';

import { ConversationTabService } from './conversation-tab-service';
import { DexieService } from './dexie-service';
import { UserPreferencesService } from './user-perferences-service';

function loadDeps(container: Container) {
  container
    .bind<DexieService>(DexieService)
    .to(DexieService)
    .inSingletonScope();
  container
    .bind<ConversationTabService>(ConversationTabService)
    .to(ConversationTabService)
    .inSingletonScope();
  container
    .bind<UserPreferencesService>(UserPreferencesService)
    .to(UserPreferencesService)
    .inSingletonScope();
}

export const Persistences = {
  loadDeps,
};
