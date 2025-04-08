import {
  ChannelConfigTypeMap,
  ChannelType,
  ChannelConfiguredType,
} from "../component/Chat/Messenger/types";
import { WhatsappAccessLevel } from "../component/CreateWhatsappFlow/WhatsappAccessLabel";
import { nameMatches } from "../component/Channel/selectors";
import { mergeDeepRight } from "ramda";

export default interface ChannelInfoType {
  image: string | undefined;
  desc: string[];
  descBrief: string;
  descBriefHeader?: string;
  name: ChannelType;
  title: string;
  titlePopup?: string;
  titleContent: string;
  isSelected?: boolean;
  setupFee: string;
  isComingSoon?: boolean;
  channelLink?: string[];
  stepByStepGuideLinkTitle?: string;
  stepByStepGuideLink?: string;
  longDescription?: JSX.Element;
  freeTrialDay?: number;
  canHaveMultipleInstances: boolean;
  id?: string;
  installMode?: "easy" | "moderate" | "advanced";
  accessLevel?: WhatsappAccessLevel;
}

export interface HasChannelConfig<K extends keyof ChannelConfigTypeMap> {
  config?: ChannelConfigTypeMap[K];
  name: ChannelType;
}

export interface ChannelInfoConfiguredType<K extends keyof ChannelConfigTypeMap>
  extends ChannelInfoType,
    HasChannelConfig<K> {}

export interface PriceRangeType {
  price: string;
  type: string;
}

export function toChannelInfoTypes(
  channelPrototypeList: ChannelInfoType[],
  channelIntegrationList: ChannelInfoType[]
) {
  return (
    acc: ChannelInfoConfiguredType<any>[],
    next: ChannelConfiguredType<any>
  ) => {
    const channelPrototype: ChannelInfoType | undefined = [
      ...channelPrototypeList,
      ...channelIntegrationList,
    ].find(nameMatches(next.type));

    if (next.type.includes("whatsapp")) {
      const whatsappPrototype = channelPrototypeList.find(
        nameMatches("whatsapp")
      );
      if (whatsappPrototype?.name === "whatsapp") {
        const appendConfigs = (next.configs ?? []).map((config) => {
          const channelConfigured = mergeDeepRight(whatsappPrototype, {
            config,
            name: next.type,
            accessLevel: config.accessLevel,
            title: config.channelName ?? config.name,
          });
          return channelConfigured as ChannelInfoConfiguredType<any>;
        });
        return [...acc, ...appendConfigs];
      }
      const whatsappCatalogPrototype = channelPrototypeList.find(
        nameMatches("whatsappCatalog")
      );
      if (whatsappCatalogPrototype?.name === "whatsappCatalog") {
        let appendConfigs: ChannelInfoConfiguredType<any>[] = [];
        for (const config of next.configs ?? []) {
          if (config.productCatalogSetting) {
            const channelConfigured = mergeDeepRight(whatsappCatalogPrototype, {
              config,
              name: next.type,
              accessLevel: config.accessLevel,
              title: "",
              descBrief: "",
            });
            appendConfigs.push(
              channelConfigured as ChannelInfoConfiguredType<any>
            );
            break;
          }
        }

        return [...acc, ...appendConfigs];
      }
    } else if (channelPrototype && next.configs) {
      const appendConfigs = next.configs.map((config) => {
        const channelConfigured = mergeDeepRight(channelPrototype, {
          config,
        });
        return channelConfigured as ChannelInfoConfiguredType<any>;
      });
      return [...acc, ...appendConfigs];
    }
    return acc;
  };
}
