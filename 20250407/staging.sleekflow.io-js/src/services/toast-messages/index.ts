import { Container } from 'inversify';

import { ToastMessagesService } from './toast-messages.service';

function loadDeps(container: Container) {
  container
    .bind<ToastMessagesService>(ToastMessagesService)
    .to(ToastMessagesService)
    .inSingletonScope();
}

export const ToastMessages = {
  loadDeps,
};
