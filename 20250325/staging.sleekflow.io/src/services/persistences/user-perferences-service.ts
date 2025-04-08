import { liveQuery } from 'dexie';
import { inject, injectable } from 'inversify';
import { from } from 'rxjs';

import { DexieService } from '../persistences/dexie-service';

@injectable()
export class UserPreferencesService {
  constructor(@inject(DexieService) private dexieService: DexieService) {}

  public getUserPreferences$(userId: string) {
    return from(
      liveQuery(() => this.dexieService.getDb().userPreference.get({ userId })),
    );
  }

  public async addOrUpdateUserPreferences$$(
    userId: string,
    conversationSidebarState: 'open' | 'closed',
  ) {
    const db = this.dexieService.getDb();
    const userPreference = await db.userPreference.get({ userId });

    return userPreference
      ? db.userPreference.put({ userId, conversationSidebarState })
      : db.userPreference.add({ userId, conversationSidebarState });
  }
}
