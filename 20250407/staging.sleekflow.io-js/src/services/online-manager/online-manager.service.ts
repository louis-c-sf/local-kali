import { injectable } from 'inversify';
import { fromEvent, map, merge, of, switchMap } from 'rxjs';

@injectable()
export class OnlineManagerService {
  public online$ = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(switchMap((isOnline) => (isOnline ? of(true) : of(false))));
}
