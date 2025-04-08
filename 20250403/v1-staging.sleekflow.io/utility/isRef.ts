import { RefObject } from "react";

export function isRef(obj: unknown): obj is RefObject<any> {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return "current" in obj;
}
