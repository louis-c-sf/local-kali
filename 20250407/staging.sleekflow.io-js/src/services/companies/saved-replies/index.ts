import { Container } from 'inversify';

import { SavedReplyService } from './saved-reply.service';

function loadDeps(container: Container) {
  container
    .bind<SavedReplyService>(SavedReplyService)
    .to(SavedReplyService)
    .inSingletonScope();
}

export const SavedReplies = {
  loadDeps,
};
