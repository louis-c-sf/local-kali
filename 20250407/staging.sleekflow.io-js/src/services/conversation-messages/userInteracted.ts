import { Subject } from 'rxjs';

const userInteracted = new Subject<boolean>();

export const userInteracted$ = userInteracted.asObservable();
export const setUserInteracted = () => userInteracted.next(true);
