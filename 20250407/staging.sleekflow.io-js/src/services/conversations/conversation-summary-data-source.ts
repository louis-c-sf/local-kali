import { interfaces } from 'inversify';
import {
  audit,
  filter,
  interval,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

import { UserService } from '@/services/user.service';

import { SimpleObjectDataSource } from '../data-sources/simple-object-data-source';
import { ConversationMatcherService } from './conversation-matcher.service';
import { ConversationSummaryService } from './conversation-summary.service';
import { ConversationService } from './conversation.service';
import { ConversationSummary } from './models/conversation-summary';
import { GetConversationsFilter } from './models/get-conversations-filter';

export class ConversationSummaryDataSource extends SimpleObjectDataSource<ConversationSummary> {
  private readonly conversationService: ConversationService;
  private readonly conversationSummaryService: ConversationSummaryService;
  private readonly conversationMatcherService: ConversationMatcherService;
  private readonly userService: UserService;

  private hasSetup = false;
  private refreshTrigger$$ = new Subject<void>();

  constructor(container: interfaces.Container) {
    super();

    this.conversationService =
      container.get<ConversationService>(ConversationService);
    this.conversationSummaryService = container.get<ConversationSummaryService>(
      ConversationSummaryService,
    );
    this.conversationMatcherService = container.get<ConversationMatcherService>(
      ConversationMatcherService,
    );
    this.userService = container.get<UserService>(UserService);
  }

  public setupAndGet$(
    getConversationsFilter: GetConversationsFilter,
  ): Observable<ConversationSummary> {
    if (this.hasSetup) {
      return this.getCachedItem$();
    }

    this.hasSetup = true;

    this.setup(getConversationsFilter);

    return this.getCachedItem$();
  }

  public onMounted() {
    this.refreshTrigger$$.next();
  }

  private setup(getConversationsFilter: GetConversationsFilter) {
    this.fetch(getConversationsFilter);

    merge(
      this.refreshTrigger$$.pipe(
        takeUntil(this.getComplete$()),
        takeUntil(this.getDisconnect$()),
      ),
      this.conversationService.getOngoingUpdatedConversation$(
        getConversationsFilter,
      ),
      this.conversationService
        .getCachedConversationUpdate$()
        .pipe(map(([cw]) => cw)),
    )
      .pipe(
        takeUntil(this.getDisconnect$()),
        switchMap(
          (cw) =>
            cw
              ? this.conversationMatcherService.matchConversationWrapper(
                  getConversationsFilter,
                  cw,
                )
              : of(true), // emissions from refrehTrigger should always trigger a fetch
        ),
        filter((matched) => matched),
        audit(() => interval(10_000)),
        filter(() => this.getMounted()),
      )
      .subscribe(() => {
        this.fetch(getConversationsFilter);
      });
  }

  private fetch(getConversationsFilter: GetConversationsFilter): void {
    let observable$: Observable<ConversationSummary> | undefined;
    if (getConversationsFilter.assignedTeamId) {
      observable$ = this.conversationSummaryService.getTeamConversationSummary$(
        getConversationsFilter,
      );
    }
    // assignedTeamId should be checked first because assignedStaffId can also be a subset of assignedTeamId
    else if (getConversationsFilter.assignedStaffId) {
      observable$ =
        this.conversationSummaryService.getStaffConversationSummary$(
          getConversationsFilter,
        );
    } else if (getConversationsFilter.isCollaborated) {
      observable$ =
        this.conversationSummaryService.getCollaboratedConversationSummary$(
          getConversationsFilter,
        );
    } else if (getConversationsFilter.isMentioned) {
      observable$ =
        this.conversationSummaryService.getMentionedConversationSummary$(
          getConversationsFilter,
        );
    } else {
      observable$ = this.conversationSummaryService.getAllConversationSummary$(
        getConversationsFilter,
      );
    }

    observable$
      .pipe(takeUntil(this.getDisconnect$()), take(1))
      .subscribe((conversationSummary) => {
        this.onNextCachedItem(conversationSummary);
      });
  }
}
