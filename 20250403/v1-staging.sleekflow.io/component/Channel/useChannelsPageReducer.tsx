import produce from "immer";
import { getActiveSubscriptionPlan } from "./Whatsapp/ChannelWhatsApp";
import { ChannelsAction, ChannelsState } from "./channelsReducer";
import { useChannelLocales } from "./localizable/useChannelLocales";
import ChannelInfoType, {
  ChannelInfoConfiguredType,
} from "../../types/ChannelInfoType";
import { nameNotMatches } from "./selectors";

export function useChannelsPageReducer() {
  const { liveChatChannel, channelIntegrationList } = useChannelLocales();

  return produce((draft: ChannelsState, action: ChannelsAction) => {
    switch (action.type) {
      case "COMPANY_LOADED":
        const actualWhatsappConfig =
          action.company?.wsChatAPIConfigs &&
          action.company.wsChatAPIConfigs[0];
        draft.isWhatsappConnected = Boolean(actualWhatsappConfig?.isConnected);
        draft.subscriptionPlanCurrent = getActiveSubscriptionPlan(
          action.company,
          action.plans
        );

        if (action.company.wsChatAPIConfigs) {
          draft.isWhatsappPaid =
            action.company.wsChatAPIConfigs.length + 1 <=
            action.company.maximumWhatsappInstance;
        }
        break;

      case "CHANNELS_LOAD":
        draft.pending = true;
        draft.channelsPending = true;
        break;
      case "SWITCH_SHOPIFY_OWNER_CONFIRM":
        draft.channelClicked = action.channel;
        draft.showSwichShopifyOwnerConfirmModal = true;
        break;
      case "CHANNELS_UPDATE":
        draft.channelsPending = false;
        draft.pending = false;
        draft.channelsActive = action.channelsActive;
        draft.channelsAvailable = action.channelsAvailable;
        draft.channelsIntegration = action.channelsIntegration;
        draft.channelsAutomatedIntegration = action.channelAutomatedIntegration;
        draft.channelsRequested = action.channelsRequested;
        break;

      case "STRIPE_STATUS_UPDATE":
        if (action.status) {
          const stripeIntegration = channelIntegrationList.find(
            (integration) => integration.name === "stripe"
          );
          if (stripeIntegration) {
            draft.channelsActive = withChannel(
              draft.channelsActive,
              stripeIntegration
            );
          }
        }
        break;

      case "SALESFORCE_STATUS_UPDATE":
        draft.channelsIntegration = draft.channelsIntegration.filter(
          (integration) => integration.name !== "salesforce"
        );
        const salesforceIntegration = channelIntegrationList.find(
          (integration) => integration.name === "salesforce"
        );
        if (salesforceIntegration) {
          draft.channelsActive = withChannel(
            draft.channelsActive,
            salesforceIntegration
          );
        }
        break;

      case "HUBSPOT_STATUS_UPDATE":
        draft.channelsIntegration = draft.channelsIntegration.filter(
          (integration) => integration.name !== "hubspot"
        );
        const hubspotIntegration = channelIntegrationList.find(
          (integration) => integration.name === "hubspot"
        );
        if (hubspotIntegration) {
          draft.channelsActive = withChannel(
            draft.channelsActive,
            hubspotIntegration
          );
        }
        break;

      case "LIVECHAT_STATUS_LOAD":
        draft.pending = true;
        draft.liveChatStatusPending = true;
        break;

      case "LIVECHAT_STATUS_UPDATE":
        draft.channelsPending = false;
        draft.pending = draft.channelsPending;
        if (action.status) {
          draft.channelsActive = withChannel(
            draft.channelsActive,
            liveChatChannel
          );
        } else {
          draft.channelsAvailable = withChannel(
            draft.channelsAvailable,
            liveChatChannel
          );
        }
        break;

      case "CHANNEL_ACTIVATED":
        draft.channelOpened = undefined;
        draft.showChannelForm = false;
        break;

      case "REMOVE_CONFIRM":
        draft.showRemoveConfirmModal = true;
        draft.channelClicked = action.channel;
        break;

      case "RENAME_CONFIRM":
        draft.showRenameConfirmModal = true;
        draft.channelClicked = action.channel;
        break;

      case "EXECUTE_START":
        draft.confirmModalPending = true;
        draft.channelsPending = true;
        break;

      case "EXECUTE_CANCEL":
        draft.showRenameConfirmModal = false;
        draft.showRemoveConfirmModal = false;
        draft.showSwichShopifyOwnerConfirmModal = false;
        draft.channelClicked = undefined;
        break;

      case "REMOVE_COMPLETE":
        draft.showRemoveConfirmModal = false;
        draft.channelClicked = undefined;
        draft.confirmModalPending = false;
        break;
      case "RENAME_COMPLETE":
        draft.showRenameConfirmModal = false;
        draft.channelClicked = undefined;
        draft.confirmModalPending = false;
        draft.channelsPending = false;
        break;
      case "CHANNEL_FORM_OPEN":
        draft.showChannelForm = true;
        draft.channelOpened = action.channelName;
        draft.isWhatsappChannelSelected = false;
        break;
      case "CHANNEL_WHATSAPP_FORM_CLOSE":
        draft.isWhatsappChannelSelected = false;
        draft.channelOpened = "whatsapp";
        break;
      case "CHANNEL_WHATSAPP_FORM_OPEN":
        draft.showChannelForm = true;
        draft.channelOpened = action.channelName;
        draft.isWhatsappChannelSelected = true;
        break;
      case "CHANNEL_FORM_CLOSE":
        draft.showChannelForm = false;
        draft.channelOpened = undefined;
        draft.isWhatsappScanned = false;
        break;
      case "WHATSAPP_SCANNED":
        draft.isWhatsappScanned = true;
        break;
      case "REVIEW_PLAN_MODAL_OPEN":
        draft.isReviewPlanModalOpen = true;
        break;
      case "REVIEW_PLAN_MODAL_CLOSE":
        draft.isReviewPlanModalOpen = false;
        break;
      case "NEW_VERSION_MODAL_OPEN":
        draft.isNewVersionModalOpen = true;
        draft.selectedChannelName = action.channelName;
        break;
      case "NEW_VERSION_MODAL_CLOSE":
        draft.isNewVersionModalOpen = false;
        draft.selectedChannelName = "";
        break;
    }
  });
}

export function withChannel(
  channels: ChannelInfoConfiguredType<any>[],
  channel: ChannelInfoType
) {
  return [
    ...channels.filter((ch) => {
      if (channel.canHaveMultipleInstances) {
        return ch.id !== channel.id;
      }
      return nameNotMatches(ch)(channel);
    }),
    channel,
  ];
}
