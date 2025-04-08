import { useState, useEffect, useCallback } from "react";
import { equals } from "ramda";
import { useAppSelector } from "../../../../../AppRootContext";
import useGetCurrentChannel from "../../../../../component/Chat/useGetCurrentChannel";
import moment from "moment";
import { fetchFacebookOTNAmountToken } from "../../../API/fetchFacebookOTNAmountToken";
import MessageType from "../../../../../types/MessageType";
import {
  FacebookOTNStateDict,
  FacebookOTNStateDictEnum,
} from "../../../models/FacebookOTNTypes";

type FacebookOTNStateType = {
  showBanner: boolean;
  state?: FacebookOTNStateDictEnum;
  validToken?: number;
};

const defaultFacebookOTNState: FacebookOTNStateType = {
  showBanner: false,
};
export const useGetFacebookOTNState = (
  latestCustomerMessage: MessageType | undefined,
  currentChatId: string
) => {
  const [messagesFilter, facebookAccountId, isDisplayTwilioDefaultoMessage] =
    useAppSelector(
      (s) => [
        s.inbox.messagesFilter,
        s.profile.facebookAccount?.id,
        s.isDisplayTwilioDefaultoMessage,
      ],
      equals
    );
  const { currentChannel } = useGetCurrentChannel(messagesFilter);
  const [facebookOTNState, setFacebookOTNState] =
    useState<FacebookOTNStateType>(defaultFacebookOTNState);
  const [loading, setLoading] = useState(true);
  const [lastCustomerMessageUid, setLastCustomerMessageUid] = useState("");

  let hoursGap = 0;
  let daysGap = 0;
  let hasHumanAgent = false;
  let showOverlay = false;
  if (latestCustomerMessage && currentChatId) {
    hoursGap = moment().diff(latestCustomerMessage.createdAt, "hours");
    daysGap = moment().diff(latestCustomerMessage.createdAt, "days");
    hasHumanAgent = daysGap <= 7;
    showOverlay =
      currentChannel === "facebook" &&
      hoursGap > 24 &&
      !!latestCustomerMessage.facebookSender?.pageId;
  } else if (currentChatId && currentChannel === "facebook") {
    showOverlay = isDisplayTwilioDefaultoMessage;
  }

  const getValidTokens = useCallback(
    async (pageId: string | undefined) => {
      try {
        const amount = await fetchFacebookOTNAmountToken(
          pageId ?? "",
          facebookAccountId ?? ""
        );
        return amount.tokenNumber;
      } catch (e) {
        console.error("getValidTokens e: ", e);
      }
    },
    [facebookAccountId]
  );

  const handleCheckFacebookOTN = useCallback(async () => {
    setLoading(true);
    try {
      if (latestCustomerMessage && !latestCustomerMessage.facebookSender) {
        setFacebookOTNState(defaultFacebookOTNState);
        return;
      }
      const validToken = await getValidTokens(
        latestCustomerMessage?.facebookSender?.pageId
      );
      if (
        hoursGap <= 24 &&
        latestCustomerMessage?.facebookSender?.id !==
          latestCustomerMessage?.facebookSender?.pageId
      ) {
        setFacebookOTNState({
          showBanner: true,
          state: FacebookOTNStateDict.within,
        });
      } else {
        setFacebookOTNState({
          showBanner: true,
          state: FacebookOTNStateDict.over,
          validToken,
        });
      }
    } catch (e) {
      console.error("handleCheckFacebookOTN e: ", e);
    } finally {
      setLoading(false);
    }
  }, [latestCustomerMessage, getValidTokens, hoursGap]);
  useEffect(() => {
    if (
      currentChannel !== "facebook" ||
      (!latestCustomerMessage && !isDisplayTwilioDefaultoMessage)
    ) {
      setFacebookOTNState(defaultFacebookOTNState);
      setLastCustomerMessageUid("");
      return;
    }
    if (
      isDisplayTwilioDefaultoMessage &&
      lastCustomerMessageUid !== latestCustomerMessage?.messageUniqueID
    ) {
      handleCheckFacebookOTN();
      if (latestCustomerMessage && latestCustomerMessage.messageUniqueID) {
        setLastCustomerMessageUid(latestCustomerMessage.messageUniqueID);
      }
    }
  }, [
    latestCustomerMessage,
    currentChannel,
    handleCheckFacebookOTN,
    isDisplayTwilioDefaultoMessage,
    lastCustomerMessageUid,
  ]);

  return {
    loading,
    showBanner: facebookOTNState.showBanner,
    bannerState: facebookOTNState.state,
    validToken: facebookOTNState.validToken,
    showOverlay,
    hasHumanAgent,
    refreshFacebookOTNState: handleCheckFacebookOTN,
  };
};
