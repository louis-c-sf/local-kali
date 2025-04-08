import { equals } from "ramda";

export function getNextLoopItem<L extends readonly any[], I = L[number]>(
  current: I,
  list: L
): I {
  const currentStepIdx = list.findIndex(equals(current));
  const stepsLoop = [...list, list[0]] as any;
  return stepsLoop[currentStepIdx + 1];
}
