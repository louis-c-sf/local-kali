import { useAppDispatch, useAppSelector } from "AppRootContext";
import useSelectedChat from "lib/effects/useSelectedChat";
import { equals } from "ramda";
import { useGetFacebookOTNState } from "./useGetFacebookOTNState";

export function useFacebookOTNFlow() {
  const dispatch = useAppDispatch();
  const currentChatId = useAppSelector(
    (s) => s.profile?.conversationId,
    equals
  );
  const isDisplayTwilioDefaultoMessage = useAppSelector(
    (s) => s.isDisplayTwilioDefaultoMessage
  );
  const { latestCustomerMessage } = useSelectedChat(currentChatId);
  const facebookOTNState = useGetFacebookOTNState(
    latestCustomerMessage,
    currentChatId
  );
  const initiate = () => {
    dispatch({
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.INITIATE",
      state: facebookOTNState,
    });
  };

  const reset = () => {
    dispatch({
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.RESET",
    });
  };

  const isReadyToInitiate =
    !facebookOTNState.loading &&
    Boolean(
      facebookOTNState.bannerState &&
        (latestCustomerMessage || isDisplayTwilioDefaultoMessage) &&
        currentChatId
    );

  return {
    initiate,
    reset,
    isReadyToInitiate,
  };
}
