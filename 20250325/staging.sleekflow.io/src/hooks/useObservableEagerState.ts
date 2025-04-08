import { useObservableEagerState as useObservableEagerStateBase } from 'observable-hooks';
import { useMemo } from 'react';
import { Observable, type OperatorFunction, type Subscriber } from 'rxjs';

/**
 * Emits `fallbackValue` immediately upon subscription *only* if
 * the source Observable has not produced a synchronous emission.
 *
 * Example:
 *   const source$ = new BehaviorSubject('BehaviorSubject value');
 *   // Because BehaviorSubject emits synchronously,
 *   // fallback value won't be used:
 *   source$
 *     .pipe(startWithIfNoSyncEmission('fallback'))
 *     .subscribe(value => console.log(value));
 */
export function startWithIfNoSyncEmission<T>(
  fallbackValue: T,
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber: Subscriber<T>) => {
      let didSyncEmit = false;
      let didSyncComplete = false;
      let didSyncError = false;

      const subscription = source.subscribe({
        next: (value) => {
          didSyncEmit = true;
          subscriber.next(value);
        },
        error: (err) => {
          didSyncError = true;
          subscriber.error(err);
        },
        complete: () => {
          didSyncComplete = true;
          subscriber.complete();
        },
      });

      // Emit fallback only if no synchronous emission, completion, or error occurred
      if (!didSyncEmit && !didSyncComplete && !didSyncError) {
        subscriber.next(fallbackValue);
      }

      return subscription;
    });
}

export const useObservableEagerState = <TState>(
  state$: Observable<TState>,
  fallbackValue: TState,
) => {
  return useObservableEagerStateBase(
    useMemo(
      () => state$.pipe(startWithIfNoSyncEmission(fallbackValue)),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- fallback value used only on initial renders
      [state$],
    ),
  );
};
