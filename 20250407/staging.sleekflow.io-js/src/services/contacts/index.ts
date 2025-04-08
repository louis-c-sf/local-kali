import { Container } from 'inversify';

import { ContactService } from './contact.service';

function loadDeps(container: Container) {
  container
    .bind<ContactService>(ContactService)
    .to(ContactService)
    .inSingletonScope();
}

export const Contacts = {
  loadDeps,
};
