import {
  ChannelsAction,
  ChannelsState,
  defaultChannelsState,
} from "./channelsReducer";
import React from "react";

export type ChannelContextType = {
  state: ChannelsState;
  dispatch: (action: ChannelsAction) => any;
};
export const ChannelsContext = React.createContext<ChannelContextType>({
  state: defaultChannelsState(),
  dispatch: (action: ChannelsAction) => {},
});
