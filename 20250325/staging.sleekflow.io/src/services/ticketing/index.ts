import { Container } from 'inversify';

import { TicketingService } from './ticketing.service';

function loadDeps(container: Container) {
  container
    .bind<TicketingService>(TicketingService)
    .to(TicketingService)
    .inSingletonScope();
}

export const Ticketing = {
  loadDeps,
};
