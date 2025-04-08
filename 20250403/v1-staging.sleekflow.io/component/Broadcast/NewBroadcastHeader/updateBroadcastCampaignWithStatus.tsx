import React from "react";
import { Action, UserType } from "../../../types/LoginType";
import { StaffType } from "../../../types/StaffType";
import BroadcastCampaignType from "../../../types/BroadcastCampaignType";
import {
  BroadcastCampaignContextType,
  defaultBroadcastCampaign,
} from "../BroadcastContext";
import moment from "moment";

export function updateBroadcastCampaignWithStatus(
  status: string,
  loginDispatch: React.Dispatch<Action>,
  staffList: StaffType[],
  broadcastCampaign: BroadcastCampaignType[],
  user: UserType,
  broadcastContext: BroadcastCampaignContextType
) {
  const {
    id,
    name,
    audienceTypes,
    channels,
    channelsWithIds,
    channelWithId,
    content,
    startDate,
    time,
  } = broadcastContext;
  if (broadcastCampaign && broadcastCampaign.length > 0) {
    const currentBroadcastIndex = broadcastCampaign.findIndex(
      (campaign) => campaign.id === id
    );
    if (currentBroadcastIndex > -1) {
      broadcastCampaign[currentBroadcastIndex] = {
        ...broadcastCampaign[currentBroadcastIndex],
        audienceTypes,
        name,
        startDate,
        time,
        lastUpdated: moment().toLocaleString(),
        content,
        channels,
        channelsWithIds,
        channelWithId,
        status,
      };
      loginDispatch({ type: "UPDATE_BROADCAST", broadcastCampaign });
    } else {
      const staff = staffList.filter(
        (staff) => staff.userInfo.email === user.email
      )[0];
      const currentBroadcast: BroadcastCampaignType = {
        ...defaultBroadcastCampaign,
        id: "1",
        name,
        audienceTypes,
        channels,
        channelsWithIds,
        channelWithId,
        content,
        status,
        uploadedFiles: [],
        filterList: [],
        startDate,
        time,
        lastUpdated: moment().toLocaleString(),
        createdBy: staff,
        params: [],
      };
      loginDispatch({
        type: "UPDATE_BROADCAST",
        broadcastCampaign: [currentBroadcast],
      });
    }
  } else {
    const staff = staffList.filter(
      (staff) => staff.userInfo.email === user.email
    )[0];
    const currentBroadcast: BroadcastCampaignType = {
      ...defaultBroadcastCampaign,
      id: "1",
      name,
      audienceTypes,
      channels,
      channelsWithIds,
      channelWithId,
      content,
      status,
      startDate,
      uploadedFiles: [],
      filterList: [],
      time,
      lastUpdated: moment().toLocaleString(),
      createdBy: staff,
      params: [],
    };
    loginDispatch({
      type: "UPDATE_BROADCAST",
      broadcastCampaign: [currentBroadcast],
    });
  }
}
