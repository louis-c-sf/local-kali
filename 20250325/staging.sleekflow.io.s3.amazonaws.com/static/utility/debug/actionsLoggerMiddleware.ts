import { LoginType, Action } from "types/LoginType";
import { Dispatch, Middleware } from "redux";
import { Scope } from "@sentry/browser";

const logs: Action[] = [];

export function actionsLoggerMiddleware(
  buffer: number
): Middleware<{}, void, any> {
  return () => (next: Dispatch<Action>) => (action: Action) => {
    if (logs.length > buffer - 1) {
      logs.shift();
    }
    logs.push(action);
    return next(action);
  };
}

export function flushRecords(limit: number) {
  const buffer = logs.slice(-limit, logs.length);
  logs.length = 0;
  return buffer;
}

export function resetRecords() {
  logs.length = 0;
}
