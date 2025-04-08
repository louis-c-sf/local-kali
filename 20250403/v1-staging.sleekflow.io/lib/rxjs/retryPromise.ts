import { from, timer, throwError } from "rxjs";
import { catchError, switchMap, retry } from "rxjs/operators";

export function retryPromise<T>(
  promise: Promise<T>,
  attempts: number,
  timeout: number
) {
  if (attempts < 1) {
    throw "Please specify 1+ attempts";
  }
  return from(promise).pipe(
    catchError(
      // catch errors from the promise, returns a new observable
      (error) => {
        // console.error(error);
        return timer(timeout) // starts new Observable that fires after timeout
          .pipe(
            // appends actions after start
            switchMap(
              // allows to produce observable with custom data
              () => throwError(error) // throws the error to be caught by retry()
            )
          );
      }
    ),
    retry(attempts - 1)
  );
}
