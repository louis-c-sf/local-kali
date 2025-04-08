import React, { createContext } from "react";
import { Action, LoginType } from "../types/LoginType";
import { UserInfoType } from "../types/ConversationType";
import { initInboxState } from "../types/state/InboxStateType";
import { defaultAssigee, defaultUser } from "../types/state/inbox/AssigneeType";
import { defaultStaff } from "../types/StaffType";
import { defaultHelpCenterState } from "../App/reducers/helpCenterReducer";
import { defaultChatSearchedState } from "App/reducers/chatSearchedReducer";

export interface LoginContextType extends LoginType {
  loginDispatch: React.Dispatch<Action>;
}

export const initialUser: LoginType = {
  userWorkspaceLocation: undefined,
  currentPlan: {
    id: "",
    subscriptionName: "",
    description: "",
    amount: 0,
    currency: "USD",
    maximumContact: 0,
    maximumMessageSent: 0,
    maximumCampaignSent: 0,
    includedAgents: 0,
    maximumChannel: false,
    extraChatAgentPlan: "",
    extraChatAgentPrice: 0,
    subscriptionTier: 0,
  },
  user: defaultUser!,
  staffList: [defaultStaff],
  selectedUser: defaultAssigee.userInfo as UserInfoType,
  profile: defaultAssigee.conversations[0],
  assignees: {
    default: defaultAssigee,
  },
  selectedTimeZone: 0,
  selectedAssignee: "",
  typeMessage: "",
  pendingStatusFilter: "All",
  isScrollToEnd: false,
  selectedStatus: "open",
  selectedChannel: "",
  hideBannerMessage: true,
  currentChatState: {
    hasMore: true,
    firstLoad: true,
    loading: false,
  },
  messagesMemoized: [],
  isDisplaySignalRMessage: false,
  quickReplyTemplates: [],
  isPlanUpdated: false,
  inbox: initInboxState,
  contacts: {
    lists: [],
    listsBooted: false,
  },
  settings: {
    teamsSettings: {
      teams: [],
      teamsLoaded: false,
    },
  },
  isContactExceed: false,
  isTrialAlert: false,
  isDisplayUpgradePlanModal: false,
  usage: {
    booted: false,
    currentNumberOfChannels: 0,
    maximumNumberOfChannel: 0,
    maximumAutomatedMessages: 100,
    totalMessagesSentFromSleekflow: 0,
    totalContacts: 0,
    maximumContacts: 100,
    maximumAgents: 0,
    currentAgents: 0,
  },
  isDisplayTwilioDefaultoMessage: false,
  connectionBanner: {
    syncing: false,
    whatsappConnecting: false,
    whatsappNotSync: false,
    fbConnecting: false,
  },
  session: {
    started: false,
    takeover: {
      locked: false,
      sessionsActive: [],
    },
  },
  automationRules: undefined,
  currency: "USD",
  automations: {
    selected: undefined,
    booted: false,
  },
  helpCenter: defaultHelpCenterState(),
  isDisplayedDefaultRule: false,
  chats: [],
  chatSearched: defaultChatSearchedState(),
  vendor: {
    whatsappCloudApi: {
      channels: {
        booted: false,
        connectedChannels: [],
      },
    },
  },
};

const LoginContext = createContext<LoginContextType>({
  ...initialUser,
  loginDispatch: () => {},
});

export default LoginContext;
