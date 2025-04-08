import { isObject } from "lodash-es";

export interface RefundErrorType {
  code: "LogicError" | "SystemError" | "Unknown";
}

export function isRefundError(e: unknown): e is RefundErrorType {
  if (isObject(e) && e.hasOwnProperty("code")) {
    return ["LogicError", "SystemError"].includes((e as RefundErrorType).code);
  }
  return false;
}
