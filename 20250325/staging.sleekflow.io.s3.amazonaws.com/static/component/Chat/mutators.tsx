import { ChannelConfiguredType, ChannelType } from "./Messenger/types";
import { getConfigId } from "../Channel/selectors";

export interface ChannelOptionValueType {
  type: ChannelType | "all";
  id?: string;
}

export function toOptionValues(
  items: ChannelOptionValueType[],
  ch: ChannelConfiguredType<any>
) {
  if (!ch.configs || ch.configs.length === 0) {
    items.push({
      type: ch.type,
    });
  } else {
    for (let config of ch.configs) {
      let configStub = {
        name: ch.type,
        config,
      };
      items.push({
        id: getConfigId(configStub),
        type: ch.type,
      });
    }
  }
  return items;
}
