import { LocationDescriptor } from "history";
import useRouteConfig from "../../../../config/useRouteConfig";
import { useLocation } from "react-router";
import { useCallback } from "react";
import { useAppDispatch } from "../../../../AppRootContext";
import MessageType from "../../../../types/MessageType";

interface SelectedMessageStateType {
  selectMessage?: {
    message: MessageType;
  };
}

export function useSelectMessageByLink() {
  const { routeTo } = useRouteConfig();
  const loginDispatch = useAppDispatch();

  const { state } = useLocation<SelectedMessageStateType>();

  const getRoute = useCallback(
    (
      message: MessageType,
      conversationId: string,
      assigneeId?: string
    ): LocationDescriptor<SelectedMessageStateType> => {
      const assigneePart = assigneeId ?? "all";
      return {
        pathname: routeTo(`/inbox/${assigneePart}/${conversationId}`),
        state: {
          selectMessage: {
            message: message,
          },
        },
      };
    },
    [routeTo]
  );

  const clickPreselectedMessage = useCallback(
    async (message: MessageType) => {
      loginDispatch({
        type: "INBOX.MESSAGE.PRESELECTED_MESSAGE_CLICK",
        message,
      });
    },
    [loginDispatch]
  );

  return {
    getRoute,
    selectedMessageState: state,
    clickPreselectedMessage,
  };
}
