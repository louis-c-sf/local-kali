import { escape } from "lodash-es";

export function htmlEscape(input: string): string {
  return escape(input);
}
