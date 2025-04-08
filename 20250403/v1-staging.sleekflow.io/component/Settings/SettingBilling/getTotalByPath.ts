import { BreakdownPartType } from "component/Settings/SettingBilling/ConversationUsage";

export function getTotalByPath(
  path: string[],
  input: BreakdownPartType,
  acc: number = 0
): number {
  const [currKey, ...pathNext] = path;

  if (currKey !== undefined && currKey !== input.key) {
    throw `Bad path: ${path.join()} missing key: ${currKey}`;
  }
  if ("total" in input) {
    return input.total + acc;
  }
  if (!("breakdown" in input)) {
    throw `Missing breakdown and total at ${path.join()}`;
  }
  if (pathNext.length === 0) {
    return input.breakdown.reduce((acc, next) => {
      return getTotalByPath([], next, acc);
    }, acc);
  }
  const [nextKey, ...pathLeftover] = pathNext;
  const nextItem = input.breakdown.find((b) => b.key === nextKey);
  if (!nextItem) {
    throw `Bad path: ${path.join()} missing key: ${nextKey}`;
  }
  if (pathLeftover.length === 0 && "total" in nextItem) {
    return nextItem.total - acc;
  }
  return getTotalByPath(pathNext, nextItem, acc);
}
