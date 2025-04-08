import { interfaces } from 'inversify';
import {
  combineLatest,
  delay,
  filter,
  interval,
  merge,
  Observable,
  of,
  startWith,
  take,
  takeUntil,
  throttleTime,
} from 'rxjs';

import { ConversationService } from '@/services/conversations/conversation.service';

import { SimpleObjectDataSource } from '../data-sources/simple-object-data-source';
import { ClassicRealTimeService } from '../signal-r/classic-real-time.service';
import { ConversationSummaryService } from './conversation-summary.service';
import { ConversationUnreadSummary } from './models/conversation-unread-summary';

export class ConversationUnreadSummaryDataSource extends SimpleObjectDataSource<ConversationUnreadSummary> {
  private readonly conversationSummaryService: ConversationSummaryService;
  private readonly classicReadTimeService: ClassicRealTimeService;
  private readonly conversationService: ConversationService;

  private hasSetup = false;

  constructor(container: interfaces.Container) {
    super();

    this.conversationSummaryService = container.get<ConversationSummaryService>(
      ConversationSummaryService,
    );
    this.classicReadTimeService = container.get<ClassicRealTimeService>(
      ClassicRealTimeService,
    );
    this.conversationService =
      container.get<ConversationService>(ConversationService);
  }

  public setupAndGet$(): Observable<ConversationUnreadSummary> {
    if (this.hasSetup) {
      return this.getCachedItem$();
    }

    this.hasSetup = true;

    this.setup();

    return this.getCachedItem$();
  }

  private setup() {
    this.fetch();

    combineLatest({
      onConversationMessageChanged: this.classicReadTimeService
        .getOnConversationMessageChanged$()
        .pipe(startWith(null)),
      onConversationRead: this.conversationService
        .getOnReadConversation$()
        .pipe(startWith(null)),
      interval: merge(
        of(0),
        interval(30000).pipe(
          filter(() => {
            // The conversation may have been read by the user, so we need to update the unread count
            if (
              this.getCachedItem().assignedToMe > 0 ||
              this.getCachedItem().collaborations > 0 ||
              this.getCachedItem().mentions > 0
            ) {
              return true;
            }

            return false;
          }),
        ),
      ),
    })
      .pipe(
        takeUntil(this.getDisconnect$()),
        throttleTime(10000, undefined, { leading: true, trailing: true }),

        // Sometimes the unread count is not updated immediately, so we need to delay a bit
        delay(1000),
      )
      .subscribe(() => {
        this.fetch();
      });
  }

  private fetch(): void {
    const observable$: Observable<ConversationUnreadSummary> =
      this.conversationSummaryService.getConversationUnreadSummary$();

    observable$
      .pipe(takeUntil(this.getDisconnect$()), take(1))
      .subscribe((conversationUnreadSummary) => {
        this.onNextCachedItem(conversationUnreadSummary);
      });
  }
}
