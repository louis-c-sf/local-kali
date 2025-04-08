import React from "react";
import "semantic-ui-css/semantic.min.css";
import "./style/css/main.css";
import "./style/css/bem.css";
import "./style/css/pages.css";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import "./style/react_dates_overrides.css";
import { BrowserRouter } from "react-router-dom";
import { initialUser } from "./context/LoginContext";
import { Action, LoginType } from "./types/LoginType";
import Helmet from "react-helmet";
import { mergeMessages } from "./component/Chat/mutators/mergeMessages";
import { matchesConversationAndUniqueId } from "./component/Chat/mutators/chatSelectors";
import AppRootContext from "./AppRootContext";
import SignalRObservable from "./component/SignalR/SignalRObservable";
import { mergeRight, remove } from "ramda";
import { reduceReducersWithDefaults } from "./utility/reduce-reducers";
import { chatReducer } from "./App/reducers/chatReducer";
import AppRoute from "./AppRoute";
import { settingsReducer } from "./App/reducers/settingsReducer";
import i18n from "./i18n";
import { dedupeChats } from "./component/Chat/mutators/dedupeChats";
import { companyReducer } from "./App/reducers/companyReducer";
import { Sidebar } from "semantic-ui-react";
import { applyMiddleware, createStore } from "redux";
import { broadcastReducer } from "./App/reducers/broadcastReducer";
import { contactsReducer } from "./App/reducers/contactsReducer";
import { usageReducer } from "./App/reducers/usageReducer";
import { channelConnectionReducer } from "./App/reducers/channelConnectionReducer";
import { notificationReducer } from "./App/reducers/notificationReducer";
import { composeWithDevTools } from "redux-devtools-extension";
import { createEpicMiddleware } from "redux-observable";
import rootEpic from "./App/epics/rootEpic";
import { defaultAssigee } from "./types/state/inbox/AssigneeType";
import { StaffType } from "./types/StaffType";
import { GlobalBoundary } from "./App/errorBoundaries/GlobalBoundaryBase";
import { automationRulesReducer } from "./App/reducers/automationRulesReducer";
import { helpCenterReducer } from "./App/reducers/helpCenterReducer";
import { MobileBrowserSplash } from "component/shared/MobileBrowserSplash/MobileBrowserSplash";
import MessageType from "types/MessageType";
import Auth0ProviderWithRedirect from "auth/Auth0ProviderWithRedirect";
import { whatsappCloudApiReducer } from "features/WhatsappCloudAPI/reducers/whatsappCloudApiReducer";
import { ErrorBoundary } from "@sentry/react";
import {
  actionsLoggerMiddleware,
  flushRecords,
} from "utility/debug/actionsLoggerMiddleware";
import SignalRAckObservable from "component/SignalR/SignalRAckObservable";

export const appReducer = (
  state: LoginType = initialUser,
  action: Action
): LoginType => {
  let assignees = { ...state.assignees };
  switch (action.type) {
    case "LOGIN": {
      return Object.assign({}, state, {
        user: { ...action.user, isAuthenticated: true },
      });
    }
    case "ASSIGNEE_ID_SELECTED":
      return { ...state, selectedAssigneeId: action.selectedAssigneeId };

    case "ASSIGNEES_CREATED":
      return {
        ...state,
        assignees: action.assignees || assignees,
      };
    case "UPDATE_SELECTED_USER":
      if (action.selectedUser) {
        return { ...state, selectedUser: action.selectedUser };
      }
      return { ...state };

    case "UPDATE_CHAT_CHANNEL":
      return mergeRight(state, {
        selectedChannelFromConversation: action.selectedChannelFromConversation,
        selectedChannelIdFromConversation:
          action.selectedChannelIdFromConversation,
      });

    case "INBOX.FILTER.CHANNEL_INIT":
      return {
        ...state,
        selectedChannel: action.channel,
        selectedInstanceId: action.channelInstanceId,
      };

    case "INBOX.FILTER_CHANNEL_UPDATE":
      const isSelectedChannelClicked =
        action.selectedChannel === state.selectedChannel &&
        action.selectedInstanceId === state.selectedInstanceId;
      if (state.selectedChannel !== "all" && isSelectedChannelClicked) {
        // reset channel filter on re-click
        return {
          ...state,
          selectedChannel: "all",
          selectedInstanceId: undefined,
        };
      }
      if (action.selectedInstanceId) {
        return {
          ...state,
          selectedChannel: action.selectedChannel,
          selectedInstanceId: action.selectedInstanceId,
        };
      }
      return {
        ...state,
        selectedChannel: action.selectedChannel,
        selectedInstanceId: undefined,
      };

    case "INBOX.FILTER_STATUS_UPDATE":
      return {
        ...state,
        selectedStatus: action.selectedStatus,
      };

    case "UPDATE_MESSAGE_STATUS":
      let foundMessage: MessageType | undefined = undefined;
      const foundMessageById = state.messagesMemoized.find(
        matchesConversationAndUniqueId(
          action.conversationId,
          action.messageUniqueID,
          action.messageCheckSum
        )
      );
      if (foundMessageById) {
        foundMessage = foundMessageById;
      } else {
        const foundMessageWithoutUniqueId = state.messagesMemoized.find(
          matchesConversationAndUniqueId(
            action.conversationId,
            "",
            action.messageCheckSum
          )
        );
        if (foundMessageWithoutUniqueId) {
          foundMessage = {
            ...action.receivedMessage,
            ...foundMessageWithoutUniqueId,
          };
        }
      }
      if (!foundMessage) {
        foundMessage = action.receivedMessage;
      }
      foundMessage.status = action.messageStatus;
      foundMessage.messageChecksum = action.messageCheckSum;

      return {
        ...state,
        messagesMemoized: mergeMessages(state.messagesMemoized, [foundMessage]),
      };

    case "UPDATE_FACEBOOK_RESPONSE":
      return {
        ...state,
        facebookResponse: action.facebookResponse,
      };
    case "UPDATE_FACEBOOK_ADS_RESPONSE":
      return {
        ...state,
        facebookAdsResponse: action.facebookResponse,
      };
    case "DISPLAY_SIGNALR_DISCONNECT_MESSAGE":
      return { ...state, isDisplaySignalRMessage: true };
    case "HIDE_SIGNALR_DISCONNECT_MESSAGE":
      return { ...state, isDisplaySignalRMessage: false };

    case "UPDATE_STAFF_LIST":
      if (action.staffList) {
        const staffList = action.staffList;
        if (state.user) {
          const currentStaff = action.staffList.find(
            (staff: StaffType) => staff.userInfo.id === state.user.id
          );
          if (currentStaff) {
            return { ...state, currentStaff, staffList: staffList || [] };
          }
        }
        return { ...state, staffList: staffList || [] };
      }
      return state;

    case "UPDATE_SELECTED_INTEGRATION_ITEM":
      return {
        ...state,
        selectedIntegrationItem: action.selectedIntegrationItem,
      };
    case "LOGOUT":
      return {
        ...state,
        user: { ...action.user, isAuthenticated: false },
      };
    case "UPDATE_REMARKS":
      if (action.profile && action.remark) {
        return {
          ...state,
          profile: {
            ...state.profile,
            remarks: [...(state.profile.remarks || []), action.remark],
          },
        };
      }
      return state;
    case "LIST_REMARKS":
      if (state.profile) {
        return {
          ...state,
          profile: { ...state.profile, remarks: action.remarks || [] },
        };
      }
      return state;
    case "CHAT_REMOVED":
      if (action.conversationId) {
        const assigneeId = Object.keys(assignees).find((assigneesName) =>
          assignees[assigneesName].conversations.find(
            (conversation) =>
              conversation.conversationId === action.conversationId
          )
        );
        if (assigneeId) {
          const findAssigneeConversationIdx = assignees[
            assigneeId
          ].conversations.findIndex(
            (conversation) =>
              conversation.conversationId === action.conversationId
          );
          const updatedAssigneeeConversations = remove(
            findAssigneeConversationIdx,
            1,
            assignees[assigneeId].conversations
          );
          assignees[assigneeId] = {
            ...assignees[assigneeId],
            conversations: dedupeChats(updatedAssigneeeConversations),
          };
          if (state.chats) {
            const foundChatIndex = state.chats.findIndex(
              (chat) => chat.conversationId === action.conversationId
            );
            if (foundChatIndex > -1) {
              const updateChats = remove(foundChatIndex, 1, state.chats);
              if (state.profile.id === state.chats[foundChatIndex].id) {
                const nextIndex =
                  foundChatIndex >= updateChats.length
                    ? updateChats.length - 1
                    : foundChatIndex;
                return {
                  ...state,
                  assignees,
                  profile:
                    (updateChats.length > 0 && updateChats[nextIndex]) ||
                    defaultAssigee.conversations[0], // todo replace with an empty conversations factory or switch to All assignee
                  chats: dedupeChats(updateChats),
                };
              }
              return { ...state, assignees, chats: updateChats };
            }
          }
          return { ...state, assignees };
        }
      }
      return { ...state };
    case "TOGGLE_PROFILE":
      return { ...state, isUpdateProfile: action.isUpdateProfile };
    case "CREATE_PROFILE":
      if (action.profile.id !== state.profile.id) {
        return { ...state, profile: { ...action.profile } };
      }
      return state;
    case "PROFILE_UPDATED":
      if (action.profile) {
        if (state.profile.id === action.profile.id) {
          return {
            ...state,
            profile: { ...state.profile, ...action.profile },
          };
        }
      }
      return state;

    case "UPDATE_BANNER_MESSAGE":
      return {
        ...state,
        bannerMessage: action.bannerMessage,
        hideBannerMessage: false,
      };
    case "HIDE_BANNER_MESSAGE":
      return { ...state, hideBannerMessage: true };

    case "IS_CONTACT_EXCEED_LIMIT":
      return { ...state, isContactExceed: action.isExceed };

    case "INBOX.FILTER_UPDATE":
      return {
        ...state,
        selectedStatus: action.selectedStatus,
        selectedChannel: action.selectedChannel,
        selectedInstanceId: action.selectedInstanceId,
        selectedAssignee: action.assigneeName,
        selectedAssigneeId: action.selectedAssigneeId,
        inbox: {
          ...state.inbox,
          filter: {
            ...state.inbox.filter,
            orderBy: action.selectedOrderBy,
          },
        },
      };
    case "EDIT_CONTACT":
      return { ...state, isEditContact: action.isEditContact };

    case "INITIAL_CHECKOUT":
      return { ...state, stripeCheckout: action.stripeCheckout };

    case "UPDATE_COMPANY_CUSTOM_USER_PROFILE_FIELD":
      if (state.company && action.customUserProfileFields) {
        return {
          ...state,
          company: {
            ...state.company,
            customUserProfileFields: action.customUserProfileFields,
          },
        };
      }
      return { ...state };
    case "UPDATE_LOGGEDIN_USER_DETAIL":
      if (action.loggedInUserDetail) {
        return {
          ...state,
          loggedInUserDetail: action.loggedInUserDetail,
          selectedTimeZone:
            action.loggedInUserDetail.timeZoneInfo.baseUtcOffsetInHour,
        };
      }
      return { ...state };
    case "UPDATE_CURRENT_PLAN":
      return { ...state, currentPlan: action.currentPlan };
    case "UPDATED_PLAN":
      return { ...state, isPlanUpdated: action.isPlanUpdated };
    case "QUICK_REPLY_UPDATE_TEMPLATES":
      return { ...state, quickReplyTemplates: action.items };
    case "IS_DISPLAY_UPGRADE_PLAN_MODAL":
      return {
        ...state,
        isDisplayUpgradePlanModal: action.isDisplayUpgradePlanModal,
      };
    case "GOOGLE_SIGNIN":
      return {
        ...state,
        googleAuth: action.googleAuth,
      };
    case "CLEAR_CACHED_MESSAGE":
      return {
        ...state,
        messagesMemoized: [],
      };
    case "GOOGLE_SIGNOUT":
      return {
        ...state,
        googleAuth: undefined,
      };
    case "TRIAL_ALERT_SHOWN":
      return {
        ...state,
        isTrialAlert: true,
      };
    case "TRIAL_ALERT_HIDDEN":
      return {
        ...state,
        isTrialAlert: false,
      };

    case "CLEAR_COMPANY":
      return {
        ...state,
        ...initialUser,
        loggedInUserDetail: undefined,
      };
    case "UPDATE_CURRENCY":
      return {
        ...state,
        currency: action.currency,
      };
    case "DISPLAY_AUTOMATION_DEFAULT_RULE":
      return {
        ...state,
        isDisplayedDefaultRule: true,
      };
    case "HIDE_AUTOMATION_DEFAULT_RULE":
      return {
        ...state,
        isDisplayedDefaultRule: false,
      };
    case "COMPANY.USER_WORKSPACE_LOCATION.LOAD":
      return {
        ...state,
        userWorkspaceLocation: action.userWorkspaceLocation,
      };
    case "IS_RBAC_TOGGLE":
      return {
        ...state,
        isRbacEnabled: action.isRbacEnabled,
      };
    default:
      return state;
  }
};
declare global {
  interface Window {
    Stripe: any;
    lmFinished: any;
    Beamer: any;
    chmln: any;
    auth0AccessToken: string;
    tolt: any;
  }
}

const reducers = reduceReducersWithDefaults(
  appReducer,
  companyReducer,
  chatReducer,
  settingsReducer,
  broadcastReducer,
  contactsReducer,
  usageReducer,
  channelConnectionReducer,
  notificationReducer,
  automationRulesReducer,
  helpCenterReducer,
  whatsappCloudApiReducer
);
// add rxjs epics
const epicMiddleware = createEpicMiddleware();
// setup redux tools
const composeEnhancers = composeWithDevTools({
  name: "SleekFlow",
  trace: true,
  traceLimit: 3,
});
const store = createStore(
  reducers,
  initialUser,
  composeEnhancers(
    applyMiddleware(epicMiddleware, actionsLoggerMiddleware(100))
  )
);

epicMiddleware.run(rootEpic);

const App: React.FC = () => {
  return (
    <>
      <Helmet
        meta={[
          {
            name: "SleekFlow",
            content: "SleekFlow",
          },
        ]}
        link={[
          {
            rel: "icon",
            type: "image/png",
            href: "./logo-favicon.png",
          },
        ]}
      >
        <html lang={i18n.language} />
      </Helmet>
      <BrowserRouter>
        <ErrorBoundary
          beforeCapture={(scope) => {
            scope.setContext("redux", {
              actionsLog: flushRecords(100),
            });
          }}
        >
          <Auth0ProviderWithRedirect>
            <AppRootContext value={store}>
              <GlobalBoundary user={store.getState().user}>
                <MobileBrowserSplash>
                  <SignalRObservable>
                    <SignalRAckObservable>
                      <Sidebar.Pushable className="pushable">
                        <div className="pusher" id={"app-sidebar-pusher"}>
                          <AppRoute />
                        </div>
                        <div
                          id="sidebar-area-right"
                          className={"sidebar-area right"}
                        ></div>
                      </Sidebar.Pushable>
                    </SignalRAckObservable>
                  </SignalRObservable>
                </MobileBrowserSplash>
              </GlobalBoundary>
            </AppRootContext>
          </Auth0ProviderWithRedirect>
        </ErrorBoundary>
      </BrowserRouter>
    </>
  );
};

export default App;
