import dayjs from 'dayjs';
import { injectable, interfaces } from 'inversify';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  interval,
  map,
  Observable,
  scan,
} from 'rxjs';

import { SimpleObjectDataSource } from '../data-sources/simple-object-data-source';
import { ClassicRealTimeService } from '../signal-r/classic-real-time.service';

interface ConversationTypingEventAccumulator {
  [conversationId: string]: Map<string, dayjs.Dayjs>;
}

interface ConversationTypingEvent {
  conversationId: string;
  staffIds: string[];
}

@injectable()
export class ConversationTypingDataSource extends SimpleObjectDataSource<ConversationTypingEventAccumulator> {
  private classiceRealTimeService: ClassicRealTimeService;

  private conversationTypingEvents:
    | Observable<ConversationTypingEvent[]>
    | undefined;

  constructor(container: interfaces.Container) {
    super();

    this.classiceRealTimeService = container.get(ClassicRealTimeService);
  }

  public setupAndGet$() {
    if (this.conversationTypingEvents) {
      return this.conversationTypingEvents;
    }

    this.conversationTypingEvents = combineLatest([
      this.classiceRealTimeService.getOnConversationTyping$().pipe(
        map((event) => ({
          ...event,
          date: dayjs(), // Ensure event.date is converted correctly to dayjs object if not already
        })),
      ),
      interval(1000).pipe(map(() => dayjs())),
    ]).pipe(
      filter(([event]) => {
        // Ensure both conversationId and staffId are present and match the target conversationId
        return !!(event.conversationId && event.staffId);
      }),
      scan(
        (
          accumulator: ConversationTypingEventAccumulator,
          [event, intervalDate],
        ) => {
          const conversationId = event.conversationId!;
          if (!accumulator[conversationId]) {
            accumulator[conversationId] = new Map();
          }

          // Always update the timestamp when a new event from the same staffId is received
          accumulator[conversationId].set(event.staffId!, event.date);

          // Loop through all staffIds to determine if they should still be shown as typing
          const typingStaffIds = Object.keys(accumulator);
          typingStaffIds.forEach((accumlatorKey) => {
            accumulator[accumlatorKey].forEach((value, key) => {
              if (intervalDate.diff(value, 'second') >= 5) {
                accumulator[accumlatorKey].delete(key);
              }
            });
            // Remove the conversationId from the accumulator if there are no more staffIds typing
            if (accumulator[accumlatorKey].size === 0) {
              delete accumulator[accumlatorKey];
            }
          });
          return accumulator;
        },
        {} as ConversationTypingEventAccumulator,
      ),
      map((accumulator) =>
        Object.keys(accumulator).map(
          (key) =>
            ({
              conversationId: key,
              staffIds: Array.from(accumulator[key].keys()),
            } as ConversationTypingEvent),
        ),
      ),
      distinctUntilChanged((previous, current) => {
        if (previous.length !== current.length) {
          return false;
        }
        return previous.every((previousItem) => {
          const currentItem = current.find(
            (x) => previousItem.conversationId === x.conversationId,
          );

          if (!currentItem) {
            return false;
          }

          // Check if staffIds have the same length
          if (previousItem.staffIds.length !== currentItem.staffIds.length) {
            return false;
          }

          // Check if all staffIds match
          return previousItem.staffIds.every(
            (id, idx) => id === currentItem.staffIds[idx],
          );
        });
      }),
    );

    return this.conversationTypingEvents;
  }
}
