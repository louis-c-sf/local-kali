import { injectable } from 'inversify';

import { SfDexie } from './sf-dexie';

@injectable()
export class DexieService {
  private readonly db: SfDexie;

  constructor() {
    this.db = new SfDexie();
  }

  public getDb() {
    return this.db;
  }
}
