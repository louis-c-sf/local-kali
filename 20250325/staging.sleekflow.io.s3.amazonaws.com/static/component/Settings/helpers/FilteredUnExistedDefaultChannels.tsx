import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { findConfigInCompany } from "../../Channel/selectors";
import { ChannelConfiguredType } from "../../Chat/Messenger/types";

const FilteredUnExistedDefaultChannels = (
  companyChannels: ChannelConfiguredType<any>[],
  defaultChannels: TargetedChannelType[]
) => {
  const filteredUnExistedDefaultChannels = defaultChannels;
  defaultChannels.forEach((channel, index) => {
    if (channel.ids) {
      channel.ids.forEach((id) => {
        const result = findConfigInCompany(
          companyChannels,
          channel.channel,
          id
        );
        if (result === undefined) {
          filteredUnExistedDefaultChannels.splice(index, 1);
        }
      });
    }
  });
  return filteredUnExistedDefaultChannels;
};
export default FilteredUnExistedDefaultChannels;
