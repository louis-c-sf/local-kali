import { FeaturesGuard } from "../helpers/FeaturesGuard";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";

export function useFeaturesGuard() {
  const [currentPlan, company, usage] = useAppSelector(
    (s) => [s.currentPlan, s.company, s.usage],
    equals
  );

  return new FeaturesGuard(currentPlan, usage, company);
}
