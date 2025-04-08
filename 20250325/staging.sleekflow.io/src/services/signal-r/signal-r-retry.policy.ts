import * as signalR from '@microsoft/signalr';
import { IRetryPolicy } from '@microsoft/signalr';

export class SignalRRetryPolicy implements IRetryPolicy {
  nextRetryDelayInMilliseconds(
    retryContext: signalR.RetryContext,
  ): number | null {
    if (retryContext.previousRetryCount < 5) {
      return 3000 * retryContext.previousRetryCount;
    } else {
      return 3000 * 5;
    }
  }
}
