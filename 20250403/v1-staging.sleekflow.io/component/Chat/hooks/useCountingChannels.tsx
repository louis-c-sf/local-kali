import useCompanyChannels from "./useCompanyChannels";
import { matchingNames } from "../../shared/ChannelsValueDropdown";
export default function useCountingChannels(enabledChannels?: string[]) {
  let companyChannels = useCompanyChannels();
  if (enabledChannels) {
    companyChannels = companyChannels.filter(matchingNames(enabledChannels));
  }
  return companyChannels.reduce((acc, next) => {
    const configs = next.configs ?? [];
    if (configs.length === 0) return acc + 1;
    return acc + configs.length;
  }, 0);
}
