import { Container } from 'inversify';

import { SleekpayService } from './sleekpay-service';

function loadDeps(container: Container) {
  container
    .bind<SleekpayService>(SleekpayService)
    .to(SleekpayService)
    .inSingletonScope();
}

export const Sleekpay = {
  loadDeps,
};
