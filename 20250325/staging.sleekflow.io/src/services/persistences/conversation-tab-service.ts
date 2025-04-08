import { liveQuery } from 'dexie';
import { inject, injectable } from 'inversify';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  take,
} from 'rxjs';

import { ConversationService } from '@/services/conversations/conversation.service';
import { ClassicRealTimeService } from '@/services/signal-r/classic-real-time.service';
import { UserService } from '@/services/user.service';

import { DexieService } from './dexie-service';
import { ConversationTab, ConversationTabGroup } from './sf-dexie';

@injectable()
export class ConversationTabService {
  private readonly MAX_NUM_OF_CONVERSATION_TABS = 7;
  public tabId?: string;
  private addConversationTabById$$: Subject<{
    conversationId: string;
    defaultMessageId?: number;
  }> = new Subject<{
    conversationId: string;
    defaultMessageId?: number;
  }>();

  constructor(
    @inject(DexieService) private dexieService: DexieService,
    @inject(ConversationService)
    private conversationService: ConversationService,
    @inject(ClassicRealTimeService)
    private classicRealTimeService: ClassicRealTimeService,
    @inject(UserService)
    private userService: UserService,
  ) {
    // Attempt to retrieve the tabId from sessionStorage
    const storedTabId = sessionStorage.getItem('tabId');
    const inUse = sessionStorage.getItem('tabInUse');
    const userId = sessionStorage.getItem('userId');

    this.setup(storedTabId, inUse, userId);
  }

  private setup(
    sessionStoredTabId: string | null,
    sessionInUse: string | null,
    sessionUserId: string | null,
  ) {
    this.userService.getMyUserId$().subscribe((myUserId) => {
      if (
        sessionStoredTabId &&
        sessionInUse !== 'true' &&
        sessionUserId === myUserId
      ) {
        // If tabId exists and tabInUse isn't true, it means the tab is not duplicated
        this.tabId = sessionStoredTabId;
      } else {
        // If tabId doesn't exist or tabInUse is true, generate a new unique tabId
        this.tabId = this.generateUniqueTabId();
      }

      // Set tabId and tabInUse in sessionStorage
      sessionStorage.setItem('tabId', this.tabId);
      sessionStorage.setItem('tabInUse', 'true');
      sessionStorage.setItem('userId', myUserId);

      // Clear tabInUse flag on beforeunload so that it's not set for new tabs
      window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('tabInUse');
      });
    });

    this.addConversationTabById$$
      .pipe(
        distinctUntilChanged((pv, cv) => {
          return (
            pv.conversationId === cv.conversationId &&
            pv.defaultMessageId === cv.defaultMessageId
          );
        }),
      )
      .subscribe(({ conversationId, defaultMessageId }) => {
        this.conversationService
          .getConversationWrapper$(conversationId)
          .pipe(take(1))
          .subscribe({
            next: (conversation) => {
              this.addConversationTab({
                conversationId: conversationId,
                userProfileId: conversation.getUserProfileId(),
                lastSelectedDate: new Date(),
                createdAt: new Date(),
                active: true,
                defaultMessageId: defaultMessageId,
              });
            },
            error: (error) => {
              console.error(error);

              this.removeConversationTab(conversationId);
            },
          });
      });
  }

  private generateUniqueTabId() {
    return Math.random().toString(36).substr(2, 9);
  }

  public getConversationTabs$(): Observable<ConversationTab[]> {
    return from(
      liveQuery(() =>
        this.dexieService
          .getDb()
          .conversationTabGroup.where({
            browserTabId: this.tabId,
          })
          .first(),
      ),
    ).pipe(
      map((group) => {
        return group?.conversationTabs || [];
      }),
      switchMap((tabs) => {
        return combineLatest(
          tabs.map((tab) =>
            this.conversationService
              .getConversationWrapper$(tab.conversationId)
              .pipe(
                map(() => {
                  return tab;
                }),
                catchError(() => {
                  return of(undefined);
                }),
              ),
          ),
        ).pipe(
          map((tabs) => {
            return tabs
              .filter((t) => t !== undefined)
              .map((x) => x as ConversationTab);
          }),
          startWith([]),
        );
      }),
    );
  }

  public getActiveConversationTab$() {
    return this.getConversationTabs$().pipe(
      map((tabs) => {
        return tabs.find((tab) => tab.active) || null;
      }),
      distinctUntilChanged((pv, cv) => {
        return (
          pv !== null &&
          cv !== null &&
          pv.conversationId === cv.conversationId &&
          pv.defaultMessageId === cv.defaultMessageId
        );
      }),
      map((tab) => {
        return tab;
      }),
    );
  }

  public async selectConversationTab(
    conversationId: string,
    conversationTab?: ConversationTab,
  ) {
    const db = this.dexieService.getDb();

    const existingActiveConversationTab = (
      await db.conversationTabGroup.get({
        browserTabId: this.tabId,
      })
    )?.conversationTabs.find((tab) => tab.active);
    const isAlreadySelected =
      existingActiveConversationTab?.conversationId === conversationId &&
      existingActiveConversationTab?.defaultMessageId ===
        conversationTab?.defaultMessageId;
    if (isAlreadySelected) {
      return;
    }
    console.log('conversationId', conversationId);
    console.log('existingActiveConversationTab', existingActiveConversationTab);

    return db.transaction('rw', db.conversationTabGroup, async () => {
      const existingConversationTabGroup = await db.conversationTabGroup.get({
        browserTabId: this.tabId,
      });
      console.log('existingConversationTabGroup', existingConversationTabGroup);

      if (!existingConversationTabGroup) {
        return null;
      }

      const existingConversationTab =
        existingConversationTabGroup.conversationTabs.find(
          (tab) => tab.conversationId === conversationId,
        );
      if (!existingConversationTab) {
        return null;
      }

      for (const tab of existingConversationTabGroup.conversationTabs) {
        tab.active = false;
      }
      existingConversationTab.active = true;
      existingConversationTab.lastSelectedDate = new Date();
      existingConversationTab.defaultMessageId =
        conversationTab?.defaultMessageId;

      console.log('existingConversationTabGroup', existingConversationTabGroup);

      await db.conversationTabGroup.put(
        existingConversationTabGroup,
        this.tabId,
      );

      return existingConversationTab;
    });
  }

  public async addConversationTabById(
    conversationId: string,
    defaultMessageId?: number,
  ) {
    // This is for enhancing the performance
    this.addConversationTabById$$.next({
      conversationId,
      defaultMessageId,
    });
  }

  public async addConversationTab(conversationTab: ConversationTab) {
    if (this.tabId === undefined) {
      return;
    }

    const db = this.dexieService.getDb();

    await db.transaction('rw', db.conversationTabGroup, async () => {
      const existingGroup = await db.conversationTabGroup.get({
        browserTabId: this.tabId,
      });
      if (!existingGroup) {
        const conversationTabGroup: ConversationTabGroup = {
          browserTabId: this.tabId!,
          conversationTabs: [conversationTab],
        };

        await db.conversationTabGroup.put(conversationTabGroup, this.tabId);

        return;
      }

      // If the conversation tab already exists, select it
      const existingTab = existingGroup.conversationTabs.find(
        (tab) => tab.conversationId === conversationTab.conversationId,
      );
      if (existingTab) {
        await this.selectConversationTab(
          conversationTab.conversationId,
          conversationTab,
        );

        return;
      }

      // Deactivate all tabs if the new tab is active
      if (conversationTab.active) {
        for (const tab of existingGroup.conversationTabs) {
          tab.active = false;
        }
      }

      existingGroup.conversationTabs.push(conversationTab);

      // Remove the oldest tab if the number of tabs exceeds the limit
      if (
        existingGroup.conversationTabs.length >
        this.MAX_NUM_OF_CONVERSATION_TABS
      ) {
        const oldestConversationTab = existingGroup.conversationTabs.reduce(
          (prev, current) =>
            prev.lastSelectedDate < current.lastSelectedDate ? prev : current,
        );
        existingGroup.conversationTabs = existingGroup.conversationTabs.filter(
          (tab) => tab.conversationId !== oldestConversationTab.conversationId,
        );
      }

      await db.conversationTabGroup.put(existingGroup, this.tabId);
    });
  }

  public async removeConversationTab(conversationId: string) {
    const db = this.dexieService.getDb();

    return db.transaction('rw', db.conversationTabGroup, async () => {
      const group = await db.conversationTabGroup.get({
        browserTabId: this.tabId,
      });
      if (!group) {
        return null;
      }

      const tab = group.conversationTabs.find(
        (tab) => tab.conversationId === conversationId,
      );
      if (!tab) {
        return null;
      }

      const lastConversationTabIndex = group.conversationTabs.findIndex(
        (tab) => tab.conversationId === conversationId,
      );
      group.conversationTabs = group.conversationTabs.filter(
        (tab) => tab.conversationId !== conversationId,
      );

      // If the removed tab was active, activate the left tab in the list
      if (tab.active) {
        if (group.conversationTabs.length > 0) {
          const newActiveTabIndex = lastConversationTabIndex - 1;

          group.conversationTabs[
            newActiveTabIndex >= 0 ? newActiveTabIndex : 0
          ].active = true;
        }
      }

      console.log('group', group);

      await db.conversationTabGroup.put(group, this.tabId);

      return group.conversationTabs.find((tab) => tab.active) || null;
    });
  }

  public async clearConversationTabs() {
    if (this.tabId === undefined) {
      return;
    }

    const db = this.dexieService.getDb();

    return db.conversationTabGroup.put({
      browserTabId: this.tabId,
      conversationTabs: [],
    });
  }
}
