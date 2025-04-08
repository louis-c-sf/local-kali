import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  Subject,
} from 'rxjs';

import { Wrapper } from '../models/wrapper';
import { MountableDataSource } from './mountable-data-source';

let y = 0;

export abstract class ArrayPagedDataSource<T extends Wrapper>
  implements MountableDataSource
{
  private id = y++;
  private isDisconnected = false;

  private readonly cachedItemIds = new Set<string | number>();
  private readonly cachedItems$$ = new BehaviorSubject<T[]>([]);

  private _cachedItems: T[] = [];

  protected get cachedItems(): T[] {
    return this._cachedItems;
  }

  private set cachedItems(value: T[]) {
    this._cachedItems = value;
  }

  private readonly isInitializing$$ = new BehaviorSubject<boolean>(true);
  private readonly isFetchingNextPage$$ = new BehaviorSubject<boolean>(false);
  private readonly isFetchingPreviousPage$$ = new BehaviorSubject<boolean>(
    false,
  );
  private readonly hasNextPage$$ = new BehaviorSubject<boolean>(true);
  private readonly hasPreviousPage$$ = new BehaviorSubject<boolean>(true);

  private readonly mounted$$ = new BehaviorSubject<boolean>(false);

  private sortFunc?: (a: T, b: T) => number;

  public observed() {
    return this.cachedItems$$.observed;
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

  protected hasId(id: string): boolean {
    return this.cachedItemIds.has(id);
  }

  protected getCachedItems$(): Observable<T[]> {
    return this.cachedItems$$.asObservable();
  }

  protected getCachedItems() {
    return [...this.cachedItems];
  }

  protected setupSortFunc(sortFunc: (a: T, b: T) => number) {
    this.sortFunc = sortFunc;
  }

  protected yieldSortedItems(isInitializing = false) {
    if (!isInitializing) {
      this.setIsInitializing(false);
    }

    this.cachedItems = [...this.cachedItems.sort(this.sortFunc)];

    this.cachedItems$$.next(this.cachedItems);
  }

  protected addItems(
    items: T[],
    options: {
      getItemId?: (a: T) => string | number;
    } = {},
  ) {
    const { getItemId = (item) => item.getId()! } = options;
    const filteredConversationWrappers = items.filter((cw) => {
      return !this.cachedItemIds.has(getItemId(cw));
    });
    if (filteredConversationWrappers.length === 0) {
      return;
    }

    filteredConversationWrappers.forEach((cw) => {
      this.cachedItemIds.add(getItemId(cw));
    });

    this.cachedItems = this.cachedItems.concat(...filteredConversationWrappers);

    for (const filteredConversationWrapper of filteredConversationWrappers) {
      filteredConversationWrapper.subscribe(this);
    }

    this.yieldSortedItems();
  }

  protected addItem(
    item: T,
    options: {
      getItemId?: (a: T) => string | number;
    } = {},
  ) {
    const { getItemId = (item) => item.getId()! } = options;
    const itemId = getItemId(item);
    if (this.cachedItemIds.has(itemId)) {
      return;
    }
    console.log('add item - ' + itemId);
    this.cachedItemIds.add(itemId);

    this.cachedItems = [...this.cachedItems, item];

    item.subscribe(this);

    this.yieldSortedItems();
  }

  private _removeItem(
    item: T,
    index: number,
    getItemId: (item: T) => string | number,
  ) {
    this.cachedItemIds.delete(getItemId(item));

    this.cachedItems = [...this.cachedItems];
    this.cachedItems.splice(index, 1);

    item.unsubscribe(this);

    this.yieldSortedItems();
  }

  protected removeItem(
    item: T,
    options: {
      findItemIndexFn?: (item: T, index: number, obj: T[]) => boolean;
      getItemId?: (item: T) => string | number;
    } = {},
  ) {
    const {
      findItemIndexFn = (y) => y.getId() === item.getId()!,
      getItemId = (item) => item.getId()!,
    } = options;
    const index = this.cachedItems.findIndex(findItemIndexFn);
    if (index === -1) {
      return;
    }

    this._removeItem(item, index, getItemId);
  }

  protected removeItemById(
    id: string | number,
    options: {
      getItemId?: (a: T) => string | number;
    } = {},
  ) {
    const { getItemId = (item) => item.getId()! } = options;
    const index = this.cachedItems.findIndex((item) => getItemId(item) === id);
    if (index === -1) {
      return;
    }

    const item = this.cachedItems[index];
    console.log('remove item by id - ' + item.getId());
    this._removeItem(item, index, getItemId);
  }

  protected removeItems(
    predicate: (item: T, index: number, array: T[]) => boolean,
  ) {
    const items = this.cachedItems.filter(predicate);
    if (items.length === 0) {
      return;
    }

    items.forEach((item) => {
      this.cachedItemIds.delete(item.getId()!);
    });

    this.cachedItems = this.cachedItems.filter(
      (...args) => !predicate(...args),
    );

    items.forEach((item) => {
      item.unsubscribe(this);
    });

    this.yieldSortedItems();
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

    this.isInitializing$$.complete();
    this.isFetchingNextPage$$.complete();
    this.isFetchingPreviousPage$$.complete();

    this.hasNextPage$$.complete();
    this.hasPreviousPage$$.complete();

    for (const cachedItem of this.cachedItems) {
      cachedItem.unsubscribe(this);
    }

    this.cachedItems$$.complete();

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

  protected setIsInitializing(isLoading: boolean) {
    this.isInitializing$$.next(isLoading);
  }

  public getIsInitializing$(): Observable<boolean> {
    return this.isInitializing$$.asObservable().pipe(distinctUntilChanged());
  }

  protected setIsFetchingNextPage(isFetching: boolean) {
    this.isFetchingNextPage$$.next(isFetching);
  }

  public getIsFetchingNextPage$(): Observable<boolean> {
    return this.isFetchingNextPage$$
      .asObservable()
      .pipe(distinctUntilChanged());
  }

  protected setIsFetchingPreviousPage(isFetching: boolean) {
    this.isFetchingPreviousPage$$.next(isFetching);
  }

  public getIsFetchingPreviousPage$(): Observable<boolean> {
    return this.isFetchingPreviousPage$$
      .asObservable()
      .pipe(distinctUntilChanged());
  }

  protected setHasNextPage(value: boolean) {
    this.hasNextPage$$.next(value);
  }

  public getHasNextPage$(): Observable<boolean> {
    return this.hasNextPage$$.asObservable().pipe(distinctUntilChanged());
  }

  public resetCachedItems() {
    this.cachedItems = [];
    this.cachedItemIds.clear();
    this.cachedItems$$.next([]);
  }

  public reset() {
    this.resetCachedItems();

    this.setIsInitializing(true);
    this.setIsFetchingNextPage(false);
    this.setIsFetchingPreviousPage(false);
    this.setHasNextPage(true);
    this.setHasPreviousPage(true);
  }

  protected setHasPreviousPage(isFetching: boolean) {
    this.hasPreviousPage$$.next(isFetching);
  }

  public getHasPreviousPage$() {
    return this.hasPreviousPage$$.asObservable().pipe(distinctUntilChanged());
  }
}
