import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';

import { MountableDataSource } from './mountable-data-source';

let y = 0;

export abstract class SimpleObjectDataSource<T> implements MountableDataSource {
  private id = y++;
  private isDisconnected = false;

  private cachedItem$$ = new ReplaySubject<T>(1);
  private cachedItem: undefined | T = undefined;

  private readonly isFetching$$ = new BehaviorSubject<boolean>(false);
  private readonly mounted$$ = new BehaviorSubject<boolean>(false);

  protected constructor() {
    // Intentionally left blank
  }

  public observed() {
    return this.cachedItem$$.observed;
  }

  public getMounted() {
    return this.mounted$$.getValue();
  }

  public setMounted(active = true) {
    if (active !== this.mounted$$.getValue()) {
      this.mounted$$.next(active);
    }
  }

  public onMounted() {}
  public onUnmount() {}

  protected getCachedItem$(): Observable<T> {
    return this.cachedItem$$;
  }

  protected getCachedItem(): T {
    if (this.cachedItem === undefined) {
      throw new Error('No cached item');
    }

    return this.cachedItem;
  }

  protected onNextCachedItem(item: T) {
    this.cachedItem$$.next(item);
    this.cachedItem = item;
  }

  private complete$$ = new Subject<void>();
  private disconnect$$ = new Subject<void>();

  public disconnect(): void {
    console.log('disconnect - ' + this.id);

    if (this.isDisconnected) {
      console.log('disconnect - ' + this.id + ' - already disconnected');
    }

    this.isDisconnected = true;

    this.disconnect$$.next();
    this.disconnect$$.complete();

    this.isFetching$$.complete();

    this.setMounted(false);
    this.mounted$$.complete();
  }

  public getDisconnect$(): Observable<void> {
    return this.disconnect$$.asObservable();
  }

  public disconnected(): boolean {
    return this.isDisconnected;
  }

  public complete(): void {
    this.complete$$.next();
    this.complete$$.complete();
  }

  public getComplete$(): Observable<void> {
    return this.complete$$.asObservable();
  }

  protected setIsLoading(isLoading: boolean) {
    this.isFetching$$.next(isLoading);
  }

  public getIsLoading$(): Observable<boolean> {
    return this.isFetching$$.asObservable();
  }
}
