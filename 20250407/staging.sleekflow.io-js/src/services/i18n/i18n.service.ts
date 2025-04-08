import { i18n as i18nType } from 'i18next';
import { injectable } from 'inversify';

import { i18n } from '@/i18n';

interface I18n {
  t: i18nType['t'];
  changeLanguage: i18nType['changeLanguage'];
}

@injectable()
export class I18nService implements I18n {
  // TODO: move i18n setup inside Translation service for a more complete implementation?
  public t;
  public changeLanguage;

  constructor() {
    this.t = i18n.t;
    this.changeLanguage = i18n.changeLanguage;
  }
}
