import { injectable } from 'inversify';
import { from, of, switchMap, timer } from 'rxjs';

import { DELIMITER } from '@/services/conversation-messages/constants';

const maxScrollTop = (dom: HTMLElement) => dom.scrollHeight - dom.clientHeight;
const scrollToBottomInaccuracy = 100;
export const MESSAGE_ID_ATTRIBUTE = 'data-message-id';
export const MESSAGE_CACHE_KEY_ATTRIBUTE = 'data-message-cache-key';
export const HIGHLIGHT_ATTRIBUTE = 'data-should-highlight';
export const DEFAULT_MESSAGE_ID_QUERY_PARAM = 'defaultMessageId';
export const getConversationMessageContainerId = (uniqueId: string) =>
  `${uniqueId}${DELIMITER}conversation-messages-container`;

function waitForElm(
  options: {
    id?: string;
    selector?: string;
  } = {},
): Promise<Element | null> {
  const { id, selector } = options;
  if (id) {
    return new Promise((resolve) => {
      if (document.getElementById(id)) {
        return resolve(document.getElementById(id));
      }

      const observer = new MutationObserver(() => {
        if (document.getElementById(id)) {
          observer.disconnect();
          resolve(document.getElementById(id));
        }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  if (selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  throw new Error('Either id or selector must be provided');
}

@injectable()
export class ConversationWindowUIService {
  public async getMessageElement({
    cacheKey,
    messageId,
  }: {
    cacheKey?: string;
    messageId?: number;
  }) {
    let elem: Element | null = null;
    if (cacheKey) {
      elem = await waitForElm({
        selector: `[${MESSAGE_CACHE_KEY_ATTRIBUTE}="${cacheKey}"]`,
      });
    }
    if (messageId) {
      elem = await waitForElm({
        selector: `[${MESSAGE_ID_ATTRIBUTE}="${messageId}"]`,
      });
    }

    return elem;
  }

  public continuouslyScrollToMessagePeriodically$({
    cacheKey,
    messageId,
    scrollOptions = {
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
    },
    interval = 500,
  }: {
    cacheKey?: string;
    messageId?: number;
    scrollOptions?: ScrollIntoViewOptions;
    interval?: number;
  }) {
    return timer(0, interval).pipe(
      switchMap(() => {
        return from(
          this.getMessageElement({
            cacheKey,
            messageId,
          }),
        ).pipe(
          switchMap((elem) => {
            elem?.scrollIntoView(scrollOptions);
            return of(elem);
          }),
        );
      }),
    );
  }

  public continuouslyScrollToTopPeriodically$(
    uniqueDatasourceIdentifier: string,
  ) {
    return timer(0, 100).pipe(
      switchMap(() => {
        return from(
          waitForElm({
            id: getConversationMessageContainerId(uniqueDatasourceIdentifier),
          }),
        ).pipe(
          switchMap((elem) => {
            if (elem) {
              elem.scrollTop = 0;
            }
            return of(elem);
          }),
        );
      }),
    );
  }

  public getIsScrolledToBottom(uniqueDatasourceIdentifier: string) {
    const scrollContainer = document.getElementById(
      getConversationMessageContainerId(uniqueDatasourceIdentifier),
    );
    const isScrolledToBottom =
      scrollContainer === null
        ? false
        : Math.ceil(scrollContainer.scrollTop) >=
          maxScrollTop(scrollContainer) - scrollToBottomInaccuracy;

    return isScrolledToBottom;
  }
}
