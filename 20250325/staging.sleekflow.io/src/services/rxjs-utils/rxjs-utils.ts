import type { RetryConfig } from 'rxjs';
import { Observable, ReplaySubject, retry, take } from 'rxjs';

export enum CACHE_REFRESHING_BEHAVIOUR {
  NEVER_REFRESH = 'NEVER_REFRESH',
  ALWAYS_REFRESH_SERVER = 'ALWAYS_REFRESH_SERVER',
  ALWAYS_REFRESH_CLIENT = 'ALWAYS_REFRESH_CLIENT',
}

export class RxjsUtils {
  public static getRetryAPIRequest(options: RetryConfig = {}) {
    const { count = 3, delay = 1000, resetOnSuccess = true, ...rest } = options;
    return function retryRequest<T>(observable$: Observable<T>) {
      return observable$.pipe(
        retry({
          count,
          delay,
          resetOnSuccess,
          ...rest,
        }),
      );
    };
  }

  public static cacheAndRetryObservable<T>(
    replaySubjectFunc: () => ReplaySubject<T> | undefined,
    observable: Observable<T>,
    shouldRefresh: boolean,
  ) {
    const replaySubject = replaySubjectFunc();

    if (!shouldRefresh && replaySubject) {
      return {
        replaySubject$$: replaySubject as ReplaySubject<T>,
        observable$: replaySubject
          .asObservable()
          .pipe(take(1)) as Observable<T>,
      };
    }

    const refresh$ = (replaySubject: ReplaySubject<T>) => {
      observable.pipe(this.getRetryAPIRequest(), take(1)).subscribe({
        next: (upw: T) => {
          replaySubject.next(upw);
        },
        error: (error) => {
          replaySubject.error(error);
        },
      });
    };

    let myReplaySubject = replaySubject;

    if (myReplaySubject === undefined) {
      myReplaySubject = new ReplaySubject<T>(1);

      refresh$(myReplaySubject);
    } else {
      if (shouldRefresh) {
        refresh$(myReplaySubject);
      }
    }

    if (shouldRefresh) {
      return {
        replaySubject$$: myReplaySubject as ReplaySubject<T>,
        observable$: myReplaySubject.asObservable() as Observable<T>,
      };
    }

    return {
      replaySubject$$: myReplaySubject as ReplaySubject<T>,
      observable$: myReplaySubject
        .asObservable()
        .pipe(take(1)) as Observable<T>,
    };
  }
}
